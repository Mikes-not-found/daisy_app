import { SavingsModel } from '../models/SavingsModel.js';

export class SavingsService {

  static async getSavingsByUserId(userId) {
    const listSavings = await SavingsModel.find({ userId });
    return listSavings;
  }

  static async insertOrUpdateSaving(userId, savingData) {
    const saving = await SavingsModel.insertOrUpdate({ userId, savingData });
    return saving; 
  }

  static async deleteSaving(userId, idDocument) {
    const response = await SavingsModel.delete({ userId, idDocument });
    return response; 
  }

}

