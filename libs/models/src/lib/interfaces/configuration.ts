import {
    ABRMode,
    ActionType,
    AnalyticsServices,
    Anchor,
    ApplicationType,
    BuildType,
    CacheValue,
    ComponentDataType,
    ComponentStyleSubType,
    ComponentStyleType,
    CuratedDataEntryType,
    DisplayOrientation,
    ErrorConfigurationType,
    FocusStyle,
    Gender,
    GradientType,
    HorizontalAlign,
    IdentityProviders,
    ItemSize,
    ItemVisibility,
    MenuItemID,
    MenuStyle,
    OS,
    PageComponentType,
    PageType,
    Platform,
    PopupMode,
    ProfileType,
    QualityMappingMode,
    SubscriptionType,
    UIType,
    revenueMode,
    LogType,
    Dimensions,
    SysData,
    Placement,
    LabelTag,
    ButtonVariants,
    SeekMode,
    SeekPreviewFormat,
    Routes,
} from './../../index';

/**
 * @name MappedAppConfiguration
 * This Model will export all the type related to the appConfiguration.
 * properties exported are :
 * @interface MappedAppBaseConfiguration - application base configuration.
 * @interface MappedApplicationConfiguration - application configuration
 *
 * @author amalmohann
 */

/**
 * @name MappedAppBaseConfiguration
 * @type interface
 * @description This interface will have the application base configuration.
 * @author amalmohann
 */
export interface MappedAppBaseConfiguration {
    application: MappedApplicationConfiguration;
}

/**
 * @name MappedApplicationConfiguration
 * @type interface
 * @description This interface will have the application configuration.
 * @author amalmohann
 */
export interface MappedApplicationConfiguration {
    baseConfiguration: MappedBaseConfiguration;
    defaultComponentTheme: ThemeConfig[];
    defaultPageTheme: ThemeConfig[];
    defaultPopupTheme: ThemeConfig[];
    features: Feature[];
    name: string;
    navigation: Navigation[];
    type: ApplicationType;
}

/**
 * @name ButtonStyle
 * @type interface
 * @description This interface will have the Button Style configuration.
 * @author amalmohann
 */
export interface ButtonStyle {
    name: string;
    edgeRadius: number;
    normal: ButtonState;
    focussed: ButtonState;
    selectedFocussed: ButtonState;
    pressed: ButtonState;
    selected: ButtonState;
    disabled: ButtonState;
}

/**
 * @name ButtonState
 * @type interface
 * @description This interface will have the Button State configuration.
 * @author amalmohann
 */
export interface ButtonState {
    name: string;
    background: Color | ColorGradient;
    text: Color;
    secondaryText: Color;
    stroke: Color;
    shadow: boolean;
    image: Color;
    graphics: Graphics;
}

/**
 * @name Color
 * @type interface
 * @description This interface will have the color configuration.
 * @author amalmohann
 */
export interface Color {
    name: string;
    code: string;
}

/**
 * @name ColorGradient
 * @type interface
 * @description This interface will have the color gradient configuration.
 * @author amalmohann
 */
export interface ColorGradient {
    name: string;
    startColor: Color;
    centerColor: Color;
    endColor: Color;
    centerX: number;
    centerY: number;
    angle: number;
    type: GradientType;
}

/**
 * @name ColorPalette
 * @type interface
 * @description This interface will have the color palette configuration.
 * @author amalmohann
 */
export interface ColorPalette {
    name: string;
    primary: Color | ColorGradient;
    secondary: Color | ColorGradient;
    tertiary: Color | ColorGradient;
    hover: Color | ColorGradient;
    disabled: Color | ColorGradient;
    error: Color | ColorGradient;
}

/**
 * @name Graphics
 * @type interface
 * @description This interface will have the graphics configuration.
 * @author amalmohann
 */
export interface Graphics {
    id: string;
    name: string;
    images: Image[];
    anchor: Anchor;
}

/**
 * @name Image
 * @type interface
 * @description This interface will have the Image configuration.
 * @author amalmohann
 */
export interface Image {
    name: string;
    imageUrl: string;
    videoUrl: string;
    media: any;
    preloadImage: boolean;
    width: number;
    height: number;
}

/**
 * @name Media
 * @type interface
 * @description This interface will have the Media configuration.
 * @author amalmohann
 */
