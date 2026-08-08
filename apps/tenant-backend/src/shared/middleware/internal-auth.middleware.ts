import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const internalAuthMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const providedSecret = req.headers['x-internal-secret'];
  const expectedSecret = process.env.INTERNAL_API_KEY;

  if (!expectedSecret || typeof providedSecret !== 'string') {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid internal secret header',
    });
    return;
  }

  const providedBuf = Buffer.from(providedSecret);
  const expectedBuf = Buffer.from(expectedSecret);

  if (providedBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(providedBuf, expectedBuf)) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid internal secret key',
    });
    return;
  }

  next();
};
