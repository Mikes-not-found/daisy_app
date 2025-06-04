import { AuthService } from '../services/authService.js';
import { SavingsService } from '../services/savingsService.js';

export class SavingsController {
  static async getSavings(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const listSavings = await SavingsService.getSavingsByUserId(userId);
      return res.json(listSavings, 200, {
        'Access-Control-Allow-Origin': '*'
      })
    } catch (error) {
      console.error('Error in SavingsController.getSavings:', error);
      return res.json({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }, 500, {
        'Access-Control-Allow-Origin': '*',
      });
    }
  }

  static async insertOrUpdateSaving(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const savingData = req.body;
      const saving = await SavingsService.insertOrUpdateSaving(userId, savingData);
      return res.json(saving, 200, {
        'Access-Control-Allow-Origin': '*'
      })
    } catch (error) {
      console.error('Error adding saving:', error);
      return res.json({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }, 500, {
        'Access-Control-Allow-Origin': '*',
      });
    }
  }

  static async deleteSaving(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const idDocument = req.body.id;
      const response = await SavingsService.deleteSaving(userId, idDocument); 
      return res.json(response, 200, {
        'Access-Control-Allow-Origin': '*',
      }); 
    } catch (error) {
      return res.json({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }, 500, {
        'Access-Control-Allow-Origin': '*',
      });
    }
  }
} 