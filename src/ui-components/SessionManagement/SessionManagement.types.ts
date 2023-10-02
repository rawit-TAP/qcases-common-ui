
export type Options = {
    checkSessionIframePath: string;
    checkSessionInterval?: number;
    idpOrigin: string;
    getSessionIdFn: () => string;
}

export const sessionCheckIframeId = 'checkSessionIframe';
