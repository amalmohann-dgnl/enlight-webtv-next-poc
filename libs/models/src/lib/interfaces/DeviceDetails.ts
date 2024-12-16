import { NetworkActiveConnectionType } from './../../index';

export interface DeviceInfo {
    deviceMake: string;
    deviceName: string;
    vmxDeviceType: string;
    deviceType: string;
    devicePlatform: string;
    brand: string;
}
export interface DeviceDetails {
    deviceMake: string;
    deviceName: string;
    vmxDeviceType: string;
    deviceType: string;
    devicePlatform: string;
    brand: string;
    deviceModel: string;
    deviceOsVersion: string;
    deviceUniqueIdentifier: string;
    vmxDeviceId: string;
    deviceConnection: string;
}

export interface Devices {
    webOS: DeviceInfo;
    tizen: DeviceInfo;
    web: DeviceInfo;
    android: DeviceInfo;
}

export interface WebOSDeviceInfo {
    modelName: string;
    version: string;
    versionMajor: number;
    versionMinor: number;
    versionDot: number;
    sdkVersion: string;
    screenWidth: number;
    screenHeight: number;
    uhd: boolean;
    uhd8K: boolean;
    oled?: boolean;
    ddrSize?: string;
    hdr10: boolean;
    dolbyVision: boolean;
    dolbyAtmos: boolean;
    brandName: string;
    manufacturer: string;
    mainboardMaker?: string;
    platformBizType: 'LG' | 'wee';
    tuner: boolean;
}

export interface WebapisProductInfo {
    getVersion: () => string;
    getFirmware: () => string;
    getDuid: () => string;
    getModelCode: () => string;
    getModel: () => string;
    getRealModel: () => string;
    isWallModel: () => boolean;
    getLocalSet: () => string;
    isUHDAModel: () => boolean;
    // Add other methods and properties
}

export interface TizenSystemInfo {
    getVersion: () => string;
    isConnectedToGateway: () => boolean;
    getSubnetMask: () => string;
    getGateway: () => string;
    getMac: () => string;
    getDns: () => string;
    getIp: () => string;
    getTVName: () => string;
    getWiFiSsid: () => string;
    getSecondaryDns: () => string;
    getCapability: (url: string) => string;
    getActiveConnectionType: () => NetworkActiveConnectionType;
    // Add other methods and properties
}

export interface WebapisNetwork extends TizenSystemInfo {
    NetworkActiveConnectionType: NetworkActiveConnectionType;
    NetworkIpMode: WebapisNetworkIPMode;
    NetworkState: WebapisNetworkState;
    NetworkWiFiSecurityMode: WebapisNetworkWiFiSecurityMode;
    NetworkWiFiEncryptionType: WebapisNetworkWiFiEncryptionType;
}

export interface WebapisNetworkActiveConnectionType {
    DISCONNECTED: number;
    WIFI: number;
    CELLULAR: number;
    ETHERNET: number;
}

export interface WebapisNetworkIPMode {
    NONE: number;
    STATIC: number;
    DYNAMIC: number;
    AUTO: number;
    FIXED: number;
    UNKNOWN: number;
}

export interface WebapisNetworkState {
    LAN_CABLE_ATTACHED: number;
    LAN_CABLE_DETACHED: number;
    LAN_CABLE_STATE_UNKNOWN: number;
    GATEWAY_CONNECTED: number;
    GATEWAY_DISCONNECTED: number;
    WIFI_MODULE_STATE_ATTACHED: number;
    WIFI_MODULE_STATE_DETACHED: number;
    WIFI_MODULE_STATE_UNKNOWN: number;
}

export interface WebapisNetworkWiFiEncryptionType {
    WEP: number;
    TKIP: number;
    AES: number;
    TKIP_AES_MIXED: number;
    NONE: number;
    UNKNOWN: number;
}

export interface WebapisNetworkWiFiSecurityMode {
    WEP: number;
    WPA_PSK: number;
    WPA2_PSK: number;
    EAP: number;
    NONE: number;
    UNKNOWN: number;
}

export interface Tizen {
    systeminfo: TizenSystemInfo;
    // Add other methods and properties
}

export interface Webapis {
    network: WebapisNetwork;
    productinfo: WebapisProductInfo;
    // Add other methods and properties
}

export interface SystemInfo {
    country?: string;
    smartServiceCountry?: string;
    timezone?: string;
}

export interface ServiceRequestObject {
    uri: string;
    params: object;
    subscribe: boolean;
    resubscribe: boolean;
    onSuccess: (response: object) => void;
    onFailure: (error: object) => void;
    onComplete: () => void;
    send: () => void;
    cancel: () => void;
}

export interface ServiceRequestParameters {
    method?: string;
    parameters?: object;
    subscribe?: boolean;
    resubscribe?: boolean;
    onSuccess?: (response: object) => void;
    onFailure?: (error: object) => void;
    onComplete?: () => void;
}

export interface Keyboard {
    isShowing: () => boolean;
}

export interface WebOS {
    platform: boolean;
    deviceInfo: (deviceCallback: (info: WebOSDeviceInfo) => void) => void;
    fetchAppId: () => string;
    systemInfo: SystemInfo;
    keyboard: Keyboard;
}