export interface Media {
    title: string;
    description: string;
    file: FileConfig;
}

/**
 * @name FileConfig
 * @type interface
 * @description This interface will have the File configuration.
 * @author amalmohann
 */
export interface FileConfig {
    contentType: string;
    fileName: string;
    url: FileConfig;
    details: { size: number; image: Dimensions };
}

/**
 * @name Filters
 * @type interface
 * @description This interface will have the filter value
 * @author amalmohann
 */
export interface Filters {
    name: string;
    platforms: Platform[];
    browser: string[];
    displayOrientation: DisplayOrientation[];
    age: string[];
    gender: Gender[];
    location: string[];
    profileType: ProfileType[];
    subscriptionType: SubscriptionType;
    buildType: BuildType;
    minimumBuildNumber: number;
    startDate: Date;
    endDate: Date;
    operatingSystem: OS;
    userId: string[];
    userSource: IdentityProviders[];
    ipAddress: string[];
    availableCountries: string[];
    incognitoBrowserMode: boolean;
    deviceCategory: string[];
}

//--------------------------
// Base Configuration
//--------------------------
/**
 * @name MappedBaseConfiguration
 * @type interface
 * @description This interface will have the mapped base configuration.
 * @author amalmohann
 */
export interface MappedBaseConfiguration {
    name: string;
    baseApiUrl: string;
    baseArticleUrl: string;
    localizationConfig: AppLocales;
    maintenanceConfig: MappedMaintenanceConfig;
    appStoreConfig: MappedAppStoreConfig;
    allowedTimeDifference: number;
    configUpdateInterval: number;
    configUpdateAppBackgroundDuration: number;
}

/**
 * @name MappedAppStoreConfig
 * @type interface
 * @description This interface will have the mapped app store configuration.
 * @author amalmohann
 */
export interface MappedAppStoreConfig {
    name: string;
    androidAppStoreUrl: string;
    googlePlayStoreIcon: SysData;
    iosAppStoreUrl: string;
    appleStoreIcon: SysData;
    showAppstoreBanner: boolean;
    facebookUrl: string;
    instagramUrl: string;
    twitterUrl: string;
    youtubeUrl: string;
    rssUrl: string;
}

/**
 * @name MappedMaintenanceConfig
 * @type interface
 * @description This interface will have the mapped maintenance configuration.
 * @author amalmohann
 */
export interface MappedMaintenanceConfig {
    name: string;
    showForceUpdate: boolean;
    minimumBuildNumber: number;
    forceUpdateMessage: string;
    forceUpdateUrl: string;
    showMaintenanceMessage: boolean;
    maintenanceMessage: string;
    supportRootedDevices: boolean;
}

/**
 * @name AppLocales
 * @type interface
 * @description This interface will have the locale configuration.
 * @author amalmohann
 */
export interface AppLocales {
    name: string;
    languages: Language[];
    labelGroups: LabelGroup[];
}

/**
 * @name Language
 * @type interface
 * @description This interface will have the locale language configuration.
 * @author amalmohann
 */
export interface Language {
    name: string;
    code: string;
    territoryCode?: string;
    contentId?: string;
}

/**
 * @name LabelGroup
 * @type interface
 * @description This interface will have the label group configuration.
 * @author amalmohann
 */
export interface LabelGroup {
    name: string;
    labels: Label[];
}

/**
 * @name Label
 * @type interface
 * @description This interface will have the label configuration.
 * @author amalmohann
 */
export interface Label {
    key: string;
    value: string;
}

//--------------------------
// Navigation
//--------------------------
/**
 * @name Navigation
 * @type interface
 * @description This interface will have the navigation configuration.
 * @author amalmohann
 */
export interface Navigation {
    name: string;
    menuItems: MenuItem[];
    menuStyle: MenuStyle;
    navigationCategory: string;
    overflowItem: MenuItem;
    maxVisibleItems: number;
    theme: ThemeConfig[];
    overflowTheme: SysData[];
    partnerItems: SysData[];
    staticMenuItems: SysData[];
}

/**
 * @name MenuItem
 * @type interface
 * @description This interface will have the Navigation Menu Item configuration.
 * @author amalmohann
 */
