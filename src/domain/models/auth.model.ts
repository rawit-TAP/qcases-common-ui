export type TokenResponse = {
  accessToken: string;
  refreshToken: string | null;
  sessionId: string;
};

export enum AuthErrorCode {
  REAUTHENTICATE_REQUIRED = "REAUTHENTICATE_REQUIRED",
  GET_ACCESS_TOKEN_FAILED = "GET_ACCESS_TOKEN_FAILED",
}
