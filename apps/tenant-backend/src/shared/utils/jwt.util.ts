import jwt, { SignOptions } from 'jsonwebtoken';
import { ENV } from '../../config/env';
import { UnauthorizedError } from '../errors/AppError';

export interface JwtPayload {
  userId: string;
  email: string;
}

export class JwtUtil {
  static sign(payload: JwtPayload): string {
    const options: SignOptions = {
      expiresIn: ENV.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    };

    return jwt.sign(payload, ENV.JWT_SECRET, options);
  }

  static verify(token: string): JwtPayload {
    try {
      return jwt.verify(token, ENV.JWT_SECRET) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired token');
    }
  }

  static decode(token: string): JwtPayload | null {
    return jwt.decode(token) as JwtPayload | null;
  }
}
