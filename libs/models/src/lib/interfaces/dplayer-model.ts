export interface DiagnalPlayerConfig {
    shakaConfig: DplayerShakaConfig;
}

export interface DplayerShakaConfig {
    sdkUrl: string;
    manifestUri: string;
    playerConfig: DPlayerConfig;
    autoplay: boolean;
}

export interface DPlayerConfig {
    streaming: DPlayerStreamingConfig;
    manifest: DPlayerManifestConfig;
    drm: DPlayerDRMConfig;
}

export interface DPlayerStreamingConfig {
    bufferingGoal: number;
    ignoreTextStreamFailures: boolean;
    rebufferingGoal: number;
    bufferBehind: number;
    stallEnabled: boolean;
    stallThreshold: number;
    retryParameters: DPlayerStreamingRetryParameters;
}

export interface DPlayerStreamingRetryParameters {
    backoffFactor: number;
    baseDelay: number;
    fuzzFactor: number;
    maxAttempts: number;
    timeout: number;
}

export interface DPlayerManifestConfig {
    dash: DPlayerManifestDashConfig;
    retryParameters: DPlayerManifestRetryParameters;
}

export interface DPlayerManifestDashConfig {
    ignoreMinBufferTime: boolean;
}

export interface DPlayerManifestRetryParameters {
    backoffFactor: number;
    baseDelay: number;
    fuzzFactor: number;
    maxAttempts: number;
    timeout: number;
}

export interface DPlayerDRMConfig {
    servers: DRMServers;
    advanced: object;
}

export interface DRMServers {
    'com.widevine.alpha'?: string;
    'com.microsoft.playready'?: string;
}
