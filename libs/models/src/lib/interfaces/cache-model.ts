import { AxiosResponse } from 'axios';

export interface CustomCacheOptions {
    cachedTime?: number;
    cache: boolean;
}

export interface CachedResponse {
    response: AxiosResponse<any, any>;
    requestUrl: string;
    cacheTimeStamp: number;
}
