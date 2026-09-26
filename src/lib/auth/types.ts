/**
 * Authentication & Session Types — Stage 4.11
 */

export type SessionTokens = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt: number; // Unix timestamp in milliseconds
};

export type OidcConfiguration = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  userinfo_endpoint?: string;
};

export type PkcePair = {
  codeVerifier: string;
  codeChallenge: string;
  state: string;
};

export type AuthSession = {
  sessionId: string;
  expiresAt: number;
};
