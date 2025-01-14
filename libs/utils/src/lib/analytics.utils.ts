import {
    AppInfo,
    AppParameters,
    DefaultRBDimensions,
    DefaultVideoDimensions,
    EventCategory,
    Platform,
    RBDimensions,
    VideoDimensions,
    VideoMetrics,
    VideoParameters,
} from '@enlight-webtv/models';
import { userAgentUtilities, deviceUtilities, commonUtilities, appUtilities } from '.';

//Utilities
const { getUserAgentDetails } = userAgentUtilities;
const { getDeviceId, getDeviceModel } = deviceUtilities;
const { removeNullUndefinedProperties } = commonUtilities;
const { getAppVersionWithPrefix, getAppMetaData } = appUtilities;

// default values for App Parameters
const defaultAppParameters: Partial<AppParameters> = {
    v: '1', // Protocol version, is always set to 1.
    t: '',
    aiid: AppInfo.APP_INSTALLER_ID,
    ds: AppInfo.DATA_SOURCE,
    cid: `${getDeviceId()}${getDeviceModel()}`, // Combination of deviceID and deviceModel
    aip: '1', // Needs to be set to 1 at all times in order to anonymize the IP of the user
    tid: '',
    ua: getUserAgentDetails().ua,
    cd: undefined,
    uid: undefined,
};

// default values for RBDimensions
const defaultRBDimensions: RBDimensions = {
    cd1: DefaultRBDimensions.BRAND,
    cd2: DefaultRBDimensions.LANGUAGE,
    cd3: DefaultRBDimensions.LOCALE,
    cd4: DefaultRBDimensions.PROPERTY_NAME,
    cd5: DefaultRBDimensions.SITE_TYPE,
    cd6: DefaultRBDimensions.ENVIRONMENT,
    cd124: Platform.WebTv,
};

/**
 * @name getScreenName
 * @type function/method
 * @description Gets the current screen name and return that.
 * @return {screenName} - returns current screenName.
 * @author anandpatel
 */
const getScreenName = () => {
    let screenName;
    switch (Router.getActiveRoute()) {
        case '$':
            screenName = 'splash';
            break;
        case '!':
            screenName = 'error';
            break;
        case 'details/:assetUID':
            screenName = 'details';
            break;
        default:
            screenName = Router.getActiveRoute()?.toLocaleLowerCase();
    }
    return screenName;
};

/**
 * @name constructAppParameters
 * @type function/method
 * @param {string} trackingId - The tracking ID to be used.
 * @description Constructs app parameters based on the trackingID.
 * @return {AppParameters} - default app parameters.
 * @author anandpatel
 */
const constructAppParameters = (trackingId: string, values: Partial<AppParameters> = {}): Partial<AppParameters> => {
    const appMetaData = getAppMetaData();
    const appParameters: Partial<AppParameters> = {
        ...defaultAppParameters,
        an: appMetaData.appName,
        av: getAppVersionWithPrefix(appMetaData.appVersion),
        aid: appMetaData.appIdentifier,
        tid: trackingId,
        ...values,
    };

    return removeNullUndefinedProperties(appParameters);
};

/**
 * @name constructRBDimensions
 * @type function/method
 * @description Constructs Red Bull dimensions.
 * @return {RBDimensions} - default Red Bull dimensions.
 * @author anandpatel
 */
// Function to construct RBDimensions with optional values
const constructRBDimensions = (values: Partial<RBDimensions> = {}): RBDimensions => {
    const rbDimensions: RBDimensions = { ...defaultRBDimensions, ...values };
    return rbDimensions;
};

/**
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 * Player Events
 * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
 **/

// default values for Video Parameters
const defaultVideoParameters: VideoParameters = {
    ec: EventCategory.VIDEO, // Event Category
    ea: '', // Event Action for video play initial
    el: '', // Event Label
};

// default values for Video Metrics
const defaultVideoMetrics: Partial<VideoMetrics> = {
    cm1: undefined, // Ad Length
    cm2: undefined, // Playtime Difference
    cm3: undefined, // Send only with video start event
    cm4: undefined, // Max Potential Playtime
    cm6: undefined, // Ad Plays
    cm52: undefined, // Video Position
    cm53: undefined, // Player Impression
    cm54: undefined, // Language Video Plays
};

