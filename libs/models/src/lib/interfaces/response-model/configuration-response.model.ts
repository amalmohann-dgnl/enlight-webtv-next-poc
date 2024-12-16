import {
    AdditionalButtonType,
    Anchor,
    ConfigLinkType,
    ConfigSysType,
    FieldItemStyle,
    FocusStyle,
    ItemSize,
    Platform,
    UIType,
    ScrollArrowsVisibility,
    ApplicationType,
    ActionType,
    APIMapping,
} from './../../index';

export interface BaseConfiguration {
    total: number;
    unFilteredItemsCount: number;
    skip: number;
    appId: string;
    contentLocale: string;
    items: ConfigItem[];
    includes: Includes;
    checksum: string;
}

export interface ApplicationConfiguration {
    name: string;
    type: ApplicationType;
    baseConfiguration: SysData[];
    navigation: SysData[];
    features: SysData[];
    defaultPageTheme: SysData[];
    defaultComponentTheme: SysData[];
    defaultPopupTheme: SysData[];
}

export interface Includes {
    Entry: ConfigItem[];
    Asset: ConfigItem[];
}

export interface ItemSys {
    updatedAt: Date;
    id: string;
    contentType: SysData;
}

export interface ConfigItem {
    sys: ItemSys;
    fields: Fields;
}

export interface File {
    url: string;
    details: Details;
    fileName: string;
    contentType: string;
}

export interface Details {
    size: number;
    image: ImageDimension;
}

export interface ImageDimension {
    width: number;
    height: number;
}

export interface SysData {
    sys: ConfigSys;
}

export interface ConfigSys {
    id: string;
    type: ConfigSysType;
    linkType: ConfigLinkType;
}

