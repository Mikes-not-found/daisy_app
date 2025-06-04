import { AuthService } from '../services/authService.js';

export class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        throw new Error('No authorization header');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new Error('No token provided');
      }

      const userId = AuthService.getUserIdFromToken(token);
      if (!userId) {
        throw new Error('Invalid token');
      }

      const isAuthorized = await AuthService.verifyUser(userId);
      if (!isAuthorized) {
        throw new Error('Unauthorized user');
      }

      req.userId = userId;
      return next ? next() : true;
    } catch (error) {
      console.error('Auth error:', error);
      throw new Error('Unauthorized user');
    }
  }
} 