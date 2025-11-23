import dotenv from 'dotenv';

dotenv.config();

// Validate JWT_SECRET in production
if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET environment variable is required in production. ' +
    'Please set a strong, random secret (minimum 32 characters).'
  );
}

// Validate JWT_SECRET strength if provided
if (process.env.JWT_SECRET) {
  if (process.env.JWT_SECRET.length < 32) {
    console.warn(
      '⚠️  WARNING: JWT_SECRET should be at least 32 characters long for security.'
    );
  }
}

export const jwtConfig = {
  secret: process.env.JWT_SECRET || (() => {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set in production');
    }
    // Only allow default in development
    console.warn('⚠️  WARNING: Using default JWT_SECRET. This should only be used in development.');
    return 'CampscapeJWTSecret2025!-DEV-ONLY';
  })(),
  expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as string,
  issuer: 'campscape-api',
  audience: 'campscape-client',
};













