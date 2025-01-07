export interface ProfileListData {
    profileId: string;
    isAdmin: boolean;
    profileName: string;
    maxParentalRatings: string[];
    profileImage?: string;
    preferences: Preferences;
    hasProfilePin: boolean;
    recommendationUserId: string;
}

export interface Preferences {
    language: string;
}

export interface PinPopData {
    buttonEnterPress?: () => void;
    handlePinCompletelyFilled?: () => void;
    handleBackPress?: () => void;
    buttonLabel?: string;
    pinLength?: number;
    title?: string;
    description1?: string;
    description2?: string;
}

export interface ProfileData {
    status: string;
    authentication_token: string;
    profile: ProfileListData[];
    account: Account;
    appState: any[];
    debug: Debug;
    isProfilePinRequired: boolean;
    middlewareRequestCid: string;
}

export interface Account {
    userId: string;
    email: string;
}

export interface Debug {
    list_profiles_cache_source: string;
    log_Attributes: LogAttributes;
}

export interface LogAttributes {
    lambda_request_id: string;
    user_id: string;
    requested_platform: string;
    module: string;
    app_env: string;
    app_name: string;
    platform: string;
    stack: string;
    requested_event: string;
    origin: string;
    sessionId: string;
    profile_id: string;
}

export interface Preferences {
    language: string;
}
