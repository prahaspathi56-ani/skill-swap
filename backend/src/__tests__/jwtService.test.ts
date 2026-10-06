import { describe, it, expect } from 'vitest';
import { jwtService } from '../services/jwtService';

describe('JwtService', () => {
  const mockUser = {
    userId: 'user_12345',
    email: 'test.student@skillswap.edu',
    role: 'STUDENT' as const,
    name: 'Alex Rivera',
  };

  it('should generate a valid JWT token and verify it correctly', () => {
    const token = jwtService.generateToken(mockUser);
    expect(typeof token).toBe('string');
    expect(token.split('.').length).toBe(3); // Header.Payload.Signature

    const verified = jwtService.verifyToken(token);
    expect(verified.userId).toBe(mockUser.userId);
    expect(verified.email).toBe(mockUser.email);
    expect(verified.role).toBe(mockUser.role);
    expect(verified.name).toBe(mockUser.name);
  });

  it('should safely decode a token without verifying', () => {
    const token = jwtService.generateToken(mockUser);
    const decoded = jwtService.decodeToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe(mockUser.userId);
    expect(decoded?.email).toBe(mockUser.email);
  });

  it('should throw an error for a tampered token', () => {
    const token = jwtService.generateToken(mockUser);
    const tamperedToken = token.slice(0, -5) + 'xxxxx';

    expect(() => {
      jwtService.verifyToken(tamperedToken);
    }).toThrow();
  });

  it('should refresh an existing token with a new token', () => {
    const token = jwtService.generateToken(mockUser);
    const refreshed = jwtService.refreshToken(token);

    expect(typeof refreshed).toBe('string');
    const verified = jwtService.verifyToken(refreshed);
    expect(verified.userId).toBe(mockUser.userId);
    expect(verified.email).toBe(mockUser.email);
  });
});
