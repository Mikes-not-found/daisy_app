import { MoneyTrackerModel } from '../models/MoneyTrackerModel.js';

export class MoneyTrackerService {

  static async getMoneyTrackerByUserId(userId) {
    const listMoneyTracker = await MoneyTrackerModel.getMoneyTrackerByUserId({ userId });
    return listMoneyTracker;
  }

  static async insertOrUpdateMoneyTrackerItem(userId, moneyTrackerData) {
    const moneyTracker = await MoneyTrackerModel.insertOrUpdate({ userId, moneyTrackerData });
    return moneyTracker; 
  }

  static async deleteMoneyTrackerItem(userId, idDocument) {
    const response = await MoneyTrackerModel.delete({ userId, idDocument });
    return response; 
  }

}