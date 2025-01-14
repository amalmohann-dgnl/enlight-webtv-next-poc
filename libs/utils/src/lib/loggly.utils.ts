/* eslint-disable @typescript-eslint/ban-ts-comment */
import { DeviceType, StorageKeys } from '@enlight-webtv/models';
import { storageUtilities, userAgentUtilities } from '.';

//import utilities
const { setState } = storageUtilities;
const { getUserAgentDetails } = userAgentUtilities;

/**
 * @name getDeviceData
 * @description Return the device data like device model, device category etc.
 * Re-declaring these functions here as utilities are not initialized before api services.
 *
 * @author anandpatel
 */
export const getDeviceData = () => {
    // re declaring these below constants as getting error 'before initialization' if importing from device utils

    //@ts-ignore
    const webOS: any = window.webos;
    //@ts-ignore
    const tizen: Tizen = window.tizen;
    //@ts-ignore
    const webapis = window.webapis;
    //@ts-ignore
    const isAndroid = () => !!window.Android;
    //@ts-ignore
    const getAndroidObject = () => window.Android;
    const getAndroidDeviceInfo = () => JSON.parse(getAndroidObject().getAndroidDeviceInfo());

    // get the device type
    const getDeviceType = () => {
        switch (true) {
            case !!webOS:
                return DeviceType.WebOS;
            case !!tizen:
                return DeviceType.Tizen;
            case isAndroid():
                return getAndroidDeviceInfo().deviceType;
            default:
                return 'web';
        }
    };

    // get the webOS device info
    let WEB_OS_DEVICE_INFO: any | null = null;
    const fetchWebOSDeviceInfo = () => {
        if (WEB_OS_DEVICE_INFO) {
            return WEB_OS_DEVICE_INFO;
        }
        if (getDeviceType() !== DeviceType.Tizen && webOS) {
            webOS.deviceInfo((info: any) => {
                WEB_OS_DEVICE_INFO = info;
                // Store WebOS device info in storage
                setState(StorageKeys.DEVICEINFO, info);
            });
        }
    };

    // get the device model info
    const getDeviceModel = () => {
        switch (getDeviceType()) {
            case DeviceType.Tizen:
                return webapis?.productinfo?.getRealModel();
            case DeviceType.WebOS:
                return fetchWebOSDeviceInfo()?.modelName;
            case DeviceType.Android: {
                return getAndroidDeviceInfo().model;
            }
        }
        return getUserAgentDetails()?.deviceModel ?? null;
    };

    return {
        deviceType: getDeviceType(),
        deviceModel: getDeviceModel(),
    };
};
