import {
    ComponentData,
    ComponentStyle,
    ComponentStyleType,
    Content,
    ContentType,
    DRMProvider,
    EPGResponse,
    PlaybackInitiatedSourceType,
    PlaybackType,
    PlayerControlConfiguration,
    PlayerMode,
    PlayerState,
} from './../../index';

export interface ParsedSMIL {
    pid: string;
    responseCode: string;
    exception: string;
    isException: boolean;
    token: string;
    manifest: string;
    loadStatus: string;
    initialConcurrencyDataFromSMIL: ConcurrencyData;
    thumbnailUrl: string;
    title: string;
    textStreamInfo: TextStreamInfo[];
    defaultAudioLang: string;
}

export interface LicenseServerUrl {
  [DRMProvider.PLAYREADY]: string;
  [DRMProvider.WIDEVINE]: string;
}

export interface TextStreamInfo {
    src: string;
    lang: string;
    type: string;
}

export interface ConcurrencyData {
    concurrencyLockUrl: string;
    concurrencyUnlockUrl: string;
    updateLockInterval: string;
    concurrencyLockParam: ConcurrencyLockParam;
}

export interface ConcurrencyLockParam {
    id: string;
    sequenceToken: string;
    encryptedLock: string;
}

export interface PlaybackData {
    smil?: string;
    smilData: ParsedSMIL;
    authorization: string;
    licenseServerUrl: LicenseServerUrl;
    drmProvider: DRMProvider;
    mpxAccount: string;
}

export interface SMILRequest {
    smilUrl: string;
    authorization: string;
}

export interface DRMConfig {
    licenseServerUrl: string;
    licenseCertificateUrl: string;
    customDRMSystem: string;
}

export interface PlayerRouteData {
    uid: string;
    playbackType?: PlaybackType;
    guid?: string;
    seasonUid: string;
    prevIdentifier?: string;
    seriesId: string | undefined;
    episodeId: string | undefined;
    streamUrl: string;
    thumbnailUrl: string;
    episodeTitle: string;
    seriesTitle: string;
    isLive: boolean;
    classificationSlateData: PlayerClassificationSlateData;
    isSchedule: boolean;
    recentlyWatched: ContinueWatchingData;
    programID: number;
    assetID: number;
    tvSeasonNumber: number;
    continueWatching: boolean;
    additionalData: any;
    dataForLocallySavingRecentlyWatched: any;
}

export interface PlayerStatusData {
    isBuffering: boolean;
    playbackStartTime: number;
    playerState: PlayerState;
    playerMode: PlayerMode;
    initialPlayback: boolean;
    retryStreamingCount: number;
    playerCurrentTimeOffset: number;
    playerRailStyle: ComponentStyle;
    playbackInitiatedSourceType: PlaybackInitiatedSourceType;
    allowContinueWatching: boolean;
    playerUIMode: PlaybackType;
    isUserPreferredQualityUpdated: boolean;
    currentTime: number;
    bufferedTime: number;
    isPlayerStatsVisible: boolean;
    playerStatsData: any;
    playerContext: any;
    relatedRailConfig: ComponentStyle;
    playerControlConfig: PlayerControlConfiguration;
    endScreenDisplayTime: number;
    shouldPlayOnSeek: boolean;
    exitTriggered: boolean;
}

export interface PlaybackVideoData {
    assetId: string;
    contentId: string;
    guid: string;
    programId: string;
    seriesId: string;
    seasonId: string;
    episodeId: string;
    seasonNumber: number;
    seriesName: string;
    title: string;
    contentType: PlaybackType;
    streamURL: string;
    smilURL: string;
    thumbnailURL: string;
    durationInMS: number;
    durationInSec: number;
    smilData: ParsedSMIL;
    seekThumbnailMap: Record<string, number>;
    seekPreviewThumbnailImages: string[];
    audioData: AudioData[];
    qualityData: QualityData[];
    textStreamData: TextStreamData[];
    selectedAudio: string;
    selectedQuality: string;
    selectedTextStream: string;
    nextEpisodeData: Content | undefined;
    relatedRailData: ComponentData | EPGResponse | undefined;
    specialHandlingType: ComponentStyleType;
    isSchedule: boolean;
    contentData: any;
    seriesData: any;
    prevIdentifier?: string;
}

export interface QualityData {
    key: string;
    value: string;
    quality: any;
}

export interface AudioData {
    key: string;
    value: string;
    audio: any;
    index: number;
}

export interface TextStreamData {
    key: string;
    value: string;
    textStream: any;
}

export interface ContinueWatchingData {
    allowContinueWatching: boolean;
    seriesId: string;
    episodeId: string;
    progress?: number | null;
    contentType: ContentType;
}

export interface StreamUrls {
    streamUrl: string;
    liveUrl: string;
    catchupUrl: string;
}

export interface SeekRange {
    minimum: number;
    maximum: number;
}

export interface PlayerClassificationSlateData {
    parentalRating: string;
    ratingTags: string[];
}

export interface SMILConstructionData {
    maxParentalRatings: string;
    clientId: string;
    locale: string;
    language: string;
    region: string | null;
    format: string;
    formats: string;
    tracking: boolean;
    userId: string;
}
