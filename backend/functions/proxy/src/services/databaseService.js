import { databases, APPWRITE_CONFIG } from '../config/appwriteConfig.js';
import { Query } from 'node-appwrite';

export class DatabaseService {
  static async getUserById(userId) {
    try {
      const userDocument = await databases.listDocuments(
        APPWRITE_CONFIG.DATABASE_ID, // databaseId
        APPWRITE_CONFIG.COLLECTIONS.USERS, // collectionId
        [
          Query.equal('userId', userId)
        ]
      );

      const idDocument = userDocument.documents[0].$id;

      return idDocument;
    } catch (error) { 
      console.error('DatabaseService getUserById error:', error);
      throw error;
    }
  }
} 