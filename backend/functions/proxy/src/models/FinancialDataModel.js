import { Query } from 'node-appwrite';
import { databases, APPWRITE_CONFIG } from '../config/appwriteConfig.js';
export class FinancialDataModel {
    static async getFinancialDataByRequisitionId(requisitionId) {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
            [
                Query.equal( 'id_requisition', requisitionId)
            ]
        )
        console.log(response)
        return response.documents[0];
    }

    static async deleteFinancialDataByAccountId(id_account) {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
            [
                Query.equal( 'id_account', id_account)
            ]
        )

        const id_document_to_delete = response.documents[0].$id;

        const deleteResponse = await databases.deleteDocument(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
            id_document_to_delete
        )

        console.log("delete completata: ", deleteResponse)

        return deleteResponse;
    }

    static async getFinancialDataByUserId(userId) {
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
            [
                Query.equal( 'fk_user', userId)
            ]
        )
        
        return response.documents;
    }
    
    static async getRequisitionIdByUserId(userId) {
        const id_user = await DatabaseService.getUserById(userId);
        const response = await databases.listDocuments(
            APPWRITE_CONFIG.DATABASE_ID,
            APPWRITE_CONFIG.COLLECTIONS.FINANCIALDATA,
            [
            Query.equal('id_user', id_user)
            ]
        );
        return response.documents[0].requisition_id;
    }
}