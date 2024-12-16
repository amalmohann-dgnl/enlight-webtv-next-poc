import { authInfo } from './../../index';

export interface TrustedLoginParams {
    authMode: string;
    code: string;
    platform: string;
    tokenDuration: number;
    redirectUri: string;
    identityProvider: string;
    userCode: string;
}

export interface TrustedLoginTokenRefreshParams {
    authMode: string;
    forceRefresh: boolean;
    platform: string;
    authInfo: authInfo;
    identityProvider: string;
}
