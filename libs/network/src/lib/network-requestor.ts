'use client'

import axios, { InternalAxiosRequestConfig, AxiosResponse, AxiosError, AxiosInstance } from 'axios';
// import axiosRetry from 'axios-retry';
// import { LogglyServices } from '@enlight-webtv/analytics-services';
import {
    AxiosErrCode,
    CountryInfo,
    Platform,
    ProfileListData,
    Project,
    ResponseCode,
    StorageKeys,
    Token,
} from '@enlight-webtv/models';
import { storageUtilities } from '@enlight-webtv/utilities';

// Services
const { getState } = storageUtilities;
// const logglyServices = new LogglyServices();

const getProjectConfig = (project: Project) => {
    const projectConfig: Record<Project, any> = {
        [Project.RALLY_TV]: {
            mandatoryParams: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                platform: !!window.Android ? JSON.parse(window.Android.getAndroidDeviceInfo()).platformName : Platform.WebTv,
            },
        },
        [Project.ENLIGHT]: {
            mandatoryParams: {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                platform: !!window.Android ? JSON.parse(window.Android.getAndroidDeviceInfo()).platformName : Platform.WebTv,
            },
        },
        [Project.CMGO]: {
            mandatoryParams: {
                platform: Platform.WebTv,
                language: (getState(StorageKeys.PROFILE) as ProfileListData)?.preferences?.language ?? 'en',
                region: (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode,
                maxParentalRatings: getState(StorageKeys.PROFILE)?.maxParentalRatings?.[0],
            },
        },
        [Project.VIDEOTRON]: {
            optionalParams: [
                {
                    paths: [
                        'content/filters',
                        '/getSeriesDetails',
                        'player/playbackEpisode',
                        'content/items',
                        '/content/',
                        'content/nextPreviousEpisodes',
                        '/searchSuggestions',
                        '/search',
                        '/accounts/profiles/favourites',
                        '/accounts/profiles/recently-watched',
                        '/recentSearch',
                    ],
                    params: { language: 'fr' },
                },
                {
                    paths: ['/entries'],
                    params: { locale: 'fr' },
                },
            ],
        },
    };
    return projectConfig[project];
};

export const getProjectSpecificParams = (project: Project) => getProjectConfig(project)?.mandatoryParams;

class NetworkRequestor {
    private static instance: NetworkRequestor;
    private axiosInstance: AxiosInstance;
    private baseURL: string;
    private projectName: Project;
    private abortControllers: Map<string, AbortController>;