export interface MenuItem {
    id: MenuItemID;
    name: string;
    title: string;
    description: string;
    actionLabel: string;
    itemStyle: ItemSize;
    anchor: Anchor;
    showSeparatorBefore: boolean;
    menuGroup: string;
    buttonStyle: ButtonStyle;
    variant: ButtonVariants;
    page: Page[];
}

//--------------------------
// Default Component Theme
//--------------------------
/**
 * @name Theme
 * @type interface
 * @description This interface will have the component theme configuration.
 * @author amalmohann
 */
export interface ThemeConfig {
    name: string;
    header: ThemeSection;
    body: ThemeSection;
    footer: ThemeSection;
    compositeStyle: CompositeStyle;
    graphics: Graphics[];
}

/**
 * @name ThemeSection
 * @type interface
 * @description This interface will have the component theme section configuration.
 * @author amalmohann
 */
export interface ThemeSection {
    name: string;
    accent: ColorPalette;
    background: ColorPalette;
    text: ColorPalette;
    curvedEdges: boolean;
}

/**
 * @name compositeStyle
 * @type interface
 * @description This interface will have the component composite Style configuration.
 * @author amalmohann
 */
export interface CompositeStyle {
    compositeStyle: ThemeSection;
    name: string;
    primaryButton: ButtonStyle;
    secondaryButton: ButtonStyle;
    primaryToggle: ButtonStyle;
    secondaryToggle: ButtonStyle;
    tertiaryButton: ButtonStyle;
    sliderIndicator: ButtonStyle;
    selectorStyle: ButtonStyle;
    dropdownStyle: ButtonStyle;
    toastTheme: ThemeSection;
    calendarStyle: ThemeSection;
    inputBox: ThemeSection;
    keyboard: ThemeSection;
    overlaySelector: ThemeSection;
}

/**
 * @name ComponentStyle
 * @type interface
 * @description This interface will have the component Style configuration.
 * @author amalmohann
 */
export interface ComponentStyle {
    name: string;
    type: ComponentStyleType;
    subType: ComponentStyleSubType;
    showViewAll: boolean;
    itemOrientation: number;
    itemEdgeRadius: number;
    showComponentTitle: boolean;
    showItemTitle: boolean;
    showItemTopLabel: boolean;
    showItemCountIndicator: boolean;
    showScrollArrows: ItemVisibility;
    itemSize: ItemSize;
    maxItemTitleLines: number;
    maxItemTopLabelLines: number;
    autoScrollEnabled: boolean;
    autoscrollDelay: number;
    autoscrollDuration: number;
    focusStyle: FocusStyle[];
    autoscrollDelayAfterInteraction: number;
    showItemBottomLabel: boolean;
    maxItemBottomLabelLines: number;
    bottomLabelPosition: HorizontalAlign;
    showMetadataPreview: boolean;
    showVideoPreview: boolean;
    showItemCountdown: boolean;
    showItemTypeImage: boolean;
    showBottomField: boolean;
}

//--------------------------
// Features
//--------------------------

//exporting all the features type as one.
export type Feature =
    | FeatureAnalytics
    | FeatureCatalog
    | FeaturePlayer
    | FeatureSearch
    | FeatureSupport
    | FeatureUserManagement
    | FeatureRevenue
    | FeatureProfileManagement;

/**
 * @name FeatureAnalytics
 * @type interface
 * @description This interface will have the analytics feature configuration.
 * @author amalmohann
 */
export interface FeatureAnalytics {
    contentId: string;
    name: string;
    analyticsIntegrations: AnalyticIntegration[];
}

/**
 * @name AnalyticIntegration
 * @type interface
 * @description This interface will have the analytics Integration configuration.
 * @author amalmohann
 */
export interface AnalyticIntegration {
    name: string;
    analyticsService: AnalyticsServices;
    analyticsConfiguration: string;
    analyticEvents: AnalyticEvent[];
}

/**
 * @name AnalyticEvent
 * @type interface
 * @description This interface will have the analytics event configuration.
 * @author amalmohann
 */
export interface AnalyticEvent {
    name: string;
    eventName: string;
    eventNameLabel: string;
    eventAction: string;
    eventAttributes: string[];
}

/**
 * @name FeatureCatalog
 * @type interface
 * @description This interface will have the Catalog feature configuration.
 * @author amalmohann
 */
