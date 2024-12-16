/**
 * @name contentful-configurations
 * This Model will export all the defaults from the contentful configurations as enums.
 * properties will exported are:
 * @enum ItemSize
 * @enum FocusStyle
 * @enum ConfigSysType
 * @enum ConfigLinkType
 * @enum ApplicationType
 * @enum HorizontalAlign
 * @enum ErrorConfigurationType
 * @enum UIType
 * @enum Anchor
 * @enum MenuStyle
 * @enum AdditionalButtonType
 * @enum Platform
 * @enum Browser
 * @enum DisplayOrientation
 * @enum Gender
 * @enum ProfileType
 * @enum SubscriptionType
 * @enum BuildType
 * @enum OS
 * @enum GradientType
 * @enum FieldItemStyle
 * @enum ActionType
 * @enum ScrollArrowsVisibility
 * @enum Features
 * @enum IdentityProviders
 * @enum PopupMode
 * @enum AnalyticsServices
 * @enum PageType
 * @enum PageComponentType
 * @enum ComponentDataType
 * @enum CuratedDataEntryType
 * @enum ABRMode
 * @enum QualityMappingMode
 *
 * @author amalmohann
 */

export enum FocusStyle {
    scale = 'scale',
    overlay = 'overlay',
    stroke = 'stroke',
    floatingFrame = 'floatingFrame',
    strokeAndScale = 'strokeAndScale',
}

export enum ItemSize {
    small = 'small',
    medium = 'medium',
    large = 'large',
    fullscreen = 'fullscreen',
    fill_width = 'fill_width',
}

export enum ConfigSysType {
    Link = 'Link',
}

export enum ConfigLinkType {
    Asset = 'Asset',
    ContentType = 'ContentType',
    Entry = 'Entry',
    Environment = 'Environment',
    Space = 'Space',
}

export enum ApplicationType {
    SPORTS = 'Sports',
    ENTERTAINMENT = 'Entertainment',
}

export enum HorizontalAlign {
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
}

