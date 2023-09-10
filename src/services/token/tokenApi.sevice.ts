import { AccessTokenResponse } from "../../domain/models/auth.model";

export interface ITokenApi {
    getAccessToken(): Promise<AccessTokenResponse>;
}
