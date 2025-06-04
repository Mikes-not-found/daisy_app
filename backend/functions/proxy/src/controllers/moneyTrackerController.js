import { DatabaseService } from '../services/databaseService.js';
import { AuthService } from '../services/authService.js';
import { ResponseHandler } from '../utils/responseHandler.js';
import { MoneyTrackerService } from '../services/moneyTrackerService.js';
export class MoneyTrackerController {
  static async getMoneyTracker(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const listMoneyTracker = await MoneyTrackerService.getMoneyTrackerByUserId(userId);
      return res.json(listMoneyTracker, 200)
    } catch (error) {
      console.error('Error in MoneyTrackerController.getMoneyTracker:', error);
      return res.json({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }, 500, {
        'Access-Control-Allow-Origin': '*',
      });
    }
  }

  static async insertOrUpdateMoneyTrackerItem(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const moneyTrackerData = req.body;
      const moneyTracker = await MoneyTrackerService.insertOrUpdateMoneyTrackerItem(userId, moneyTrackerData);
      return res.json(moneyTracker, 200)
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }

  static async deleteMoneyTrackerItem(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const idDocument = req.body.id;
      const response = await MoneyTrackerService.deleteMoneyTrackerItem(userId, idDocument);
      return res.json(response, 200)
    } catch (error) {
      return ResponseHandler.error(res, error);
    }
  }
} 