export enum ErrorConfigurationType {
    API_ERROR = 'APIError',
    APP_FORCE_UPDATE = 'AppForceUpdate',
    APP_GEO_RESTRICTED = 'AppGeoRestricted',
    APP_MAINTENANCE = 'AppMaintenance',
    APP_NO_NETWORK = 'AppNoNetwork',
    DEVICE_CODE_EXPIRED = 'DeviceCodeExpired',
    DOWNLOAD_RESTRICTED_TO_WIFI = 'DownloadRestrictedToWifi',
    EPG_API_ERROR = 'EpgApiError',
    EPG_NO_PROGRAMMES = 'EPGNoProgrammes',
    GENERIC_ADD_FAVOURITE = 'GenericAddFavorite',
    GENERIC_DOWNLOAD_FAILED = 'GenericDownloadFailed',
    GENERIC_DOWNLOAD_LIMIT = 'GenericDownloadLimit',
    GENERIC_ERROR = 'GenericError',
    GENERIC_ERROR_CHANGE_SETTINGS = 'GenericErrorChangeSettings',
    GENERIC_ERROR_REMOVE_FAVOURITE = 'GenericErrorRemoveFavourite',
    GENERIC_NO_DOWNLOADS = 'GenericNoDownloads',
    GENERIC_NO_FAVOURITE = 'GenericNoFavourite',
    GENERIC_NO_PURCHASE_HISTORY = 'GenericNoPurchaseHistory',
    GENERIC_NO_SEARCH = 'GenericNoSearch',
    GENERIC_NO_SEARCH_TV = 'GenericNoSearchTV',
    GENERIC_NO_SUGGESTION = 'GenericNoSuggestion',
    INVALID_COUPON = 'InvalidCoupon',
    LOGIN_PAGE_LOAD_FAILED = 'LoginPageLoadFailed',
    LOGIN_POPUP_ERROR = 'LoginPopupError',
    LOGIN_SESSION_EXPIRE = 'LoginSessionExpire',
    LOGIN_UNSUPPORTED_SUBSCRIPTION_TYPE = 'LoginUnsupportedSubscriptionType',
    LOGIN_UNSUPPORTED_USER_TYPE = 'LoginUnsupportedUserType',
    NO_TV_CHANNELS = 'NoTVChannels',
    PLAYBACK_CONCURRENCY = 'PlaybackConcurrency',
    PLAYBACK_DEVICE_UNSUPPORTED = 'PlaybackDeviceUnsupported',
    PLAYBACK_DRM = 'PlaybackDRM',
    PLAYBACK_ENTITLEMENT = 'PlaybackEntitlement',
    PLAYBACK_FORMAT = 'PlaybackFormat',
    PLAYBACK_GENERIC = 'PlaybackGeneric',
    PLAYBACK_GEO_RESTRICTED = 'PlaybackGeoRestricted',
    PLAYBACK_RESTRICTED_TO_WIFI = 'PlaybackRestrictedToWifi',
    PLAYER_HDCP_DISPLAY = 'PlayerHdcpDisplay',
    PLAYER_HDCP_DRM = 'PlayerHdcpDRM',
    PURCHASE_FAILED = 'PurchaseFailed',
    PURCHASE_REQUIRED = 'PurchaseRequired',
    ROOTED_DEVICE = 'RootedDevice',
    SERVER_ERROR = 'ServerError',
    TIME_DIFFERENCE_EXCEEDED = 'TimeDifferenceExceeded',
    TV_LOGIN_FAILED = 'TVLoginFailed',
    USER_ACCOUNT_CREATION_FAILED = 'UserAccountCreationFailed',
    USER_LOGIN_FAILED = 'UserLoginFailed',
    USER_PROFILE_SAVING_FAILED = 'UserProfileSavingFailed',
    USER_SUBSCRIPTION_REQUIRED = 'UserSubscriptionRequired',
    TEAM_AND_DRIVER_NO_DATA_ERROR = 'TeamAndDriverNoDataError',
    NEED_TO_LOGIN_TYPE = 'NeedToLogInType',
    ONBOARDS_PUMIC_TOKEN_FAILURE = 'OnboardsPumicTokenFailure',
    LIVE_MAPS_PUMIC_TOKEN_FAILURE = 'LiveMapsPumicTokenFailure',
    DETAILS_SCHEDULE_EMPTY_ERROR = 'DeatilsScheduleEmptyError',
    TEAM_AND_DRIVER_GENERAL_ERROR = 'TeamAndDriverGeneralError',
    ARTICLE_PAGE_FAILURE = 'ArticlePageFailure',
    ARTICLE_LISTING_NO_DATA = ' ArticleListingNoData',
    INVALID_EMAIL = 'InvalidEmail',
    GENERIC_PAGE_FAILURE = 'GenericPageFailure',
    LIVE_UPDATE_NOT_STARTED = 'LiveUpdateNotStarted',
    NO_LIVE_UPDATE_COMMENTS = 'NoLiveUpdateComments',
    LIVE_UPDATE_COMMON_ERROR = 'LiveUpdateCommonError',
    DATA_NOT_FOUND = 'DataNotFound',
    MISSING_PARAMS_FAILED = 'MissingParamsFailed',
    DETAIL_HIGHLIGHTS_EMPTY_ERROR = 'DetailHighlightsEmptyError',
    NEED_TO_SUBSCRIBE = 'NeedToSubscribe',
    SUBSCRIPTION_EXIST = 'SubscriptionExist',
    STRIPE_LOAD_ERROR = 'StripeLoadError',
    UNKNOWN_SMIL_ERROR = 'UnknownSmilError',
    MANIFEST_FAILED = 'ManifestFailed',
    DRM_FAILED = 'DrmFailed',
    PLAYER_SEGMENT_FAILED = 'PlayerSegmentFailed',
    NO_NETWORK_PAYMENT_FAILURE = 'NoNetworkPaymentFailure',
}

export enum UIType {
    PAGE = 'page',
    POPUP = 'popup',
    FULLSCREEN = 'fullscreen',
    SNACKBAR = 'snackbar',
    TOAST = 'toast',
}

export enum Anchor {
    TOP = 'top',
    BOTTOM = 'bottom',
    LEFT = 'left',
    RIGHT = 'right',
    CENTER = 'center',
    CENTER_TOP = 'center-top',
    CENTER_BOTTOM = 'center-bottom',
    CENTER_LEFT = 'center-left',
    CENTER_RIGHT = 'center-right',
    TOP_LEFT = 'top-left',
    TOP_RIGHT = 'top-right',
    BOTTOM_LEFT = 'bottom-left',
    BOTTOM_RIGHT = 'bottom-right',
}

