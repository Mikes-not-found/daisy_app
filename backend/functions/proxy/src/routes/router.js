import { SavingsController } from '../controllers/savingsController.js';
import { MoneyTrackerController } from '../controllers/moneyTrackerController.js';
import { AuthMiddleware } from '../middleware/authMiddleware.js';
import { GoCardlessController } from '../controllers/goCardlessController.js';
import { FinancialDataController } from '../controllers/FinancialDataController.js';

export default class Router {
  static async handleRequest(req, res) {
    try {
      // Verifica autenticazione per tutte le routes protette
      // if (req.path.startsWith('/api/')) {
      //   await AuthMiddleware.authenticate(req, res);
      // }

      // Routes per Savings
      if (req.path === '/api/savings' && req.method === 'GET') {
        return await SavingsController.getSavings(req, res);
      }
      
      if (req.path === '/api/insertOrUpdateSaving' && req.method === 'POST') {
        return await SavingsController.insertOrUpdateSaving(req, res);
      }
      
      if (req.path === '/api/deleteSaving' && req.method === 'DELETE') {
        return await SavingsController.deleteSaving(req, res);
      }

      // Routes per Bills/Earnings
      if (req.path === '/api/moneyTracker' && req.method === 'GET') {
        return await MoneyTrackerController.getMoneyTracker(req, res);
      }
      
      if (req.path === '/api/insertOrUpdateMoneyTrackerItem' && req.method === 'POST') {
        return await MoneyTrackerController.insertOrUpdateMoneyTrackerItem(req, res);
      }

      if (req.path === '/api/deleteMoneyTrackerItem' && req.method === 'DELETE') {
        return await MoneyTrackerController.deleteMoneyTrackerItem(req, res);
      }

      // Routes per GoCardless
      if (req.path === '/api/gocardless/token' && req.method === 'GET') {
        return await GoCardlessController.getToken(req, res); 
      }

      if (req.path === '/api/gocardless/token/refresh' && req.method === 'POST') {
        return await GoCardlessController.refreshToken(req, res); 
      }

      if (req.path === '/api/gocardless/bankList' && req.method === 'POST') {
        return await GoCardlessController.getBankList(req, res);
      }

      if (req.path === '/api/gocardless/buildLink' && req.method === 'POST') {
        return await GoCardlessController.buildLink(req, res);
      }

      if (req.path === '/api/gocardless/detailAccounts' && req.method === 'GET') {
        return await FinancialDataController.getAccountsDetails(req, res);
      }

      if (req.path === '/api/gocardless/transactions' && req.method === 'GET') {
        return await FinancialDataController.getTransactions(req, res);
      }

      if (req.path === '/api/gocardless/deleteBankCard' && req.method === 'DELETE') {
        return await FinancialDataController.deleteBankCard(req, res);
      }

      if(req.path === '/api/gocardless/syncAllData' && req.method === 'POST') {
        return await FinancialDataController.syncAllData(req, res);
      }
      
      // Route non trovata
      return res.json({ error: 'Route not found' }, 404);
    } catch (error) {
      console.error('Router error:', error);
      return res.json({ error: error.message }, 500);
    }
  }
}