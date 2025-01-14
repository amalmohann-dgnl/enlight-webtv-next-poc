import { AppMetaData, DeviceType, StorageKeys } from '@enlight-webtv/models';
import { storageUtilities } from '.';


const { getState } = storageUtilities;

const navigationKeyCodes: Record<number, string> = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down',
    4: 'Back',
    10009: 'Back',
    461: 'Back',
    8: 'Back',
    13: 'Enter',
};

let lastKeyDown: number;
let isRepeat = false;
// Variable to keep track of scroll throttling with 400ms delay
let lastScrollTime_400: number;
// Variable to keep track of scroll throttling with 200ms delay
let lastScrollTime_200: number;

/**
 * @name throttleNavigation
 * @type function
 * @description this function will throttle the navigation
 *
 * @author alwin-baby
 */
const throttleNavigation = (event: Event) => {
    if (!!navigationKeyCodes[(event as KeyboardEvent).keyCode]) {
        if (event.type === 'keydown') {
            if (Date.now() - lastKeyDown < 242) {
                isRepeat = true;
                event.stopPropagation();
            } else {
                lastKeyDown = Date.now();
                (event as any).isRepeat = isRepeat;
            }
        } else if (event.type === 'keyup') {
            isRepeat = false;
        }
    } else if (event.type === 'wheel') {
        const date = Date.now();
        //Determine whether to throttle event with 400ms delay
        if (lastScrollTime_400 && date - lastScrollTime_400 < 400) {
            (event as any).isRepeat_400 = true;
        } else {
            lastScrollTime_400 = date;
        }
        //Determine whether to throttle event with 200ms delay
        if (lastScrollTime_200 && date - lastScrollTime_200 < 50) {
            (event as any).isRepeat_200 = true;
        } else {
            lastScrollTime_200 = date;
        }
    }
};

/**
 * @name eventPassThroughHandler
 * @type function
 * @param {Event} event
 * @description this function will check if the scroll event is required or should be discarded
 * @returns {boolean} - Boolean indicationg if the event is passed through or not
 * @author tonyaugustine
 */
const eventPassThroughHandler: (event: Event) => boolean = (event: Event): boolean => {
    // Prevent scroll events when LG keybpard is open as it is resulting in the entire page to be scrolled
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (window.isKeyboardOpen) {
        event?.preventDefault();
        event?.stopPropagation();
        return false;
    }
    return true;
};

let allowAnimations = true;

/**
 * @name getAllowAnimations
 * @type function
 * @description this function will return the value weather to allow animations or not
 * @returns {boolean}
 *
 * @author alwin-baby
 */
const getAllowAnimations = () => allowAnimations;

/**
 * @name setAllowAnimations
 * @type function
 * @description this function change the value of allowAnimations
 * @param {boolean} permitAnimations
 *
 * @author alwin-baby
 */
const setAllowAnimations = (permitAnimations: boolean) => {
    allowAnimations = permitAnimations;
};

/**
 * @name getAppVersionWithPrefix
 * @description creates the app version with adding the suffix and prefix for analytics
 *
 * @author anandpatel
 */
export const getAppVersionWithPrefix = (version: string) => {
    // retrieve device related data
    const deviceInfo = getState(StorageKeys.DEVICEINFO) ?? {};
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const envMode = import.meta.env.MODE;
    let platformName;
    switch (deviceInfo.deviceType) {
        case DeviceType.Android:
            platformName = 'ATV';
            break;
        case DeviceType.FireTV:
            platformName = 'FTV';
            break;
        default:
            platformName = 'WTV';
            break;
    }
    const app_version = `${platformName}.${version}-${envMode?.toUpperCase()}`;
    return app_version;
};

/**
 * @name getAppMetaData
 * @type function/method
 * @description Gets the current app metadata and return that.
 * @param {key} - key to fetch the value
 * @return {metaData} - returns current screenName.
 * @author amalmohann
 */
let APP_META_DATA: AppMetaData = {} as AppMetaData;
const getAppMetaData = () => {
    if (APP_META_DATA && Object.keys(APP_META_DATA)?.length > 0) {
        return APP_META_DATA;
    }
    APP_META_DATA = getState(StorageKeys.APP_METADATA) as AppMetaData;
    return APP_META_DATA;
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
window.setAllowAnimations = setAllowAnimations;

export { throttleNavigation, getAllowAnimations, setAllowAnimations, getAppMetaData, eventPassThroughHandler };
