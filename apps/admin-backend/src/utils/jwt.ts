import jwt from 'jsonwebtoken';

export interface AdminJwtPayload {
  id: string;
  email: string;
  role: string;
}

const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  return secret;
};

export const signAdminToken = (payload: AdminJwtPayload): string => {
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: '8h',
  });
};

export const verifyAdminToken = (token: string): AdminJwtPayload => {
  return jwt.verify(token, getJwtSecret()) as AdminJwtPayload;
};
