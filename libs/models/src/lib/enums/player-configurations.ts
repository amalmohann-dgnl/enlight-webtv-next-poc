export enum ConcurrencyLockStatus {
    LOCK = 'update',
    UNLOCK = 'unlock',
}

export enum Players {
    SHAKA = 'shaka',
    BIT_MOVIN = 'bitmovin',
    VIDEO_JS = 'videojs',
    ANDROID = 'android',
    DVP = 'dvp',
}

export enum MUXEvents {
    VIDEO_CHANGE = 'videochange',
    PROGRAM_CHANGE = 'programchange',
}

export enum DRMProvider {
    PLAYREADY = 'playReady',
    WIDEVINE = 'widevine',
    NONE = 'none',
}

export enum SMILExceptionResponse {
    ENTITLEMENT_VALIDATION_ERROR = 'EntitlementValidationError',
    NO_ASSET_TYPE_FORMAT_MATCHES = 'NoAssetTypeFormatMatches',
    LICENSE_NOT_GRANTED = 'LicenseNotGranted',
    CONCURRENCY_LIMIT_VOILATION = 'ConcurrencyLimitViolation',
    PLAYBACK_ENTITLEMENT = 'PlaybackEntitlement',
    GEO_LOCATION_BLOCKED = 'GeoLocationBlocked',
    DEFAULT = 'default',
}

export enum PlaybackType {
    LIVE = 'live',
    VOD = 'vod',
    VOD_SERIES = 'vod_series',
    MOVIE = 'movie',
    SERIES = 'series',
    TRAILER = 'trailer',
    PREVIEW = 'preview',
    EPISODE = 'episode',
}

export enum EpisodeActions {
    NEXT = 'next',
    PREV = 'previous',
}

export enum ShakaNetworkRequest {
    MANIFEST = 0,
    SEGMENT = 1,
    LICENSE = 2,
    APP = 3,
    TIMING = 4,
    SERVER_CERTIFICATE = 5,
    KEY = 6,
    ADS = 7,
    CONTENT_STEERING = 8,
}

export enum ShakaError {
    HTTP_ERROR = 1002,
    REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE = 6001,
    FAILED_TO_CREATE_CDM = 6002,
    FAILED_TO_ATTACH_TO_VIDEO = 6003,
    INVALID_SERVER_CERTIFICATE = 6004,
    FAILED_TO_CREATE_SESSION = 6005,
    FAILED_TO_GENERATE_LICENSE_REQUEST = 6006,
    LICENSE_REQUEST_FAILED = 6007,
    LICENSE_RESPONSE_REJECTED = 6008,
    ENCRYPTED_CONTENT_WITHOUT_DRM_INFO = 6010,
    NO_LICENSE_SERVER_GIVEN = 6012,
    OFFLINE_SESSION_REMOVED = 6013,
    EXPIRED = 6014,
    SERVER_CERTIFICATE_REQUIRED = 6015,
    INIT_DATA_TRANSFORM_ERROR = 6016,
    SERVER_CERTIFICATE_REQUEST_FAILED = 6017,
    MIN_HDCP_VERSION_NOT_MATCH = 6018,
    ERROR_CHECKING_HDCP_VERSION = 6019,
    LOAD_INTERRUPTED = 7000,
}

export enum PlaybackInitiatedSourceType {
    DETAILS = 'details',
    CARD = 'card',
    PREVIEW = 'preview',
    PLAYER = 'player',
    MORE_INFO = 'more_info',
}

export enum PlayerState {
    NOT_INIT = 'NotInitialized',
    CREATED = 'created',
    LOADED = 'loaded',
    READY = 'ready',
    FIRST_PLAY = 'firstPlay',
    BUFFERING = 'buffering',
    SEEKING = 'seeking',
    PAUSED = 'paused',
    PLAYING = 'playing',
    UNLOADED = 'unloaded',
    ENDED = 'ended',
    ERROR = 'error',
    LOADING = 'loading',
    IDLE = 'idle',
    WAITING = 'waiting',
}

export enum DPlayerEvents {
    //core events
    ON_STATE_CHANGED = 'onStateChanged',
    DPLAYER_LOADED = 'DPlayerLoaded',
    DPLAYER_ERROR = 'DPlayerError',
    DPLAYER_WATCH_AGAIN = 'DPlayerWatchAgain',
    MEDIA_LOADING = 'mediaLoading',
    MEDIA_SUCCESS = 'mediaLoadSuccess',
    MEDIA_FAILED = 'mediaLoadFailed',
    //video tag events
    CAN_PLAY = 'canplay',
    READY = 'canplaythrough',
    COMPLETE = 'complete',
    DURATION_CHANGE = 'durationchange',
    EMPTIED = 'emptied',
    ENDED = 'ended',
    LOADED_DATA = 'loadeddata',
    LOADED_META_DATA = 'loadedmetadata',
    PAUSE = 'pause',
    PLAYING = 'playing',
    PROGRESS = 'progress',
    RATE_CHANGE = 'ratechange',
    SEEKED = 'seeked',
    SEEKING = 'seeking',
    STALLED = 'stalled',
    SUSPEND = 'suspend',
    TIME_UPDATE = 'timeupdate',
    VOLUME_CHANGE = 'volumechange',
    WAITING = 'waiting',
    //shaka events
    STALL_STARTED = 'stallstarted',
    STALL_ENDED = 'stallended',
    DVR_WINDOW_EXCEEDED = 'DVRWindowExceeded',
    VIDEO_QUALITY_CHANGED = 'videoqualitychanged',
    AUDIO_QUALITY_CHANGED = 'audioqualitychanged',
    AUDIO_CHANGED = 'audiochanged',
    SOURCE_UNLOADED = 'sourceunloaded',
    SOURCE_LOADED = 'sourceloaded',
    CUE_ENTER = 'cueenter',
    CUE_EXIT = 'cueexit',
    SUBTITLE_ENABLED = 'subtitleenabled',
    ERROR = 'error',
    TIME_SHIFT = 'timeshift',
    TIME_SHIFTED = 'timeshifted',
    DESTROY = 'destroy',
    PAUSED = 'paused',
    PLAY = 'play',
    BUFFERING = 'buffering',
    MANIFEST_PARSED = 'manifestparsed',
    LOADING = 'loading',
}

export enum UIToggle {
    SHOW = 'show',
    HIDE = 'hide',
}

export enum PlayerRightSideMenuOptions {
    UNSELECTED = 'unselected',
    AUDIO = 'audio',
    QUALITY = 'quality',
    SUBTITLE = 'subtitle',
    SEASON = 'season',
}

export enum PlayerMode {
    FULLSCREEN = 'fullscreen',
    MINIPLAYER = 'miniplayer',
    STANDARD = 'standard',
}

export enum SeekDirection {
    FORWARD = 'forward',
    BACKWARD = 'backward',
}

export enum SeekMode {
    FRAME = 'frame',
    FILMSTRIP = 'filmStrip',
}

export enum SeekPreviewFormat {
    SPRITE_SHEET = 'spriteSheet',
    IMAGE_DATA_ARRAY = 'imageDataArray',
}

export enum PlayerComponents {
    PROGRAMME_RAIL = 'programComponent',
    RELATED_RAIL = 'relatedComponent',
}

export enum PlayerCustomOptions {
    SUBTITLE_DISABLE = 'subtitleDisable',
}
