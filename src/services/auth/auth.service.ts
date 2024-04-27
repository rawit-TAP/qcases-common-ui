import jwt_decode from "jwt-decode";
import dayjs from "dayjs";
import {
  ACCESS_TOKEN_KEY,
  AUTHORIZATION_CODE,
  REFRESH_TOKEN_KEY,
  SESSION_ID_KEY,
} from "../../domain/constants/storage";
import { DecodedAccessToken } from "@qcases/common";
import { TokenResponse } from "../../domain/models/auth.model";
import { IAuthApi } from "./authApi.sevice";

export type TokenServiceOptions = {
  tokenApi: IAuthApi;
};

export class AuthService {
  private accessTokenValue = "";
  private refreshTokenValue = "";
  private sessionId = "";
  private getTokensPromise: Promise<TokenResponse> | null = null;
  constructor(private options: TokenServiceOptions) {
    this.setAccessToken(localStorage.getItem(ACCESS_TOKEN_KEY) || "");
    this.setRefreshToken(localStorage.getItem(REFRESH_TOKEN_KEY) || "");
    this.setSessionId(localStorage.getItem(SESSION_ID_KEY) || "");
  }

  private getTokensByCodeExchange = async () => {
    const authorizationCode = sessionStorage.getItem(AUTHORIZATION_CODE);
    try {
      if (!authorizationCode) {
        throw new Error("Authorization code is not set to session storage");
      }
      if (!this.getTokensPromise) {
        this.getTokensPromise =
          this.options.tokenApi.getTokensByCodeExchange(authorizationCode);
      }
      const tokenResponse = await this.getTokensPromise;
      sessionStorage.removeItem(AUTHORIZATION_CODE);
      return tokenResponse;
    } catch (e) {
      console.error("[getTokensByCodeExchange] failed", e);
      throw e;
    }
  };

  public getAccessToken = async () => {
    if (this.isAccessTokenValid()) {
      return this.accessTokenValue;
    }
    const storageValue = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (storageValue) {
      this.accessTokenValue = storageValue;
    }
    if (this.isAccessTokenValid()) {
      return this.accessTokenValue;
    }
    // First time login, need call exchange code to token
    if (!this.isRefreshTokenValid()) {
      try {
        const tokenResponse = await this.getTokensByCodeExchange();
        this.setAccessToken(tokenResponse.accessToken);
        this.setRefreshToken(tokenResponse.refreshToken!);
        this.setSessionId(tokenResponse.sessionId);
        return tokenResponse.accessToken;
      } catch (e) {
        throw new Error("Get tokens first time after login failed");
      }
    }
    // Subsequence login
    try {
      if (!this.getTokensPromise) {
        this.getTokensPromise =
          this.options.tokenApi.getAccessTokenByRefreshToken(
            this.refreshTokenValue
          );
      }
      const tokenResponse = await this.getTokensPromise;
      this.setAccessToken(tokenResponse.accessToken);
      this.setSessionId(tokenResponse.sessionId);
      this.clearGettingAccessTokenPromise();
      return this.accessTokenValue;
    } catch (e) {
      console.error("Getting token failed test");
      this.accessTokenValue = "";
      throw e;
    }
  };

  private clearGettingAccessTokenPromise = () => {
    this.getTokensPromise = null;
  };

  public refreshAccessToken = async () => {
    try {
      if (!this.isRefreshTokenValid()) {
        throw new Error("Refresh token is invalid");
      }
      if (!this.getTokensPromise) {
        this.getTokensPromise =
          this.options.tokenApi.getAccessTokenByRefreshToken(
            this.refreshTokenValue
          );
      }
      const tokenResponse = await this.getTokensPromise;
      this.setAccessToken(tokenResponse.accessToken);
      this.clearGettingAccessTokenPromise();
      return this.accessTokenValue;
    } catch (e) {
      console.error("Getting token failed", e);
      // Check if status code is 401 => clear auth data, throw error
      this.clearAuthData();
      throw e;
    }
  };

  public logout = async () => {
    try {
      this.clearAuthData();
    } catch (e) {
      console.error("Logout failed", e);
      throw e;
    }
  };

  public clearAuthData = () => {
    console.log("Clear all local auth data");
    this.setAccessToken("");
    this.setRefreshToken("");
    this.setSessionId("");
  };

  private setAccessToken = (value: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, value);
    this.accessTokenValue = value;
  };

  public getSessionId = () => {
    return this.sessionId;
  };

  private setSessionId = (value: string) => {
    localStorage.setItem(SESSION_ID_KEY, value);
    this.sessionId = value;
  };

  private setRefreshToken = (value: string) => {
    localStorage.setItem(REFRESH_TOKEN_KEY, value);
    this.refreshTokenValue = value;
  };

  private isAccessTokenValid = () => {
    if (!this.accessTokenValue) {
      return false;
    }
    try {
      const tokenDecoded = jwt_decode<DecodedAccessToken>(
        this.accessTokenValue
      );
      if (dayjs().isAfter(dayjs.unix(tokenDecoded.exp))) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };

  private isRefreshTokenValid = () => {
    if (!this.refreshTokenValue) {
      return false;
    }
    try {
      const tokenDecoded = jwt_decode<DecodedAccessToken>(
        this.refreshTokenValue
      );
      if (dayjs().isAfter(dayjs.unix(tokenDecoded.exp))) {
        return false;
      }
      return true;
    } catch (e) {
      return false;
    }
  };
}
