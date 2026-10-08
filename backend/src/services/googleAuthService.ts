import { OAuth2Client } from 'google-auth-library';
import { config } from '../config';

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

export class GoogleAuthService {
  private client: OAuth2Client;

  constructor() {
    this.client = new OAuth2Client(config.google.clientId);
  }

  /**
   * Verifies a Google ID token from Google Identity Services.
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo> {
    // If client ID is set, verify cryptographic signature and audience
    if (config.google.clientId) {
      try {
        const ticket = await this.client.verifyIdToken({
          idToken,
          audience: config.google.clientId,
        });

        const payload = ticket.getPayload();
        if (!payload || !payload.email) {
          throw new Error('Invalid Google token payload.');
        }

        return {
          googleId: payload.sub,
          email: payload.email.toLowerCase().trim(),
          name: payload.name || payload.email.split('@')[0],
          avatarUrl: payload.picture,
          emailVerified: !!payload.email_verified,
        };
      } catch (err: any) {
        if (config.nodeEnv === 'production') {
          throw err;
        }
        // In development or testing, fall through to dev token parser
      }
    }

    // Development fallback: Parse JWT payload safely if GOOGLE_CLIENT_ID is not configured yet
    try {
      const parts = idToken.split('.');
      if (parts.length === 3) {
        const payloadJson = Buffer.from(parts[1], 'base64').toString('utf-8');
        const payload = JSON.parse(payloadJson);
        if (payload.email) {
          return {
            googleId: payload.sub || `dev_google_${Date.now()}`,
            email: payload.email.toLowerCase().trim(),
            name: payload.name || payload.email.split('@')[0],
            avatarUrl: payload.picture,
            emailVerified: true,
          };
        }
      }
    } catch {
      // Fall through to error
    }

    throw new Error('Google authentication failed. Invalid token.');
  }
}

export const googleAuthService = new GoogleAuthService();
