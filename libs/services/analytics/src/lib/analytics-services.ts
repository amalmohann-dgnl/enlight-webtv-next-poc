import axios, { AxiosError, AxiosResponse } from 'axios';
import { redirect } from 'next/navigation'
import {
    AnalyticsEventQueueType,
    AxiosErrCode,
    EventAction,
    EventLabel,
    HitType,
    PlaybackType,
    Routes,
    StorageKeys,
    VideoDimensions,
    VideoMetrics,
    AppParameters,
    CustomVideoDimension,
    RBDimensions,
    BuildType,
    UserAgentDetails,
    ProfileListData,
    AnalyticsServices as AnalyticsServiceType,
    MixpanelAnalyticsParameters,
    EventType,
    AnalyticIntegration,
    CountryInfo,
    Project,
    AnalyticEvent,
} from '@enlight-webtv/models';
import {
    analyticsUtilities,
    deviceUtilities,
    userAgentUtilities,
    recommendationUtilities,
    configurationUtilities,
    appUtilities,
  commonUtilities,
    storageUtilities
} from '@enlight-webtv/utilities';

//import.meta having type config issue.
const {
    VITE_UNIVERSAL_ANALYTICS_URL: ANALYTICS_URL,
    VITE_UNIVERSAL_ANALYTICS_GLOBAL_ID: GLOBAL_ID,
    VITE_UNIVERSAL_ANALYTICS_LOCAL_ID: LOCAL_ID,
    VITE_UNIVERSAL_ANALYTICS_VIDEO_GLOBAL_ID: VIDEO_GLOBAL_ID,
    VITE_UNIVERSAL_ANALYTICS_VIDEO_LOCAL_ID: VIDEO_LOCAL_ID,
    VITE_UNIVERSAL_ANALYTICS_VIDEO_VIDEO_ID: VIDEO_VIDEO_ID,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
} = import.meta.env;

//import utilities
const {
    constructVideoDimensions,
    constructVideoMetrics,
    constructVideoParameters,
    setCommonVideoDimension,
    getScreenName,
    constructRBDimensions,
    constructAppParameters,
} = analyticsUtilities;
const { getDeviceModel, getOsVersion, getDeviceCategory, getAppStoreName, getDeviceBrand, getPlatformName, getOSName } = deviceUtilities;
const { getUserAgentDetails } = userAgentUtilities;
const { getRecommendationUserID } = recommendationUtilities;
const { getMixPanelConfiguration, getEngageConfiguration } = configurationUtilities;
const { getAppVersionWithPrefix, getAppMetaData } = appUtilities;
const { isValidValue, isValidUrl, convertNullUndefinedPropertiesToEmptyString } = commonUtilities;
const { getState } = storageUtilities;

//variables
let POS_EVENT_TIME = 0;
let POS_RELATIVE_EVENT_TIME = 0;
let currentPOS = 0;
let PlaylistPosition = '0';

class AnalyticsServices {
    static #eventQueue: AnalyticsEventQueueType[] = [];
    static #baseMixPanelAttributes?: any;
    static #mixPanelConfiguration?: AnalyticIntegration;
    static #mixPanelRequestConfig?: any;
    static #isProcessingQueue = false;
    static requiredAnalyticsServices: AnalyticsServiceType[] = [];
    static engageClientID?: string;
    requestRetryDelayDuration = 3000;
    maxRequestRetrys = Infinity;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    static project: Project = import.meta.env.VITE_PROJECT_NAME as Project;

