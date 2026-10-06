import { describe, it, expect } from 'vitest';
import { googleAuthService } from '../services/googleAuthService';

describe('GoogleAuthService', () => {
  it('should safely decode a simulated Google ID token in development mode', async () => {
    const mockGoogleUser = {
      sub: 'google_user_998877',
      email: 'alex.student@gmail.com',
      name: 'Alex Rivera',
      picture: 'https://lh3.googleusercontent.com/a/test-avatar',
      email_verified: true,
    };

    const dummyHeader = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64');
    const dummyPayload = Buffer.from(JSON.stringify(mockGoogleUser)).toString('base64');
    const dummySignature = Buffer.from('sig').toString('base64');
    const mockIdToken = `${dummyHeader}.${dummyPayload}.${dummySignature}`;

    const verified = await googleAuthService.verifyIdToken(mockIdToken);
    expect(verified.email).toBe('alex.student@gmail.com');
    expect(verified.name).toBe('Alex Rivera');
    expect(verified.avatarUrl).toBe('https://lh3.googleusercontent.com/a/test-avatar');
    expect(verified.emailVerified).toBe(true);
  });

  it('should reject malformed tokens', async () => {
    await expect(googleAuthService.verifyIdToken('invalid.token')).rejects.toThrow();
  });
});
