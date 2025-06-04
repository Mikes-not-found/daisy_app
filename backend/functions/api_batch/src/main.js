import { Client, Users, Query } from 'node-appwrite';
import { databases, APPWRITE_CONFIG, client, BASE_URL } from './config/appwriteConfig.js';

// This Appwrite function will be executed every time your function is triggered
export default async ({ req, res, log, error }) => {
  // You can use the Appwrite SDK to interact with other services
  // For this example, we're using the Users service
  const users = new Users(client);
    try {
      const response = await users.list();
      // Log messages and errors to the Appwrite Console
      // These logs won't be seen by your end users
      log(`Total users: ${response.total}`);
      const currentTime = new Date();
      const timeQuery = new Date(currentTime.getTime() - 8 * 60 * 60 * 1000);
      const timeQueryString = timeQuery.toISOString().slice(0, -1) + "+00:00";
      log("Time query:", timeQueryString);


      const listFinancialData = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID, 
        APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA  
      );

      const listDocumentToUpdate = listFinancialData.documents;
      listDocumentToUpdate.forEach(async(document) => {
        try {
          log("Inizio elaborazione documento: ", document.$id);
          log("document: ", document.fk_user);

          // Calcola la data di scadenza per ogni documento
          const createdAt = new Date(document.$createdAt);
          log("createdAt: ", createdAt);
          const accessValidForDays = document.access_valid_for_days;
          log("accessValidForDays: ", accessValidForDays);
          const expirationDate = new Date(createdAt);
          expirationDate.setDate(createdAt.getDate() + accessValidForDays);
          log("currentDate: ", currentTime);
          log("expirationDate: ", expirationDate);
            if (currentTime > expirationDate) {
              log("Scaduto");

              const responseDeleteDocument = await databases.deleteDocument(
                APPWRITE_CONFIG.DATABASE_ID, 
                APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
                document.$id
              );
              
              log("responseDeleteDocument: ", responseDeleteDocument);
            } else {
              log("Non scaduto");
              log("controllo se l'update è scaduto");
              if(isExpiredForEightHours(document.$updatedAt, currentTime)) {
                log("Scaduto da almeno 8 ore");
                const responseUser = await databases.listDocuments(
                  APPWRITE_CONFIG.DATABASE_ID, 
                  APPWRITE_CONFIG.COLLECTIONS.USERS,
                  [
                    Query.equal('userId', document.fk_user)
                  ]      
                );
      
                const userData = responseUser.documents[0];
      
                log("responseUser: ", responseUser);
      
                const accessToken = userData.access_token;
                const id_account = document.id_account;
                const institutionId = document.id_institution;
      
                log("accessToken: ", accessToken);
                log("id_account: ", id_account);
                log("institutionId: ", institutionId);
                // ------ DETAILS ------
                const detailsResponse = await fetch(`${BASE_URL}/institutions/${institutionId}/`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
                const detailsData = await detailsResponse.json();
                log("detailsData: ", detailsData);
                // ------ BALANCES ------
                const balancesResponse = await fetch(`${BASE_URL}/accounts/${id_account}/balances/`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
                const balancesData = await balancesResponse.json();
      
                console.log("balancesData: ", balancesData);
      
                const detail_account = JSON.stringify({
                  card_name: detailsData.name,
                  card_balance: balancesData.balances[0].balanceAmount.amount,
                  card_currency: balancesData.balances[0].balanceAmount.currency,
                });
      
                log("detail_account: ", detail_account);
      
                // ------ TRANSACTIONS ------
                const transactionsResponse = await fetch(`${BASE_URL}/accounts/${id_account}/transactions/`, {
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                });
                const transactionsData = await transactionsResponse.json();
                  // Elaborazione delle transazioni booked
                  const bookedTransactions = transactionsData.transactions.booked.map(transaction => {
                    // Prima creiamo l'oggetto con i campi desiderati
                    const filteredTransaction = {
                      bookingDate: transaction.bookingDate,
                      valueDate: transaction.valueDate,
                      transactionAmount: transaction.transactionAmount,
                      debtorName: transaction.debtorName,
                      remittanceInformationUnstructured: transaction.remittanceInformationUnstructured,
                      category: null  // Aggiungiamo esplicitamente category come null
                    };
                    return filteredTransaction;
                  });
      
                  // Elaborazione delle transazioni pending
                  const pendingTransactions = transactionsData.transactions.pending.map(transaction => {
                    // Stessa cosa per le pending
                    const filteredTransaction = {
                      valueDate: transaction.valueDate,
                      transactionAmount: transaction.transactionAmount,
                      remittanceInformationUnstructured: transaction.remittanceInformationUnstructured,
                      category: null  // Aggiungiamo esplicitamente category come null
                    };
                    return filteredTransaction;
                  });
      
                  const filteredTransactions = {
                    booked: bookedTransactions,
                    pending: pendingTransactions
                  };
      
                const detail_transactions = JSON.stringify(filteredTransactions);
                log("detail_transactions: ", detail_transactions);
                const updateResponse = await databases.updateDocument(
                  APPWRITE_CONFIG.DATABASE_ID,
                  APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
                  document.$id,
                  {
                    transactions: detail_transactions,
                    detail_account: detail_account
                  }
                )
                log("aggiornamento andato a buon fine", updateResponse);
                log("Fine elaborazione documento: ", document.$id);
              } else {
                log("Non scaduto da 8 ore");
              }
            }
        } catch (err) {
          error(`Errore durante l'elaborazione del documento ${document.$id}`);
        }
      });

    } catch(err) {
      error("Could not update documents: " + err.message);
    }

  return res.json({
    motto: "Build like a team of hundreds_",
    learn: "https://appwrite.io/docs",
    connect: "https://appwrite.io/discord",
    getInspired: "https://builtwith.appwrite.io",
  });
};


function isExpiredForEightHours(updatedAt, currentTime) {
  const eightHoursInMillis = 8 * 60 * 60 * 1000;
  return (currentTime - new Date(updatedAt)) >= eightHoursInMillis;
}