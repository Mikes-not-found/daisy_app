import jwt from 'jsonwebtoken';
import { DatabaseService } from './databaseService.js';

export class AuthService {
  static getUserIdFromRequest(req) {
    if (!req.headers['authorization']) {
      throw new Error('User ID not found in request headers');
    }
    const authHeader = req.headers['authorization'];
    const token = authHeader.split(' ')[1];
    return this.getUserIdFromToken(token);
  }

  static getUserIdFromToken(token) {
    try {
      const decoded = jwt.decode(token);
      return decoded.userId;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  }

  static async verifyUser(userId) {
    try {
      const user = await DatabaseService.getUserById(userId);
      return !!user;
    } catch (error) {
      console.error('Error verifying user:', error);
      return false;
    }
  }
} 