import { AxiosResponse } from 'axios';
import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import {
    Features,
    Platform,
    FeatureUserManagement,
    LoginResponse,
    LogglyActionType,
    LogLevel,
    LogType,
    ModuleType,
    DeviceCodeResponse,
    TrustedLoginParams,
    TrustedLoginTokenResponse,
    StorageKeys,
    LabelKey,
    Routes,
    UserAuthConfiguration,
    ErrorPopupData,
    TrustedLoginTokenResponseData,
    FeatureProfileManagement,
    EventType,
    Project,
} from '@enlight-webtv/models';
import {
    authUtilities,
    storageUtilities,
    configurationUtilities,
    deviceUtilities,
    errorUtilities,
    networkUtilities,
    commonUtilities,
    projectUtilities,
} from '@enlight-webtv/utilities';
import { LogglyServices, AnalyticsServices } from '@enlight-webtv/analytics-services';
import { PaymentServices } from '.';
import { redirect } from 'next/navigation';

//services
const logglyServices = new LogglyServices();
const analyticsService = new AnalyticsServices();
const { subscriptionStatus, destroy: destroyPaymentServices } = new PaymentServices();

//utilities
const { encodeToBase64Token } = authUtilities;
const { getFeatureByKey, getLabel } = configurationUtilities;
const { setupErrorPopup } = errorUtilities;
const { prepareParams } = networkUtilities;
const { exitApp } = deviceUtilities;
const { isValidValue } = commonUtilities;
const { clearUserDataInStorage } = storageUtilities;
const { getProjectName } = projectUtilities;
const { getState, setState } = storageUtilities;


/**
 * @name AuthServices
 * @type service class
 * @description This class will have all the network services that need to be used for authentication.
 *
 * @author amalmohann
 */
class AuthServices {
    static instance: AuthServices | null;
    private networkRequestor;
    private refreshTokenTimer: any;