export interface FeatureCatalog {
    contentId: string;
    name: string;
    cache: CacheValue | string;
    showVideoPreview: boolean;
    showPlayAction: boolean;
    showTrailers: boolean;
    showCategoryType: boolean;
    showPurchaseModeIcon: boolean;
    showMoreInfo: boolean;
    allowFavoriting: boolean;
    allowSharing: boolean;
    shareURL: string;
    allowDownloading: boolean;
    theme: ThemeConfig[];
    movieMetadata: string[];
    seriesMetadata: string[];
    sportsVodMetadata: string[];
    sportsEventMetadata: string[];
    collapseDescription: boolean;
    maxCollapsedLines: number;
    seoFields: string[];
    apiInterval: number;
    tab: MenuItem[];
    productListingComponent: PageComponent[];
    episodeListingComponent: PageComponent[];
    metadataLinkPage: Page[];
    peopleLinkPage: Page[];
    relatedMediaComponent: PageComponent[];
    metaTheme: ThemeConfig[];
}

/**
 * @name PageComponent
 * @type interface
 * @description This interface will have the page component configuration.
 * @author amalmohann
 */
export interface PageComponent {
    name: string;
    title: string;
    identifierExt: string;
    contents: ComponentData[];
    cache: CacheValue | string;
    componentStyle: ComponentStyle[];
    overflowComponentStyle: ComponentStyle[];
    tagConfiguration: TagData[];
    theme: ThemeConfig[];
    maxItems: number;
    overflowListingTheme: ThemeConfig;
    landingPage: string[];
    landingPages: string;
    type: PageComponentType;
    primaryDropdown: NodeType;
    secondaryDropdown: NodeType;
    additionalButton: any;
    componentData: ComponentData;
}

export interface CountryInfo {
    countryCode: string | null;
    countryName: string | null;
}

/**
 * @name Page
 * @type interface
 * @description This interface will have the page  configuration.
 * @author amalmohann
 */
export interface Page {
    label: string;
    title: string;
    identifierExt: string;
    type: PageType;
    urlIdentifier: string;
    components: PageComponent[] | ErrorConfiguration[];
    theme: ThemeConfig[];
    titleAlignment: HorizontalAlign;
    showTitle: boolean;
    showAppLogo: boolean;
    popupTheme: ThemeConfig[];
    navigation: Navigation[];
    secondaryMenuItem: MenuItem[];
}

/**
 * @name TagData
 * @type interface
 * @descripton This interface will have the Tag Data configuration.
 * @author tonyaugustine
 */
export interface TagData {
    anchor: Anchor;
    contentId: string;
    placement: Placement;
    tagId: LabelTag;
    label: string;
    tagStyle: ThemeSection;
    showSlantingEdge: boolean;
}

/**
 * @name ErrorConfiguration
 * @type interface
 * @description This interface will have the Error configuration.
 * @author amalmohann
 */
export interface ErrorConfiguration {
    name: string;
    type: ErrorConfigurationType;
    code: string;
    title: string;
    serverErrorCode: string[];
    description: string;
    uiType: UIType;
    loggingLevel: LogType;
    primaryActionType: ActionType;
    secondaryActionType: ActionType;
    primaryActionLabel: string;
    secondaryActionLabel: string;
    secondaryActionDescription: string;
    separatorText: string;
    faqDescription: string;
    faqLabel: string;
    faqItem: FAQItem[];
    theme: ThemeConfig[];
}

/**
 * @name FAQItem
 * @type interface
 * @description This interface will have the FAQ configuration.
 * @author amalmohann
 */
export interface FAQItem {
    name: string;
    question: string;
    answer: string;
    group: string;
}

/**
 * @name ComponentData
 * @type interface
 * @description This interface will have the component data configuration.
 * @author amalmohann
 */
export interface ComponentData {
    name: string;
    type: ComponentDataType;
    data: string;
    params: string;
    curatedData: CuratedDataEntry[];
    apiPageSize: number;
    source?: string;
}

/**
 * @name CuratedDataEntry
 * @type interface
 * @description This interface will have the curated data configuration.
 * @author amalmohann
 */
