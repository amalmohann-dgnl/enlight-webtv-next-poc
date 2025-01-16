import { Project, StorageKeys, SubscriptionType, Token } from '@enlight-webtv/models';
import { isValidValue } from './common.utils';
import { storageUtilities } from '.';

//import services
const { getState } = storageUtilities;

/**
 * @name encodeToBase64Token
 * @type function/method
 * @description This function will convert the strings to base64 encoded
 * @param {string} param1 - string that need to be encoded
 * @param {string} param2 - string that need to be encoded
 * @return {string} - base 64 encoded token
 *
 * @author amalmohann
 */
const encodeToBase64Token = (param1: string, param2: string) => {
    if (!param1 || !param2) return '';
    const URIFormattedData = encodeURIComponent(`${param1}:${param2}`);
    return `Basic ${btoa(unescape(URIFormattedData))}`;
};

/**
 * @name getIsAuthenticated
 * @type function/method
 * @description this function checks if the user is authenticated.
 * @return {Promise<boolean> } - returns if user is authenticated
 * @author tonyaugustine
 */
const getIsAuthenticated = (): Promise<boolean> => {
    return new Promise(resolve => {
        const isAuthenticated = isValidValue(getState(Token.USER_CONSUMER_TOKEN)) && isValidValue(getState(Token.USER_PROFILE_TOKEN));
        resolve(isAuthenticated);
    });
};

/**
 * @name getSubscriptionType
 * @type function
 * @description This function will return the subscription type of the user. If the user is
 * not logged in - anonymous subscription will be returned
 * logged in - registered subscription will be returned
 * logged in and subscribed - subscribed subscription will be return subscribed.
 * @return {SubscriptionType}
 *
 * @author amalmohann
 */
const getSubscriptionType = async (): Promise<SubscriptionType> => {
    // return SubscriptionType.Subscribed;
    // fetch the status
    const isAuthenticated = await getIsAuthenticated();
    const subscriptionStatus = await getState('isUserSubscribed');

    //set the status
    const isRegistered = !!isAuthenticated;
    const isSubscribed = !!subscriptionStatus;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const project = Project.VIDEOTRON;
    if (project === Project.VIDEOTRON) {
        return getState(StorageKeys.LOGIN_INFO)?.subscription?.subscriptionType?.toLowerCase() ?? SubscriptionType.Anonymous;
    }

    //check the status
    if (isRegistered) {
        if (isSubscribed) {
            return SubscriptionType.Subscribed;
        }
        return SubscriptionType.Registered;
    }
    return SubscriptionType.Anonymous;
};

/**
 * @name getSubscriptionDetails
 * @type function
 * @description This function will return the details of subscription status.
 * @return {SubscriptionType}
 *
 * @author amalmohann
 */
const getSubscriptionDetails = () => {
    return getState(StorageKeys.LOGIN_INFO)?.subscription;
};

export { encodeToBase64Token, getIsAuthenticated, getSubscriptionType, getSubscriptionDetails };
