/* eslint-disable @typescript-eslint/ban-ts-comment */
'use client'
import { v4 as uuidv4 } from 'uuid';
import {
    Brand,
    ConnectionType,
    Device,
    DeviceType,
    Devices,
    NetworkActiveConnectionType,
    PlatformName,
    StorageKeys,
    DeviceCategory,
    WebOSDeviceInfo,
    deviceName,
    Tizen,
    Webapis,
    DeviceShortKeyForMUX,
    AppStoreName,
    Platform,
    AstroDeviceModel,
} from '@enlight-webtv/models';
import { getUserAgentDetails } from './user-agent.utils';
import { addNetworkStateChangeListener } from './network.utils';
import { UAParser } from 'ua-parser-js';
import { setState, getState  } from './storage.utils';

const parser = new UAParser(window.navigator.userAgent);
const TVs: Devices = {
    webOS: {
        deviceMake: Device.LGTV,
        deviceName: navigator.appVersion,
        vmxDeviceType: DeviceCategory.TV,
        deviceType: DeviceCategory.TV,
        devicePlatform: PlatformName.WEBOS,
        brand: Brand.LG,
    },
    tizen: {
        deviceMake: Device.SAMSUNG,
        deviceName: navigator.appVersion,
        vmxDeviceType: DeviceCategory.TV,
        deviceType: DeviceCategory.TV,
        devicePlatform: PlatformName.TIZEN,
        brand: Brand.SAMSUNG,
    },
    web: {
        deviceMake: parser.getDevice().vendor ?? '',
        deviceName: navigator.appVersion,
        vmxDeviceType: parser.getDevice().type ?? '',
        deviceType: parser.getDevice().type ?? '',
        devicePlatform: parser.getOS().name ?? '',
        brand: parser.getDevice().vendor ?? '',
    },
    android: {
        deviceMake: Device.ANDROID,
        deviceName: navigator.appVersion,
        vmxDeviceType: DeviceCategory.TV,
        deviceType: DeviceCategory.TV,
        devicePlatform: PlatformName.ANDROID,
        brand: Brand.LG,
    },
};

//@ts-ignore
const webOS: any = window.webOS;
//@ts-ignore
const tizen: Tizen = window.tizen;
//@ts-ignore
const webapis: Webapis = window.webapis;
//@ts-ignore
const webOSDeviceId: any = window.webOSDeviceId;

const webOSConnection: string | null = null;

/**
 * @name isAndroid
 * @type function/method
 * @description checks weather the device is android.
 * @return {boolean} - if the device is android.
 *
 * @author alwin-baby
 */
//@ts-ignore
const isAndroid = () => !!window.Android;

/**
 * @name getAndroidObject
 * @type function/method
 * @description gets the android object from window.
 * @return {any} - android object.
 *
 * @author alwin-baby
 */
//@ts-ignore
const getAndroidObject = () => window.Android;

/**
 * @name getParsedAndroidMethods
 * @type function/method
 * @description gets parsed android methods
 * @return {any} - android object.
 *
 * @author amalmohann
 */
//@ts-ignore
const getParsedAndroidMethods = (methodName: string) => JSON.parse(window.Android[methodName]?.());

/**
 * @name getAndroidDeviceInfo
 * @type function/method
 * @description gets the android device info
 * @return {string} - device info object
 * @author anandpatel
 */
//@ts-ignore
const getAndroidDeviceInfo = () => JSON.parse(getAndroidObject().getAndroidDeviceInfo());

/**
 * @name getDeviceType
 * @type function/method
 * @description checks the type of the device (WebOS, Tizen, or Android).
 * @return {DeviceType} - type of the device (WebOS, Tizen, or Android).
 * @author anandpatel
 */
const getDeviceType = () => {
    switch (true) {
        case !!webOS:
            return DeviceType.WebOS;
        case !!tizen:
            return DeviceType.Tizen;
        case isAndroid():
            return getAndroidDeviceInfo().deviceType;
        case checkAstroDevice():
            return DeviceType.ASTRO;
        default:
            return 'web';
    }
};

/**
 * @name getAppStoreName
 * @type function
 * @description Retrives the appstore found on the device
 * @return {AppStoreName | null} - Appstor name
 * @author tonyaugustine
 */
