import { TokenResponse } from "../../domain/models/auth.model";

export interface IAuthApi {
  getAccessTokenByRefreshToken(refreshToken: string): Promise<TokenResponse>;
  getTokensByCodeExchange(code: string): Promise<TokenResponse>;
}
