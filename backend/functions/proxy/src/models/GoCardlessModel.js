import { ID, Query } from 'node-appwrite';
import { databases, APPWRITE_CONFIG, BASE_URL } from '../config/appwriteConfig.js';
import { DatabaseService } from '../services/databaseService.js';
import { GO_CARDLESS_ENUM } from '../enum/goCardlessEnum.js';

export class GoCardlessModel {
  static async getToken(secretId, secretKey, userId) {
    try {
      
      const response = await fetch(`${BASE_URL}/token/new/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ secret_id: secretId, secret_key: secretKey }),
      });

      const tokenData = await response.json();

      const currentDocument = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USERS,
        [Query.equal('userId', userId)]
      );

      const id_document = currentDocument.documents[0].$id;

      console.log("TOKENDATA -----------------------: ", tokenData);
      console.log("USERID ---------------------: ", userId)
      console.log("USERID DOCUMENT ---------------------: ", id_document)

      const now = Date.now();
      const access_token_expires = Math.floor(now / 1000) + tokenData.access_expires; 
      const refresh_access_token_expires = Math.floor(now / 1000) + tokenData.refresh_expires;
      const updateData = {
        access_token: tokenData.access,
        refresh_access_token: tokenData.refresh,
        access_token_expires: access_token_expires,
        refresh_access_token_expires: refresh_access_token_expires
      }

      console.log("update data document: ", updateData)

      const responseUpdate = await databases.updateDocument( 
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USERS,
        id_document,
        updateData
      )
      
      console.log("8. Risposta update documento:", JSON.stringify(responseUpdate, null, 2));
      return responseUpdate;
    } catch (error) {
      console.log('Error getting token:', error.message);
      throw error.message
    }
  }

  static async getTokenRefresh(userId, refreshToken) {
    try {
      console.log("faccio il token refresh");
      
      const response = await fetch(`${BASE_URL}/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      const tokenData = await response.json();
      console.log("tokenRefresh", tokenData, userId); 

      const currentDocument = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USERS,
        [Query.equal('userId', userId)]
      );

      console.log("currentDOcument", currentDocument);
      

      const now = Date.now();
      const access_token_expires = Math.floor(now / 1000) + tokenData.access_expires; 

      const dataToUpdate = {
        access_token: tokenData.access,
        access_token_expires: access_token_expires
      }
      console.log("datatupdate: ", dataToUpdate);
      
      const id_document = currentDocument.documents[0].$id;

      const responseUpdate = await databases.updateDocument( 
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.USERS,
        id_document,
        dataToUpdate
      )
        
      console.log("responseUpdate: ", responseUpdate);

      const GoCardlessToken = {
        access_token: responseUpdate.access_token,
        access_token_expires: responseUpdate.access_token_expires,
        refresh_access_token: responseUpdate.refresh_access_token,
        refresh_access_token_expires: responseUpdate.refresh_access_token_expires,
      }

      return GoCardlessToken;
    } catch (error) {
      console.error('Error getting token:', error);
      throw error
    }
  }


  static async getBankList(userId, accessToken) {
    try {
      const country = 'it'; //TODO: rendere dinamico in base alla country del dispositivo
      const response = await fetch(`${BASE_URL}/institutions/?country=${country}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const bankListData = await response.json();
      return bankListData;
    } catch (error) {
      console.error('Error getting bank list:', error);
      throw error
    }
  }

  static async createEndUserAgreement(accessToken, institutionId) {
    try {
      const response = await fetch(`${BASE_URL}/agreements/enduser/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          institution_id: institutionId,
          max_historical_days: 90, //TODO DA CAMBIARE A 180
          access_valid_for_days: 2, //TODO DA CAMBIARE A 180
          access_scope: ['balances', 'details', 'transactions']
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating agreement:', error);
      throw error
    }
  }
  

  static async buildLink(accessToken, institutionId, agreementId, accessValidForDays) {
    try {
      const response = await fetch(`${BASE_URL}/requisitions/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redirect: "com.daisy://profiles",
          institution_id: institutionId,
          reference: `daisy_${Date.now()}`,
          agreement: agreementId,
          user_language: 'IT'
        }),
      });

      console.log("accessValidForDays: ", accessValidForDays)

      const dataResponse = await response.json();
      console.log("dataToSend: ", dataResponse)
      return dataResponse
    } catch (error) {
      console.error('Error creating requisition:', error);
      throw error 
    }
  } 

  static async syncAllData(userId, accessToken, requisitionId, istitutionId) {
    try {
      console.log(requisitionId, userId, accessToken)
      // Ottiene gli account dalla requisition
      const requisitionResponse = await fetch(`${BASE_URL}/requisitions/${requisitionId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const requisitionData = await requisitionResponse.json();
      console.log("requisitionResponse: ", requisitionData)
      const id_account = requisitionData.accounts[0];

      // Ottiene i dettagli dell'account
      const detailsResponse = await fetch(`${BASE_URL}/institutions/${istitutionId}/`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const detailsData = await detailsResponse.json();
      // Ottiene i saldi dell'account
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

      // Ottiene le transazioni dell'account
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

      const createData = {
        fk_user: userId,
        id_account: id_account,
        id_requisition: requisitionId,
        id_institution: istitutionId,
        transactions: detail_transactions,
        detail_account: detail_account,
        access_valid_for_days: 2
      }


      const responseData = await databases.createDocument(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
        ID.unique(),
        createData
      )


      return responseData;
    } catch (error) {
      console.error('Errore durante la sincronizzazione completa:', error);
      throw error;
    }
  }

  static async syncData(userId, data, type) {
    try {

      // Verifica che data non sia vuoto o nullo
      if (!data || (Array.isArray(data) && data.length === 0) || Object.keys(data).length === 0) {
        console.log("Nessun dato da sincronizzare");
        throw new Error('Nessun dato da sincronizzare');
      }

      const id_user = await DatabaseService.getUserById(userId);
 
      let updateData = {
        id_user: id_user,
      };
      
      switch (type) {
        case GO_CARDLESS_ENUM.SYNC_TOKEN:
          updateData = {
            ...updateData,
            access_token: data.access,
            refresh_access_token: data.refresh,
            access_token_expires: data.access_expires,
            refresh_access_token_expires: data.refresh_expires
          };
          break;
          
        case GO_CARDLESS_ENUM.SYNC_REQUISITION:
          updateData = {
            ...updateData,
            requisition_id: data.requisition_id,
            institution_id: data.institution_id
          };
          break;

        case GO_CARDLESS_ENUM.SYNC_ALL_DATA:
          updateData = {
            ...updateData,
            id_accounts: data.accounts,
            detail_accounts: data.details,
            transactions: data.transactions
          };
          break;

        default:
          throw new Error('Tipo di sincronizzazione non valido');
      }

      const currentDocument = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID,
        APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
        [Query.equal('id_user', id_user)]
      );

      let responseData;
      if(currentDocument.total) {
        const idDocumentToUpdate = currentDocument.documents[0].$id;
        console.log("update");
        responseData = await databases.updateDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
          idDocumentToUpdate,
          updateData
        );
      } else {
        console.log("create");
        responseData = await databases.createDocument(
          APPWRITE_CONFIG.DATABASE_ID,
          APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
          ID.unique(),
          updateData
        );
      }
        
      return responseData;
    } catch (error) {
      console.error(`Errore durante la sincronizzazione ${type}:`, error);
      throw error;
    }
  }


}