const getAppStoreName = () => {
    if (isAndroid()) return AppStoreName.GOOGLE_PLAYSTORE;
    switch (getDeviceType()) {
        case DeviceType.WebOS:
            return AppStoreName.LG_CONTENT_STORE;
        case DeviceType.Tizen:
            return AppStoreName.SAMSUNG_SMARTHUB;
    }
    return null;
};

/**
 * @name getDeviceCategory
 * @type function
 * @description Retrieves the category of device
 * @return {DeviceCategory | string | null} - category of the device
 * @author tonyaugustine
 */
const getDeviceCategory = (): DeviceCategory | string => {
    if (isAndroid()) {
        return getAndroidDeviceInfo()?.deviceCategory?.toString() ?? DeviceCategory.TV;
    } else if (getDeviceType() === DeviceType.WEB) {
        return DeviceCategory.DESKTOP;
    } else return DeviceCategory.TV;
};

/**
 * @name getFormattedPlatformVersion
 * @type function
 * @description  - It Retrieves the TV platform version - tizen 4.0, webos 7.4 etc
 * @return {string | null} - Formatted platform version
 *
 * @author tonyaugustine
 */
const getFormattedPlatformVersion = () => {
    const osVersion = getOsVersion();
    const deviceType = getDeviceType();
    let devicePlatformVersion = null;

    if (typeof deviceType === 'string' && osVersion) {
        devicePlatformVersion = `${deviceType} ${osVersion.toString()}`;
    }
    return devicePlatformVersion;
};

/**
 * @name initializeDeviceDetails
 * @type function/method
 * @description Initializes device details (webos and tizen) and stores in the storage.
 * @author anandpatel
 */
const initializeDeviceDetails = () => {
    getDeviceInfo();
    const deviceType = getDeviceType();
    deviceType === DeviceType.Tizen && addNetworkStateChangeListener(webapis);
};

/**
 * @name fetchWebOSDeviceInfo
 * @type function/method
 * @description Fetches WebOS device information and caches it for further use.
 * @return {WebOSDeviceInfo | null} - The WebOS device information, or null if not available.
 * @author anandpatel
 */
let WEB_OS_DEVICE_INFO: WebOSDeviceInfo | null = null;
const fetchWebOSDeviceInfo = () => {
    if (WEB_OS_DEVICE_INFO) {
        return WEB_OS_DEVICE_INFO;
    }

    if (getDeviceType() !== DeviceType.Tizen && webOS) {
        webOS.deviceInfo((info: WebOSDeviceInfo) => {
            WEB_OS_DEVICE_INFO = info;
            // Store WebOS device info in storage
            const deviceInfo = getState(StorageKeys.DEVICEINFO);
            setState(StorageKeys.DEVICEINFO, { ...deviceInfo, ...info });
        });
        return WEB_OS_DEVICE_INFO;
    }

    return;
};

/**
 * @name tizenInfo
 * @type object
 * @description Contains utility methods for fetching information from a Tizen device.
 * @author anandpatel
 */
const tizenInfo = {
    getDuid: () => {
        let duid: any = null;
        if (duid) return duid;
        duid = webapis?.productinfo?.getDuid();
        return duid;
    },
    getMac: () => {
        let mac: any = null;

        if (mac) return mac;
        mac = webapis?.network?.getMac();
        return mac;
    },
    getVersion: () => {
        let version: string | null = null;
        if (version) return version;
        version = tizen?.systeminfo?.getCapability('http://tizen.org/feature/platform.version');
        return version;
    },
    getModel: () => {
        let model: string | null = null;
        if (model) return model;
        // Certain samsung models return invalid string data for getRealModel(), hence appending it to getModel()
        model = `${webapis?.productinfo?.getModel()}(${webapis?.productinfo?.getRealModel()})`;
        return model;
    },
    getActiveConnectionType: () => {
        let connectionType: NetworkActiveConnectionType | null = null;

        if (connectionType) return connectionType;
        connectionType = webapis?.network?.getActiveConnectionType();
        return connectionType;
    },
};

/**
 * @name getTizenDeviceInfo
 * @type function/method
 * @description fetches Tizen device information.
 * @return {Object} - Tizen device information object with properties like duid, osVersion, model, activeConnectionType, and mac.
 * @author anandpatel
 */
