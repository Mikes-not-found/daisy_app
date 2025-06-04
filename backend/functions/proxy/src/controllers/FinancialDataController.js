import { FinancialDataService } from "../services/financialDataService.js";
import { AuthService } from '../services/authService.js';

export class FinancialDataController {
    
    static async getAccountsDetails(req, res) {
        try {
            const userId = AuthService.getUserIdFromRequest(req);
            const accountsDetails = await FinancialDataService.getAccountsDetails(userId);
            return res.json(accountsDetails, 200);
        } catch (error) {
            return res.json({ error: error.message }, 500);
        }
    }

    static async deleteBankCard(req, res) {
        try {
            const userId = AuthService.getUserIdFromRequest(req);
            const { id_account } = req.body;
            const deleteResponse = await FinancialDataService.deleteBankCad(userId, id_account);
            return res.json(deleteResponse, 200);
        } catch (error) {
            return res.json({ error: error.message }, 500);
        }
    }

    static async getTransactions(req, res) {
        try {
            const userId = AuthService.getUserIdFromRequest(req);
            const transactionsDetails = await FinancialDataService.getTransactions(userId, req.query);
            return res.json(transactionsDetails, 200);
        } catch (error) {
            return res.json({ error: error.message }, 500);
        }
    }

    static async syncAllData(req, res) {
        try {
            const userId = AuthService.getUserIdFromRequest(req);
            const { access_token, requisitionId, institutionId } = req.body;
            const syncAllData = await FinancialDataService.syncAllData(userId, access_token, requisitionId, institutionId);
            return res.json(syncAllData, 200);
        } catch (error) {
            return res.json({ error: error.message }, 500);
        }
    }
}