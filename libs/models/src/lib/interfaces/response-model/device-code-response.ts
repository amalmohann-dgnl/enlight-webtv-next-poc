import { APIMapping } from './../../index';

export interface DeviceCodeResponse {
    data: DeviceCodeData;
    middlewareRequestCid: string;
    apiMapping: APIMapping[];
    interval: number;
    device_code: string;
    user_code: string;
    verification_uri: string;
    verification_uri_complete: string;
    expires_in: number;
    message: string;
    status: string;
    successCode: number;
    successMessage: string;
}

export interface DeviceCodeData {
    deviceCode: string;
    userCode: string;
    verificationUri: string;
    verificationUriComplete: string;
    expiresIn: number;
    interval: number;
}

export interface TrustedLoginTokenResponse {
    token: string;
    userId: string;
    userName: string;
    authInfo: authInfo;
    duration: number;
    errorCode?: number;
    message?: string;
    status?: string;
    data?: TrustedLoginTokenResponseData;
}
export interface TrustedLoginTokenResponseData {
    authentication_token: string;
    refresh_token: string;
    refresh_token_expires_in: number;
    status: string;
    userId: string;
}
export interface authInfo {
    encryptedToken: string;
    idToken: string;
    refreshToken: string;
}
