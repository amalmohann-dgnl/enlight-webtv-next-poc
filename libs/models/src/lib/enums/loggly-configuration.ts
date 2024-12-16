/**
 * @name UILevel
 * @type enum
 * @description This enum will have the different UI levels
 * @author tonyaugustine
 */
export enum UILevel {
    INFO = 'INFO',
    ERROR = 'ERROR',
}

/**
 * @name UserType
 * @type enum
 * @description This enum will have the different user types
 * @author tonyaugustine
 */
export enum UserType {
    REGISTERED = 'REGISTERED',
    GUEST = 'GUEST',
    PARTNER = 'PARTNER',
}

/**
 * @name LogglyActionType
 * @type enum
 * @description This enum will have the different action types
 * @author tonyaugustine
 */
export enum LogglyActionType {
    CardClick = 'card click',
    PlayClick = 'play click',
    OnSearchClick = 'search button click',
    SignInClick = 'signin click',
    LogoutClick = 'logout click',
    RemoveFavouriteClick = 'remove favourite click',
    AddFavouriteClick = 'add favourite click',
    NetworkReinstated = 'network reinstated',
}

/**
 * @name LogLevel
 * @type enum
 * @description This enum will have the different log levels
 * @author  tonyaugustine
 */
export enum LogLevel {
    WARNING = 'Warning',
    INFO = 'Info',
    NIL = 'Nil',
    ERROR = 'Error',
    DEBUG = 'Debug',
}

/**
 * @name SearchErrorType
 * @type enum
 * @description This enum will have different serach error types
 * @author  gowripriyadileep
 */
export enum SearchErrorType {
    GenericNoSearch = 'GenericNoSearch',
}

/**
 * @name LogType
 * @type enum
 * @description This enum will have the different log types
 * @author  tonyaugustine
 */
export enum LogType {
    ERROR = 'ERROR',
    DEBUG = 'DEBUG',
    INFO = 'INFO',
}

/**
 * @name ModuleType
 * @type enum
 * @description This enum will have the different module types
 * @author  tonyaugustine
 */
export enum ModuleType {
    Authentication = 'Authentication',
    Concurrency = 'Concurrency',
    Player = 'Player',
    Search = 'Search',
    General = 'General',
    Profile = 'Profile',
    API = 'API',
}

/**
 * @name GeneralModuleErrorType
 * @type enum
 * @description This enum will have the different general module error types
 * @author  gowripriyadileep
 */
export enum GeneralModuleErrorType {
    AppNoNetwork = 'AppNoNetwork',
    AppMaintenance = 'AppMaintenance',
    ServerError = 'ServerError',
    APIError = 'APIError',
    AppGeoRestricted = 'AppGeoRestricted',
}

/**
 * @name TypeToUICode
 * @type enum
 * @description This enum will have the mapping of typeCodes to UI codes.
 * @author  tonyaugustine
 */
export enum TypeToUICode {
    LoginUnsupportedUserType = 'A-3002',
    UserSubscriptionRequired = 'A-3004',
    LoginPageLoadFailed = 'A-3007',
    UserLoginFailed = 'A-3009',
    UserDoesnotExist = 'A-3010',
    DeviceCodeExpired = 'A-3016',
    ProfileError = 'A-3015',
    LoginUnsupportedSubscriptionType = 'A-3008',
    GenericNoFavourite = 'A-5009',
    GenericErrorRemoveFavourite = 'A-5001',
    GenericAddFavourite = 'A-5002',
    AppNoNetwork = 'A-1001',
    AppMaintenance = 'A-1002',
    ServerError = 'A-6001',
    APIError = 'A-4001',
    GenericNoSearch = 'A-5007',
    AppForceUpdate = 'A-1003',
    RootedDevice = 'A-1005',
    TimeDifferenceExceeded = 'A-1006',
}

/**
 * @name AuthenticationErrorType
 * @type enum
 * @description Contains authentication error types
 * @author  tonyaugustine
 */
export enum AuthenticationErrorType {
    LoginUnsupportedUserType = 'LoginUnsupportedUserType',
    UserSubscriptionRequired = 'UserSubscriptionRequired',
    LoginPageLoadFailed = 'LoginPageLoadFailed',
    UserLoginFailed = 'UserLoginFailed',
    UserDoesnotExist = 'UserDoesnotExist',
    DeviceCodeExpired = 'DeviceCodeExpired',
    ProfileError = 'ProfileError',
    LoginUnsupportedSubscriptionType = 'LoginUnsupportedSubscriptionType',
}

/**
 * @name  ProfileModuleErrorType
 * @type enum
 * @description Contains user profile error types
 * @author tonyaugustine
 */
export enum ProfileModuleErrorType {
    GenericNoFavourite = 'GenericNoFavourite',
    GenericErrorRemoveFavourite = 'GenericErrorRemoveFavourite',
    GenericAddFavourite = 'GenericAddFavourite',
}
