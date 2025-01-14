export enum HitType {
    SCREENVIEW = 'screenview',
    EVENT = 'event',
}

export enum EventAction {
    PLAY_INITIAL = 'playInitial',
    POS_RELATIVE = 'posRelative',
    POS = 'pos',
    PLAY = 'play',
    PAUSE = ' pause',
    SEEK = 'seek',
    EOF = 'eof',
    PLAY_AD = 'playAd',
    SKIP_AD = 'skipAd',
    STOP = 'stop',
}

export enum EventLabel {
    START = 'Start',
    EOF = 'EOF',
}

export enum EventCategory {
    VIDEO = 'video',
}

export enum DefaultRBDimensions {
    BRAND = 'non-red-bull-branded-sites',
    LOCALE = 'en',
    // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
    LANGUAGE = 'en',
    PROPERTY_NAME = 'rally-tv',
    SITE_TYPE = 'tv',
    ENVIRONMENT = 'on-site',
}
export enum DefaultVideoDimensions {
    VIDEO_ACCOUNT_NAME = 'RBTV',
    PLAYER_ID = 'DPlayer',
    TRACKING_VERSION = 'V1',
}

export enum EventType {
    CONTENT_VIEW = '_content.view',
    CONTENT_SHARE = '_content.share',
    SUPPORT_FAQ = '_support.faq',
    CONTENT_FAVOURITE = '_content.favourite',
    CONTENT_PLAYBACK = '_content.playback',
    CONTENT_PROMO = '_content.promo',
    CONTENT_BROWSE = '_content.browse',
    USER_LOGIN = '_user.login',
    USER_LOGOUT = '_user.logout',
    USER_PROFILE = '_user.profile',
    SESSION_START = '_session.start',
    SESSION_END = '_session.end',
    SEARCH = 'search',
    CONTENT_SUBTITLES = '_content.subtitles',
}