export interface CuratedDataEntry {
    name: string;
    title: string;
    subTitle: string;
    description: string;
    graphics: Graphics[];
    page: Page[] | PageComponent[];
    type: CuratedDataEntryType;
    data: string;
    params: string;
    listData: any[] | Label[];
    ctaData: string;
    ctaDescription: string;
}

/**
 * @name NodeType
 * @type interface
 * @description This interface will have the node configuration.
 * @author amalmohann
 */
export interface NodeType {
    nodeName: string;
    nodeId: string;
    nodeKey: string;
    nodeValue: string;
    parentKey: string;
}

/**
 * @name FeaturePlayer
 * @type interface
 * @description This interface will have the player feature configuration.
 * @author amalmohann
 */
export interface FeaturePlayer {
    contentId: string;
    name: string;
    alowCasting: boolean;
    allowMobileBrowserPlayback: boolean;
    playFromLastPosition: boolean;
    progressSaveInterval: number;
    maxResumePercent: number;
    abrMode: ABRMode;
    abrStartingProfile: string[];
    qualityMappingMode: QualityMappingMode;
    qualityMapping: QualityMapping[];
    portraitPlayerEnabled: boolean;
    pipPlayerEnabled: boolean;
    debugModeEnabled: boolean;
    allowOutsidePip: boolean;
    fullScreenConfig: PlayerControlConfiguration[];
    portraitConfig: PlayerControlConfiguration[];
    linearPlayerConfig: PlayerControlConfiguration[];
    castConfig: PlayerControlConfiguration[];
    pipConfig: PlayerControlConfiguration[];
    programComponent: PageComponent[];
    relatedComponent: PageComponent[];
}

/**
 * @name QualityMapping
 * @type interface
 * @description This interface will have the player quality mapping configuration.
 * @author amalmohann
 */
export interface QualityMapping {
    key: string;
    value: string;
}

/**
 * @name PlayerControlConfiguration
 * @type interface
 * @description This interface will have the player control configuration.
 * @author amalmohann
 */
export interface PlayerControlConfiguration {
    name: string;
    titleView: boolean;
    breadCrumbView: boolean;
    audioSelector: boolean;
    qualitySelector: boolean;
    subtitleSelector: boolean;
    fontSizeSelector: boolean;
    nextButton: boolean;
    prevButton: boolean;
    playPauseButton: boolean;
    fwdButton: boolean;
    rewButton: boolean;
    muteButton: boolean;
    totalDuration: boolean;
    remainingTime: boolean;
    elapsedTime: boolean;
    orientationSwitch: boolean;
    autoRotate: boolean;
    autoPlay: boolean;
    seekBar: boolean;
    seekPreview: boolean;
    seekPreviewWidth: number;
    seekPreviewHeight: number;
    bingeWatching: boolean;
    backToLive: boolean;
    watchFromStart: boolean;
    bingeCountdownDuration: number;
    fwdDuration: number;
    rewDuration: number;
    backButton: boolean;
    theme: ThemeConfig[];
    controllerTheme: ThemeConfig[];
    selectorTheme: ThemeConfig[];
    playbackAssetFormat: string;
    previewAssetFormat: string;
    additionalConfiguration: string;
    configVersion: string;
    seekPreviewType: SeekMode;
    seekPreviewFormat: SeekPreviewFormat;
}

/**
 * @name FeatureSearch
 * @type interface
 * @description This interface will have the search feature configuration.
 * @author amalmohann
 */
export interface FeatureSearch {
    contentId: string;
    name: string;
    searchPage: Page[];
    enableSearchHistory: boolean;
    enableSearchSuggestions: boolean;
    maxSearchHistoryCount: number;
    maxSearchSuggestionCount: number;
    maxSearchResultsCount: number;
    minimumSearchQueryLength: number;
    maximumSearchQueryLength: number;
    searchSuggestionTypeRatio: string;
    searchResultTypeRatio: string;
    searchSuggestionsFilter: string;
    searchResultsFilter: string;
    searchFilters: any;
}

/**
 * @name FeatureSupport
 * @type interface
 * @description This interface will have the Support feature configuration.
 * @author amalmohann
 */
export interface FeatureSupport {
    contentId: string;
    name: string;
    contactNo: string[];
    contactEmail: string[];
    contactLink: string;
    tosLink: string;
    tosData: string;
    faqLink: string;
    faqData: FAQItem[];
    privacyPolicyLink: string;
    privacyPolicyData: string;
    errorConfiguration: ErrorConfiguration[];
    logLevel: string[];
    theme: ThemeConfig[];
}