const getTizenDeviceInfo = () => {
    const deviceInfo: any = {};

    if (tizen && tizenInfo) {
        try {
            deviceInfo.duid = tizenInfo.getDuid();
        } catch (e) {
            // Handle the exception if needed
        }
        try {
            deviceInfo.osVersion = tizenInfo.getVersion();
        } catch (e) {
            // Handle the exception if needed
        }
        try {
            deviceInfo.model = tizenInfo.getModel();
        } catch (e) {
            // Handle the exception if needed
        }
        try {
            deviceInfo.activeConnectionType = tizenInfo.getActiveConnectionType();
        } catch (e) {
            // Handle the exception if needed
        }
        try {
            deviceInfo.mac = tizenInfo.getMac();
        } catch (e) {
            // Handle the exception if needed
        }
    }

    return deviceInfo;
};

/**
 * @name getDeviceId
 * @type function/method
 * @description fetches the device ID based on the device type (Tizen, WebOS, or other) and stores it in the local storage.
 * @return {string} - device ID.
 * @author anandpatel
 */
const getDeviceId = () => {
    let deviceId: any;
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            deviceId = tizenInfo?.getMac();
            break;
        case DeviceType.WebOS:
            deviceId = webOSDeviceId;
            break;
        case DeviceType.Android:
            deviceId = getAndroidDeviceInfo().deviceId;
            break;
        default:
            deviceId = uuidv4();
    }

    let storedDeviceInfo: any = getState(StorageKeys.DEVICEINFO);
    if (!storedDeviceInfo) {
        storedDeviceInfo = { id: deviceId };
        setState(StorageKeys.DEVICEINFO, storedDeviceInfo);
    } else if (storedDeviceInfo && storedDeviceInfo.id !== deviceId) {
        storedDeviceInfo = { ...storedDeviceInfo, id: deviceId };
        setState(StorageKeys.DEVICEINFO, storedDeviceInfo);
    }
    return storedDeviceInfo.id;
};

/**
 * @name getAstroOSVersion
 * @type function/method
 * @description fetches the OS version of astro device from the user agent string.
 * @return {string} - OS version.
 * @author tonyaugustine
 */
const getAstroOSVersion = () => {
    const userAgent = window.navigator.userAgent;
    const regex = /AppleWebKit\/([\d.]+)/;
    const match = userAgent.match(regex);
    return match ? match[1] : '';
};

/**
 * @name getOsVersion
 * @type function/method
 * @description fetches the OS version based on the device type (Tizen or WebOS).
 * @return {string} - OS version.
 * @author anandpatel
 */
const getOsVersion = () => {
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            return tizenInfo?.getVersion();
        case DeviceType.WebOS: {
            if (!WEB_OS_DEVICE_INFO?.sdkVersion) {
                fetchWebOSDeviceInfo();
            }
            return WEB_OS_DEVICE_INFO?.sdkVersion;
        }
        case DeviceType.Android: {
            return getAndroidDeviceInfo().osVersion; // get the correct variable name
        }
        case DeviceType.ASTRO: {
            return getAstroOSVersion();
        }
    }

    return 'unknown';
};

/**
 * @name getPlatformAcronym
 * @type function/method
 * @description return the platform acronyms
 * @return {PlatformAcronym} - OS version.
 * @author amalmohann
 */
const getPlatformAcronym = () => {
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            return DeviceShortKeyForMUX.TIZEN;
        case DeviceType.WebOS:
            return DeviceShortKeyForMUX.WEBOS;
        default:
            return DeviceShortKeyForMUX.WEB;
    }
};

/**
 * @name getDeviceModel
 * @type function/method
 * @description fetches the device model based on the device type (Tizen or WebOS).
 * @return {string | null} - device model.
 * @author anandpatel
 */
const getDeviceModel = () => {
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            return tizenInfo?.getModel();
        case DeviceType.WebOS:
            return WEB_OS_DEVICE_INFO?.modelName;
        case DeviceType.Android: {
            return getAndroidDeviceInfo().model;
        }
        case DeviceType.ASTRO: {
            return getAstroDeviceModel();
        }
    }
    return getUserAgentDetails()?.deviceModel ?? null;
};

/**
 * @name getAstroDeviceModel
 * @type function
 * @description Fetches the astro device model based on user agen string
 * @return {string} - Astro device model.
 * @author tonyaugustine
 */
const getAstroDeviceModel = () => {
    const userAgent = window.navigator.userAgent;
    if (userAgent.includes('AS620SM')) {
        return AstroDeviceModel.ULTRA_V1;
    } else if (userAgent.includes('AS630SM')) {
        return AstroDeviceModel.ULTRA_V2;
    } else if (userAgent.includes('KSTB6112')) {
        return AstroDeviceModel.ULTI;
    } else {
        return null;
    }
};