export enum Placement {
    INSIDE = 'inside',
    OUTSIDE = 'outside',
}

export enum LabelTag {
    TOP_10 = 'top_10',
    NEW = 'new',
    COMING_SOON = 'coming_soon',
    HOT = 'hot',
}

export enum MenuStyle {
    LEFT_SLIDER_MENU = 'LeftSliderMenu',
    BOTTOM_TABS = 'BottomTabs',
    HEADER_MENU = 'HeaderMenu',
    BACK_BUTTON = 'BackButton',
    DROPDOWN = 'DropDown',
    PAGE_TABS = 'PageTabs',
}

export enum AdditionalButtonType {
    Calendar = 'CALENDAR',
    Selector = 'SELECTOR',
}

export enum Platform {
    WebTv = 'webTv',
    AndroidTv = 'AndroidTv',
    FireTV = 'FireTv',
}

export enum DisplayOrientation {
    Landscape = 'landscape',
}

export enum Gender {
    Male = 'male',
    Female = 'female',
    All = 'all',
    Other = 'other',
}

export enum ProfileType {
    Adult = 'adult',
    Kid = 'kid',
    Normal = 'normal',
}

export enum SubscriptionType {
    Anonymous = 'anonymous',
    Subscribed = 'subscribed',
    Registered = 'registered',
    Premium = 'premium',
    Partner = 'partner',
    Basic = 'basic',
}

export enum BuildType {
    QA = 'qa',
    Internal = 'internal',
    Prod = 'prod',
    Preprod = 'preprod',
    Staging = 'staging',
    Dev = 'dev',
}

export enum OS {
    WINDOWS = 'windows',
    MAC = 'mac',
    LINUX = 'linux',
    WEBOS = 'webos',
    TIZEN = 'tizen',
    FIRETV = 'firetv',
}

export enum GradientType {
    LINEAR = 'linear',
    SWEEP = 'sweep',
    RADIAL = 'radial',
}

export enum FieldItemStyle {
    Footer = 'footer',
    Primary = 'primary',
    Secondary = 'secondary',
    Special = 'special',
}

export enum ActionType {
    CANCEL = 'cancel',
    CUSTOM = 'custom',
    EXIT = 'exit',
    RETRY = 'retry',
    BACK = 'back',
}

export enum ScrollArrowsVisibility {
    Never = 'Never',
    OnFocus = 'onFocus',
}

export enum Features {
    FeatureEPG = 'featureEpg',
    FeatureSearch = 'featureSearch',
    FeaturePlayer = 'featurePlayer',
    FeatureSupport = 'featureSupport',
    FeatureAnalytics = 'featureAnalytics',
    FeatureCatalog = 'featureCatalog',
    FeatureUserManagement = 'featureUserManagement',
    FeatureAdvertisement = 'featureAdvertisement',
    FeatureIntro = 'featureIntro',
    FeatureResultsAndStandings = 'featureResultsAndStandings',
    FeatureArticle = 'featureArticle',
    FeatureRevenue = 'featureRevenue',
    featureProfileManagement = 'featureProfileManagement',
}

export enum IdentityProviders {
    VDT = 'vdt',
    MPX = 'mpx',
    FACEBOOK = 'facebook',
    GOOGLE = 'google',
    APPLE = 'apple',
    COGNITO = 'cognito',
    GUEST = 'guest',
    PARTNER = 'partner',
}

export enum PopupMode {
    ON_SPLASH = 'OnSplash',
    NEVER = 'Never',
    ON_PLAYBACK = 'OnPlayback',
}

export enum AnalyticsServices {
    FIREBASE = 'Firebase',
    MUX = 'Mux',
    ENGAGE = 'Engage',
    RECOMBEE = 'Recombee',
    MIXPANEL = 'Mixpanel',
    GOOGLE_ANALYTICS = 'GoogleAnalytics',
}

export enum PageType {
    PAGE = 'page',
    PLAYER = 'player',
    POPUP = 'popup',
    LISTING = 'listing',
    WEBVIEW = 'webview',
    EXTERNAL = 'external',
    TEAMS_N_DRIVERS = 'teams&drivers',
    DEVICECODE = 'deviceCode',
}

