import jwt from 'jsonwebtoken';

export const generateToken = (id, role) => {
  const secret = process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_in_production';
  // Always use a valid string format - default to '7d' (7 days)
  let expiresIn = '7d';
  
  if (process.env.JWT_EXPIRE && typeof process.env.JWT_EXPIRE === 'string' && process.env.JWT_EXPIRE.trim() !== '') {
    expiresIn = process.env.JWT_EXPIRE.trim();
  }
  
  if (!secret) {
    throw new Error('JWT_SECRET is required');
  }
  
  return jwt.sign({ id, role }, secret, {
    expiresIn: expiresIn
  });
};

export const generateRefreshToken = (id, role) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_change_in_production';
  // Always use a valid string format - default to '30d' (30 days)
  let expiresIn = '30d';
  
  if (process.env.JWT_REFRESH_EXPIRE && typeof process.env.JWT_REFRESH_EXPIRE === 'string' && process.env.JWT_REFRESH_EXPIRE.trim() !== '') {
    expiresIn = process.env.JWT_REFRESH_EXPIRE.trim();
  }
  
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET is required');
  }
  
  return jwt.sign({ id, role }, secret, {
    expiresIn: expiresIn
  });
};

