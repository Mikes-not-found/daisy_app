import { ID, Query } from 'node-appwrite';
import { databases, APPWRITE_CONFIG } from '../config/appwriteConfig.js';

export class SavingsModel {
    static async find({ userId }) {
        try {
            if (!userId) {
                throw new Error('UserId non fornito');
            }

            const userDocument = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID, // databaseId
                APPWRITE_CONFIG.COLLECTIONS.USERS, // collectionId
                [
                  Query.equal('userId', userId)
                ]
              );
              
        
              const idDocument = userDocument.documents[0].$id;
        
            
              const currentDocument = await databases.listDocuments(
                APPWRITE_CONFIG.DATABASE_ID, // databaseId
                APPWRITE_CONFIG.COLLECTIONS.SAVINGS, // collectionId
                [
                  Query.equal('id_user', idDocument)
                ]
              );
                    
              const listSavings = [];
        
              currentDocument.documents.forEach((document) => {
                const item = {
                  id: document.$id,
                  type: document.type,
                  amount: document.amount,
                  end_date: document.end_date
                };
                listSavings.push(item);
              });

              return listSavings;

        } catch (error) {
            console.error('Error in SavingsModel.find:', error);
            throw error;
        }
    }

    static async insertOrUpdate({ userId, savingData }) {
        try {
            if (!userId) {
                throw new Error('UserId non fornito');
            }
            let newDocument;

            if (savingData.id) {
                
                newDocument = await databases.updateDocument(
                    APPWRITE_CONFIG.DATABASE_ID,
                    APPWRITE_CONFIG.COLLECTIONS.SAVINGS,
                    savingData.id,
                    { 
                        type: savingData.type,
                        amount: savingData.amount,
                        end_date: savingData.end_date
                    }
                );
                
            } else {
                // Altrimenti crea un nuovo documento
                const userDocument = await databases.listDocuments(
                    APPWRITE_CONFIG.DATABASE_ID,
                    APPWRITE_CONFIG.COLLECTIONS.USERS,
                    [Query.equal('userId', userId)]
                );
              
                newDocument = await databases.createDocument(
                    APPWRITE_CONFIG.DATABASE_ID,
                    APPWRITE_CONFIG.COLLECTIONS.SAVINGS,
                    ID.unique(),
                    { 
                        "type": savingData.type,
                        "amount": savingData.amount,
                        "id_user": userDocument.documents[0].$id,
                        "end_date": savingData.end_date
                    }
                );

               
            }
              
             // DTO   
             const documentToSend = {
                id: newDocument.$id,
                type: newDocument.type,
                amount: newDocument.amount,
                    end_date: newDocument.end_date
                }
            
            return documentToSend;
        } catch (error) {
            console.error('Error in SavingsModel.create:', error);
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
                APPWRITE_CONFIG.COLLECTIONS.SAVINGS,
                idDocument
            );

            return response;
        } catch (error) {
            console.error('Error in SavingsModel.delete:', error);
            throw error;
        }
    }
} 