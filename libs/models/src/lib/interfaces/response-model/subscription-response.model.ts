import { APIMapping } from './../../index';

export interface SubscriptionResponse {
    middlewareRequestCid: string;
    status: string;
    entitlement: Entitlement;
    apiMapping: APIMapping[];
}

export interface Entitlement {
    id: string;
    status: string;
    paymentProvider: string;
    subscriptionStatus: boolean;
    autoRenew: boolean;
    periodStart: number;
    periodEnd: number;
    productId: string;
}
