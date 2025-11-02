import { Request, Response, NextFunction } from 'express';
import { extractTokenFromHeader, verifyToken, JWTPayload } from '../utils/auth.js';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * Middleware to verify JWT authentication
 * Replaces verifySupabaseAuth middleware
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = extractTokenFromHeader(req.header('authorization'));

    if (!token) {
      res.status(401).json({ message: 'No token provided' });
      return;
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/**
 * Middleware to check if user is an admin or owner
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  if (req.user.userRole !== 'admin' && req.user.userRole !== 'owner') {
    res.status(403).json({ message: 'Insufficient permissions. Admin access required.' });
    return;
  }

  next();
};

/**
 * Middleware to check if user is an owner
 */
export const requireOwner = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  if (req.user.userRole !== 'owner') {
    res.status(403).json({ message: 'Insufficient permissions. Owner access required.' });
    return;
  }

  next();
};
