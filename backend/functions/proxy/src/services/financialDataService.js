import { FinancialDataModel } from "../models/FinancialDataModel.js";
import { GoCardlessService } from "./goCardlessService.js";

export class FinancialDataService {
 
    static async getAccountsDetails(userId) {
        const financialData = await FinancialDataModel.getFinancialDataByUserId(userId);
        if(financialData.length > 0) {
            let array_detailAccounts = []
            financialData.forEach((element) => {
                const dataTosend = {
                    id_account: element.id_account,
                    ...JSON.parse(element.detail_account)
                }
                array_detailAccounts.push(dataTosend)
            })
            console.log(array_detailAccounts)
            return array_detailAccounts;
        } else {
            return null;
        } 
    }

    static async deleteBankCad(userId, id_account) {
        //TODO Inserire controllo utente  attraverso lo userId
        return await FinancialDataModel.deleteFinancialDataByAccountId(id_account)

    }

    static async getTransactions(userId, dateRange) {
        const financialData = await FinancialDataModel.getFinancialDataByUserId(userId);
        if(financialData && financialData.length > 0) {
            let array_transactions = [];
            financialData.forEach((element) => {
                array_transactions.push(JSON.parse(element.transactions))
            })

            const groupedTransactions = {
                        booked: [],
                        pending: []
                    };

            const defaultStartDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
            const defaultEndDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

            const startDate = new Date(dateRange.start_date || defaultStartDate);
            const endDate = new Date(dateRange.end_date || defaultEndDate);

            console.log(array_transactions)
            
            array_transactions.forEach(transactionGroup => {
                const group = typeof transactionGroup === 'string' 
                    ? JSON.parse(transactionGroup) 
                    : transactionGroup;
                    
                if (group.booked) {
                    const filteredBooked = group.booked.filter(transaction => {
                        const transactionDate = new Date(transaction.bookingDate || transaction.valueDate);
                        return transactionDate >= startDate && transactionDate <= endDate;
                    });
                    groupedTransactions.booked.push(...filteredBooked);
                }
                if (group.pending) {
                    const filteredPending = group.pending.filter(transaction => {
                        const transactionDate = new Date(transaction.bookingDate || transaction.valueDate);
                        return transactionDate >= startDate && transactionDate <= endDate;
                    });
                    groupedTransactions.pending.push(...filteredPending);
                }
            }); 

            //Ordinamento in ordine più recente
            groupedTransactions.booked.sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime());
            groupedTransactions.pending.sort((a, b) => new Date(b.valueDate).getTime() - new Date(a.valueDate).getTime());

            return groupedTransactions;
        }  else {
            return null;
        }
    }

    static async syncAllData(userId, access_token, requisitionId, institutionId) {
        if(institutionId !== null && requisitionId !== null && access_token !== null && userId !== null) {
            return await GoCardlessService.syncAllData(userId, access_token, requisitionId, institutionId);
        } else {
            return null;
        }
    }
}