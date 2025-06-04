import { GoCardlessModel } from '../models/GoCardlessModel.js';
import { GOCARDLESS_SECRET_ID, GOCARDLESS_SECRET_KEY } from '../config/appwriteConfig.js';

export class GoCardlessService {
  static async getToken(userId) {
    const secretId = process.env.GOCARDLESS_SECRET_ID ? process.env.GOCARDLESS_SECRET_ID : GOCARDLESS_SECRET_ID;
    const secretKey = process.env.GOCARDLESS_SECRET_KEY ? process.env.GOCARDLESS_SECRET_KEY : GOCARDLESS_SECRET_KEY;
    return await GoCardlessModel.getToken(secretId, secretKey, userId);
  }

  static async refreshToken(userId, refresh_token) {
    return await GoCardlessModel.getTokenRefresh(userId, refresh_token);
  }

  static async getBankList(userId, accessToken) {
    return await GoCardlessModel.getBankList(userId, accessToken);
  }

  static async buildLink(userId, accessToken, institutionId) {
    const agreement = await GoCardlessModel.createEndUserAgreement(accessToken, institutionId);
    return await GoCardlessModel.buildLink(accessToken, institutionId, agreement.id, agreement.access_valid_for_days);
  }

  static async syncAllData(userId, access_token, requisition_id, istitutionId) {
    return await GoCardlessModel.syncAllData(userId, access_token, requisition_id, istitutionId);
  }
} 