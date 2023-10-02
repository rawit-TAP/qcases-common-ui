import jwt_decode from "jwt-decode";
import dayjs from "dayjs";
import { ACCESS_TOKEN_KEY, SESSION_ID_KEY } from "../../domain/constants/storage";
import { DecodedAccessToken } from "@qcases/common";
import { AccessTokenResponse } from "../../domain/models/auth.model";
import { IAuthApi } from "./authApi.sevice";

export type TokenServiceOptions = {
    tokenApi: IAuthApi;
}
export class AuthService {
    private accessTokenValue = '';
    private sessionId = '';
    private getAccessTokenPromise: Promise<AccessTokenResponse> | null = null;
    constructor(private options: TokenServiceOptions) {
        this.setSessionId(localStorage.getItem(SESSION_ID_KEY) || '');
        this.setAccessToken(localStorage.getItem(SESSION_ID_KEY) || '');
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
            this.setSessionId(tokenResponse.sessionId);
            this.setAccessToken(tokenResponse.jwt);
            this.clearGettingAccessTokenPromise();
            return this.accessTokenValue;
        }
        catch(e) {
            console.error('Getting token failed test');
            this.accessTokenValue = '';
            throw e;
        }
    }

    private clearGettingAccessTokenPromise = () => {
        this.getAccessTokenPromise = null;
    }

    public refreshAccessToken = async () => {
        try {
            if(!this.getAccessTokenPromise) {
                this.getAccessTokenPromise = this.options.tokenApi.getAccessToken();
            }
            const tokenResponse = await this.getAccessTokenPromise;
            this.setSessionId(tokenResponse.sessionId);
            this.setAccessToken(tokenResponse.jwt);
            this.clearGettingAccessTokenPromise();
            return this.accessTokenValue;
        }
        catch(e) {
            console.error('Getting token failed', e);
            // Check if status code is 401 => clear auth data, throw error
            this.clearAuthData();
            throw e;
        }
    }

    public logout = async () => {
        try {
            const logoutResponse = await this.options.tokenApi.logout(this.accessTokenValue);
            console.log('Logged out successfully', logoutResponse);
            this.clearAuthData();
        }
        catch(e) {
            console.error('Logout failed', e);
            throw e;
        }
    }

    public clearAuthData = () => {
        console.log('Clear all local auth data');
        this.setSessionId('');
        this.setAccessToken('');
    }

    private setSessionId = (value: string) => {
        this.sessionId = value;
        localStorage.setItem(SESSION_ID_KEY, value);
    }

    private setAccessToken = (value: string) => {
        this.accessTokenValue = value;
        localStorage.setItem(ACCESS_TOKEN_KEY, value);
    }

    public getSessionId = () => {
        return this.sessionId;
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
