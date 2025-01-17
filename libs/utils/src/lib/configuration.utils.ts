import {
    FieldItemStyle,
    Label,
    MenuStyle,
    MappedAppBaseConfiguration,
    Image,
    ThemeSection,
    Color,
    Feature,
    Navigation,
    CompositeStyle,
    Graphics,
    FeatureUserManagement,
    Page,
    MenuItemID,
    MenuItem,
    Features,
    FeaturePlayer,
    StorageKeys,
    FeatureSupport,
    ErrorConfiguration,
    FeatureAnalytics,
    AnalyticIntegration,
    AnalyticsServices as AnalyticsServiceType,
    PageComponentType,
    FeatureCatalog,
    ColorPalette,
    Language,
    FeatureProfileManagement,
    ThemeConfig,
    ButtonStyle,
    ProfileConfig,
    UserAgentDetails,
    SubscriptionType,
    CountryInfo,
} from '@enlight-webtv/models';
import { mathUtilities, userAgentUtilities, appUtilities, storageUtilities } from '.';
import { isValidValue } from './common.utils';
import { getSubscriptionType } from './auth.utils';
import { getLoginPageData } from './page.utils';

// utilities
const { getUserAgentDetails } = userAgentUtilities;
const { uniqueIdGenerator } = mathUtilities;
const { getAppMetaData } = appUtilities;
/**
 * @name getAppConfig
 * @type function/method
 * @description This function will return the app configuration.
 * @return {MappedAppBaseConfiguration}  app configuration.
 *
 * @author alwin-baby
 */
let CONFIG_CACHE: MappedAppBaseConfiguration | null;
const getAppConfig = () => {
    if (isValidValue(CONFIG_CACHE)) {
        return CONFIG_CACHE as MappedAppBaseConfiguration;
    }
    const AppConfiguration = storageUtilities.getState(StorageKeys.CONFIG);
    CONFIG_CACHE = AppConfiguration;
    return AppConfiguration as MappedAppBaseConfiguration;
};

/**
 * @name clearConfigCache
 * @type function/method
 * @description This function will clear the cached app config value and should be called before fetching entries.
 *
 * @author alwin-baby
 */
const clearConfigCache = () => {
    CONFIG_CACHE = null;
    LABEL_MAP_CACHE = null;
    DEFAULT_BODY_BACKGROUND_COLOR_CACHE = null;
    DEFAULT_BODY_SECONDARY_COLOR_CACHE = null;
    DEFAULT_BODY_TERTIARY_COLOR_CACHE = null;
    DEFAULT_BODY_ACCENT_COLOR_CACHE = null;
    DEFAULT_BODY_TEXT_PRIMARY_COLOR_CACHE = null;
    DEFAULT_BODY_TEXT_SECONDARY_COLOR_CACHE = null;
    DEFAULT_BODY_TEXT_TERTIARY_COLOR_CACHE = null;
    DEFAULT_COMPONENT_BODY_THEME_CACHE = null;
    DEFAULT_COMPONENT_HEADER_THEME_CACHE = null;
    DEFAULT_COMPONENT_BODY_TEXT_PRIMARY_COLOR_CACHE = null;
    DEFAULT_COMPONENT_COMPOSITE_STYLE_CACHE = null;
    NAVIGATION_CONFIG_CACHE = null;
    DEFAULT_PAGE_BODY_THEME_CACHE = null;
    DEFAULT_PAGE_HEADER_THEME_CACHE = null;
    DEFAULT_COMPOSITE_STYLE_CACHE = null;
    DEFAULT_GRAPHICS_CONFIG_CACHE = [];
    DEFAULT_POPUP_BODY_THEME_CACHE = undefined;
    HOMEPAGE_CONFIG = undefined;
    LIVE_TV_CONFIG = undefined;
    PLAYER_CONFIG = undefined;
    SUPPORT_CONFIG = undefined;
    ON_DEMAND_CONFIG = undefined;
    FAVOURITES_CONFIG = undefined;
    ARCHIVE_CONFIG = undefined;
    UUID = undefined;
    MUX_ENV_KEY_CACHE = null;
    DEFAULT_INPUT_BOX_COMPOSITE_STYLE = null;
    DEFAULT_TERTIARY_BUTTON_COMPOSITE_STYLE = null;
    FULL_SCREEN_PLAYER_THEME_CACHE = null;
    DEFAULT_PAGE_BODY_ACCENT_CONFIG = undefined;
    DEFAULT_PAGE_BODY_TEXT_CONFIG = undefined;
    CATALOG_META_THEME = undefined;
    FULL_SCREEN_PLAYER_SELECTOR_THEME_CACHE = null;
    LINEAR_PLAYER_THEME_CACHE = null;
    DEFAULT_BODY_ACCENT_HOVER_COLOR_CACHE = null;
    DEFAULT_COMPONENT_BODY_ACCENT_HOVER_COLOR_CACHE = null;
    DEFAULT_COMPONENT_BODY_ACCENT_PRIMARY_COLOR_CACHE = null;
    DEFAULT_KEYBOARD_THEME_CACHE = null;
    CATALOG_CONFIG = undefined;
    USER_MANAGEMENT_CONFIG = undefined;
    PROFILE_MANAGEMENT_CONFIG = undefined;
    CATEGORY_CONFIG = undefined;
    LANGUAGE_CONFIG = undefined;
    PROFILE_CONFIGURATIONS = null;
};

/**
 * @name getLabel
 * @type function/method
 * @description This function will get the label for the specified key and returns the value. If no match found,
 * returns the undefined value.
 * @param {string} key - key for the label
 * @return {string} label - returns the value matching the key specified.
 *
 * @author amalmohann
 */
let LABEL_MAP_CACHE: Map<string, string> | null;
const getLabel = (key: string) => {
    //check if the cache has the map
    if (LABEL_MAP_CACHE) {
        if (LABEL_MAP_CACHE.has(key)) {
            return LABEL_MAP_CACHE.get(key);
        }
    }
    const LABELS: Label[] = storageUtilities.getState('labels');
    const LABEL_MAP = new Map((LABELS ?? []).filter(item => item?.value?.trim().length > 0).map(item => [item.key, item.value]));
    if (LABEL_MAP.has(key)) {
        return LABEL_MAP.get(key);
    }
    return null;
};

/**
 * @name shouldUpdateConfiguration
 * @type function
 * @description This function will check if the config needes to me remapped. This will be required if the entries cecksum
 *  changes or if any of the values used during filtering changes.
 * @param {any} config - dependency config
 * @return {boolean} - If entries remapping is neeeded
 * @author tonyaugustine
 */
const shouldUpdateConfiguration = async (currentConfig: any = {}) => {
    const previousConfigurationDependencies = storageUtilities.getState(StorageKeys.CONFIGURATION_DEPENDENCIES) ?? {};
    let currentConfigurationDependencies: any = (await getCurrentComputedConfigurationDependencies()) ?? {};
    currentConfigurationDependencies = { ...currentConfigurationDependencies, ...currentConfig };
    let shouldUpdateConfiguration = false;

    const currentConfigurationDependencyKeys = Object.keys(currentConfigurationDependencies);
    const previousConfigurationDependencyKeys = Object.keys(previousConfigurationDependencies);

    // Check if both objects have the same number of keys
    if (currentConfigurationDependencyKeys.length !== previousConfigurationDependencyKeys.length) {
        shouldUpdateConfiguration = true;
        return true;
    }

    // Check if both objects have the exact same set of keys
    if (!currentConfigurationDependencyKeys.every(key => previousConfigurationDependencyKeys.includes(key))) {
        shouldUpdateConfiguration = true;
        return true;
    }

    // If a valid chesum is not found then config remapping is needed
    if (!previousConfigurationDependencies['checksum'] || !currentConfigurationDependencies['checksum']) {
        shouldUpdateConfiguration = true;
        return true;
    }

    for (const dependency in currentConfigurationDependencies) {
        if (previousConfigurationDependencies[dependency] !== currentConfigurationDependencies[dependency]) {
            shouldUpdateConfiguration = true;
            break;
        }
    }
    return shouldUpdateConfiguration;
};

