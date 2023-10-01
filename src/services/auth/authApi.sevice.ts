import { AccessTokenResponse, LogoutResponse } from "../../domain/models/auth.model";

export interface IAuthApi {
    getAccessToken(): Promise<AccessTokenResponse>;
    logout(accessToken: string): Promise<LogoutResponse>;
}