export enum PageComponentType {
    CATALOG = 'catalog',
    LANDING_PAGE = 'landing_page',
    LANDING_FEATURE_POINTS = 'landing_feature_points',
    LANDING_FEATURE = 'landing_feature',
    LANDING_PLAN = 'landing_plan',
    LANDING_CONTENT_CATEGORY = 'landing_content_category',
    LANDING_CHANNELS = 'landing_channels',
    LANDING_FAQ = 'landing_faq',
    LANDING_INTRO = 'landing_intro',
    SEARCH_RESULTS = 'search_result',
    SEARCH_HISTORY = 'search_history',
    SEARCH_SUGGESTION = 'search_suggestion',
    NO_SEARCH_RESULTS_COMPONENT = 'no_search_result_component',
}

export enum ComponentDataType {
    OTHER = 'other',
    MEDIA_ID = 'mediaId',
    FEED_ID = 'feedId',
    CHANNEL_ID = 'channelId',
    LISTING_PARAMS = 'listingParams',
    LISTING = 'listing',
    RECOMMENDATION = 'recommendation',
    APPS = 'apps',
    CALENDAR = 'calendar',
    TEAMS_AND_DRIVERS = 'teams&drivers',
    LIVE_PROGRAMME = 'liveProgramme',
    HIGHLIGHTS = 'highlights',
    ARCHIVE_DATA = 'archiveData',
}

export enum ComponentStyleType {
    STATIC = 'static',
    HORIZONTAL_LIST = 'horizontal_list',
    VERTICAL_LIST = 'vertical_list',
    GRID = 'grid',
    LIVE_TV = 'live_tv',
    CATCH_UP = 'catch_up',
    NEXT_RALLIES = 'next_rallies',
    RECENTLY_WATCHED = 'recently_watched',
    FULL_REPLAY = 'full_replay',
    FAVOURITES = 'favourites',
    BINGE_WATCHING = 'binge_watching',
}

export enum ComponentStyleSubType {
    NONE = 'none',
    RECENTLY_WATCHED = 'recentlyWatched',
    EPG = 'epg',
    EPISODE_LIST = 'epiodeList',
    RELATED = 'related',
    HERO_SLIDER = 'heroSlider',
    SEARCH_RESULTS = 'searchResults',
    SEARCH_SUGGESTION = 'searchSuggestion',
    SEARCH_HISTORY = 'searchHistory',
    DOWNLOADS = 'downloads',
    PRODUCT = 'product',
    SPORT = 'sport',
    ECOMMERCE = 'ecommerce',
    NEWSLETTER = 'newsLetter',
}

export enum ItemVisibility {
    ALWAYS = 'Always',
    NEVER = 'Never',
    ON_FOCUS = 'OnFocus',
}

export enum CuratedDataEntryType {
    MOVIE = 'movie',
    SERIES = 'series',
    LISTING = 'listing',
    MATCH = 'match',
    SPORTING_EVENT = 'sportingEvent',
    EXTERNAL_URI = 'externalUri',
    PRODUCT = 'product',
    CHANNEL = 'channel',
    INTRO = 'intro',
    PAGE = 'page',
    LIVE_EVENT = 'liveEvent',
    NEWS_LETTER = 'newsLetter',
    ARCHIVE = 'archive',
}

export enum ABRMode {
    ABSOLUTE = 'absolute',
    CAPPING = 'capping',
}

export enum QualityMappingMode {
    HEIGHT = 'height',
    HEIGHT_MAP = 'heightMap',
    HEIGHT_RANGE = 'heightRange',
    BITRATE_RANGE = 'bitrateRange',
    BITRATE_MAP = 'bitrateMap',
    HEIGHT_BITRATE_INDEX = 'heightBitrateIndex',
}

export enum ConfigurationKey {
    APP_SPLASH_LOGO = 'app_splash',
    APP_HEADER_LOGO = 'app_header_logo',
    APP_LOADING_LOGO = 'app_loading_logo',
    FEATURE_CATALOG = 'Feature Catalog',
    FEATURE_SEARCH = 'Feature Search',
}

/**
 * @name MenuItemID
 * @type enum
 * @description This enum will have all the menu item ids.
 * @author alwin-baby
 */
