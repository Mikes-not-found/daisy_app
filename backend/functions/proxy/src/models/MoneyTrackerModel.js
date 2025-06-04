import { ID, Query } from 'node-appwrite';
import { databases, APPWRITE_CONFIG } from '../config/appwriteConfig.js';

export class MoneyTrackerModel {
    static async getMoneyTrackerByUserId({ userId }) {
        try {
            if (!userId) {
                throw new Error('UserId non fornito');
            } 
            
              const currentDocument = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID, // databaseId
                APPWRITE_CONFIG.COLLECTIONS.MONEYTRACKER, // collectionId
                [
                  Query.equal('id_user', userId)
                ]
              );
                    
              const listMoneyTracker = [];
        
              currentDocument.documents.forEach((document) => {
                const item = {
                  id: document.$id,
                  target: document.target,
                  amount: document.amount,
                  category: document.category,
                  date: document.date
                }
                listMoneyTracker.push(item)
              })

              return listMoneyTracker; 

        } catch (error) {
            console.error('Error in MoneyTrackerModel.find:', error);
            throw error;
        }
    }

    static async insertOrUpdate({ userId, moneyTrackerData }) {
        try {
            if (!userId) {
                throw new Error('UserId non fornito');
            }
            let newDocument;
            console.log("moneyTrackerData", moneyTrackerData);
            if (moneyTrackerData.id) {                
                newDocument = await databases.updateDocument(
                    APPWRITE_CONFIG.DATABASE_ID,
                    APPWRITE_CONFIG.COLLECTIONS.MONEYTRACKER,
                    moneyTrackerData.id,
                    { 
                        target: moneyTrackerData.target,
                        amount: moneyTrackerData.amount,
                        category: moneyTrackerData.category,
                        date: moneyTrackerData.date
                    }
                );
                
            } else {
                newDocument = await databases.createDocument(
                    APPWRITE_CONFIG.DATABASE_ID,
                    APPWRITE_CONFIG.COLLECTIONS.MONEYTRACKER,
                    ID.unique(),
                    { 
                        "target": moneyTrackerData.target,
                        "amount": moneyTrackerData.amount,
                        "category": moneyTrackerData.category,
                        "date": moneyTrackerData.date,
                        "id_user": userId
                    }
                );
            }
              
             // DTO   
             const documentToSend = {
                id: newDocument.$id,
                target: newDocument.target,
                amount: newDocument.amount,
                category: newDocument.category,
                date: newDocument.date,
                }
            
            return documentToSend;
        } catch (error) {
            console.error('Error in MoneyTrackerModel.create:', error);
            throw error;
        }
    }

    static async delete({ userId, idDocument }) {
        try {
            if (!userId) {
                throw new Error('UserId non fornito');
            }

            const response = await databases.deleteDocument(
                APPWRITE_CONFIG.DATABASE_ID,
                APPWRITE_CONFIG.COLLECTIONS.MONEYTRACKER,
                idDocument
            );

            return response;
        } catch (error) {
            console.error('Error in MoneyTrackerModel.delete:', error);
            throw error;
        }
    }
} 