/**
 * @name getDeviceMake
 * @type function/method
 * @description fetches the device make based on the device type (Tizen or WebOS).
 * @return {string} - device make.
 * @author anandpatel
 */
const getDeviceMake = () => {
    const deviceMake: string = TVs.web.deviceMake;
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            return TVs.tizen.deviceMake;
        case DeviceType.WebOS:
            return TVs.webOS.deviceMake;
        case DeviceType.Android: {
            return TVs.android.deviceMake;
        }
    }
    return deviceMake;
};

/**
 * @name getDeviceBrand
 * @type function
 * @description Retrives the brand of the device
 * @return {DeviceType | string } - Device brand
 * @author tonyaugustine
 */
const getDeviceBrand = () => {
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            return TVs.tizen.brand;
        case DeviceType.WebOS:
            return TVs.webOS.brand;
        case DeviceType.Android:
            return getAndroidDeviceInfo().model;
        case DeviceType.ASTRO:
            return DeviceType.ASTRO;
        default:
            return TVs.web.brand;
    }
};

/**
 * @name getDeviceName
 * @type function/method
 * @description fetches the device name based on the device type (Tizen, WebOS, or other).
 * @return {string} - device name.
 * @author anandpatel
 */
const getDeviceName = () => {
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            return `${deviceName.Samsung} ${tizenInfo.getModel()}`;
        case DeviceType.WebOS:
            return `${deviceName.LG} ${WEB_OS_DEVICE_INFO?.modelName}`;
        case DeviceType.Android: {
            return `${deviceName.ANDROID} ${getAndroidDeviceInfo().model}`;
        }
    }

    return deviceName.LG;
};

/**
 * @name getConnectionType
 * @type function/method
 * @description fetches the connection type (WIFI or LAN) based on the device type (Tizen or WebOS).
 * @return {string} - connection type.
 * @author anandpatel
 */
const getConnectionType = () => {
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            return getTizenConnectionType();
        case DeviceType.WebOS:
            return webOSConnection;
        case DeviceType.Android: {
            return getAndroidDeviceInfo().connectionType;
        }
    }
    return ConnectionType.WIFI;
};

/**
 * @name getTizenConnectionType
 * @type function/method
 * @description fetches the connection type (WIFI or LAN) for tizen.
 * @return {string} - connection type.
 * @author anandpatel
 */
const getTizenConnectionType = () => {
    const tizenConnection = tizenInfo.getActiveConnectionType();
    let connType: string | null = null;
    switch (tizenConnection) {
        case NetworkActiveConnectionType.DISCONNECTED:
            connType = ConnectionType.DISCONNECTED;
            break;
        case NetworkActiveConnectionType.WIFI:
            connType = ConnectionType.WIFI;
            break;
        case NetworkActiveConnectionType.CELLULAR:
            connType = ConnectionType.CELLULAR;
            break;
        case NetworkActiveConnectionType.ETHERNET:
            connType = ConnectionType.ETHERNET;
            break;
        default:
            connType = 'Error';
    }
    return connType;
};

/**
 * @name getDeviceInfo
 * @type function/method
 * @description fetches general device information, including device model, OS version, device ID, connection type, and device name.
 * @return {Object} - device information.
 * @author anandpatel
 */
const getDeviceInfo = () => {
    let deviceInfo: any = { ...TVs.web };
    switch (getDeviceType()) {
        case DeviceType.Tizen:
            deviceInfo = { ...TVs.tizen };
            break;
        case DeviceType.WebOS:
            fetchWebOSDeviceInfo();
            deviceInfo = { ...TVs.webOS };
            break;
        case DeviceType.Android: {
            deviceInfo = { ...TVs.android };
            deviceInfo.brand = getAndroidDeviceInfo().brand;
            break;
        }
    }

    const DeviceInfo = {
        ...deviceInfo,
        deviceModel: getDeviceModel(),
        deviceOsVersion: getOsVersion(),
        deviceUniqueIdentifier: getDeviceId(),
        vmxDeviceId: getDeviceId(),
        deviceId: getDeviceId(),
        deviceConnection: getConnectionType(),
        deviceName: getDeviceName(),
        DeviceType: getDeviceType(),
        deviceMake: getDeviceMake(),
    };
    // Store device info in the local storage
    setState(StorageKeys.DEVICEINFO, DeviceInfo);
    return DeviceInfo;
};