    /**
     * @name sendMixPanelEvent
     * @type method
     * @description  - it constructs the properties that required for the mixpanel event and sends them
     * @return {void} - No return value
     *
     * @author tonyaugustine
     */
    async sendMixPanelEvent(eventType: EventType, eventAttributes?: any, shouldKeepAlive = false) {
        if (
            !AnalyticsServices.requiredAnalyticsServices.includes(AnalyticsServiceType.ENGAGE) &&
            !AnalyticsServices.requiredAnalyticsServices.includes(AnalyticsServiceType.MIXPANEL)
        ) {
            return;
        }

        if (!isValidValue(AnalyticsServices.#mixPanelConfiguration)) {
            const mixPanelConfig = getMixPanelConfiguration() ?? getEngageConfiguration();
            if (!mixPanelConfig) {
                console.error('Invalid mixpanel configuration');
                return;
            }
            AnalyticsServices.#mixPanelConfiguration = mixPanelConfig;
        }

        // Get bas attributes to be sent for each event
        if (!isValidValue(AnalyticsServices.#baseMixPanelAttributes)) {
            try {
                this.initializeBaseMixPanelAttributes();
            } catch (error) {
                console.error(error);
                return;
            }
        }

        if (AnalyticsServices.#mixPanelConfiguration) {
            // Get user related attributes to be sent for event
            const authAttributes = this.getUserAttributes();
            const locale = getState(StorageKeys.LOCALE);
            const utcOffset = -new Date().getTimezoneOffset() * 60 * 1000;

            // Data to be sent for the event log
            const attributes = {
                ...AnalyticsServices.#baseMixPanelAttributes,
                ...authAttributes,
                language: locale,
                utc_offset: utcOffset,
                timestamp: Date.now(),
                event_timestamp: Date.now(),
                ...eventAttributes,
            };
            let requiredAttributes = [];
            // Filter mixpanel attributes to only those that are required to be mentioned in the config
            try {
                requiredAttributes = this.filterMixPanelAttributes(eventType, attributes, eventAttributes?.event_action);
            } catch (error) {
                console.info(error);
                return;
            }

            // Throw errors if proper not proper config data is available to send the event
            if (!AnalyticsServices.#mixPanelRequestConfig && isValidValue(AnalyticsServices.#mixPanelConfiguration.analyticsConfiguration)) {
                AnalyticsServices.#mixPanelRequestConfig = JSON.parse(AnalyticsServices.#mixPanelConfiguration.analyticsConfiguration);
            }
            if (!AnalyticsServices.#mixPanelRequestConfig) {
                console.error('Mixpanel request config not found');
                return;
            }
            if (!AnalyticsServices.#mixPanelRequestConfig.api_key) {
                console.error('Invalid apikey');
                return;
            }
            if (!isValidUrl(AnalyticsServices.#mixPanelRequestConfig.endpoint)) {
                console.error('Invalid data/capture endpoint url');
                return;
            }

            let totalEventData: string | object = {
                attrObj: { ...convertNullUndefinedPropertiesToEmptyString(requiredAttributes) },
                eventName: eventType,
            };

            // Send data must be strigified for Engage. Timepstamp is also additionally added
            if (AnalyticsServices.#mixPanelConfiguration?.analyticsService === AnalyticsServiceType.ENGAGE) {
                Object.assign(totalEventData, {
                    projectId: AnalyticsServices.#mixPanelRequestConfig?.projectId,
                    clientId: AnalyticsServices.engageClientID,
                    timestamp: Date.now(),
                });
                totalEventData = JSON.stringify(totalEventData);
            }

            AnalyticsServices.#eventQueue.push({
                analyticsService: AnalyticsServiceType.MIXPANEL,
                requestMethod: 'put',
                url: AnalyticsServices.#mixPanelRequestConfig.endpoint,
                requestHeaders: { 'X-Api-Key': AnalyticsServices.#mixPanelRequestConfig.api_key, 'Content-Type': 'application/json' },
                requestData: {
                    Data: totalEventData,
                    PartitionKey: AnalyticsServices.#mixPanelRequestConfig?.projectId,
                },
                shouldKeepAlive,
            });
            this.#processEventQueue();
        }
    }

    /**
     * @name filterMixPanelAttributes
     * @type method
     * @description - Filter mixpanel attributes to only those that are required to be mentioned in the config
     * @return {any} - filtered attributes
     *
     * @author tonyaugustine
     */
    filterMixPanelAttributes = (eventType: EventType, attributes: any, eventAction?: string) => {
        const filteredAttributes: any = {};

        const eventTypeConfigArray =
            AnalyticsServices.#mixPanelConfiguration?.analyticEvents?.filter(analyticEvent => analyticEvent?.eventName === eventType) ?? [];

        if (!isValidValue(eventTypeConfigArray)) throw new Error(`Config not found for event: ${eventType}`);

        let eventTypeConfig: AnalyticEvent | undefined;
        if (eventTypeConfigArray?.length === 1 || !isValidValue(eventAction)) {
            eventTypeConfig = eventTypeConfigArray[0];
        } else {
            eventTypeConfig = eventTypeConfigArray.find(event => event?.eventAction === eventAction) ?? eventTypeConfigArray[0];
        }
        const requiredEventAttributes = new Set(eventTypeConfig?.eventAttributes);
        Object.keys(attributes).forEach(attributeKey => {
            if (requiredEventAttributes.has(attributeKey)) filteredAttributes[attributeKey] = attributes[attributeKey];
        });

        requiredEventAttributes?.forEach(attributeKey => {
            if (!(attributeKey in filteredAttributes)) filteredAttributes[attributeKey] = '';
        });

        return filteredAttributes;
    };

    /**
     * @name initializeBaseMixPanelAttributes
     * @type method
     * @description - eurns the base mixpanel attributes
     * @return {any} - Base mixpanel attributes
     *
     * @author tonyaugustine
     */
    initializeBaseMixPanelAttributes = () => {
        const userAgent: UserAgentDetails = getUserAgentDetails();
        const appMetaData = getAppMetaData();
        const sessionID = getState(StorageKeys.SESSIONID);
        if (!sessionID) throw new Error('SessionID not found');

        const osVersion = getOsVersion() && getOsVersion() !== 'unknown' ? getOsVersion() : userAgent?.osVersion;
        const os = getOSName();
        const countryName = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryName;

        //import.meta having type config issue.
        //eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const appEnv = import.meta.env['VITE_BUILD_TYPE'] as BuildType;
        if (!appEnv) throw new Error('Invalid app environment');

        const baseAttributes = {
            app_env: appEnv,
            device_model: getDeviceModel(),
            browser: userAgent?.browserName ?? null,
            operating_system: os ?? null,
            os_version: osVersion ?? null,
            device_category: getDeviceCategory(),
            browser_version: userAgent?.browserVersion ?? null,
            app_store: getAppStoreName(),
            device_brand: getDeviceBrand(),
            country: countryName ?? null,
            app_version: getAppVersionWithPrefix(appMetaData.appVersion),
            platform: getPlatformName(),
            session_id: sessionID,
        };

        AnalyticsServices.#baseMixPanelAttributes = { ...baseAttributes };
        if (AnalyticsServices.#mixPanelConfiguration?.analyticsService === AnalyticsServiceType.ENGAGE) {
            AnalyticsServices.engageClientID = getState(StorageKeys.ENGAGE_CLIENT_ID);
        }
        return baseAttributes;
    };

    /**
     * @name getUserAttributes
     * @type method
     * @description - Reurns the user attributes to be send for events
     * @return {any} - User related attributes
     *
     * @author tonyaugustine
     */
    getUserAttributes = () => {
        const recommendationUserId = getRecommendationUserID();
        const profileID = getState(StorageKeys.PROFILE_ID);
        const profileData = getState(StorageKeys.PROFILE) as ProfileListData;
        const userID = getState(StorageKeys.USER_ID);
        const userData = getState(StorageKeys.USER_DATA);
        // TODO: Correct this method
        const userType = userData?.subscription?.customerType || (getState(StorageKeys.IS_USER_SUBSCRIBED) === true ? 'Subscribed user' : 'Guest');
        const userAttrributes = {
            user_id: userID,
            profile_id: profileID,
            profile_type: profileData?.maxParentalRatings?.[0],
            ...(recommendationUserId && { recommendationUserId }),
            user_type: userType,
            user_source: userData?.subscription?.source,
            user_email_hash: userID,
        };
        return userAttrributes;
    };

    /**
     * @name sendEvent
     * @type function/method
     * @param {string} analyticsUrl - The URL of the Analytics Service.
     * @param {object} analyticsAttributes - Attributes to be sent to  Analytics Service.
     * @description Sends an event to the Analytics Service or adds it to the queue if the events are failing.
     * @return {Promise<AxiosResponse<any, any> | null>} - A promise that resolves with the response or rejects with an error, or null if the event is added to the queue.
     * @author tonyaugustine
     */
    static async sendEvent(eventData: AnalyticsEventQueueType) {
        if (eventData.shouldKeepAlive) {
            let url = eventData?.url;
            if (isValidValue(eventData.urlParams)) {
                const queryString = new URLSearchParams(eventData.urlParams as Record<string, string>).toString();
                url += (url.indexOf('?') == -1 ? '?' : '&') + `${queryString}`;
            }

            const fetchOptions: RequestInit = {
                method: eventData.requestMethod,
                headers: {
                    ...eventData.requestHeaders,
                },
                keepalive: true,
                ...((eventData.requestMethod === 'post' || eventData.requestMethod === 'put') && { body: JSON.stringify(eventData.requestData) }),
            };

            const response = await fetch(url, fetchOptions);
            if (!response.ok) {
                throw new Error(JSON.stringify(response));
            }
        } else {
            const response: AxiosResponse<any, any> = await axios.request({
                url: eventData.url,
                method: eventData.requestMethod,
                headers: eventData.requestHeaders,
                params: eventData.urlParams,
                ...((eventData.requestMethod === 'post' || eventData.requestMethod === 'put') && { data: eventData.requestData }),
            });
            if ((response.status >= 200 && response.status < 300) || response !== null) {
                // Event sent successfully, you can handle it here
            } else {
                throw new Error('Failed to send event');
            }
        }
    }

    #processEventQueue() {
        if (AnalyticsServices.#isProcessingQueue) return;

        AnalyticsServices.#isProcessingQueue = true;

        while (AnalyticsServices.#eventQueue.length > 0) {
            const eventData = AnalyticsServices.#eventQueue.shift();
            if (eventData) {
                try {
                    AnalyticsServices.sendEvent(eventData);
                } catch (error) {
                    console.error(`Failed to send event: ${eventData}`, error);

                    // check if it is No Network error
                    const axiosError = error as AxiosError;
                    if (axiosError.code === AxiosErrCode.ERR_NETWORK) {
                        // Re-add the failed event to the end of the queue
                        AnalyticsServices.#eventQueue.push({ ...eventData });
                        AnalyticsServices.#isProcessingQueue = false;

                        redirect(
                            Routes.NETWORK_ERROR,
                        );
                    }

                    // Handle retries
                    if (!eventData.retryCount) {
                        eventData.retryCount = 1;
                    } else {
                        eventData.retryCount += 1;
                    }

                    if (eventData.retryCount <= this.maxRequestRetrys) {
                        // Re-add the failed event to the queue with a delay
                        setTimeout(() => {
                            AnalyticsServices.#eventQueue.push({ ...eventData });
                            this.#processEventQueue();
                        }, this.requestRetryDelayDuration * eventData.retryCount);
                    } else {
                        console.error(`Event ${eventData} failed after ${this.maxRequestRetrys} retries.`);
                    }
                }
            }
        }
        AnalyticsServices.#isProcessingQueue = false;
    }

    /**
     * @name sendGoogleAnalyticsEvent
     * @type function/method
     * @param {AnalyticsProvider} analyticsProvider - The analytics provider to use.
     * @param {AppParameters} appParameters - Google Analytics app parameters.
     * @param {CustomVideoDimension} customDimension - Custom dimensions for Google Analytics.
     * @description Sends an analytics event.
     * @author tonyaugustine
     */
    sendGoogleAnalyticsEvent(
        analyticsParameters: Partial<AppParameters> | MixpanelAnalyticsParameters,
        customDimension?: RBDimensions | Partial<CustomVideoDimension>,
    ) {
        if (!AnalyticsServices.requiredAnalyticsServices.includes(AnalyticsServiceType.GOOGLE_ANALYTICS)) return;

        const eventData: AnalyticsEventQueueType = {
            analyticsService: AnalyticsServiceType.GOOGLE_ANALYTICS,
            requestMethod: 'get',
            url: ANALYTICS_URL,
            urlParams: { ...(analyticsParameters as Partial<AppParameters>), ...customDimension },
            shouldKeepAlive: true,
        };

        AnalyticsServices.#eventQueue.push(eventData);
        this.#processEventQueue();
    }

    /**
     * @name sendScreenViewEvent
     * @type function/method
     * @description Sends a screen view event to Google Analytics.
     * @author anandpatel
     */
    sendScreenViewEvent = async () => {
        const globalAppParameters = constructAppParameters(GLOBAL_ID, { cd: getScreenName(), t: HitType.SCREENVIEW });
        const localAppParameters = constructAppParameters(LOCAL_ID, { cd: getScreenName(), t: HitType.SCREENVIEW });

        this.sendGoogleAnalyticsEvent(localAppParameters, constructRBDimensions());
        this.sendGoogleAnalyticsEvent(globalAppParameters, constructRBDimensions());
    };

    /**
     * @name sendVideoEvent
     * @type function/method
     * @param {CustomVideoDimension} customDimension - Custom video dimension.
     * @description Sends a video event to Google Analytics with custom dimensions and app parameter.
     * @author anandpatel
     */
    sendVideoEvent = async (customDimension: Partial<CustomVideoDimension>) => {
        const userData = getState(StorageKeys.USER_DATA);
        const uid = userData?.userId || undefined;
        const globalAppParameters = constructAppParameters(VIDEO_GLOBAL_ID, { t: HitType.EVENT, uid: uid });
        const localAppParameters = constructAppParameters(VIDEO_LOCAL_ID, { t: HitType.EVENT, uid: uid });
        const videoAppParameters = constructAppParameters(VIDEO_VIDEO_ID, { t: HitType.EVENT, uid: uid });

        this.sendGoogleAnalyticsEvent(globalAppParameters, customDimension);
        this.sendGoogleAnalyticsEvent(localAppParameters, customDimension);
        this.sendGoogleAnalyticsEvent(videoAppParameters, customDimension);
    };

    /**
     * @name sendVideoStartEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @param {Partial<VideoMetrics>} videoMetricValues - Partial values of video metrics.
     * @description Sends a video start event with custom dimensions, metrics, and app parameter.
     * @author anandpatel
     */
    sendVideoStartEvent = (videoDimensionValues: Partial<VideoDimensions>, videoMetricValues: Partial<VideoMetrics>) => {
        const commonDimensions: Partial<VideoDimensions> = {
            cd34: videoDimensionValues.cd34,
            cd35: videoDimensionValues.cd35,
            cd36: videoDimensionValues.cd36,
            cd40: 'true', // video will always autoplay
            cd41: videoDimensionValues.cd41,
            cd44: videoDimensionValues.cd44,
            cd47: videoDimensionValues.cd47,
            cd45: videoDimensionValues.cd45,
            cd49: videoDimensionValues.cd49,
            cd50: videoDimensionValues.cd50,
            cd58: videoDimensionValues.cd58,
            cd59: videoDimensionValues.cd59,
            cd61: videoDimensionValues.cd61,
            cd72: videoDimensionValues.cd72,
            cd73: videoDimensionValues.cd73,
            cd128: videoDimensionValues.cd128,
            cd129: videoDimensionValues.cd129,
            cd131: videoDimensionValues.cd131,
            cd136: videoDimensionValues.cd136,
        };

        setCommonVideoDimension(commonDimensions);
        const videoDimensions = constructVideoDimensions({
            cd37: videoDimensionValues.cd37,
        });

        const videoParameters = constructVideoParameters({
            ea: EventAction.PLAY_INITIAL,
            el: EventLabel.START,
        });

        const videoMetrics = constructVideoMetrics({
            cm3: 1,
            cm4: videoMetricValues.cm4,
            cm54: videoMetricValues.cm54,
        });

        const rbDimensions = constructRBDimensions();
        const CustomVideoDimension: Partial<CustomVideoDimension> = { ...videoDimensions, ...videoParameters, ...videoMetrics, ...rbDimensions };
        this.sendVideoEvent(CustomVideoDimension);
        currentPOS = 0;
        PlaylistPosition = '0';
        POS_EVENT_TIME = 0;
        POS_RELATIVE_EVENT_TIME = 0;
    };

    /**
     * @name sendPOSVideoEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @description Sends a position (POS) video event at every 10sec and 60sec for live video playtime.
     */

    sendPOSVideoEvent = (videoDimensionValues: Partial<VideoDimensions>) => {
        if (Number.parseInt(videoDimensionValues.cd37!) > currentPOS) {
            const videoDimensions = constructVideoDimensions({
                cd61: videoDimensionValues.cd61,
                cd37: videoDimensionValues.cd128 === PlaybackType.LIVE ? '00000' : videoDimensionValues.cd37?.padStart(5, '0'),
                cd131: videoDimensionValues.cd131,
            });

            const videoParameters = constructVideoParameters({
                ea: EventAction.POS,
            });

            const PosEventTime = POS_EVENT_TIME ? Math.floor(Date.now() / 1000) - POS_EVENT_TIME : 0;
            const PosRelativeTime = POS_RELATIVE_EVENT_TIME ? Math.max(0, Math.floor(Date.now() / 1000) - POS_RELATIVE_EVENT_TIME) : 0;
            const videoMetrics = constructVideoMetrics({
                cm2: PosEventTime,
                cm52: PosRelativeTime || PosEventTime,
            });

            const rbDimensions = constructRBDimensions();
            const CustomVideoDimension: Partial<CustomVideoDimension> = {
                ...videoDimensions,
                ...videoParameters,
                ...videoMetrics,
                ...rbDimensions,
            };
            this.sendVideoEvent(CustomVideoDimension);
            POS_EVENT_TIME = Math.floor(Date.now() / 1000);
            currentPOS = Number.parseInt(videoDimensionValues.cd37!);
        }
    };

    /**
     * @name sendPOSRelativeVideoEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @description Sends a relative position (POS_RELATIVE) video event at every 10% of the video playtime.
     */
    sendPOSRelativeVideoEvent = (videoDimensionValues: Partial<VideoDimensions>) => {
        if (PlaylistPosition !== videoDimensionValues.cd131) {
            const videoDimensions = constructVideoDimensions({
                cd61: videoDimensionValues.cd61,
                cd37: videoDimensionValues.cd37,
                cd131: videoDimensionValues.cd131,
            });

            const videoParameters = constructVideoParameters({
                ea: EventAction.POS_RELATIVE,
            });

            const videoMetrics = constructVideoMetrics({
                cm52:
                    POS_RELATIVE_EVENT_TIME > POS_EVENT_TIME
                        ? Math.floor(Date.now() / 1000) - POS_RELATIVE_EVENT_TIME
                        : Math.floor(Date.now() / 1000) - POS_EVENT_TIME,
            });

            const rbDimensions = constructRBDimensions();
            const CustomVideoDimension: Partial<CustomVideoDimension> = {
                ...videoDimensions,
                ...videoParameters,
                ...videoMetrics,
                ...rbDimensions,
            };

            this.sendVideoEvent(CustomVideoDimension);
            PlaylistPosition = videoDimensionValues.cd131!;
            POS_RELATIVE_EVENT_TIME = Math.floor(Date.now() / 1000);
        }
    };

    /**
     * @name sendPlayVideoEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @description Sends a play video event with custom dimensions, metrics, and app parameter.
     */
    sendPlayVideoEvent = (videoDimensionValues: Partial<VideoDimensions>) => {
        const videoDimensions = constructVideoDimensions({
            cd61: videoDimensionValues.cd61,
            cd37: videoDimensionValues.cd37,
            cd131: videoDimensionValues.cd131,
        });

        const videoParameters = constructVideoParameters({
            ea: EventAction.PLAY,
        });

        const videoMetrics = constructVideoMetrics({});

        const rbDimensions = constructRBDimensions();
        const CustomVideoDimension: Partial<CustomVideoDimension> = { ...videoDimensions, ...videoParameters, ...videoMetrics, ...rbDimensions };
        this.sendVideoEvent(CustomVideoDimension);
    };

    /**
     * @name sendPauseVideoEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @description Sends a pause video event with custom dimensions, metrics, and app parameter.
     */
    sendPauseVideoEvent = (videoDimensionValues: Partial<VideoDimensions>) => {
        const videoDimensions = constructVideoDimensions({
            cd61: videoDimensionValues.cd61,
            cd37: videoDimensionValues.cd37,
            cd131: videoDimensionValues.cd131,
        });

        const videoParameters = constructVideoParameters({
            ea: EventAction.PAUSE,
        });

        const videoMetrics = constructVideoMetrics({});

        const rbDimensions = constructRBDimensions();
        const CustomVideoDimension: Partial<CustomVideoDimension> = { ...videoDimensions, ...videoParameters, ...videoMetrics, ...rbDimensions };
        this.sendVideoEvent(CustomVideoDimension);
    };

    /**
     * @name sendSeekVideoEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @description Sends a seek video event with custom dimensions, metrics, and app parameter.
     */
    sendSeekVideoEvent = (videoDimensionValues: Partial<VideoDimensions>) => {
        const videoDimensions = constructVideoDimensions({
            cd61: videoDimensionValues.cd61,
            cd37: videoDimensionValues.cd37,
            cd131: videoDimensionValues.cd131,
        });

        const videoParameters = constructVideoParameters({
            ea: EventAction.SEEK,
        });

        const videoMetrics = constructVideoMetrics({});

        const rbDimensions = constructRBDimensions();
        const CustomVideoDimension: Partial<CustomVideoDimension> = { ...videoDimensions, ...videoParameters, ...videoMetrics, ...rbDimensions };
        this.sendVideoEvent(CustomVideoDimension);
    };

    /**
     * @name sendStopVideoEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @description Sends a stop video event with custom dimensions, metrics, and app parameter.
     */
    sendStopVideoEvent = (videoDimensionValues: Partial<VideoDimensions>) => {
        const videoDimensions = constructVideoDimensions({
            cd61: videoDimensionValues.cd61,
            cd37: videoDimensionValues.cd37,
            cd131: videoDimensionValues.cd131,
        });

        const videoParameters = constructVideoParameters({
            ea: EventAction.STOP,
        });

        const videoMetrics = constructVideoMetrics({});

        const rbDimensions = constructRBDimensions();
        const CustomVideoDimension: Partial<CustomVideoDimension> = { ...videoDimensions, ...videoParameters, ...videoMetrics, ...rbDimensions };
        this.sendVideoEvent(CustomVideoDimension);
    };

    /**
     * @name sendEndOfVideoEvent
     * @type function/method
     * @param {Partial<VideoDimensions>} videoDimensionValues - Partial values of video dimensions.
     * @description Sends an end-of-video (EOF) event with custom dimensions, metrics, and app parameter.
     */
    sendEndOfVideoEvent = (videoDimensionValues: Partial<VideoDimensions>) => {
        const videoDimensions = constructVideoDimensions({
            cd61: videoDimensionValues.cd61,
            cd37: videoDimensionValues.cd37,
            cd131: videoDimensionValues.cd131,
        });

        const videoParameters = constructVideoParameters({
            ea: EventAction.EOF,
            el: EventLabel.EOF,
        });

        const videoMetrics = constructVideoMetrics({});

        const rbDimensions = constructRBDimensions();
        const CustomVideoDimension: Partial<CustomVideoDimension> = { ...videoDimensions, ...videoParameters, ...videoMetrics, ...rbDimensions };
        this.sendVideoEvent(CustomVideoDimension);
    };
}

export default AnalyticsServices;
