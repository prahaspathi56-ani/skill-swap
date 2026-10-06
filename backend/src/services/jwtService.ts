import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: 'STUDENT' | 'MODERATOR' | 'ADMIN';
  name: string;
}

export class JwtService {
  private secret: string;
  private defaultExpiresIn: string;

  constructor() {
    this.secret = config.jwtSecret;
    this.defaultExpiresIn = config.jwtExpiresIn || '7d';
  }

  /**
   * Generates a signed JWT token for an authenticated student/admin.
   */
  generateToken(payload: JwtUserPayload, expiresIn?: string): string {
    const options: SignOptions = {
      expiresIn: (expiresIn || this.defaultExpiresIn) as any,
      issuer: 'skillswap-api',
      audience: 'skillswap-client',
    };
    return jwt.sign(payload, this.secret, options);
  }

  /**
   * Verifies and decodes a JWT token.
   * Throws an error if expired, invalid, or tampered with.
   */
  verifyToken(token: string): JwtUserPayload {
    const decoded = jwt.verify(token, this.secret, {
      issuer: 'skillswap-api',
      audience: 'skillswap-client',
    }) as JwtUserPayload;

    return decoded;
  }

  /**
   * Safely decodes a token without verifying signature (useful for inspection).
   */
  decodeToken(token: string): JwtUserPayload | null {
    try {
      return jwt.decode(token) as JwtUserPayload | null;
    } catch {
      return null;
    }
  }

  /**
   * Refreshes a valid existing token with a new expiration window.
   */
  refreshToken(token: string): string {
    const decoded = this.verifyToken(token);
    return this.generateToken({
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    });
  }
}

export const jwtService = new JwtService();
