import { AdminJwtPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminJwtPayload;
    }
  }
}