/**
 * @name FeatureUserManagement
 * @type interface
 * @description This interface will have the User Management feature configuration.
 * @author amalmohann
 */
export interface FeatureUserManagement {
    contentId: string;
    name: string;
    authConfigurations: UserAuthConfiguration[];
    registrationMethods: IdentityProviders[];
    loginMethods: IdentityProviders[];
    showLoginPopup: PopupMode;
    firstNameMinChars: number;
    firstNameMaxChars: number;
    lastNameMinChars: number;
    lastNameMaxChars: number;
    minPasswordChars: number;
    maxPasswordChars: number;
    ageMinimumYears: number;
    ageMaxYears: number;
    dobPickerMinimumDate: string;
    dobPickerMaxDate: string;
    dobDisplayFormat: string;
    firstNameValidationRegex: string;
    lastNameValidationRegex: string;
    emailValidationRegex: string;
    passwordRegex: string;
    genderList: Record<string, string>[];
    allowRegistrationWithoutTosAgreement: boolean;
    allowRegistrationWithoutPrivacyAgreement: boolean;
    allowProfileInfoSkipping: boolean;
    allowPasswordReveal: boolean;
    emailVerification: boolean;
    resetPasswordHost: string;
    logInPage: Page[];
    loginTheme: ThemeConfig[];
    profileTheme: ThemeConfig[];
    registrationTheme: ThemeConfig[];
    resetPasswordTheme: ThemeConfig[];
    forgotPasswordCodeTimer: number;
}

/**
 * @name UserAuthConfiguration
 * @type interface
 * @description This interface will have the User Authentication configuration.
 * @author amalmohann
 */
export interface UserAuthConfiguration {
    name: string;
    identityProvider: IdentityProviders;
    authorizeUrl: string;
    redirectUri: string;
    authClientId: string;
    logoutExtendPeriod: number;
    accessTokenRefreshInterval: number;
    logoutRedirectUri: string;
    registrationUri: string;
    subscriptionUri: string;
    additionalConfiguration: string;
}

export interface ErrorPopupData {
    logoSrc: string;
    title: string;
    description: string;
    buttons: ErrorButton[];
    showErrorCode?: boolean;
    errorCode?: string;
}

export interface ErrorButton {
    label: string;
    handleEnterPress?: () => null | Promise<void> | void;
    handleBackPress?: () => null | Promise<void> | void | boolean;
}
export interface ErrorPageData {
    error?: any;
    logoSrc: string;
    title: string;
    description: string;
    buttons: ErrorButton[];
    errorDescription?: string;
    errorCode: string;
    showErrorCode?: boolean;
    handleBackPress?: () => void;
    route: Routes;
}

export interface FeatureRevenue {
    name: string;
    revenueMode: revenueMode[];
    productListingPage: Page[];
    productDetailsPage: Page[];
    purchaseHistoryPage: Page[];
    purchaseRedirectionPage: Page[];
    allowPromoCodeField: boolean;
    contentId: string;
}

export interface ProfileConfig {
    name: string;
    mandatoryPin: boolean;
    playbackPin: boolean;
    maxAge: number;
    ratingId: string;
    relatedRatingId: string[];
    ratingLabel: string;
    ratingDescription: string;
    showAgeConfirmationDeclaration: boolean;
    requirePasswordConfirmation: boolean;
    contentId: string;
}

export interface FeatureProfileManagement {
    name: string;
    maximumProfiles: number;
    enableKidsMode: boolean;
    requireLoginToResetPin: boolean;
    avatars: string;
    themeProfileList: ThemeConfig[];
    themeProfilePopup: ThemeConfig[];
    themeProfileDetails: ThemeConfig[];
    profileConfig: ProfileConfig[];
    showSelectionOnStart: boolean;
    requireKidsPin: boolean;
    initialAgeRatingEnabled: boolean;
    autoProfileSelection: boolean;
    initialRatingSelectionChoice: boolean;
    profileNameMinChars: number;
    profileNameMaxChars: number;
    profiletNameValidationRegex: string;
    contentId: string;
}

export interface KeyValueData {
    key: string;
    value: string;
}
