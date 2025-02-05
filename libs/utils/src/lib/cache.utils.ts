import { AxiosResponse } from 'axios';
import { CachedResponse, CustomCacheOptions } from '@enlight-webtv/models';

/**
 * @name generateCacheKey
 * @description - Generates a unique cache key based on the endpoint, params, and query params.
 * @param {string} endpoint - The API endpoint URL.
 * @param {Object} params - The parameters for the network call.
 *
 * @returns {string} A unique cache key.
 *
 * @author amalmohann
 */
const generateCacheKey = (endpoint: string, params: any): string => {
    let paramString = '';
    const paramKeys = Object.keys(params);
    if (paramKeys.length > 0) {
        for (const key of paramKeys) {
            paramString += `${key}=${params[key]}&`;
        }
        //remove last &
        paramString = paramString.slice(0, -1);
    }
    return `${endpoint}?${paramString}`;
};

/**
 * @name isCacheValid
 * @description Checks if the cache is still valid based on the cache time and validity period.
 * @param {number} cachedTime - The timestamp when the response was cached.
 * @param {number} validityPeriod - The validity period of the cache in milliseconds.
 * @returns {boolean} True if the cache is still valid, false otherwise.
 *
 * @author amalmohann
 */
const isCacheValid = (cachedTime: number, validityPeriod: number): boolean => {
    return Date.now() - cachedTime < validityPeriod;
};

/**
 * @name getAxiosCachedResponse
 * @description Performs network calls using Axios with caching support.
 * f the response is already in the cache and still valid, the Promise resolves with the cached data.
 * If the cache is not present or expired, the Promise resolves with the data from the network call.
 * If there is an error in the network call, the Promise rejects with the error.
 * @param {string} cacheKey - cache key to cache
 * @param {CustomCacheOptions} [options={}] - cache options
 * @returns {Promise<AxiosResponse | boolean>} A Promise that resolves with the response from the network call.
 *
 * @author amalmohann
 */
let CACHED_RESPONSES: Record<string, any> = {};
const getAxiosCachedResponse = async (cacheKey: string, options: CustomCacheOptions = {} as CustomCacheOptions): Promise<AxiosResponse | boolean> => {
    const { cachedTime = 0 } = options;

    if (!CACHED_RESPONSES) {
        return Promise.resolve(false);
    }

    if (CACHED_RESPONSES[cacheKey] && isCacheValid(CACHED_RESPONSES[cacheKey].cacheTimeStamp, cachedTime * 1000)) {
        const response = Promise.resolve(CACHED_RESPONSES[cacheKey].response);
        return response;
    }

    return Promise.resolve(false);
};

/**
 * @name setAxiosCachedResponse
 * @description This function will set the cache for the responses
 * @param {string} cacheKey - cache key
 * @param {AxiosResponse<any, any>} [response={}] - Response from Axios
 *
 * @author amalmohann
 */
const setAxiosCachedResponse = (cacheKey: string, requestUrl: string, response: AxiosResponse<any, any>) => {
    if (cacheKey && response) {
        const cachedResponse: CachedResponse = {} as CachedResponse;
        cachedResponse.response = response;
        cachedResponse.requestUrl = requestUrl;
        cachedResponse.cacheTimeStamp = Date.now();
        CACHED_RESPONSES[cacheKey] = cachedResponse;
    }
};

/**
 * @name getCachedResponses
 * @description This function will return the cached responses
 * @returns {object} - cache map
 *
 * @author amalmohann
 */
const getCachedResponses = () => {
    return CACHED_RESPONSES;
};

/**
 * @name clearCachedResponses
 * @description This function will clear the cached responses
 * @returns {object} - cache map
 *
 * @author amalmohann
 */
const clearCachedResponses = () => {
    CACHED_RESPONSES = {};
};

export { generateCacheKey, isCacheValid, getAxiosCachedResponse, setAxiosCachedResponse, getCachedResponses, clearCachedResponses };