export enum MenuItemID {
    MENU_HOME = 'menu_home',
    SEARCH_BAR = 'search_bar',
    SEARCH_MENU_ITEM = 'search_menu_item',
    MENU_LIVE_TV = 'menu_live_tv',
    ON_DEMAND_MENU = 'on_demand_menu',
    MENU_CATEGORIES = 'menu_categories',
    ARCHIVE_MENU = 'archive_menu',
    FAQ_ITEM = 'faq_item',
    HIGHLIGHTS_DETAILS_MENU = 'highlights_details_menu',
    SCHEDULE_DETAILS_MENU = 'schedule_details_webtv',
    FAVOURITES = 'favorites',
    MENU_FAVORITES = 'menu_favorites',
    FULL_REPLAY_DETAILS_MENU = 'full_replay_details_webtv',
    LOGOUT = 'logout',
    MENU_SETTINGS = 'menu_settings',
    MENU_PROFILE = 'menu_profile',
    TRAILERS_DETAILS_TAB = 'trailers_details_tab',
    EPISODE_DETAILS_MENU = 'episode_details_menu',
    MENU_SHOWS = 'menu_shows',
    MENU_MOVIE = 'menu_movie',
    MENU_KIDS = 'menu_kids',
    MENU_DIVERTISSEMENT = 'menu_divertissement',
    RELATED_DETAILS_MENU = 'related_details_menu',
}

export enum LabelKey {
    // Login
    LABEL_LOGIN_TITLE = 'label_tv_login_title',
    LABEL_LOGIN_DESCRIPTION = 'label_tv_login_description',
    LABEL_LOGIN_LINK = 'label_tv_login_link',
    LABEL_LOGIN_BUTTON = 'label_tv_login_button',
    LABEL_LOGIN_SEND_CODE = 'label_login_send_code',
    LABEL_SIGNUP_BUTTON = 'label_sign_up_login',
    LABEL_LOGIN_FOOTER = 'label_login_footer',
    LABEL_LOGIN_PLACEHOLDER_MAIL = 'label_login_placeholder_mail',
    LABEL_LOGIN_PLACEHOLDER_PASSWORD = 'label_login_placeholder_password',
    LABEL_SIGNUP_ERROR_ENTER_VALID_EMAIL = 'label_sign_up_error_enter_valid_email',
    LABEL_SIGNUP_ERROR_MINIMUM_PASSWORD_CHARACTER = 'label_sign_up_error_minimum_password_character',

    // Logout
    LABEL_LOGOUT_POPUP_TITLE = 'logout_popup_title',
    LABEL_LOGOUT_POPUP_DESCRIPTION = 'label_logout_popup_description',
    LABEL_STAY_SIGNED_IN = 'label_stay_signed_in',
    LABEL_LOGOUT_CANCEL = 'label_logout_cancel',
    LABEL_LOGOUT_BUTTON = 'label_logout_button',

    // Exit Popup
    LABEL_EXIT_TITLE = 'label_exit_title',
    LABEL_EXIT_DESCRIPTION = 'label_exit_description',
    LABEL_EXIT_PRIMARY_BUTTON = 'label_exit_primary_button',
    LABEL_EXIT_SECONDARY_BUTTON = 'label_exit_secondary_button',

    // Subscription
    LABEL_SUBSCRIBE_TITLE = 'label_tv_subscribe_title',
    LABEL_SUBSCRIBE_DESCRIPTION_1 = 'label_tv_subscribe_description1',
    LABEL_SUBSCRIBE_DESCRIPTION_2 = 'label_tv_subscribe_description2',
    LABEL_SUBSCRIBE_DESCRIPTION_3 = 'label_tv_subscribe_description3',
    LABEL_SUBSCRIBE_BUTTON = 'label_tv_subscribe_button',

    // Help
    LABEL_HELP_TITLE = 'label_help_title',
    LABEL_HELP_DESCRIPTION = 'label_help_description',
    LABEL_HELP_LINK = 'label_help_link',
    LABEL_HELP_BUTTON = 'label_help_button',

