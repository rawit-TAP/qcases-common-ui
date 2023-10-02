
export type AccessTokenResponse = {
    jwt: string;
    sessionId: string;
}

export type LogoutResponse = {
    sessionId: string;
    postLogoutUrl: string;
}