    constructor(create = false) {
        if (create) this.destroy();
        if (AuthServices.instance) {
            return AuthServices.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        AuthServices.instance = this;
    }

    destroy() {
        if (AuthServices.instance === this) {
            AuthServices.instance = null;
            destroyPaymentServices();
        }
    }

    /**
     * @name login
     * @type service
     * @description this service will be used to login to the application
     * @param user
     * @return {AxiosResponse<BaseConfiguration, any>}
     *
     * @author amalmohann
     */
    login = async (username: string, password: string): Promise<AxiosResponse<LoginResponse, any>> => {
        //get user management configuration
        const featureUserManagement: FeatureUserManagement = getFeatureByKey(Features.FeatureUserManagement) as FeatureUserManagement;
        const loginMethod = featureUserManagement.loginMethods[0];

        //encoding the username and password
        const token = encodeToBase64Token(username, password);

        //api call
        const response: AxiosResponse<LoginResponse, any> = await this.networkRequestor!.post(
            '/accounts/login',
            {
                platform: Platform.WebTv,
                identityProvider: loginMethod,
            },
            {
                headers: {
                    Authorization: token,
                },
            },
        );

        return response;
    };

    /**
     * @name logout
     * @type service
     * @description this service will be used to logout from the application
     * @return {AxiosResponse<BaseConfiguration, any>}
     *
     * @author anandpatel
     */
    logout = async (): Promise<AxiosResponse<LoginResponse, any>> => {
        // Send logout succesfull analytics log
        analyticsService.sendMixPanelEvent(EventType.USER_LOGOUT);

        // Clear out any user rleated data in storage
        clearUserDataInStorage();

        //get user management configuration
        const featureUserManagement: FeatureUserManagement = getFeatureByKey(Features.FeatureUserManagement) as FeatureUserManagement;
        const loginMethod = featureUserManagement.loginMethods[0];

        //api call
        const response: AxiosResponse<LoginResponse, any> = await this.networkRequestor!.post('/accounts/logout', {
            platform: Platform.WebTv,
            identityProvider: loginMethod,
        });

        if (response?.data?.status === 'Success') {
            //send log when logout success
            logglyServices.sendLog({
                module: ModuleType.Authentication,
                logType: LogType.INFO,
                errorPathObject: new Error(),
                logLevel: LogLevel.INFO,
                action: LogglyActionType.LogoutClick,
                errorShown: false,
                data: { infoData: { debug_message: 'Logout success' } },
            });
        }

        return response;
    };

    /**
     * @name getActivationCode
     * @type service
     * @description this service will be used to get the device activation code
     * @return {AxiosResponse<DeviceCodeResponse, any>}
     *
     * @author anandpatel
     */
    getActivationCode = async (clientId?: string): Promise<AxiosResponse<DeviceCodeResponse, any>> => {
        const deviceId = getState(StorageKeys.DEVICEINFO).deviceId;
        const response: AxiosResponse<DeviceCodeResponse, any> = await this.networkRequestor!.post('/accounts/device/code', {
            clientId: clientId,
            deviceId: deviceId,
            timeStamp: new Date().getTime().toString(),
            platform: Platform.WebTv,
        });
        return response.data ? response : Promise.reject(response);
    };

    /**
     * @name getTrustedLoginToken
     * @type service
     * @description this service will be used to check if user has activated the TV or not
     * @return {AxiosResponse<TrustedLoginTokenResponse, any>}
     *
     * @author anandpatel
     */
    getTrustedLoginToken = async (param: TrustedLoginParams): Promise<AxiosResponse<TrustedLoginTokenResponse, any>> => {
        //api call
        const deviceId = getState(StorageKeys.DEVICEINFO).deviceId;
        const response: AxiosResponse<TrustedLoginTokenResponse, any> = await this.networkRequestor!.post(
            '/accounts/trustedLogin',
            {
                ...param,
            },
            {
                headers: {
                    Authorization: `Basic ${btoa(unescape(encodeURIComponent(`${deviceId}::${param.userCode}`)))}`,
                },
            },
        );

        return response;
    };

    /**
     * @name getTrustedLoginTokenRefresh
     * @type service
     * @description this service will be used to check if user has activated the TV or not
     * @return {AxiosResponse<TrustedLoginTokenResponse, any>}
     *
     * @author anandpatel
     */
    refreshTrustedLoginToken = async (param: any): Promise<AxiosResponse<TrustedLoginTokenResponse, any>> => {
        //api call
        const response: AxiosResponse<TrustedLoginTokenResponse, any> = await this.networkRequestor!.post('/accounts/trustedLogin', {
            ...prepareParams(param),
        });

        return response;
    };

    /**
     * @name refreshAccountLoginToken
     * @type service
     * @description this service will be used to check if user has activated the TV or not
     * @return {AxiosResponse<TrustedLoginTokenResponse, any>}
     *
     * @author anandpatel
     */
    refreshAccountLoginToken = async (param: any, headers: any): Promise<AxiosResponse<TrustedLoginTokenResponse, any>> => {
        //api call
        const response: AxiosResponse<TrustedLoginTokenResponse, any> = await this.networkRequestor!.get('/account/refresh', {
            params: {
                ...prepareParams(param),
            },
            headers: headers,
        });

        return response;
    };

    /**
     * @name refreshToken
     * @type function
     * @description this function will be used to refresh the token and user info
     *
     * @author anandpatel
     */
    refreshToken = async (
        trustedLoginData: TrustedLoginTokenResponse | TrustedLoginTokenResponseData,
        authConfigurations: UserAuthConfiguration,
        pageRefresh = true,
    ) => {
        // get the login info
        const loginInfo = getState(StorageKeys.LOGIN_INFO);
        // Get the timestamp when the token was last refreshed
        const tokenRefreshedTime = (loginInfo as any)?.time;

        // Extract the expiration duration of the refresh token (in milliseconds or seconds)
        const refresh_token_expires_in_MS = (trustedLoginData as TrustedLoginTokenResponseData)?.refresh_token_expires_in;
        const refresh_token_expires_in_S = (trustedLoginData as TrustedLoginTokenResponse)?.duration;

        // Determine the refresh token's duration (fallback to seconds if milliseconds is unavailable)
        const duration = refresh_token_expires_in_MS || refresh_token_expires_in_S * 1000;

        // Get the configured access token refresh interval from contentful configurations
        const accessTokenRefreshInterval = authConfigurations?.accessTokenRefreshInterval as number;

        // Calculate the shortest refresh interval between the token's duration and the configured refresh interval
        const tokenRefreshInterval = Math.min(duration, accessTokenRefreshInterval);

        // Get the logout extend period from contentful configurations
        const logoutExtendPeriod = authConfigurations?.logoutExtendPeriod;

        // Get the current timestamp in milliseconds
        const currentTimeInMs = new Date().getTime();

        let params, headers, tokenRefreshResponse: any, tokenRefreshResponseData: any;

        // Check if the trustedLoginData contains a refresh token (for the refresh token API call)
        if ((trustedLoginData as TrustedLoginTokenResponseData).refresh_token) {
            params = {
                platform: Platform.WebTv,
            };
            headers = {
                Authorization: 'Bearer ' + (trustedLoginData as TrustedLoginTokenResponseData).authentication_token,
                refresh_token: (trustedLoginData as TrustedLoginTokenResponseData).refresh_token,
            };

            tokenRefreshResponseData = await this.refreshAccountLoginToken(params, headers);
        } else {
            params = {
                authMode: 'refreshToken',
                forceRefresh: true,
                platform: Platform.WebTv,
                authInfo: (trustedLoginData as TrustedLoginTokenResponse).authInfo!,
                identityProvider: authConfigurations?.identityProvider,
            };

            // Call the API to refresh the trusted login token
            tokenRefreshResponse = await this.refreshTrustedLoginToken(params);
        }

        // If the refresh response contains token data, update the app's state with the new token information
        if (tokenRefreshResponse?.data || tokenRefreshResponseData?.data) {
            // Get the current timestamp again after the refresh
            const currentTimeInMs = new Date().getTime();

            // Store the updated login information in local storage
            setState(StorageKeys.LOGIN_INFO, {
                LoginMode: authConfigurations?.identityProvider,
                time: currentTimeInMs,
                ...(tokenRefreshResponse?.data ?? tokenRefreshResponseData?.data?.data),
            });

            // Store the authentication token in local storage for subsequent requests
            setState(
                StorageKeys.USER_PROFILE_TOKEN,
                tokenRefreshResponse?.data?.authInfo ?? tokenRefreshResponseData?.data?.data?.authentication_token,
            );

            // Store the refresh token for future use
            setState(StorageKeys.USER_CONSUMER_TOKEN, tokenRefreshResponse?.data.token ?? tokenRefreshResponseData?.data?.data?.refresh_token);

            // If the project is not "Videotron", fetch the subscription status and store it
            if (getProjectName() !== Project.VIDEOTRON) {
                const subscriptionStatusResponse = await subscriptionStatus();
                const isUserSubscribed = subscriptionStatusResponse?.data?.entitlement?.subscriptionStatus;
                setState(StorageKeys.IS_USER_SUBSCRIBED, isUserSubscribed);
            }

            // Check if profile management is enabled in the project features
            const profileManagement = getFeatureByKey(Features.featureProfileManagement) as FeatureProfileManagement;
            const isValidProfileFeature = isValidValue(profileManagement);

            // Set up a timer to automatically refresh the token at the calculated refresh interval
            if (!this.refreshTokenTimer) {
                this.refreshTokenTimer = setInterval(() => {
                    // Recursively refresh the token periodically
                    this.refreshToken(tokenRefreshResponse.data ?? tokenRefreshResponseData, authConfigurations, false);
                }, tokenRefreshInterval * 1000);
            }

            // Navigate to the profile or homepage based on the feature flag
            pageRefresh && redirect(isValidProfileFeature ? Routes.PROFILES : Routes.HOMEPAGE);
            return;
        } else {
            // If token refresh failed, check if the logout extend period has expired
            if (currentTimeInMs < tokenRefreshedTime + logoutExtendPeriod * 1000) {
                // If the user can still be kept logged in, retry the token refresh or navigate to the profile/homepage
                if (pageRefresh) {
                    if (!this.refreshTokenTimer) {
                        this.refreshTokenTimer = setInterval(() => {
                            const loginInfo = getState(StorageKeys.LOGIN_INFO);
                            this.refreshToken(loginInfo, authConfigurations, false);
                        }, tokenRefreshInterval * 1000);
                    }

                    // Check if profile management is valid and navigate accordingly
                    const profileManagement = getFeatureByKey(Features.featureProfileManagement) as FeatureProfileManagement;
                    const isValidProfileFeature = isValidValue(profileManagement);
                    redirect(isValidProfileFeature ? Routes.PROFILES : Routes.HOMEPAGE);
                }
            } else if (pageRefresh) {
                // If the user should be logged out, clear their data and navigate to the login page
                clearUserDataInStorage();
                redirect(Routes.LOGIN);
            } else {
                // If the refresh failed, show an error popup with options to logout or exit
                const data = {
                    logoSrc: 'icons/error/logout.png',
                    title: getLabel(LabelKey.LABEL_LOGOUT_POPUP_TITLE),
                    description: getLabel(LabelKey.LABEL_LOGOUT_POPUP_DESCRIPTION),
                    buttons: [
                        {
                            label: getLabel(LabelKey.LABEL_LOGOUT_BUTTON),
                            handleEnterPress: async () => {
                                // Handle logout and redirect to login screen
                                this.logout();
                                clearUserDataInStorage();
                                redirect(Routes.LOGIN);
                            },
                            handleBackPress: () => null,
                        },
                        {
                            label: getLabel(LabelKey.LABEL_EXIT),
                            handleEnterPress: () => exitApp(), // Exit the application
                            handleBackPress: () => null,
                        },
                    ],
                } as ErrorPopupData;

                // Show the error popup and stop the refresh token interval
                setupErrorPopup(data);
                clearInterval(this.refreshTokenTimer);
            }
        }
    };
}

export default AuthServices;
