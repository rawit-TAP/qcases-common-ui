import jwt_decode from "jwt-decode";
import dayjs from "dayjs";
import { ACCESS_TOKEN_KEY } from "../../domain/constants/storage";
import { DecodedAccessToken } from "@qcases/common";
import { AccessTokenResponse } from "../../domain/models/auth.model";
import { ITokenApi } from "./tokenApi.sevice";

export type TokenServiceOptions = {
    tokenApi: ITokenApi;
}
export class TokenService {
    private accessTokenValue = '';
    private getAccessTokenPromise: Promise<AccessTokenResponse> | null = null;
    constructor(private options: TokenServiceOptions) {

    }
    public getAccessToken = async () => {
        if(this.isTokenValid()) {
            return this.accessTokenValue;
        }
        const storageValue = localStorage.getItem(ACCESS_TOKEN_KEY);
        if(storageValue) {
            this.accessTokenValue = storageValue;
        }
        if(this.isTokenValid()) {
            return this.accessTokenValue;
        }
        // call api for geting token
        try {
            if(!this.getAccessTokenPromise) {
                this.getAccessTokenPromise = this.options.tokenApi.getAccessToken();
            }
            const tokenResponse = await this.getAccessTokenPromise;
            localStorage.setItem(ACCESS_TOKEN_KEY, tokenResponse.jwt);
            this.accessTokenValue = tokenResponse.jwt;
            return this.accessTokenValue;
        }
        catch(e) {
            console.error('Getting token failed');
            this.accessTokenValue = '';
            throw e;
        }
    }

    private isTokenValid = () => {
        if(!this.accessTokenValue) {
            return false;
        }
        try {
            const tokenDecoded = jwt_decode<DecodedAccessToken>(this.accessTokenValue);
            if(dayjs().isAfter(dayjs.unix(tokenDecoded.exp))) {
                return false;
            }
            return true;
        }
        catch(e) {
            return false;
        }
    }
}
