import { GoCardlessService } from '../services/goCardlessService.js';
import { AuthService } from '../services/authService.js';

export class GoCardlessController {
  static async getToken(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const token = await GoCardlessService.getToken(userId);
      return res.json(token, 200);
    } catch (error) {
      return res.json({ error: error.message }, 500);
    } 
  }

  static async refreshToken(req, res) {
    try {
      const { refresh_token } = req.body;
      console.log(refresh_token);
      const userId = AuthService.getUserIdFromRequest(req);
      const token = await GoCardlessService.refreshToken(userId, refresh_token);
      return res.json(token, 200);
    } catch (error) {
      return res.json({ error: error.message }, 500);
    } 
  }

  static async getBankList(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const { accessToken } = req.body;
      const bankList = await GoCardlessService.getBankList(userId, accessToken);
      return res.json(bankList, 200);
    } catch (error) {
      return res.json({ error: error.message }, 500);
    }
  }

  static async buildLink(req, res) {
    try {
      const userId = AuthService.getUserIdFromRequest(req);
      const { accessToken, institutionId } = req.body;
      const linkData = await GoCardlessService.buildLink(userId, accessToken, institutionId);
      return res.json(linkData, 200);
    } catch (error) {
      return res.json({ error: error.message }, 500);
    }
  }
   
} 