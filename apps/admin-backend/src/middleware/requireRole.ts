import { Request, Response, NextFunction } from 'express';

export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.admin) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized: Authentication required',
      });
      return;
    }

    if (!allowedRoles.includes(req.admin.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
};