    // Search
    LABEL_SEARCH_PLACEHOLDER = 'label_search_placeholder',
    LABEL_SEARCH_NO_RESULTS = 'label_no_search_result',
    LABEL_SEARCH_DESCRIPTION = 'label_search_description',
    LABEL_CLEAR_SEARCH = 'label_clear_search',
    LABEL_SEARCH_RESULTS_TITLE = 'label_search_results_title',
    LABEL_SEARCH_RESULT_TITLE = 'label_search_result_title',
    LABEL_NO_SEARCH_RESULT_TITLE = 'label_no_search_result_title',
    LABEL_TYPE_MOVIE = 'label_type_movie',
    LABEL_TYPE_SERIES = 'label_type_series',
    LABEL_TYPE_PREVIEW = 'label_type_preview',
    LABEL_SEARCH_DIRECTOR = 'label_search_director',
    LABEL_SEARCH_CAST = 'label_search_cast',

    // Error Popup
    LOGOUT_POPUP_TITLE = 'logout_popup_title',
    LABEL_TV_LOGOUT_DESCRIPTION = 'label_tv_logout_description',
    ERROR_CODE = 'error_code',
    LABEL_SID = 'label_sid',
    LABEL_EXIT = 'error_ext',

    //Favourites
    LABEL_ADD_WATCHLIST = 'label_add_watchlist',
    LABEL_REMOVE_WATCHLIST = 'label_remove_watchlist',

    // Rail
    LABEL_COMPONENT_LIVE = 'label_component_live',
    LABEL_COMPONENT_ON_NEXT = 'label_component_on_next',
    LABEL_COMPONENT_VIEW_ALL = 'label_component_view_all',
    LABEL_VIEW_ALL = 'label_view_all',
    LABEL_VIEW_ALL_DESCRIPTION = 'label_view_all_desc',

    // Recently Watched
    LABEL_RECENTLY_WATCHED_CONTINUE_WATCHING = 'label_recently_watched_continue_watching',
    LABEL_RECENTLY_WATCHED_PLAY_BUTTON = 'label_recently_watched_play_button',
    LABEL_RECENTLY_WATCHED_MIN = 'label_recently_watched_min',
    LABEL_RECENTLY_WATCHED_HR = 'label_recently_watched_hr',
    LABEL_DETAILS_UPCOMING_BUTTON = 'label_details_upcoming_button',

    // Preview Component
    LABEL_COMPONENT_COMPLETED = 'label_component_complete',
    LABEL_SPORTS_HEADER_DURATION_DAYS = 'label_sports_header_duration_days',
    LABEL_SPORTS_HEADER_DURATION_HRS = 'label_sports_header_duration_hrs',
    LABEL_SPORTS_HEADER_DURATION_MINS = 'label_sports_header_duration_mins',
    LABEL_SPORTS_HEADER_DURATION_SEC = 'label_sports_header_duration_sec',
    LABEL_COMPONENT_STARTED_AT = 'label_component_started_at',
    LABEL_RECENTLY_WATCHED_LEFT = 'label_recently_watched_left',
    LABEL_TIME_TITLE = 'label_time_title',
    LABEL_PLACEHOLDER_TITLE = 'label_placeholder_title',
    LABEL_TV_HOW_TO_WATCH = 'label_tv_how_to_watch',
    LABEL_MORE_INFO = 'label_more_info',
    LABEL_TV_PLAY_LIVE = 'label_tv_play_live',
    LABEL_TV_WATCH_REPLAY = 'label_tv_watch_replay',
    LABEL_TV_PLAY_NOW = 'label_tv_play_now',
    TV_GUIDE_TODAY = 'tvguide_today',
    TV_GUIDE_YESTERDAY = 'tvguide_yesterday',
    LABEL_DETAILS_RESUME = 'label_details_resume',
    BUTTON_CLOSE = 'button_close',
    LABEL_DETAILS_EPISODE_PREFIX = 'label_details_episode_prefix',
    LABEL_DETAILS_SEASON_PREFIX = 'label_details_season_prefix',
    LABEL_DETAILS_SEASON = 'label_details_season',
    LABEL_DETAILS_EPISODE = 'label_details_episode',
    LABEL_DETAILS_PLAY_TRAILER = 'label_details_play_trailer',
    DETAILS_PLAY = 'details_play',
    LABEL_DETAILS_CC = 'label_details_cc',
    LABEL_DETAILS_SEASONS = 'label_details_seasons',

