import { APIMapping } from './../../index';

export interface LoginResponse {
    middlewareRequestCid: string;
    userId: string;
    profileId: string;
    name: string;
    userName: string;
    maxPersonas: number;
    firstName: string;
    lastName: string;
    token: string;
    duration: number;
    idleTimeout: number;
    profileToken: string;
    identityProvider: string;
    platform: string;
    acceptedTos: string;
    profile: Profile[];
    countryName: string;
    countryIsoCode: string;
    subscription: Subscription;
    tokenValidity: string;
    authInfo: string;
    apiMapping: APIMapping[];
    isMigratedPayPalUser: boolean;
    message: string;
    status: string;
    successCode: number;
    successMessage: string;
}

export interface Profile {
    acceptedTos: string;
    avatar: string;
    email: string;
    enablePushNotifications: string;
    gender: string;
    preferredLanguage: string;
    enablePromotions: string;
}

export interface Subscription {
    emailHash: string;
    source: string;
    subscriptionType: string;
}
