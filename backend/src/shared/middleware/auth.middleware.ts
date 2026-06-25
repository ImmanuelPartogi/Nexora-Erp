// src/shared/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../errors/AppError';
import { JwtUtil } from '../utils/jwt.util';
import { prisma } from '../db/prisma';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = JwtUtil.verify(token);

    // Get user from database — exclude password hash from the request context.
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User not found or inactive');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};