    // Player Controls
    LABEL_BACK_TO_LIVE = 'label_back_to_live',
    LABEL_LIVE = 'label_live',
    LABEL_PLAYER_NEXT = 'label_player_next',
    LABEL_PLAYER_LANGUAGE = 'label_player_language',
    LABEL_PLAYER_SETTINGS = 'label_player_settings',
    LABEL_AUDIO_TITLE = 'label_audio_title',
    LABEL_SUBTITLE_TITLE = 'label_subtitle_title',
    LABEL_QUALITY_TITLE = 'label_quality_title',
    LABEL_PLAYER_CONTROL_PLAY = 'label_player_control_play',
    LABEL_PLAYER_CONTROL_PAUSE = 'label_player_control_pause',
    LABEL_LIVETV_TITLE = 'label_livetv_title',
    LABEL_RATING_TITLE = 'label_rating_title',
    //Player Audio, Subtitle
    LABEL_PLAYER_AUDIO = 'audio_',
    LABEL_PLAYER_SUBTITLE = 'subtitle_',
    LABEL_PLAYER_NO_SUBTITLE = 'subtitle_none',
    //Binge Watching
    LABEL_BINGE_NOW_PLAYING = 'label_binge_now_playing',
    LABEL_BINGE_STARTING_IN = 'label_binge_starting_in',
    LABEL_DISMISS_ENDSCREEN = 'label_player_component_view_ALL',
    LABEL_BINGE_UP_NEXT = 'label_binge_up_next',

    // Profiles
    LABEL_PROFILE_MANAGE_TITLE = 'label_profile_manage_title',
    LABEL_PROFILE_MANAGE_DESCRIPTION = 'label_profile_manage_description',
    LABEL_PROFILE_POPUP_CHANGE_PIN_POPUP_TITLE = 'label_profile_popup_change_pin_popup_title',
    LABEL_PROFILE_KIDS_PIN_FORGOT_SWITCH_DESC = 'label_profile_kidspin_forgot_switch_desc',
    LABEL_PROFILE_PIN_FORGOT_DESCRIPTION = 'label_profile_pin_forgot_description',
    LABEL_PROFILE_MANAGE_BUTTON = 'label_profile_manage_button',
    LABEL_PROFILE_POPUP_WRONG_PIN = 'label_profile_popup_wrong_pin',

    //Settings
    CONTACT_US_LINK_DESCRIPTION = 'contact_us_link_description',
    LANGUAGE_SUBTITLE = 'language_subtitle',
    LANGUAGE_BUTTON = 'language_button',
    CONTACT_US_SUBTITLE = 'contact_us_subtitle',
    CONTACT_US_LINK = 'contact_us_link',
    FAQ_SUBTITLE = 'faq_subtitle',
    FAQ_LINK = 'faq_link',
    SUBSCRIPTION_SUBTITLE = 'subscription_subtitle',
    PRIVACY_POLICY_SUBTITLE = 'privacy_policy_subtitle',
    PRIVACY_POLICY_LINK = 'privacy_policy_link',
    SUBSCRIPTION_LINK = 'subscription_link',
    TERMS_AND_CONDITIONS_LINK = 'terms_and_conditions_link',
    TERMS_AND_CONDITIONS_SUBTITLE = 'terms_and_conditions_subtitle',
    LABEL_SETTINGS_AUTO_PLAY_ON = 'label_settings_auto_play_on',
    LABEL_SETTINGS_AUTO_PLAY_OFF = 'label_settings_auto_play_off',
    AUTO_PLAY_VIDEO_SUBTITLE = 'auto_play_video_subtitle',
    AUTO_PLAY_VIDEO_BUTTON = 'auto_play_video_button',

    // More info
    LABEL_DETAILS_DIRECTOR = 'label_details_director',
    LABEL_DETAILS_GENRE = 'label_details_genre',
    LABEL_DETAILS_CAST = 'label_details_cast',
    LABEL_DETAILS_RATING = 'label_details_rating',
}

export enum ConfigurationContentType {
    VOD = 'vod',
    WATCHLIST = 'watchlist',
    LIVE = 'live',
    UPCOMING = 'upcoming',
    INBETWEEN = 'in-between',
    REPLAY = 'replay',
    CONTINUE = 'continue',
}

export enum revenueMode {
    SVOD = 'svod',
    TVOD = 'tvod',
    ANONYMOUS = 'anonymous',
}

export enum CacheValue {
    NEVER = 'Never',
    FOREVER = 'Forever',
}