const commonVideoDimensions: Partial<VideoDimensions> = {
    cd32: DefaultVideoDimensions.VIDEO_ACCOUNT_NAME, // Video Account Name
    cd33: 'unspecified', // Ad Type
    cd34: '', // MB Asset ID or VIN
    cd35: '', // Video Name
    cd36: '', // CMS Video Name
    cd38: 'unspecified', // Display URL
    cd39: 'unspecified', // Display Domain
    cd40: '', // Video Autoplay
    cd41: '', // Media ID
    cd42: DefaultVideoDimensions.PLAYER_ID, // Player ID
    cd43: '', // Reference ID same as Media ID
    cd44: '', // Video Chapter
    cd45: '', // Video Label
    cd46: DefaultVideoDimensions.VIDEO_ACCOUNT_NAME, // Video Label Group
    cd47: '', // Video Season
    cd49: '', // Video URL
    cd50: '', // Video Stream
    cd51: 'unspecified', // Ad Position
    cd58: 'unspecified', // Video Product ID
    cd59: '', // Video Asset ID
    cd60: DefaultVideoDimensions.TRACKING_VERSION, // Tracking Version
    cd61: 'unspecified', // Video Audio Language
    cd62: 'unspecified', // Video Subtitles Language
    cd72: '', // Channel Classification
    cd73: '', // Content Bundle
    cd128: '', // Video Stream Type
    cd129: '', // Video Play ID
    cd131: '', // Playlist Position
    cd136: '', // Player Mode
};

/**
 * @name constructVideoDimensions
 * @type function/method
 * @param {Partial<VideoDimensions>} values - Optional values to customize video dimensions.
 * @description Constructs video dimensions with optional values.
 * @return {Partial<VideoDimensions>} - Default or customized video dimensions.
 * @author anandpatel
 */
const constructVideoDimensions = (values: Partial<VideoDimensions> = {}): Partial<VideoDimensions> => {
    // Merge the provided values with default values
    const videoDimensions: Partial<VideoDimensions> = { ...commonVideoDimensions, ...values };
    return removeNullUndefinedProperties(videoDimensions);
};

/**
 * @name constructVideoParameters
 * @type function/method
 * @param {Partial<VideoParameters>} values - custom video parameters.
 * @description Constructs video parameters with custom values.
 * @return {VideoParameters} - Default and custom video parameters.
 * @author anandpatel
 */
const constructVideoParameters = (values: Partial<VideoParameters> = {}): Partial<VideoParameters> => {
    // Merge the provided values with default values
    const videoParameters: VideoParameters = { ...defaultVideoParameters, ...values };
    return removeNullUndefinedProperties(videoParameters);
};

/**
 * @name constructVideoMetrics
 * @type function/method
 * @param {Partial<VideoMetrics>} values - custom video metrics.
 * @description Constructs video metrics with custom values.
 * @return {VideoMetrics} - Default and custom video metrics.
 * @author anandpatel
 */
const constructVideoMetrics = (values: Partial<VideoMetrics> = {}): Partial<VideoMetrics> => {
    // Merge the provided values with default values
    const videoMetrics: Partial<VideoMetrics> = { ...defaultVideoMetrics, ...values };
    return removeNullUndefinedProperties(videoMetrics);
};

// Video Events
/**
 * @name setCommonVideoDimension
 * @type function
 * @description Updates commonVideoDimensions with the provided values.
 * @param {Partial<VideoDimensions>} values - Object containing values to update in commonVideoDimensions.
 */
const setCommonVideoDimension = (values: Partial<VideoDimensions>): void => {
    for (const key in values) {
        if (values[key as keyof VideoDimensions] !== undefined) {
            commonVideoDimensions[key as keyof VideoDimensions] = values[key as keyof VideoDimensions] as VideoDimensions[keyof VideoDimensions];
        }
    }
};

export {
    constructVideoDimensions,
    constructVideoMetrics,
    constructVideoParameters,
    setCommonVideoDimension,
    getScreenName,
    constructRBDimensions,
    constructAppParameters,
};