    constructor() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.baseURL = 'https://preprod-api.illicoplus.ca/v1b1/';
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.projectName = Project.VIDEOTRON;
        this.axiosInstance = axios.create({ baseURL: this.baseURL });
        this.abortControllers = new Map<string, AbortController>();
        this.configureInterceptors();
    }

    public static getInstance(): NetworkRequestor {
        if (!NetworkRequestor.instance) {
            NetworkRequestor.instance = new NetworkRequestor();
        }
        return NetworkRequestor.instance;
    }

    private configureInterceptors() {
        const skipAuthorizationHeaderList = [
            '/request/entries',
            '/config/entries',
            '/accounts/login',
            '/accounts/device/code',
            '/accounts/trustedLogin',
            '/location',
            '/content',
        ];

        const skipRequestsFromAbortController = [
            '/accounts/profiles/favourites',
            '/accounts/profiles/recently-watched',
            '/player/progress',
            '/recentSearch',
            '/accounts/trustedLogin',
            '/accounts/login',
            '/config/entries',
            '/request/entries',
        ];
        const skipUnauthorizedAccessCheck = ['profiles/pin'];

        // Apply axios-retry
        // axiosRetry(this.axiosInstance, {
        //     // Set the maximum number of retry attempts
        //     retries: 3,
        //     retryCondition: error => {
        //         const { code, config, response } = error;
        //         const statusCode = response?.status || code;
        //         const shouldRetry =
        //             statusCode &&
        //             // Check if the error code is in the list of status codes that can be retried
        //             ['401', '404', '408', '500', '502', '503', '504', '522', '524'].includes(statusCode.toString()) &&
        //             config?.url &&
        //             // Make sure it is not in the skip auth list
        //             !skipAuthorizationHeaderList.some(substring => config?.url?.includes(substring));
        //         return !!shouldRetry;
        //     },
        //     //the delay between retry attempts
        //     retryDelay: axiosRetry.exponentialDelay,
        // });

        this.axiosInstance.interceptors.request.use(
            (request: InternalAxiosRequestConfig<any>) => {
                const controller = new AbortController();
                request.signal = controller.signal;

                // Store the controller instance with the request URL as the key
                if (request.url && !skipRequestsFromAbortController.some(substring => request?.url?.includes(substring))) {
                    this.abortControllers.set(request.url || '', controller);
                }

                if (request.method === 'get') {
                    const extraParamConfig = getProjectConfig(this.projectName);

                    // Add all project specific mandatory parms along with the request
                    request.params = {
                        ...request.params,
                        ...extraParamConfig?.mandatoryParams,
                    };

                    // Get optional param configuration
                    const optionalParams = extraParamConfig?.optionalParams;

                    // Get required optional param config
                    const matchingOptionalParamConfig = optionalParams?.find((parmConfig: any) => {
                        return parmConfig.paths.some((urlPath: string) => {
                            return request?.url?.includes(urlPath);
                        });
                    });

                    // Add the optional params to the request if available
                    if (matchingOptionalParamConfig && matchingOptionalParamConfig?.params) {
                        request.params = {
                            ...request.params,
                            ...matchingOptionalParamConfig?.params,
                        };
                    }
                }

                if (request.url === 'subscription/status') {
                    const tokenKey = this.projectName === Project.CMGO ? Token.USER_PROFILE_TOKEN : Token.USER_CONSUMER_TOKEN;
                    const token = getState(tokenKey);
                    request.headers.Authorization = `Bearer ${token}`;
                    return request;
                }

                if (request.url && !skipAuthorizationHeaderList.some(substring => request?.url?.includes(substring))) {
                    const userToken =
                        this.projectName === Project.VIDEOTRON ? getState(Token.USER_CONSUMER_TOKEN) : getState(Token.USER_PROFILE_TOKEN);
                    if (userToken) {
                        request.headers.Authorization = `Bearer ${userToken}`;
                    }
                    return request;
                }

                return request;
            },
            (error: AxiosError) => {
                //send log when error in request
                // logglyServices.sendLog({
                //     module: ModuleType.General,
                //     logType: LogType.ERROR,
                //     logLevel: LogLevel.ERROR,
                //     errorPathObject: new Error(),
                //     errorShown: false,
                //     retryCount: 0,
                //     errorCode: GeneralModuleErrorType.APIError,
                //     apiErrorData: { responseData: error },
                // });

                console.error('An error occurred in the request:', error);
                throw error;
            },
        );

        this.axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                // Remove the controller from the map once the request is completed
                this.abortControllers.delete(response.config.url || '');
                return response;
            },
            (error: AxiosError) => {
                if (error?.code === AxiosErrCode.ERR_NETWORK && !navigator.onLine) {
                    // const activeHash = Router.getActiveHash();
                    // const storeRoute = true;
                    // Router.navigate(Routes.NETWORK_ERROR, { error: AxiosErrCode.ERR_NETWORK, route: activeHash, keepAlive: true }, storeRoute);
                } else if (error?.response?.status === ResponseCode.UNAUTHORIZED) {
                    const responseUrl = error?.request?.responseURL;
                    if (responseUrl && skipUnauthorizedAccessCheck.some(substring => responseUrl?.includes(substring))) {
                        console.error('An error occurred in the response:', error);
                        return error.response?.data ? error.response.data : error;
                    }

                    // Router.navigate(Routes.LOGIN, false);
                }
                console.error('An error occurred in the response:', error);

                if (error?.config?.url !== 'health' && error?.code !== AxiosErrCode.ERR_NETWORK && navigator.onLine) {
                    // logglyServices.sendLog({
                    //     module: ModuleType.General,
                    //     logType: LogType.ERROR,
                    //     logLevel: LogLevel.ERROR,
                    //     errorPathObject: new Error(),
                    //     errorShown: false,
                    //     data: { infoData: { retryCount: 0 } },
                    //     errorCode: GeneralModuleErrorType.APIError,
                    //     apiErrorData: { responseData: error },
                    // });
                }

                return error?.response?.data ? error?.response?.data : error;
            },
        );
    }

    public getAxiosInstance() {
        return this.axiosInstance;
    }

    public abortAllRequests() {
        this.abortControllers.forEach(controller => controller.abort());
        this.abortControllers.clear();
    }
}

export default NetworkRequestor;
