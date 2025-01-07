import { AppStoreName, BuildType, ContentType, DeviceCategory, EventType, AnalyticsServices as AnalyticsServiceType } from './../../index';

export interface AnalyticsEventQueueType {
    analyticsService: AnalyticsServiceType;
    requestMethod: string;
    url: string;
    requestHeaders?: object;
    urlParams?: object;
    requestData?: object;
    shouldKeepAlive?: boolean;
    retryCount?: number;
}

export interface MixPanelSendEventDataModel {
    PartitionKey?: string;
    Data: {
        eventName: string;
        attrObj: MixPanelEventAttributesModel;
    };
}

export interface BaseMixPanelEventAttributesModel {
    app_env: BuildType;
    device_model: string;
    browser: string;
    operating_system: string;
    os_version: string;
    device_category: DeviceCategory | string;
    language: string;
    browser_version: string;
    app_store?: AppStoreName | null;
    device_brand: string;
    country: string | null;
    app_version: string;
    user_id: string;
    profile_id: string;
    profile_type: string;
    platform: string;
    session_id: string;
    recommendation_id?: string;
    utc_offset: number;
    timestamp: number;
    recommendationUserId?: string;
    user_type?: string;
}

export interface MixpanelAnalyticsParameters {
    eventType: EventType;
    eventAttributes: MixPanelEventAttributesModel;
}

export interface MixPanelEventAttributesModel {
    entry_point?: string;
    content_id?: string;
    content_type?: ContentType;
    session_duration?: string;
    portion?: string;
    playback_mode?: string;
    item_id?: string;
    content_title?: string;
    content_classification?: string;
    content_genre?: string;
    recommendation_id?: string;
    event_action?: string;
    share_link?: string;
    share_target?: string;
    content_stream_id?: string;
    utm_source?: string;
    faq_category?: string;
    page?: string;
    faq_id?: string;
    search_term?: string;
    language_code?: string;
    progress?: number;
    content_duration?: number;
    start_time?: number;
    casting_platform?: string;
    content_offer_id?: string;
}

export interface AppMetaData {
    appName: string;
    appVersion: string;
    appIdentifier: string;
}

export interface AppParameters {
    v: string; // Protocol version (mandatory)
    t: string; // Hit Type (mandatory)
    tid: string; // Tracking ID (mandatory)
    cid: string; // Client ID (mandatory)
    ua: string; // User Agent (mandatory)
    aip: string; // Anonymize IP (mandatory)
    an: string; // App Name (mandatory)
    av: string; // App Version (mandatory)
    aid: string; // App ID
    aiid: string; // App Installer ID
    ds: string; // Data Source
    cd: string; // Screenview
    uid?: string; // User ID
}

export interface RBDimensions {
    cd1: string; // Brand
    cd2: string; // Language
    cd3: string; // Locale
    cd4: string; // Property Name - Example Values: rally-tv
    cd5: string; // Site Type - Example Values: app
    cd6: string; // Environment - Example Values: on-site
    cd124: string; // Device-Platform - Example Values: iOS | Android | Smart tv
}

export interface VideoParameters {
    ec: string; // Event Category
    ea: string; // Event Action
    el: string; // Event Label
}

export interface VideoDimensions {
    cd32: string; // Account Name
    cd33: string; // Ad Type
    cd34: string; // MB Asset ID or VIN
    cd35: string; // Video Name
    cd36: string; // CMS Video Name
    cd37: string; // Absolute Position
    cd38: string; // Display URL
    cd39: string; // Display Domain
    cd40: string; // Video Autoplay
    cd41: string; // Media ID
    cd42: string; // Player ID
    cd43: string; // Reference ID
    cd44: string; // Video Chapter
    cd45: string; // Video Label
    cd46: string; // Video Label Group
    cd47: string; // Video Season
    cd49: string; // Video URL
    cd50: string; // Video Stream
    cd51: string; // Ad Position
    cd58: string; // Video Product ID
    cd59: string; // Video Asset ID
    cd60: string; // Tracking Version
    cd61: string; // Video Audio Language
    cd62: string; // Video Subtitles Language
    cd72: string; // Channel Classification
    cd73: string; // Content Bundle
    cd128: string; // Video Stream Type
    cd129: string; // Video Play ID
    cd131: string; // Playlist Position
    cd136: string; // Player Mode
}

export interface VideoMetrics {
    cm1: number; // Ad Length
    cm2: number; // Playtime Difference
    cm3: number; // Video Plays
    cm4: number; // Max Potential Playtime
    cm6: number; // Ad Plays
    cm52: number; // Video Position
    cm53: number; // Player Impression
    cm54: number; // Language Video Plays
}

export interface CustomVideoDimension extends VideoParameters, VideoDimensions, VideoMetrics, RBDimensions {}