/**
 * @name exitApp
 * @type function/method
 * @description This function will return the reference of exit app function that can be used to to exit the app
 * @return {() => any} reference of exit function
 *
 * @author anandpatel
 */
const exitApp = () => {
    const deviceType = getDeviceType();
    switch (deviceType) {
        case DeviceType.Tizen:
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.tizen.application.getCurrentApplication().exit();
            window.close();
            return;
        case DeviceType.WebOS:
            window.close();
            return;
        case DeviceType.Android:
        case DeviceType.FireTV:
            getAndroidObject().exitApplication();
            return;
        case DeviceType.ASTRO:
            exitAstroApp();
            return;
        default:
            window.close();
    }
};

/**
 * @name getTizenVersion
 * @description gets the Tizen version
 * handle the duplication issue on tizen version 6.5 by dynamic import of the
 * vite legacy code.
 *
 * @author amalmohann
 */
// Function to extract Tizen version from User-Agent string
function getTizenVersion(userAgentString: string) {
    // Regular expression for extracting Tizen version
    const tizenVersionRegex = /Tizen (\d+\.\d+)/i;

    // Extract Tizen version information
    const versionMatch = userAgentString.match(tizenVersionRegex);
    const tizenVersion = versionMatch ? versionMatch[1] : 'Unknown Tizen Version';

    return tizenVersion;
}

/**
 * @function calculatePrecision
 * @description Calculates the precision value based on the current window width and height in comparison to a default resolution.
 * Usually TV’s will render browsers at a max resolution of 1080p but for some TV's it is not, for those we are up scaling and down scaling
 * based on window width and height.
 * @returns {number} - Precision value representing the scaling factor.
 *
 * @author anandpatel
 */
const calculatePrecision = () => {
    if (window.innerWidth > 1920) {
        // Default resolution
        const defaultResolution = { width: 1920, height: 1080 };

        // Current window dimensions
        const outputWidth = window.innerWidth;
        const outputHeight = window.innerHeight;

        // Calculate scaling for width and height
        const precisionX = outputWidth / defaultResolution.width;
        const precisionY = outputHeight / defaultResolution.height;

        // Determine the maximum scaling (precision)
        const precision = Math.max(precisionX, precisionY);

        return precision;
    }
    return null;
};

/**
 * @function getPlatformName
 * @description Retrives the platform name
 * @returns {string}.
 *
 * @author tonyaugustine
 */
const getPlatformName = () => {
    if (isAndroid()) return getAndroidDeviceInfo().deviceType;
    else return Platform.WebTv;
};

/**
 * @name checkAstroDevice
 * @type function
 * @description this function will check if the device is astro
 *
 * @author alwin-baby
 */
const checkAstroDevice = () => {
    const userAgent = navigator.userAgent;
    const regex = /Astro/;
    const isAstro = regex.test(userAgent);
    return isAstro;
};

/**
 * @name exitAstroApp
 * @type function
 * @description This function will exit the astro app
 *
 * @author alwin-baby
 */
const exitAstroApp = () => {
    fetch('http://127.0.0.1:11111/jsonrpc', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'Controller.1.deactivate',
            params: {
                callsign: 'WebKitBrowser',
            },
        }),
    });
};

/**
 * @name getOSName
 * @type function
 * @description This function will get the os name
 * @author tonyaugustine
 */
const getOSName = () => {
    let osName = '';
    osName = getDeviceType() !== 'web' ? getDeviceType() : getUserAgentDetails()?.osName;
    if (checkAstroDevice()) osName = 'Astro';
    return osName;
};

export {
    initializeDeviceDetails,
    getDeviceInfo,
    getConnectionType,
    getDeviceName,
    getDeviceModel,
    getOsVersion,
    getDeviceId,
    getTizenDeviceInfo,
    fetchWebOSDeviceInfo,
    getDeviceType,
    getDeviceMake,
    isAndroid,
    getAndroidObject,
    getAndroidDeviceInfo,
    exitApp,
    getTizenVersion,
    calculatePrecision,
    getPlatformAcronym,
    getParsedAndroidMethods,
    getDeviceCategory,
    getFormattedPlatformVersion,
    getAppStoreName,
    getDeviceBrand,
    getPlatformName,
    checkAstroDevice,
    getOSName,
};