export interface Fields {
    key?: string;
    contentId?: string;
    value?: string;
    label?: string;
    title?: string;
    identifierExt?: string;
    contents?: SysData[];
    cache?: string;
    componentStyle?: SysData[];
    maxItems?: number;
    name?: string;
    description?: string;
    file: File;
    code?: string;
    header?: SysData;
    body?: SysData;
    compositeStyle?: SysData;
    type?: string;
    uiType?: UIType;
    primaryActionType?: ActionType;
    secondaryActionType?: ActionType;
    primaryActionLabel?: string;
    secondaryActionLabel?: string;
    filter?: SysData;
    showForceUpdate?: boolean;
    showMaintenanceMessage?: boolean;
    maintenanceMessage?: string;
    id?: string;
    images?: SysData[];
    anchor?: Anchor;
    faqLabel?: string;
    faqItem?: SysData[];
    page?: SysData[];
    itemStyle?: FieldItemStyle;
    buttonStyle?: SysData;
    components?: SysData[];
    titleAlignment?: Anchor;
    showTitle?: boolean;
    showAppLogo?: boolean;
    platforms?: Platform[];
    question?: string;
    answer?: string;
    group?: string;
    subType?: string;
    showViewAll?: boolean;
    itemOrientation?: number;
    itemEdgeRadius?: number;
    showComponentTitle?: boolean;
    showItemTitle?: boolean;
    showItemTopLabel?: boolean;
    showItemCountIndicator?: boolean;
    itemSize?: ItemSize;
    maxItemTitleLines?: number;
    maxItemTopLabelLines?: number;
    focusStyle?: FocusStyle[];
    showMetadataPreview?: boolean;
    showItemCountdown?: boolean;
    showItemTypeImage?: boolean;
    normal?: SysData;
    focussed?: SysData;
    selected?: SysData;
    labels?: SysData[];
    edgeRadius?: number;
    background?: SysData;
    text?: SysData;
    stroke?: SysData;
    selectedFocussed?: SysData;
    showSeparatorBefore?: boolean;
    disabled?: SysData;
    faqDescription?: string;
    footer?: SysData;
    graphics?: SysData[];
    accent?: SysData;
    theme?: SysData[];
    data?: string;
    params?: string;
    pressed?: SysData;
    identityProvider?: string;
    authClientId?: string;
    logoutExtendPeriod?: number;
    accessTokenRefreshInterval?: number;
    tertiary?: SysData;
    media?: SysData;
    preloadImage?: boolean;
    shadow?: boolean;
    menuItems?: SysData[];
    menuStyle?: string;
    navigationCategory?: FieldItemStyle;
    maxVisibleItems?: number;
    showScrollArrows?: ScrollArrowsVisibility;
    subscriptionType?: string[];
    actionLabel?: string;
    apiPageSize?: number;
    minimumBuildNumber?: number;
    forceUpdateMessage?: string;
    foceUpdateUrl?: string;
    curatedData?: SysData[];
    analyticsIntegrations?: SysData[];
    curvedEdges?: boolean;
    browser?: string[];
    primaryButton?: SysData;
    secondaryButton?: SysData;
    tertiaryButton?: SysData;
    toastTheme?: SysData;
    secondaryActionDescription?: string;
    primary?: SysData;
    secondary?: SysData;
    sliderIndicator?: SysData;
    dropdownStyle?: SysData;
    inputBox?: SysData;
    introContent?: SysData[];
    landingPage?: SysData[];
    allowSkip?: boolean;
    allowBackNavigation?: boolean;
    showProgressIndicator?: boolean;
    showStrategy?: string[];
    profileType?: string[];
    imageUrl?: string;
    image?: SysData;
    buttonGraphics?: SysData;
    secondaryText?: SysData;
    eventName?: string;
    eventNameLabel?: string;
    eventAction?: string;
    eventAttributes?: string[];
    error?: SysData;
    hover?: SysData;
    urlIdentifier?: string;
    subTitle?: string;
    ctaData?: string;
    listData?: SysData[];
    navigation?: SysData[];
    displayOrientation?: string[];
    selectorStyle?: SysData;
    ctaDescription?: string;
    showBottomField?: boolean;
    analyticsService?: string;
    analyticsConfiguration?: string;
    analyticEvents?: SysData[];
    keyboard?: SysData[];
    authConfigurations?: SysData[];
    registrationMethods?: string[];
    loginMethods?: string[];
    showLoginPopup?: string;
    firstNameMinChars?: number;
    firstNameMaxChars?: number;
    lastNameMinChars?: number;
    lastNameMaxChars?: number;
    minPasswordChars?: number;
    maxPasswordChars?: number;
    ageMinimumYears?: number;
    ageMaxYears?: number;
    dobPickerMinimumDate?: Date;
    dobPickerMaxDate?: Date;
    dobDisplayFormat?: string;
    firstNameValidationRegex?: string;
    lastNameValidationRegex?: string;
    emailValidationRegex?: string;
    passwordRegex?: string;
    genderList?: SysData[];
    allowRegistrationWithoutTosAgreement?: boolean;
    allowRegistrationWithoutPrivacyAgreement?: boolean;
    allowProfileInfoSkipping?: boolean;
    allowPasswordReveal?: boolean;
    emailVerification?: boolean;
    resetPasswordHost?: string;
    loginTheme?: SysData[];
    profileTheme?: SysData[];
    registrationTheme?: SysData[];
    resetPasswordTheme?: SysData[];
    forgotPasswordCodeTimer?: number;
    ipAddress?: string[];
    tableIdentifier?: string;
    menuTitle?: string;
    dynamicTableTitle?: string;
    showSeasonList?: boolean;
    showChampionshipType?: boolean;
    showTypeFilter?: boolean;
    liveTimingFields?: string;
    autoUpdateInterval?: number;
    additionalButton?: AdditionalButton[];
    maxDownloadValidity?: number;
    maxDownloads?: number;
    maxConcurrentDownloads?: number;
    allowStorageSelection?: boolean;
    allowVideoTrackSelection?: boolean;
    allowAudioTrackSelection?: boolean;
    allowSubtitleTrackSelection?: boolean;
    bitrateSelectionMode?: string;
    maxDownloadBitrate?: number;
    minDownloadBitrate?: number;
    showPlayAction?: boolean;
    showTrailers?: boolean;
    showCategoryType?: boolean;
    allowFavoriting?: boolean;
    allowSharing?: boolean;
    shareUrl?: string;
    allowDownloading?: boolean;
    movieMetadata?: string[];
    seriesMetadata?: string[];
    episodeListingComponent?: SysData[];
    metaTheme?: SysData[];
    relatedMediaComponent?: SysData[];
    collapseDescription?: boolean;
    maxCollapsedLines?: number;
    seoFields?: string[];
    productListingComponent?: SysData[];
    tab?: SysData[];
    contactLink?: string[];
    tosLink?: string;
    faqLink?: string;
    faqData?: SysData[];
    privacyPolicyLink?: string;
    errorConfiguration?: SysData[];
    logLevel?: string[];
    allowCasting?: boolean;
    allowMobileBrowserPlayback?: boolean;
    playFromLastPosition?: boolean;
    progressSaveInterval?: number;
    maxResumePercent?: number;
    abrMode?: string;
    abrStartingProfile?: string[];
    qualityMappingMode?: string;
    qualityMapping?: SysData[];
    portraitPlayerEnabled?: boolean;
    pipPlayerEnabled?: boolean;
    debugModeEnabled?: boolean;
    allowOutsidePip?: boolean;
    fullScreenConfig?: SysData[];
    portraitConfig?: SysData[];
    linearPlayerConfig?: SysData[];
    castConfig?: SysData[];
    baseConfiguration?: SysData[];
    features?: SysData[];
    defaultPageTheme?: SysData[];
    defaultComponentTheme?: SysData[];
    defaultPopupTheme?: SysData[];
    allowCalendar?: boolean;
    epgPage?: SysData[];
    numberOfPreviousDay?: number;
    numberOfUpNextDay?: number;
    showDetailPopup?: boolean;
    prefetchData?: number;
    enableIndexDb?: boolean;
    rallyResultComponent?: SysData[];
    championshipStandingComponent?: SysData[];
    wolfPowerComponent?: SysData[];
    liveTimingMenu?: SysData[];
    titleView?: boolean;
    breadCrumbView?: boolean;
    audioSelector?: boolean;
    qualitySelector?: boolean;
    subtitleSelector?: boolean;
    fontSizeSelector?: boolean;
    nextButton?: boolean;
    prevButton?: boolean;
    playPauseButton?: boolean;
    fwdButton?: boolean;
    rewButton?: boolean;
    muteButton?: boolean;
    totalDuration?: boolean;
    remainingTime?: boolean;
    elapsedTime?: boolean;
    orientationSwitch?: boolean;
    autoRotate?: boolean;
    autoPlay?: boolean;
    seekBar?: boolean;
    seekPreview?: boolean;
    backToLive?: boolean;
    watchFromStart?: boolean;
    fwdDuration?: number;
    rewDuration?: number;
    backButton?: boolean;
    selectorTheme?: SysData[];
    playbackAssetFormat?: string;
    previewAssetFormat?: string;
    bingeWatching?: boolean;
    bingeCountdownDuration?: number;
    controllerTheme?: SysData[];
    additionalConfiguration?: string;
    languages?: SysData[];
    labelGroups?: SysData[];
    searchPage?: SysData[];
    enableSearchHistory?: boolean;
    enableSearchSuggestions?: boolean;
    maxSearchHistoryCount?: number;
    maxSearchSuggestionCount?: number;
    maxSearchResultsCount?: number;
    minimumSearchQueryLength?: number;
    maximumSearchQueryLength?: number;
    searchSuggestionTypeRatio?: string;
    searchResultTypeRatio?: string;
    revenueMode?: string[];
    productListingPage?: SysData[];
    productDetailsPage?: SysData[];
    purchaseHistoryPage?: SysData[];
    baseApiUrl?: string;
    baseArticleUrl?: string;
    localizationConfig?: SysData[];
    maintenanceConfig?: SysData[];
    appStoreConfig?: SysData[];
    allowedTimeDifference?: number;
    androidAppStoreUrl?: string;
    iosAppStoreUrl?: string;
    showAppstoreBanner?: boolean;
    facebookUrl?: string;
    instagramUrl?: string;
    twitterUrl?: string;
    youtubeUrl?: string;
    rssUrl?: string;
    separatorText?: string;
    autoScrollEnabled?: boolean;
    nodeName?: string;
    nodeId?: string;
    nodeKey?: string;
    nodeValue?: string;
    parentKey?: string;
    driverFields?: string;
    codriverFields?: string;
    teamFields?: string;
    seasonList?: SysData[];
    championshipList?: SysData[];
    typeList?: SysData[];
    pageTitle?: string;
    pageDescription?: string;
    pageThumbnail?: PageThumbnail;
    manufacturerFields?: string;
    secondaryMenuItem?: SysData[];
    primaryToggle?: SysData;
    secondaryToggle?: SysData;
    provisionalStandingsEnable?: string;
    articlePage?: SysData[];
    relatedComponent?: SysData[];
    autoscrollDelay?: number;
    autoscrollDuration?: number;
    primaryDropdown?: SysData[];
    secondaryDropdown?: SysData[];
    supportedAdTypes?: string[];
    adPlayerTheme?: SysData[];
    bottomLabelPosition?: Anchor;
    showItemBottomLabel?: boolean;
    maxItemBottomLabelLines?: number;
    authorizeUrl?: string;
    territoryCode?: string;
    redirectUri?: string;
    logoutRedirectUri?: string;
}

export interface AdditionalButton {
    url?: string;
    lang?: string;
    type: AdditionalButtonType;
    value: string;
    button: string;
}

export interface PageThumbnail {
    url: string;
}

export interface ErrorResponse {
    apiMapping: object[];
    errorCode: number;
    errorMessage: string;
    message: string;
    middlewareRequestCid: string;
    status: string;
}

export interface ChangeResponse {
    middlewareRequestCid: string;
    content: any[];
    notification: Notification;
    contentful: Contentful;
    apiMapping: APIMapping[];
}

export interface Contentful {
    changeExists: boolean;
    hash: string;
}

export interface Notification {
    entertainment: number;
    media: number;
    feed: number;
}
