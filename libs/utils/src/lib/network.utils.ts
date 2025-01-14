import { Router } from '@lightningjs/sdk';
import * as commonUtilities from './common.utils';
import { AxiosErrCode, Routes } from '@enlight-webtv/models';

//utilities
const { isValidValue } = commonUtilities;

/**
 * @name prepareParams
 * @type function/method
 * @description This function will take object as input and return param
 * @param {Record<string, any>} params - object of parameters
 * @return {Record<string, any>} params - the text texture settings. (default is body preset)
 *
 * @author amalmohann
 */
const prepareParams = (params: Record<string, any> | undefined): Record<string, any> => {
    //check for valid params
    if (!isValidValue(params)) {
        return {};
    }

    const validKeyValues: Record<string, any> = {};
    for (const key in params) {
        const value = params[key];
        if (isValidValue(value)) {
            // Check if the value is not falsy (e.g., not null, undefined, '', etc.)
            validKeyValues[key] = value;
        }
    }
    return validKeyValues;
};

/**
 * @name extractParams
 * @type function/method
 * @description This function will take string params and converts into records
 * @param {string} params - object of parameters
 * @return {Record<string, any>} params - the text texture settings. (default is body preset)
 *
 * @author amalmohann
 */
const extractParams = (paramString: string): Record<string, any> => {
    const extractedParams: Record<string, any> = {};
    let params: string[] = [paramString];

    if (paramString?.includes('&')) {
        params = paramString.split('&');
    } else if (paramString?.includes(',')) {
        params = paramString.split(',');
    }

    if (isValidValue(params)) {
        params.forEach((param: string) => {
            const paramMap = param?.split('=');
            if (paramMap && paramMap.length === 2) {
                const key: string = paramMap[0]!.trim();
                const value: string = paramMap[1]!.trim();
                extractedParams[key] = value;
            }
        });
    }
    return extractedParams;
};

/**
 * @name fetchImage
 * @type function/method
 * @description This function will fetch the image
 * @param {string} url - object of parameters
 * @return {Promise<Image>} image
 *
 * @author amalmohann
 */
const fetchImage = (url: string) => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous'; // Allow cross-origin requests
        img.onload = () => resolve(img);
        img.onerror = error => reject(error);
        img.src = url;
    });
};

/**
 * @name addNetworkStateChangeListener
 * @type function/method
 * @description This function will add the network change event listner to tizen
 * @param {string} webapis - webapi object
 *
 * @author anandpatel
 */
const addNetworkStateChangeListener = (webapis: any) => {
    webapis?.network?.addNetworkStateChangeListener(function (value: string) {
        const activeHash = Router.getActiveHash();
        if (value == webapis.network.NetworkState.GATEWAY_DISCONNECTED && activeHash !== Routes.NETWORK_ERROR) {
            const storeRoute = true;
            Router.navigate(Routes.NETWORK_ERROR, { error: AxiosErrCode.ERR_NETWORK, route: activeHash, keepAlive: true }, storeRoute);
        }
    });
};

export { prepareParams, extractParams, fetchImage, addNetworkStateChangeListener };
