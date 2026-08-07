// src/types/express.d.ts
// Type augmentation untuk Express Request

import { User, Company } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        name: string;
      };
      activeCompanyId?: string;
      activeCompany?: Company;
    }
  }
}

export { };