/**
 * @name getCurrentComputedConfigurationDependencies
 * @type function
 * @description This function will retreive current values of the config dependencies
 * @param {any} config - Dependency config
 * @return {any} - Cureent config dependencies
 * @author tonyaugustine
 */
const getCurrentComputedConfigurationDependencies = async () => {
    const userAgent: UserAgentDetails = getUserAgentDetails();
    const checksum = storageUtilities.getState(StorageKeys.CHECKSUM);
    const appVersion = getAppMetaData()?.appVersion;
    const osName = userAgent.osName || '';
    const browserName = userAgent.browserName || '';
    const countryCode = (storageUtilities.getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
    const subscriptionType = (await getSubscriptionType()) ?? SubscriptionType.Anonymous;
    // TODO: Add date to dependencies check
    // const date = new Date();
    //import.meta having type config issue.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const buildType = import.meta.env.VITE_BUILD_TYPE;
    return { checksum, /*date, */ appVersion, osName, browserName, subscriptionType, countryCode, buildType };
};
/**
 * @name getImageUrl
 * @type function/method
 * @description This function will return the images url for the Image If no match found, returns the empty string value.
 * @param {Image} image - image asset
 * @return {string} image url
 *
 * @author amalmohann
 */
const getImageUrl = (image: Image) => {
    let imageURL: string | undefined;
    //assigning the icon based on the priority
    //fetching the url from config
    imageURL = image.imageUrl;
    if (!imageURL) {
        //fetching the url from the file from the config
        imageURL = image?.media?.file.url;
    }

    return imageURL ?? '';
};

/**
 * @name getDefaultPageBodyAccentConfiguration
 * @type function/method
 * @description This function will return the default page-body-accent configuration. If no match found, returns the undefined value.
 * @return {string} background color.
 *
 * @author alwin-baby
 */
let DEFAULT_PAGE_BODY_ACCENT_CONFIG: ColorPalette | undefined;
const getDefaultPageBodyAccentConfiguration = () => {
    if (isValidValue(DEFAULT_PAGE_BODY_ACCENT_CONFIG)) {
        return DEFAULT_PAGE_BODY_ACCENT_CONFIG as ColorPalette;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const accentConfig = defaultPageBodyTheme?.accent;
    DEFAULT_PAGE_BODY_ACCENT_CONFIG = accentConfig;
    return accentConfig;
};

/**
 * @name getDefaultPageBodyTextConfiguration
 * @type function/method
 * @description This function will return the default page-body-text configuration. If no match found, returns the undefined value.
 * @return {ColorPalette | undefined} background color.
 *
 * @author alwin-baby
 */
let DEFAULT_PAGE_BODY_TEXT_CONFIG: ColorPalette | undefined;
const getDefaultPageBodyTextConfiguration = () => {
    if (isValidValue(DEFAULT_PAGE_BODY_TEXT_CONFIG)) {
        return DEFAULT_PAGE_BODY_TEXT_CONFIG as ColorPalette;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const textConfig = defaultPageBodyTheme?.text;
    DEFAULT_PAGE_BODY_TEXT_CONFIG = textConfig;
    return textConfig;
};

/**
 * @name getFeaturePlayerBodyAccentConfiguration
 * @type function/method
 * @description This function will return the default featurePlayer-body-accent configuration. If no match found, returns the undefined value.
 * @return {string} background color.
 *
 * @author alwin-baby
 */
let FEATURE_PLAYER_BODY_ACCENT_CONFIG: ColorPalette | undefined;
const getFeaturePlayerBodyAccentConfiguration = () => {
    if (isValidValue(FEATURE_PLAYER_BODY_ACCENT_CONFIG)) {
        return FEATURE_PLAYER_BODY_ACCENT_CONFIG as ColorPalette;
    }
    const featurePlayer = getFeatureByKey(Features.FeaturePlayer) as FeaturePlayer;
    const defaultPageBodyTheme = featurePlayer.fullScreenConfig?.[0]?.theme?.[0]?.body as unknown as ThemeSection;
    const accentConfig = defaultPageBodyTheme?.accent;
    FEATURE_PLAYER_BODY_ACCENT_CONFIG = accentConfig;
    return accentConfig;
};

/**
 * @name getDefaultBodyBackgroundColor
 * @type function/method
 * @description This function will return the color configuration If no match found, returns the undefined value.
 * @return {string} background color.
 *
 * @author amalmohann
 */
let DEFAULT_BODY_BACKGROUND_COLOR_CACHE: Color | null;
const getDefaultBodyBackgroundColor = () => {
    if (isValidValue(DEFAULT_BODY_BACKGROUND_COLOR_CACHE)) {
        return DEFAULT_BODY_BACKGROUND_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const backgroundColor = defaultPageBodyTheme?.background?.primary as Color;
    DEFAULT_BODY_BACKGROUND_COLOR_CACHE = backgroundColor;
    return backgroundColor;
};

/**
 * @name getDefaultBodySecondaryColor
 * @type function/method
 * @description This function will return the color configuration If no match found, returns the undefined value.
 * @return {string} Secondary color.
 *
 * @author amalmohann
 */
let DEFAULT_BODY_SECONDARY_COLOR_CACHE: Color | null;
const getDefaultBodySecondaryColor = () => {
    if (isValidValue(DEFAULT_BODY_SECONDARY_COLOR_CACHE)) {
        return DEFAULT_BODY_SECONDARY_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const backgroundColor = defaultPageBodyTheme.background.secondary as Color;
    DEFAULT_BODY_SECONDARY_COLOR_CACHE = backgroundColor;
    return backgroundColor;
};

/**
 * @name getCatalogMetaTheme
 * @type function/method
 * @description This function will return the catalog meta theme config
 * @return {ThemeConfig} Meta theme configuration.
 *
 * @author tonyaugustine
 */
let CATALOG_META_THEME: ThemeConfig | undefined;
const getCatalogMetaTheme = () => {
    if (isValidValue(CATALOG_META_THEME)) {
        return CATALOG_META_THEME as ThemeConfig;
    }
    const catalogConfig = getCatalogConfig();
    const metaTheme = catalogConfig?.metaTheme?.[0];
    CATALOG_META_THEME = metaTheme;
    return metaTheme;
};

/**
 * @name getDefaultBodyTertiaryColor
 * @type function/method
 * @description This function will return the color configuration If no match found, returns the undefined value.
 * @return {string} tertiary color.
 *
 * @author amalmohann
 */
let DEFAULT_BODY_TERTIARY_COLOR_CACHE: Color | null;
const getDefaultBodyTertiaryColor = () => {
    if (isValidValue(DEFAULT_BODY_TERTIARY_COLOR_CACHE)) {
        return DEFAULT_BODY_TERTIARY_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const backgroundColor = defaultPageBodyTheme.background.tertiary as Color;
    DEFAULT_BODY_TERTIARY_COLOR_CACHE = backgroundColor;
    return backgroundColor;
};

/**
 * @name getDefaultBodyAccentColor
 * @type function/method
 * @description This function will return the color configuration If no match found, returns the undefined value.
 * @return {string} accent color.
 *
 * @author amalmohann
 */
let DEFAULT_BODY_ACCENT_COLOR_CACHE: Color | null;
const getDefaultBodyAccentColor = () => {
    if (isValidValue(DEFAULT_BODY_ACCENT_COLOR_CACHE)) {
        return DEFAULT_BODY_ACCENT_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme();
    const accentColor = defaultPageBodyTheme?.accent?.primary as Color;
    DEFAULT_BODY_ACCENT_COLOR_CACHE = accentColor;
    return accentColor;
};

/**
 * @name getFullScreenPlayerTheme
 * @type function/method
 * @description This function will return the fullscreen player theme.
 * @return {ThemeSection | undefined} theme.
 *
 * @author tonyaugustine
 */
let FULL_SCREEN_PLAYER_THEME_CACHE: ThemeConfig | null;
const getFullScreenPlayerTheme = () => {
    if (isValidValue(FULL_SCREEN_PLAYER_THEME_CACHE)) {
        return FULL_SCREEN_PLAYER_THEME_CACHE as ThemeConfig;
    }
    const playerConfigTheme = getPlayerConfig()?.fullScreenConfig?.[0]?.theme[0];
    FULL_SCREEN_PLAYER_THEME_CACHE = playerConfigTheme ?? ({} as ThemeConfig);
    return playerConfigTheme;
};

/**
 * @name getFullScreenPlayerSelectorTheme
 * @type function/method
 * @description This function will return the fullscreen player selector theme.
 * @return {ThemeConfig | undefined} theme.
 *
 * @author tonyaugustine
 */
let FULL_SCREEN_PLAYER_SELECTOR_THEME_CACHE: ThemeConfig | null;
const getFullScreenPlayerSelectorTheme = () => {
    if (isValidValue(FULL_SCREEN_PLAYER_SELECTOR_THEME_CACHE)) {
        return FULL_SCREEN_PLAYER_SELECTOR_THEME_CACHE as ThemeConfig;
    }
    const fullScreenPlayerSelectorTheme = getPlayerConfig()?.fullScreenConfig?.[0]?.selectorTheme?.[0];

    FULL_SCREEN_PLAYER_SELECTOR_THEME_CACHE = fullScreenPlayerSelectorTheme ?? ({} as ThemeConfig);
    return fullScreenPlayerSelectorTheme;
};

/**
 * @name getLinerPlayerPlayerTheme
 * @type function/method
 * @description This function will return the linear player player theme
 * @return {ThemeConfig | undefined} theme config.
 *
 * @author tonyaugustine
 */
let LINEAR_PLAYER_THEME_CACHE: ThemeConfig | null;
const getLinerPlayerPlayerTheme = () => {
    if (isValidValue(LINEAR_PLAYER_THEME_CACHE)) {
        return LINEAR_PLAYER_THEME_CACHE as ThemeConfig;
    }
    const linearPlayerConfigTheme = getPlayerConfig()?.linearPlayerConfig?.[0]?.theme[0];
    LINEAR_PLAYER_THEME_CACHE = linearPlayerConfigTheme ?? ({} as ThemeConfig);
    return linearPlayerConfigTheme;
};

/**
 * @name getDefaultBodyAccentHoverColor
 * @type function/method
 * @description This function will return the color configuration If no match found, returns the undefined value.
 * @return {string} accent color.
 *
 * @author alwin-baby
 */
let DEFAULT_BODY_ACCENT_HOVER_COLOR_CACHE: Color | null;
const getDefaultBodyAccentHoverColor = () => {
    if (isValidValue(DEFAULT_BODY_ACCENT_HOVER_COLOR_CACHE)) {
        return DEFAULT_BODY_ACCENT_HOVER_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const accentHoverColor = defaultPageBodyTheme?.accent?.hover as Color;
    DEFAULT_BODY_ACCENT_HOVER_COLOR_CACHE = accentHoverColor;
    return accentHoverColor;
};

/**
 * @name getDefaultComponentBodyAccentHoverColor
 * @type function/method
 * @description This function will return the color configuration If no match found, returns the undefined value.
 * @return {string} accent color.
 *
 * @author tonyaugustine
 */
let DEFAULT_COMPONENT_BODY_ACCENT_HOVER_COLOR_CACHE: Color | null;
const getDefaultComponentBodyAccentHoverColor = () => {
    if (isValidValue(DEFAULT_COMPONENT_BODY_ACCENT_HOVER_COLOR_CACHE)) {
        return DEFAULT_COMPONENT_BODY_ACCENT_HOVER_COLOR_CACHE as Color;
    }
    const defaultComponentBodyTheme = getDefaultComponentBodyTheme();
    const accentHoverColor = defaultComponentBodyTheme?.accent?.hover as Color;
    DEFAULT_COMPONENT_BODY_ACCENT_HOVER_COLOR_CACHE = accentHoverColor;
    return accentHoverColor;
};

/**
 * @name getDefaultComponentBodyAccentPrimaryColor
 * @type function/method
 * @description This function will return the color configuration If no match found, returns the undefined value.
 * @return {string} accent color.
 *
 * @author anandpatel
 */
let DEFAULT_COMPONENT_BODY_ACCENT_PRIMARY_COLOR_CACHE: Color | null;
const getDefaultComponentBodyAccentPrimaryColor = () => {
    if (isValidValue(DEFAULT_COMPONENT_BODY_ACCENT_PRIMARY_COLOR_CACHE)) {
        return DEFAULT_COMPONENT_BODY_ACCENT_PRIMARY_COLOR_CACHE as Color;
    }
    const defaultComponentBodyTheme = getDefaultComponentBodyTheme();
    const accentPrimaryColor = defaultComponentBodyTheme?.accent?.primary as Color;
    DEFAULT_COMPONENT_BODY_ACCENT_PRIMARY_COLOR_CACHE = accentPrimaryColor;
    return accentPrimaryColor;
};

/**
 * @name getDefaultBodyTextPrimaryColor
 * @type function/method
 * @description This function will return the default primary text color. If no match found, returns the undefined value.
 * @return {string}  default text primary color.
 *
 * @author alwin-baby
 */
let DEFAULT_BODY_TEXT_PRIMARY_COLOR_CACHE: Color | null;
const getDefaultBodyTextPrimaryColor = () => {
    if (isValidValue(DEFAULT_BODY_TEXT_PRIMARY_COLOR_CACHE)) {
        return DEFAULT_BODY_TEXT_PRIMARY_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const textPrimaryColor = defaultPageBodyTheme?.text?.primary as Color;
    DEFAULT_BODY_TEXT_PRIMARY_COLOR_CACHE = textPrimaryColor;
    return textPrimaryColor;
};

/**
 * @name getDefaultBodyTextSecondaryColor
 * @type function/method
 * @description This function will return the default secondary text color. If no match found, returns the undefined value.
 * @return {string}  default text secondary color.
 *
 * @author alwin-baby
 */
let DEFAULT_BODY_TEXT_SECONDARY_COLOR_CACHE: Color | null;
const getDefaultBodyTextSecondaryColor = () => {
    if (isValidValue(DEFAULT_BODY_TEXT_SECONDARY_COLOR_CACHE)) {
        return DEFAULT_BODY_TEXT_SECONDARY_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const textSecondaryColor = defaultPageBodyTheme?.text?.secondary as Color;
    DEFAULT_BODY_TEXT_SECONDARY_COLOR_CACHE = textSecondaryColor;
    return textSecondaryColor;
};

/**
 * @name getDefaultBodyTextTertiaryColor
 * @type function/method
 * @description This function will return the default tertiary text color. If no match found, returns the undefined value.
 * @return {string}  default text tertiary color.
 *
 * @author alwin-baby
 */
let DEFAULT_BODY_TEXT_TERTIARY_COLOR_CACHE: Color | null;
const getDefaultBodyTextTertiaryColor = () => {
    if (isValidValue(DEFAULT_BODY_TEXT_TERTIARY_COLOR_CACHE)) {
        return DEFAULT_BODY_TEXT_TERTIARY_COLOR_CACHE as Color;
    }
    const defaultPageBodyTheme = getDefaultPageBodyTheme() as ThemeSection;
    const textTertiaryColor = defaultPageBodyTheme?.text?.tertiary as Color;
    DEFAULT_BODY_TEXT_TERTIARY_COLOR_CACHE = textTertiaryColor;
    return textTertiaryColor;
};

/**
 * @name getNavigationThemeBackgroundSecondaryColor
 * @type function/method
 * @description This function will return the navigation theme background secondary color. If no match found, returns the undefined value.
 * @return {string}  default text tertiary color.
 *
 * @author anandpatel
 */

const getNavigationThemeBackgroundSecondaryColor = () => {
    const navigationTheme = getNavigationConfig().theme;
    const secondaryColor = navigationTheme?.[0]?.body?.background?.secondary as Color;
    return secondaryColor;
};

/**
 * @name getDefaultComponentBodyTheme
 * @type function/method
 * @description This function will return the body  configuration  If no match found, returns the undefined value.
 * @return {ThemeSection | undefined} Default Component Body .
 *
 * @author amalmohann
 */
let DEFAULT_COMPONENT_BODY_THEME_CACHE: ThemeSection | null;
const getDefaultComponentBodyTheme = () => {
    if (isValidValue(DEFAULT_COMPONENT_BODY_THEME_CACHE)) {
        return DEFAULT_COMPONENT_BODY_THEME_CACHE as ThemeSection;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultComponentTheme = AppConfiguration.application.defaultComponentTheme;
    DEFAULT_COMPONENT_BODY_THEME_CACHE = defaultComponentTheme[0]?.body as ThemeSection;
    return defaultComponentTheme[0]?.body;
};

/**
 * @name getDefaultComponentHeaderTheme
 * @type function/method
 * @description This function will return the default component header theme configuration.
 * If no match found, returns the undefined value.
 * @return {ThemeSection | undefined} Default Component Body .
 *
 * @author alwin-baby
 */
let DEFAULT_COMPONENT_HEADER_THEME_CACHE: ThemeSection | null;
const getDefaultComponentHeaderTheme = () => {
    if (isValidValue(DEFAULT_COMPONENT_HEADER_THEME_CACHE)) {
        return DEFAULT_COMPONENT_HEADER_THEME_CACHE as ThemeSection;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultComponentTheme = AppConfiguration.application.defaultComponentTheme;
    DEFAULT_COMPONENT_HEADER_THEME_CACHE = defaultComponentTheme[0]?.header as ThemeSection;
    return defaultComponentTheme[0]?.header;
};

/**
 * @name getDefaultComponentBodyTextPrimaryColor
 * @type function/method
 * @description This function will return the default primary text color. If no match found, returns the undefined value.
 * @return {string}  default text primary color.
 *
 * @author alwin-baby
 */
let DEFAULT_COMPONENT_BODY_TEXT_PRIMARY_COLOR_CACHE: Color | null;
const getDefaultComponentBodyTextPrimaryColor = () => {
    if (isValidValue(DEFAULT_COMPONENT_BODY_TEXT_PRIMARY_COLOR_CACHE)) {
        return DEFAULT_COMPONENT_BODY_TEXT_PRIMARY_COLOR_CACHE as Color;
    }
    const defaultComponentTheme = getDefaultComponentBodyTheme() as ThemeSection;
    const textPrimaryColor = defaultComponentTheme?.text?.primary as Color;
    DEFAULT_COMPONENT_BODY_TEXT_PRIMARY_COLOR_CACHE = textPrimaryColor;
    return textPrimaryColor;
};

/**
 * @name getDefaultComponentCompositeStyle
 * @type function/method
 * @description This function will return the default composite style theme. If no match found, returns the undefined value.
 * @return {ThemeSection | undefined} Default Component Body .
 *
 * @author tonyaugustine
 */
let DEFAULT_COMPONENT_COMPOSITE_STYLE_CACHE: CompositeStyle | null;
const getDefaultComponentCompositeStyle = () => {
    if (isValidValue(DEFAULT_COMPONENT_COMPOSITE_STYLE_CACHE)) {
        return DEFAULT_COMPONENT_COMPOSITE_STYLE_CACHE as CompositeStyle;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultComponentTheme = AppConfiguration?.application?.defaultComponentTheme;
    DEFAULT_COMPONENT_COMPOSITE_STYLE_CACHE = defaultComponentTheme?.[0]?.compositeStyle as CompositeStyle;
    return defaultComponentTheme?.[0]?.compositeStyle;
};

/**
 * @name getNavigationConfig
 * @type function/method
 * @description This function will return the sidebar configuration If no match found, returns the undefined value.
 * @return {any} sidebarConfig.
 *
 * @author amalmohann
 */
let NAVIGATION_CONFIG_CACHE: Navigation | null;
const getNavigationConfig = () => {
    if (isValidValue(NAVIGATION_CONFIG_CACHE)) {
        return NAVIGATION_CONFIG_CACHE as Navigation;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();

    //getting the left slider menu configuration
    const sidebarConfigList = AppConfiguration.application.navigation.filter(
        nav => nav.navigationCategory === FieldItemStyle.Primary && nav.menuStyle === MenuStyle.LEFT_SLIDER_MENU,
    );
    //returning the first item.
    NAVIGATION_CONFIG_CACHE = sidebarConfigList[0] as Navigation;
    return sidebarConfigList[0] as Navigation;
};

/**
 * @name getDefaultPageBodyTheme
 * @type function/method
 * @description This function will return the body  configuration  If no match found, returns the undefined value.
 * @return {ThemeSection | undefined} Default Page Body .
 *
 * @author amalmohann
 */
let DEFAULT_PAGE_BODY_THEME_CACHE: ThemeSection | null;
const getDefaultPageBodyTheme = () => {
    if (isValidValue(DEFAULT_PAGE_BODY_THEME_CACHE)) {
        return DEFAULT_PAGE_BODY_THEME_CACHE as ThemeSection;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultPageTheme = AppConfiguration?.application.defaultPageTheme;
    DEFAULT_PAGE_BODY_THEME_CACHE = defaultPageTheme?.[0]?.body as ThemeSection;
    return defaultPageTheme?.[0]?.body ?? ({} as ThemeSection);
};

/**
 * @name getDefaultPageHeaderTheme
 * @type function/method
 * @description This function will return the Header  configuration  If no match found, returns the undefined value.
 * @return {ThemeSection | undefined} Default Page Header .
 *
 * @author amalmohann
 */
let DEFAULT_PAGE_HEADER_THEME_CACHE: ThemeSection | null;
const getDefaultPageHeaderTheme = () => {
    if (isValidValue(DEFAULT_PAGE_HEADER_THEME_CACHE)) {
        return DEFAULT_PAGE_HEADER_THEME_CACHE as ThemeSection;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultPageTheme = AppConfiguration?.application.defaultPageTheme;
    DEFAULT_PAGE_HEADER_THEME_CACHE = defaultPageTheme[0]?.header as ThemeSection;
    return defaultPageTheme[0]?.header;
};

/**
 * @name getDefaultCompositeStyle
 * @type function/method
 * @description This function will return the default composite configuration If no match found, returns the undefined value.
 * @return {CompositeStyle | undefined} default composite configuration
 *
 * @author amalmohann
 */
let DEFAULT_COMPOSITE_STYLE_CACHE: CompositeStyle | null;
const getDefaultCompositeStyle = () => {
    if (isValidValue(DEFAULT_COMPOSITE_STYLE_CACHE)) {
        return DEFAULT_COMPOSITE_STYLE_CACHE as CompositeStyle;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultPageTheme = AppConfiguration?.application.defaultPageTheme;
    DEFAULT_COMPOSITE_STYLE_CACHE = defaultPageTheme?.[0]?.compositeStyle as CompositeStyle;
    return defaultPageTheme?.[0]?.compositeStyle;
};

/**
 * @name getDefaultKeyboardTheme
 * @type function/method
 * @description This function will return the default keyboard theme. If no match found, returns the undefined value.
 * @return {CompositeStyle | undefined} default composite configuration
 *
 * @author alwin-baby
 */
let DEFAULT_KEYBOARD_THEME_CACHE: ThemeSection | null;
const getDefaultKeyboardTheme = () => {
    if (isValidValue(DEFAULT_KEYBOARD_THEME_CACHE)) {
        return DEFAULT_KEYBOARD_THEME_CACHE as ThemeSection;
    }
    const defaultCompositeStyle: CompositeStyle = getDefaultCompositeStyle() as CompositeStyle;
    DEFAULT_KEYBOARD_THEME_CACHE = defaultCompositeStyle?.keyboard;
    return defaultCompositeStyle?.keyboard;
};

/**
 * @name getDefaultGraphicsConfig
 * @type function/method
 * @description This function will return the default graphics configuration If no match found, returns the undefined value.
 * @return {Graphics[] | undefined} default graphics configuration
 *
 * @author amalmohann
 */
let DEFAULT_GRAPHICS_CONFIG_CACHE: (Graphics[] | undefined)[] = [];
const getDefaultGraphicsConfig = (index: number) => {
    if (DEFAULT_GRAPHICS_CONFIG_CACHE[index]) {
        return DEFAULT_GRAPHICS_CONFIG_CACHE[index];
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultPageTheme = AppConfiguration?.application?.defaultPageTheme;

    if (defaultPageTheme && Array.isArray(defaultPageTheme[index]?.graphics)) {
        const graphics = defaultPageTheme[index]?.graphics as Graphics[];
        DEFAULT_GRAPHICS_CONFIG_CACHE[index] = graphics;
        return graphics;
    }

    return undefined; // Handle the case where no valid graphics are found
};

/**
 * @name getDefaultGraphicsByID
 * @type function/method
 * @description This function will return the default graphics configuration based on ID If no match found, returns the undefined value.
 * @param {string} graphicsKey - key for the graphics to be searched.
 * @return {Graphics | undefined} default graphics configuration
 *
 * @author amalmohann
 */
const getDefaultGraphicsByID = (graphicsKey: string) => {
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultPageTheme = AppConfiguration?.application?.defaultPageTheme;

    for (let index = 0; index < defaultPageTheme?.length; index++) {
        const defaultGraphics = getDefaultGraphicsConfig(index);
        const graphic = defaultGraphics?.find(graphic => graphic.id === graphicsKey);

        if (graphic) {
            return graphic; // Return an array with the matching graphic
        }
    }

    return undefined; // Return undefined if no matching graphic is found
};

/**
 * @name getDefaultPopupBodyTheme
 * @type function/method
 * @description This function will return the default popup body theme configuration, if not found returns undefined.
 * @return {ThemeSection | undefined} - The default popup body theme.
 * @author anandpatel
 */
let DEFAULT_POPUP_BODY_THEME_CACHE: ThemeSection | undefined;
const getDefaultPopupBodyTheme = (): ThemeSection | undefined => {
    if (DEFAULT_POPUP_BODY_THEME_CACHE) {
        return DEFAULT_POPUP_BODY_THEME_CACHE;
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const defaultPopupTheme = AppConfiguration?.application?.defaultPopupTheme;
    const defaultPopupBodyTheme = defaultPopupTheme?.[0]?.body;
    DEFAULT_POPUP_BODY_THEME_CACHE = defaultPopupBodyTheme;
    return defaultPopupBodyTheme;
};

/**
 * @name getDefaultPopupBodyTextSecondaryColor
 * @type function/method
 * @description This function will returns the secondary text color from default popup body theme configuration.
 * @return {Color} - popup secondary text color.
 * @author anandpatel
 */
const getDefaultPopupBodyTextSecondaryColor = () => {
    const defaultPopupBodyTheme = getDefaultPopupBodyTheme();
    const secondaryColor: Color = defaultPopupBodyTheme?.text?.secondary as Color;
    return secondaryColor;
};

/**
 * @name getFeatureByKey
 * @type function/method
 * @description This function will return the feature configuration for If no match found, returns the undefined value.
 * @param {string} featureKey - key for the feature to be searched.
 * @return { Feature | undefined} feature based on the key
 *
 * @author amalmohann
 */
const getFeatureByKey = (featureKey: string) => {
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const featuresList = AppConfiguration.application.features;
    const feature = featuresList.filter(feature => feature.contentId === featureKey);
    return feature[0] as Feature;
};

/**
 * @name getSearchResultsTheme
 * @type function
 * @description This function retrieves the theme of the Search Results component.
 * @param {Object} themeObject - The theme configuration object.
 * @return {Object | null} The theme of the Search Results component or null if not found.
 * @author anandpatel
 */
function getSearchResultsTheme(themeObject: any): object {
    const searchResultsComponent = themeObject.components.find((component: any) => component.type === PageComponentType.SEARCH_RESULTS);
    return (searchResultsComponent.theme[0] as ThemeSection) || null;
}

/**
 * @name getSearchHistoryTheme
 * @type function
 * @description This function retrieves the theme of the Search History component.
 * @param {Object} themeObject - The theme configuration object.
 * @return {Object | null} The theme of the Search History component or null if not found.
 * @author anandpatel
 */
function getSearchHistoryTheme(themeObject: any): ThemeSection {
    const searchHistoryComponent = themeObject.components.find((component: any) => component.type === PageComponentType.SEARCH_HISTORY);
    return (searchHistoryComponent?.theme[0] as ThemeSection) || null;
}

/**
 * @name getSearchSuggestionTheme
 * @type function
 * @description This function retrieves the theme of the Search Suggestion component.
 * @param {Object} themeObject - The theme configuration object.
 * @return {Object | null} The theme of the Search Suggestion component or null if not found.
 * @author anandpatel
 */
function getSearchSuggestionTheme(themeObject: any): ThemeSection {
    const searchSuggestionComponent = themeObject.searchPage[0].components.find(
        (component: any) => component.type === PageComponentType.SEARCH_SUGGESTION,
    );
    return (searchSuggestionComponent?.theme[0] as ThemeSection) || null;
}

/**
 * @name getPlayerRelatedComponentTheme
 * @type function
 * @description This function retrieves the theme of the Player Related Component Theme.
 *
 * @return {ThemeConfig | null} The theme of theRelated component
 * @author tonyaugustine
 */
function getPlayerRelatedComponentTheme(): ThemeConfig | null {
    const featurePlayer: FeaturePlayer | undefined = getFeatureByKey(Features.FeaturePlayer) as FeaturePlayer;
    const relatedComponentConfig = featurePlayer?.relatedComponent?.[0];
    const relatedComponentTheme = relatedComponentConfig?.theme?.[0] ?? null;
    return relatedComponentTheme;
}

/**
 * @name getLoginPageTheme
 * @type function
 * @description Retrieves the login page theme
 * @return {Object} Returns the login page theme
 * @author tonyaugustine
 */
function getLoginPageTheme(): ThemeConfig | undefined {
    const featureUser = getFeatureUserManagement();
    if (featureUser) {
        return featureUser?.loginTheme?.[0];
    }
    return undefined;
}

/**
 * @name getSearchInputBoxThemes
 * @type function
 * @description Retrieves the sub-themes (accent, background, and text) of an input box from a given themeObject.
 * @param {Object} themeObject - The theme configuration object containing inputBox sub-themes.
 * @return {Object} An object containing the input box sub-themes (accent, background, and text).
 * @author anandpatel
 */
function getSearchInputBoxThemes(themeObject: any): ThemeSection {
    // Retrieve the inputBox theme from the themeObject or set it to null if not found
    const inputBoxTheme = themeObject.searchPage[0].theme[0]?.compositeStyle?.inputBox as ThemeSection;

    // Return an object containing the inputBox sub-themes
    return inputBoxTheme;
}

/**
 * @name getHomePageConfig
 * @type function/method
 * @description This function will return the homepage configuration for If no match found, returns the undefined value.
 * @return { Page | undefined} feature based on the key
 *
 * @author amalmohann
 */
let HOMEPAGE_CONFIG: Page | undefined;
const getHomePageConfig = () => {
    if (isValidValue(HOMEPAGE_CONFIG)) {
        return HOMEPAGE_CONFIG;
    }
    const navigation: Navigation | undefined = getNavigationConfig();
    const config = navigation.menuItems.filter((item: MenuItem) => item.id === MenuItemID.MENU_HOME)[0];
    const pageConfig = config?.page.filter((value: Page) => isValidValue(value));
    HOMEPAGE_CONFIG = pageConfig?.[0];
    return pageConfig?.[0];
};

/**
 * @name getLiveTvPageConfig
 * @type function/method
 * @description This function will return the Live Tv page configuration for If no match found, returns the undefined value.
 * @return { Page | undefined} feature based on the key
 *
 * @author amalmohann
 */
let LIVE_TV_CONFIG: Page | undefined;
const getLiveTvPageConfig = () => {
    if (isValidValue(LIVE_TV_CONFIG)) {
        return LIVE_TV_CONFIG;
    }
    const navigation: Navigation | undefined = getNavigationConfig();
    const config = navigation.menuItems.filter((item: MenuItem) => item.id === MenuItemID.MENU_LIVE_TV)[0]?.page[0];
    LIVE_TV_CONFIG = config;
    return config;
};

/**
 * @name getPlayerConfig
 * @type function/method
 * @description This function will return the player configuration for If no match found, returns the undefined value.
 * @return { FeaturePlayer | undefined} feature based on the key
 *
 * @author amalmohann
 */
let PLAYER_CONFIG: FeaturePlayer | undefined;
const getPlayerConfig = (): FeaturePlayer | undefined => {
    if (isValidValue(PLAYER_CONFIG)) {
        return PLAYER_CONFIG;
    }
    const config: FeaturePlayer | undefined = getFeatureByKey(Features.FeaturePlayer) as FeaturePlayer;
    PLAYER_CONFIG = config;
    return config;
};

/**
 * @name getCatalogConfig
 * @type function/method
 * @description This function will return the Catalog configuration. If no match found, returns the undefined value.
 * @return {FeatureCatalog | undefined} feature based on the key
 *
 * @author alwin-baby
 */
let CATALOG_CONFIG: FeatureCatalog | undefined;
const getCatalogConfig = (): FeatureCatalog | undefined => {
    if (isValidValue(CATALOG_CONFIG)) {
        return CATALOG_CONFIG;
    }
    const config: FeatureCatalog | undefined = getFeatureByKey(Features.FeatureCatalog) as FeatureCatalog;
    CATALOG_CONFIG = config;
    return config;
};

/**
 * @name getPageConfig
 * @type function/method
 * @param {itemId} string - MenuItem Id
 * @description This function will return the page configuration based on the itemId, If no match found, returns the undefined value.
 * @return { Page | undefined} feature based on the key
 *
 * @author anandpatel
 */
const getPageConfig = (itemID?: string) => {
    const navigation: Navigation | undefined = getNavigationConfig();
    const config = navigation.menuItems.filter((item: MenuItem) => item.id === itemID)[0]?.page[0];
    return config;
};

/**
 * @name getFeatureUserManagement
 * @type function/method
 * @description This function will return the feature user management configuration. If no match found, returns the undefined value.
 * @return {FeatureUserManagement | undefined} feature based on the key
 *
 * @author tonyaugustine
 */
let USER_MANAGEMENT_CONFIG: FeatureUserManagement | undefined;
const getFeatureUserManagement = (): FeatureUserManagement | undefined => {
    if (isValidValue(USER_MANAGEMENT_CONFIG)) {
        return USER_MANAGEMENT_CONFIG;
    }
    const config: FeatureUserManagement | undefined = getFeatureByKey(Features.FeatureUserManagement) as FeatureUserManagement;
    USER_MANAGEMENT_CONFIG = config;
    return config;
};

/**
 * @name getSupportConfig
 * @type function/method
 * @description This function will return the support configuration for If no match found, returns the undefined value.
 * @return { FeatureSupport | undefined} feature based on the key
 *
 * @author amalmohann
 */
let SUPPORT_CONFIG: FeatureSupport | undefined;
const getSupportConfig = () => {
    if (isValidValue(SUPPORT_CONFIG)) {
        return SUPPORT_CONFIG;
    }
    const config: Feature | undefined = getFeatureByKey(Features.FeatureSupport);
    SUPPORT_CONFIG = config as FeatureSupport;
    return config;
};

/**
 * @name getProfileManagementConfig
 * @type function/method
 * @description This function will return the profile management configuration for If no match found, returns the undefined value.
 * @return { FeatureProfileManagement | undefined} feature based on the key
 *
 * @author alwin-baby
 */
let PROFILE_MANAGEMENT_CONFIG: FeatureProfileManagement | undefined;
const getProfileManagementConfig = () => {
    if (isValidValue(PROFILE_MANAGEMENT_CONFIG)) {
        return PROFILE_MANAGEMENT_CONFIG;
    }
    const config: Feature | undefined = getFeatureByKey(Features.featureProfileManagement);
    PROFILE_MANAGEMENT_CONFIG = config as FeatureProfileManagement;
    return config;
};

/**
 * @name getOnDemandPageConfig
 * @type function/method
 * @description This function will return the on demand page configuration for If no match found, returns the undefined value.
 * @return { Feature | undefined} feature based on the key
 *
 * @author amalmohann
 */
let ON_DEMAND_CONFIG: Page | undefined;
const getOnDemandPageConfig = () => {
    if (isValidValue(ON_DEMAND_CONFIG)) {
        return ON_DEMAND_CONFIG;
    }
    const navigation: Navigation | undefined = getNavigationConfig();
    const config = navigation.menuItems.filter((item: MenuItem) => item.id === MenuItemID.ON_DEMAND_MENU)[0]?.page[0];
    ON_DEMAND_CONFIG = config;
    return config;
};
/**
 * @name getFavouritesPageConfig
 * @type function/method
 * @description This function will return the favouritesPage configuration for If no match found, returns the undefined value.
 * @return { Feature | undefined} feature based on the key
 *
 * @author anandpatel
 *
 */
let FAVOURITES_CONFIG: Page | undefined;
const getFavouritesPageConfig = () => {
    if (isValidValue(FAVOURITES_CONFIG)) {
        return FAVOURITES_CONFIG;
    }
    const navigation: Navigation | undefined = getNavigationConfig();

    const config = navigation.menuItems.filter((item: MenuItem) => item.id === MenuItemID.FAVOURITES || item.id === MenuItemID.MENU_FAVORITES)[0]
        ?.page[0];
    FAVOURITES_CONFIG = config;
    return config;
};

/**
 * @name getArchivePageConfig
 * @type function/method
 * @description This function will return the archive page configuration for If no match found, returns the undefined value.
 * @return { Page | undefined} feature based on the key
 *
 * @author amalmohann
 */
let ARCHIVE_CONFIG: Page | undefined;
const getArchivePageConfig = () => {
    if (isValidValue(ARCHIVE_CONFIG)) {
        return ARCHIVE_CONFIG;
    }
    const navigation: Navigation | undefined = getNavigationConfig();
    const config = navigation.menuItems.filter((item: MenuItem) => item.id === MenuItemID.ARCHIVE_MENU)[0]?.page[0];
    ARCHIVE_CONFIG = config;
    return config;
};

/**
 * @name getCategoryPageConfig
 * @type function/method
 * @description This function will return the archive page configuration for If no match found, returns the undefined value.
 * @return { Page | undefined} feature based on the key
 *
 * @author amalmohann
 */
let CATEGORY_CONFIG: Page | undefined;
const getCategoryPageConfig = () => {
    if (isValidValue(CATEGORY_CONFIG)) {
        return CATEGORY_CONFIG;
    }
    const navigation: Navigation | undefined = getNavigationConfig();
    const config = navigation.menuItems.filter((item: MenuItem) => item.id === MenuItemID.MENU_CATEGORIES)[0]?.page[0];
    CATEGORY_CONFIG = config;
    return config;
};

/**
 * @name getLanguageConfig
 * @type function/method
 * @description This function will return the language configuration. If no match found, returns the undefined value.
 * @return {Language[]} available language list
 *
 * @author tonyaugustine
 */
let LANGUAGE_CONFIG: Language[] | undefined;
const getLanguageConfig = () => {
    if (isValidValue(LANGUAGE_CONFIG)) {
        return LANGUAGE_CONFIG as Language[];
    }
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const languageConfig = AppConfiguration?.application?.baseConfiguration?.localizationConfig?.languages;
    return languageConfig;
};

/**
 * @name getErrorByCode
 * @type function/method
 * @description This function retrieves an error object based on an error code.
 * If no matching error code is found, it returns undefined.
 * @param {number} errorCode - The error code to look up in the error code map.
 * @returns {ErrorConfiguration | undefined} - The error object corresponding to the error code, or undefined if not found.
 * @author anandpatel
 */
const getErrorByCode = (errorCode: string): ErrorConfiguration | undefined => {
    const errorCodeMapString: string | undefined = storageUtilities.getState('errorCode');

    if (!errorCodeMapString) {
        // Handle the case where the error code map string is not found in storage
        console.error('Error code map string not found in storage.');
        return undefined;
    }

    // Parse the JSON string back to an array of key-value pairs and then create a Map
    const errorCodeMap = new Map<string, ErrorConfiguration>(JSON.parse(errorCodeMapString));
    // Find the error object in the Map
    const ErrorConfiguration = errorCodeMap.get(errorCode);

    if (ErrorConfiguration) {
        // You found the error object
        return ErrorConfiguration;
    } else {
        // Error object not found for the given code
        console.warn('Error not found for code:', errorCode);
        return undefined;
    }
};

/**
 * @name getLoginListData
 * @type function/method
 * @description This function retrieves login list data based on a provided key.
 * If no matching key is found, it returns undefined.
 * @param {string} key - The key to search for in the login list data.
 * @param {FeatureUserManagement} featureUserManagement - An object containing user management features.
 * @returns {LoginListData | undefined} - The login list data corresponding to the key, or undefined if not found.
 * @author anandpatel
 */
const getLoginListData = (key: string, featureUserManagement: FeatureUserManagement) => {
    const loginData = getLoginPageData(featureUserManagement);
    const loginListData = loginData.listData?.find((data: any) => key === data.key);

    return loginListData;
};

/**
 * @name getClientIdForConfig
 * @type service
 * @description This function will generate the client id for the config change.
 * @returns {string} clientId
 * @author amalmohann
 */
let UUID: string | undefined;
const getClientIdForConfig = async () => {
    //check in local cache
    if (UUID) {
        return UUID;
    }

    //get from local storage
    UUID = await storageUtilities.getState(StorageKeys.CLIENT_ID);

    //check in local storage
    if (!UUID) {
        UUID = uniqueIdGenerator();
        storageUtilities.setState(StorageKeys.CLIENT_ID, UUID);
    }
    return UUID;
};

/**
 * @name getMuxENVKey
 * @type service
 * @description This function will fetch the environment key for mux from contentful
 * @returns {string} environment key
 * @author anandpatel
 */
let MUX_ENV_KEY_CACHE: string | null = null;
const getMuxENVKey = () => {
    if (MUX_ENV_KEY_CACHE) {
        return MUX_ENV_KEY_CACHE;
    }
    const muxConfig = getFeatureByKey(Features.FeatureAnalytics) as FeatureAnalytics;
    const analyticsIntegrations = muxConfig?.analyticsIntegrations.filter(
        (analytics: AnalyticIntegration) => analytics.analyticsService === AnalyticsServiceType.MUX,
    )[0];
    const analyticsConfiguration = JSON.parse(analyticsIntegrations?.analyticsConfiguration ?? '');
    MUX_ENV_KEY_CACHE = analyticsConfiguration.environmentKey;
    return MUX_ENV_KEY_CACHE;
};

/**
 * @name getMaintenanceModeConfig
 * @type service
 * @description This function will fetch the maintenance config from contentful
 * @returns {MappedMaintenanceConfig} - return maintenance config
 * @author anandpatel
 */
const getMaintenanceModeConfig = () => {
    const AppConfiguration: MappedAppBaseConfiguration = getAppConfig();
    const maintenanceConfig = AppConfiguration.application.baseConfiguration.maintenanceConfig;
    return maintenanceConfig;
};

/**
 * @name getDefaultInputBoxCompositeStyle
 * @type service
 * @description This function will fetch the maintenance config from contentful
 * @returns {MappedMaintenanceConfig} - return maintenance config
 * @author anandpatel
 */
let DEFAULT_INPUT_BOX_COMPOSITE_STYLE: ThemeSection | null = null;
const getDefaultInputBoxCompositeStyle = (): ThemeSection => {
    if (DEFAULT_INPUT_BOX_COMPOSITE_STYLE) {
        return DEFAULT_INPUT_BOX_COMPOSITE_STYLE;
    }
    const defaultCompositeStyle = getDefaultCompositeStyle() as CompositeStyle;
    const { inputBox } = defaultCompositeStyle;
    DEFAULT_INPUT_BOX_COMPOSITE_STYLE = inputBox;
    return DEFAULT_INPUT_BOX_COMPOSITE_STYLE;
};
/**
 * @name getAuthConfigurations
 * @type service
 * @description This function will fetch auth configurations from contentful
 * @returns {UserAuthConfiguration[]} - return auth config
 * @author anandpatel
 */
const getAuthConfigurations = () => {
    const featureUserManagement: FeatureUserManagement = getFeatureByKey(Features.FeatureUserManagement) as FeatureUserManagement;
    const authConfigurations = featureUserManagement.authConfigurations;
    return authConfigurations[0];
};

/**
 * @name getRequiredAnalyticsServices
 * @type Function
 * @description This function will reteive the required anaytics integrations for this project
 * @returns {AnalyticsServiceType[]} - required anaytics integrations
 * @author tonyaugustine
 */
const getRequiredAnalyticsServices = () => {
    const featureAnalyticsConfig = getFeatureByKey(Features.FeatureAnalytics) as FeatureAnalytics;
    const requiredAnalyticsServices = featureAnalyticsConfig?.analyticsIntegrations?.flatMap(analyticsIntegration => {
        if (Object.values(AnalyticsServiceType).includes(analyticsIntegration?.analyticsService)) return [analyticsIntegration?.analyticsService];
        else return [];
    });
    return requiredAnalyticsServices;
};
/**
 * @name getDefaultTertiaryButtonCompositeStyle
 * @type function
 * @description This function will retrieve default tertiary button style
 * @returns {ButtonStyle} - return tertiary button style
 * @author anandpatel
 */
let DEFAULT_TERTIARY_BUTTON_COMPOSITE_STYLE: ButtonStyle | null = null;
const getDefaultTertiaryButtonCompositeStyle = () => {
    if (DEFAULT_TERTIARY_BUTTON_COMPOSITE_STYLE) {
        return DEFAULT_TERTIARY_BUTTON_COMPOSITE_STYLE;
    }
    const defaultCompositeStyle = getDefaultCompositeStyle() as CompositeStyle;
    const defaultTertiaryButtonCompositeStyle = defaultCompositeStyle?.tertiaryButton;
    DEFAULT_TERTIARY_BUTTON_COMPOSITE_STYLE = defaultTertiaryButtonCompositeStyle;
    return DEFAULT_TERTIARY_BUTTON_COMPOSITE_STYLE;
};

let MIXPANEL_CONFIG: AnalyticIntegration | null;
/**
 * @name getMixPanelConfiguration
 * @type function
 * @description This function will retreive mixpanel configuraiton
 * @returns {AnalyticIntegration | null} - return Analytics config
 * @author tonyaugustine
 */
const getMixPanelConfiguration = () => {
    if (MIXPANEL_CONFIG) {
        return MIXPANEL_CONFIG;
    }
    const featureAnalyticsConfig = getFeatureByKey(Features.FeatureAnalytics) as FeatureAnalytics;
    const mixPanelConfig = featureAnalyticsConfig?.analyticsIntegrations?.find(
        analyticsIntegration => analyticsIntegration.analyticsService === AnalyticsServiceType.MIXPANEL,
    );
    if (isValidValue(mixPanelConfig)) {
        MIXPANEL_CONFIG = mixPanelConfig!;
        return MIXPANEL_CONFIG;
    }
    return null;
};

let ENGAGE_CONFIG: AnalyticIntegration | null;
/**
 * @name getEngageConfiguration
 * @type function
 * @description This function will retreive engage configuraiton
 * @returns {AnalyticIntegration | null} - return engage analytics config
 * @author tonyaugustine
 */
const getEngageConfiguration = () => {
    if (ENGAGE_CONFIG) {
        return ENGAGE_CONFIG;
    }
    const featureAnalyticsConfig = getFeatureByKey(Features.FeatureAnalytics) as FeatureAnalytics;
    const engageConfig = featureAnalyticsConfig?.analyticsIntegrations?.find(
        analyticsIntegration => analyticsIntegration.analyticsService === AnalyticsServiceType.ENGAGE,
    );

    if (isValidValue(engageConfig)) {
        MIXPANEL_CONFIG = engageConfig!;
        return MIXPANEL_CONFIG;
    }
    return null;
};

/**
 * @name getProfileConfigurations
 * @type function
 * @description This function will retreive the profile configurations
 * @returns {ProfileConfig[]} - returns the profile configurations
 *
 * @author alwin-baby
 */
let PROFILE_CONFIGURATIONS: ProfileConfig[] | null = null;
const getProfileConfigurations = () => {
    if (PROFILE_CONFIGURATIONS) {
        return PROFILE_CONFIGURATIONS;
    }
    const featureProfileManagemant = getFeatureByKey(Features.featureProfileManagement) as FeatureProfileManagement;
    const profileConfig = featureProfileManagemant?.profileConfig;
    PROFILE_CONFIGURATIONS = profileConfig;
    return profileConfig;
};

/**
 * @name getProfileConfigByRating
 * @type function
 * @description This function will retreive the profile config based on a rating
 * @returns {ProfileConfig} - returns the profile config
 *
 * @author alwin-baby
 */
const getProfileConfigByRating = (rating: string) => {
    const profileConfigurations = getProfileConfigurations();
    const profileConfig = profileConfigurations?.find(config => config.relatedRatingId?.includes(rating));
    return profileConfig;
};

export {
    getClientIdForConfig,
    getAppConfig,
    getLabel,
    getImageUrl,
    getDefaultBodyBackgroundColor,
    getDefaultBodySecondaryColor,
    getDefaultBodyTertiaryColor,
    getDefaultBodyAccentColor,
    getDefaultBodyTextPrimaryColor,
    getDefaultBodyTextSecondaryColor,
    getDefaultBodyTextTertiaryColor,
    getDefaultComponentBodyTheme,
    getDefaultComponentBodyTextPrimaryColor,
    getDefaultComponentCompositeStyle,
    getNavigationConfig,
    getNavigationThemeBackgroundSecondaryColor,
    getDefaultPageBodyTheme,
    getDefaultPageHeaderTheme,
    getDefaultCompositeStyle,
    getDefaultGraphicsConfig,
    getDefaultGraphicsByID,
    getFeatureByKey,
    getSearchResultsTheme,
    getSearchHistoryTheme,
    getSearchSuggestionTheme,
    getSearchInputBoxThemes,
    getHomePageConfig,
    getErrorByCode,
    getLoginListData,
    getLiveTvPageConfig,
    getOnDemandPageConfig,
    getArchivePageConfig,
    getCategoryPageConfig,
    getPlayerConfig,
    getSupportConfig,
    getProfileManagementConfig,
    getFavouritesPageConfig,
    clearConfigCache,
    getDefaultPopupBodyTheme,
    getDefaultPopupBodyTextSecondaryColor,
    getDefaultComponentHeaderTheme,
    getMuxENVKey,
    getMaintenanceModeConfig,
    getCatalogConfig,
    getDefaultPageBodyAccentConfiguration,
    getAuthConfigurations,
    getDefaultInputBoxCompositeStyle,
    getLanguageConfig,
    getDefaultBodyAccentHoverColor,
    getLinerPlayerPlayerTheme,
    getFullScreenPlayerTheme,
    getDefaultKeyboardTheme,
    getCatalogMetaTheme,
    getDefaultComponentBodyAccentHoverColor,
    getDefaultComponentBodyAccentPrimaryColor,
    getFeatureUserManagement,
    getLoginPageTheme,
    getFullScreenPlayerSelectorTheme,
    getMixPanelConfiguration,
    getDefaultTertiaryButtonCompositeStyle,
    getPlayerRelatedComponentTheme,
    getPageConfig,
    getProfileConfigurations,
    getProfileConfigByRating,
    getRequiredAnalyticsServices,
    shouldUpdateConfiguration,
    getFeaturePlayerBodyAccentConfiguration,
    getDefaultPageBodyTextConfiguration,
    getEngageConfiguration,
};
