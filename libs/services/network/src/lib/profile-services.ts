'use client'
import { AxiosResponse } from 'axios';
import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import {
    ContentResponse,
    Platform,
    StorageKeys,
    Token,
    LogglyActionType,
    LogLevel,
    LogType,
    ModuleType,
    ProfileModuleErrorType,
    ProfileListData,
    PageComponent,
    ProfileData,
    CountryInfo,
} from '@enlight-webtv/models';
import { LogglyServices } from '@enlight-webtv/analytics-services';
import { configurationUtilities, networkUtilities, storageUtilities } from '@enlight-webtv/utilities';

//import the services
const { getState, setState } = storageUtilities;
const logglyServices = new LogglyServices();

//getting the profile token if exists
let token = '';

// utilities
const { getFavouritesPageConfig } = configurationUtilities;
const { prepareParams, extractParams } = networkUtilities;

/**
 * @name ProfileServices
 * @type service class
 * @description This class will have all the network services that need to be used for profiles.
 *
 * @author amalmohann
 */
class ProfileServices {
    static instance: ProfileServices | null;
    private networkRequestor;

  constructor(create = false) {
        token =  getState(Token.USER_PROFILE_TOKEN);
        if (create) this.destroy();
        if (ProfileServices.instance) {
            return ProfileServices.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        ProfileServices.instance = this;
    }

    destroy() {
        if (ProfileServices.instance === this) {
            ProfileServices.instance = null;
        }
    }

    /**
     * @name getContinueWatching
     * @type service
     * @description this service will be used to continueWatching to the application
     * @param user
     * @return {AxiosResponse<ContentResponse, any>}
     *
     * @author amalmohann
     */
    getRecentlyWatching = async (): Promise<AxiosResponse<ContentResponse, any> | null> => {
        try {
            //api call
            const response: AxiosResponse<ContentResponse, any> = await this.networkRequestor!.get('/accounts/profiles/recently-watched', {
                params: {
                    page: 1,
                    // size: 10,
                    maxResumePercent: 95,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // TODO: Need to make this implementation dynamic
            const maxRecentlyWatchedItems = 15;
            if (response?.data?.content.length) {
                const splicedContents = (response?.data?.content || []).splice(0, maxRecentlyWatchedItems);
                response.data.content = splicedContents;
            }
            return response;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    /**
     * @name getFavourites
     * @type service
     * @description this service will be used to get favourites for the application
     * @param {number} apiPageSize - apiPageSize contains limit of page size
     * @return {AxiosResponse<BaseConfiguration, any>}     *
     * @author anandpatel
     */
    getFavourites = async (apiPageSize: number = 20): Promise<AxiosResponse<any, any> | null> => {
        try {
            //api call
            const response: AxiosResponse<any, any> = await this.networkRequestor!.get('/accounts/profiles/favourites', {
                params: {
                    page: 1,
                    limit: apiPageSize,
                    platform: Platform.WebTv,
                },
            });
            if (response?.data) {
                this.updateFavorites(response.data);
            }

            // send log when there are no favourites
            if (response?.data && response?.data?.content.length === 0) {
                logglyServices.sendLog({
                    module: ModuleType.Profile,
                    logType: LogType.ERROR,
                    errorPathObject: new Error(),
                    logLevel: LogLevel.INFO,
                    errorShown: true,
                    errorCode: ProfileModuleErrorType.GenericNoFavourite,
                    data: {
                        infoData: { debug_message: 'Favourites list empty' },
                    },
                });
            }
            return response.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    /**
     * @name updateFavorites
     * @type function/method
     * @description Updates the list of favorite items in the local storage.
     * @param {any} responseData - The response data contains array of favourite items.
     * @author anandpatel
     */
    private updateFavorites = (responseData: any) => {
        if (responseData) {
            const favourites = responseData;
            setState(StorageKeys.FAVOURITES, JSON.stringify(favourites));
        }
    };

    /**
     * @name removeFavourites
     * @type service
     * @description this service will be used to remove favourites for the application
     * @param {string} mediaID - mediaID contains seriesUid incase of content type calendar else it will be uid
     * @return {AxiosResponse<BaseConfiguration, any>}
     * @author anandpatel
     */
    removeFavourites = async (mediaID: string): Promise<AxiosResponse<any, any> | null> => {
        try {
            const region = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
            //api call
            const response: AxiosResponse<any, any> = await this.networkRequestor!.delete('/accounts/profiles/favourites', {
                data: {
                    media_id: mediaID,
                    platform: Platform.WebTv,
                    region,
                },
            });

            //send log when removing favourite failed
            if (response.status !== 200) {
                logglyServices.sendLog({
                    module: ModuleType.Profile,
                    logType: LogType.ERROR,
                    errorPathObject: new Error(),
                    logLevel: LogLevel.WARNING,
                    action: LogglyActionType.RemoveFavouriteClick,
                    errorShown: false,
                    retryCount: 0,
                    errorCode: ProfileModuleErrorType.GenericErrorRemoveFavourite,
                });
            }
            return response.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    /**
     * @name checkFavourites
     * @type service
     * @description this service will be used to check favourites for the mediaId
     * @param {string} mediaID - mediaID contains seriesUid incase of content type calendar else it will be uid
     * @return {AxiosResponse<BaseConfiguration, any>}
     * @author anandpatel
     */
    checkFavourites = async (mediaID: string): Promise<AxiosResponse<any, any> | null> => {
        const favoritesConfig = getFavouritesPageConfig();
        const params = (favoritesConfig?.components?.[0] as PageComponent)?.contents?.[0]?.params;
        const paramMap = extractParams(params || '');
        const preparedParams = prepareParams(paramMap);

        try {
            //api call
            const response: AxiosResponse<any, any> = await this.networkRequestor!.get(`/accounts/profiles/favourites/${mediaID}`, {
                params: preparedParams,
            });
            return response.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    /**
     * @name addFavourites
     * @type service
     * @description this service will be used to add favourites for the mediaId
     * @param {string} mediaID - mediaID contains seriesUid incase of content type calendar else it will be uid
     * @param {string} mediaType - mediaType contains type of content to be removed
     * @return {AxiosResponse<BaseConfiguration, any>}
     * @author anandpatel
     */
    addFavourites = async (mediaID: string, mediaType: string): Promise<AxiosResponse<any, any> | null> => {
        try {
            const region = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
            //api call
            const response: AxiosResponse<any, any> = await this.networkRequestor!.post('/accounts/profiles/favourites', {
                media_id: mediaID,
                mediaType: mediaType,
                platform: Platform.WebTv,
                region,
            });

            //send log when adding favourite failed
            if (response.status != 200) {
                logglyServices.sendLog({
                    module: ModuleType.Profile,
                    logType: LogType.ERROR,
                    errorPathObject: new Error(),
                    logLevel: LogLevel.ERROR,
                    action: LogglyActionType.AddFavouriteClick,
                    errorShown: false,
                    retryCount: 0,
                    errorCode: ProfileModuleErrorType.GenericAddFavourite,
                });
            }
            return response.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };

    /**
     * @name getProfiles
     * @type service
     * @description this service will be used to get different profiles associated with an account
     *
     * @author alwin-baby
     */
    getProfiles = async (): Promise<AxiosResponse<any, any> | null> => {
        try {
            //api call
            const response: any = await this.networkRequestor!.get('profiles', {
                params: {
                    platform: Platform.WebTv,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (err: any) {
            console.error(err);
            return err?.data;
        }
    };

    /**
     * @name setProfile
     * @type service
     * @description this service will be used to set the currently selected profile associated with an account
     *
     * @author alwin-baby
     */
    setProfile = async (profileId: string): Promise<ProfileData | null> => {
        try {
            //api call
            const response: any = await this.networkRequestor!.get(`profiles/${profileId}`, {
                params: {
                    platform: Platform.WebTv,
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (err: any) {
            console.error(err);
            return err?.data;
        }
    };

    /**
     * @name updateProfileLanguage
     * @type service
     * @description this service will be used to update the language of a profile
     * @param language - language code
     *
     * @author tonyaugustine
     */
    // TODO: add proper network call
    updateProfileLanguage = async (language: string) => {
        try {
            //api call
            const response: any = await this.networkRequestor!.put(
                'profiles',
                {
                    platform: Platform.WebTv,
                    preferences: { language },
                },
                { headers: { Authorization: `Bearer ${token}` } },
            );

            return response.data;
        } catch (err: any) {
            console.error(err);
            return err?.data;
        }
    };

    /**
     * @name verifyPin
     * @type service
     * @description this service will be used to verify the pin associated with a profile
     *
     * @author alwin-baby
     */
    verifyPin = async (pin: string): Promise<any | null> => {
        try {
            const profile: ProfileListData = getState(StorageKeys.PROFILE);
            const region = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
            const { maxParentalRatings } = profile;

            //api call
            const response: any = await this.networkRequestor!.post(
                'profiles/pin',
                { maxParentalRatings: maxParentalRatings?.[0], platform: 'web', profilePin: pin, region },
                {
                    headers: { Authorization: `Bearer ${getState(StorageKeys.USER_PROFILE_TOKEN)}` },
                },
            );
            return response.data;
        } catch (err: any) {
            console.error(err);
            return err?.data;
        }
    };
}

export default ProfileServices;
