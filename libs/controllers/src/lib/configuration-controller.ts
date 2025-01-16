import {
    MappedAppBaseConfiguration,
    MappedApplicationConfiguration,
    BaseConfiguration,
    ConfigItem,
    SysData,
    ApplicationConfiguration,
    MappedBaseConfiguration,
    MappedAppStoreConfig,
    Filters,
    Platform,
    MappedMaintenanceConfig,
    AppLocales,
    LabelGroup,
    Label,
    Language,
    Navigation,
    MenuItem,
    ButtonStyle,
    ButtonState,
    Graphics,
    Image,
    Color,
    ThemeConfig,
    ColorPalette,
    ColorGradient,
    ThemeSection,
    CompositeStyle,
    Features,
    Feature,
    FeatureAnalytics,
    AnalyticIntegration,
    AnalyticEvent,
    FeatureCatalog,
    PageComponent,
    Page,
    NodeType,
    ComponentData,
    CuratedDataEntry,
    ErrorConfiguration,
    FAQItem,
    FeaturePlayer,
    PlayerControlConfiguration,
    FeatureSearch,
    FeatureSupport,
    FeatureUserManagement,
    UserAuthConfiguration,
    ProfileType,
    SubscriptionType,
    ComponentStyle,
    StorageKeys,
    FeatureRevenue,
    QualityMapping,
    UserAgentDetails,
    DisplayOrientation,
    DeviceCategory,
    FeatureProfileManagement,
    ProfileConfig,
    TagData,
    BuildType,
    CountryInfo,
} from '@enlight-webtv/models';
import { commonUtilities, dateUtilities, userAgentUtilities, appUtilities, stylesUtilities, authUtilities, storageUtilities } from '@enlight-webtv/utilities';

//import utility functions
const { isValidValue, extractValueFromParentheses } = commonUtilities;
const { isDateBefore, isDateAfter } = dateUtilities;
const { convertColorToHex } = stylesUtilities;
const { getSubscriptionType } = authUtilities;
const { getAppMetaData } = appUtilities;
const { getState, setState } = storageUtilities;
const { getUserAgentDetails } = userAgentUtilities;

//cache variables
const CONFIG_DATA: Record<string, any[]> = {} as Record<string, any[]>;
const CONFIG_MAP: Record<string, any> = {} as Record<string, any>;
const VALID_FILTER_ARRAY: string[] = [];
const userAgent: UserAgentDetails = getUserAgentDetails();

class ConfigurationController {
    static instance: ConfigurationController | null;
    static appVersion: string | null;
    static osName: string | null;
    static browserName: string | null;
    static date: Date | null;
    static subscriptionType: SubscriptionType = SubscriptionType.Anonymous;
    static countryCode: string | null;
    static buildType: BuildType | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (ConfigurationController.instance) {
            return ConfigurationController.instance;
        }
        ConfigurationController.instance = this;
    }

    destroy() {
        if (ConfigurationController.instance === this) {
            ConfigurationController.instance = null;
        }
    }

    /**
     * @name mapConfigArray
     * @type function/method
     * @description This function will create the config array from entries
     * with the provided id and will return the matching configurations array if any.
     *
     * @author amalmohann
     */
    mapConfigArray = async () => {
        // // Set the values that will be used for entries filtering
        await this.initializeFilterValues();

        (CONFIG_DATA['configs'] as ConfigItem[]).forEach((config: ConfigItem) => {
            const contentType = config.sys?.contentType?.sys?.id;
            //check if filter configuration
            if (contentType === 'filter') {
                //check if already existing filter or not.
                if (VALID_FILTER_ARRAY.indexOf(config.sys.id) === -1 && this.isValidFilters(config.fields as unknown as Filters)) {
                    VALID_FILTER_ARRAY.push(config.sys.id);
                }
            } else {
                CONFIG_MAP[config.sys.id] = {
                    ...config.fields,
                    contentId: contentType,
                };
            }
        });
    };

    /**
     * @name initializeFilterValues
     * @type function
     * @description This function will initialize the values used for filtering
     * @author tonyaugustine
     */
    initializeFilterValues = async () => {
        // Initialize filter values
        ConfigurationController.appVersion = getAppMetaData()?.appVersion || '';
        ConfigurationController.osName = userAgent.osName || '';
        ConfigurationController.browserName = userAgent.browserName || '';
        ConfigurationController.countryCode = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
        ConfigurationController.subscriptionType = (await getSubscriptionType()) ?? SubscriptionType.Anonymous;
        ConfigurationController.date = new Date();
        //import.meta having type config issue.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        ConfigurationController.buildType = import.meta.env.VITE_BUILD_TYPE;
        const configurationDependencies = getState(StorageKeys.CONFIGURATION_DEPENDENCIES);
        setState(StorageKeys.CONFIGURATION_DEPENDENCIES, {
            ...(configurationDependencies || {}),
            appVersion: ConfigurationController.appVersion,
            osName: ConfigurationController.osName,
            browserName: ConfigurationController.browserName,
            countryCode: ConfigurationController.countryCode,
            subscriptionType: ConfigurationController.subscriptionType,
            // TODO: Add date check as well
            // date: ConfigurationController.date,
            buildType: ConfigurationController.buildType,
        });
    };

    /**
     * @name getConfigById
     * @type function/method
     * @description This function will take id as input and will search the config
     * with the provided id and will return the matching configurations array if any.
     * @param {string} id - configuration id.
     * @return {any} config - configurations matching the provided id.
     *
     * @author amalmohann
     */
    getConfigById = (id: string | undefined): any => {
        if (id) {
            if (id in CONFIG_MAP) {
                const config: any = CONFIG_MAP[id];
                const filterId: string | undefined = config?.filter?.sys?.id;
                if (!filterId) {
                    return CONFIG_MAP[id];
                }
                if (filterId && VALID_FILTER_ARRAY.indexOf(filterId) !== -1) {
                    return CONFIG_MAP[id];
                }
                return null;
            }
        }
        return null;
    };

    /**
     * @name isValidFilters
     * @type function/method
     * @description This function will check if the filters are valid or not.
     * @param {Filters} filters - all the filters
     * @return {boolean} - returns true if the configuration is valid.
     *
     * @author amalmohann
     */
    isValidFilters = (filters: Filters) => {
        //filter for the platform
        if (!!filters.platforms && !filters.platforms.map(platforms => platforms.toLowerCase())?.includes(Platform.WebTv.toLowerCase())) {
            return false;
        }

        //filter for the location : handling multiple keys for location - location and availableCountries
        if (!!filters.location || !!filters.availableCountries) {
            const countryCode: any = ConfigurationController.countryCode;
            if (!(filters.location?.includes(countryCode) || filters.availableCountries?.includes(countryCode))) {
                return false;
            }
        }

        //filter for the profile type
        //TODO: update after user authentication
        if (!!filters.profileType && !filters.profileType?.includes(ProfileType.Normal)) {
            return false;
        }

        //filter for the subscription type
        if (!!filters.subscriptionType && !filters.subscriptionType.includes(ConfigurationController.subscriptionType)) {
            return false;
        }

        //filter for the displayOrientation type
        if (!!filters.displayOrientation && !filters.displayOrientation.includes(DisplayOrientation.Landscape)) {
            return false;
        }

        //filter for the browser type
        if (!!filters.deviceCategory && !filters.deviceCategory.includes(DeviceCategory.TV)) {
            return false;
        }

        //filter for the browser type
        if (!!filters.browser && ConfigurationController.browserName && !filters.browser.includes(ConfigurationController.browserName)) {
            return false;
        }

        //filter for the incognitoBrowserMode type
        if (filters.incognitoBrowserMode) {
            return false;
        }

        //filter to check if the start date is after today's date.
        if (!!filters.startDate && isDateAfter(new Date(filters.startDate), new Date())) {
            return false;
        }

        //filter to check if the start date is before today's date.
        if (!!filters.endDate && isDateBefore(new Date(filters.endDate), new Date())) {
            return false;
        }

        //filter to check for the operating system.
        if (!!filters.operatingSystem && filters.operatingSystem !== ConfigurationController.osName) {
            return false;
        }

        //import.meta having type config issue.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        const buildType = ConfigurationController.buildType!;
        if (!!filters.buildType && filters.buildType !== buildType.toLowerCase()) {
            return false;
        }

        if (filters.minimumBuildNumber) {
            const buildNumberExtracted = extractValueFromParentheses(ConfigurationController.appVersion ?? '');

            if (filters.minimumBuildNumber && buildNumberExtracted) {
                const appBuildNumber = Number(buildNumberExtracted[1] ?? 0);
                if (filters.minimumBuildNumber > appBuildNumber) return false;
            }
        }

        return true;
    };

    /**
     * @name getColor
     * @type function/method
     * @description This function will take color config as input and return the color data.
     * @param {SysData} colorConfig - color config.
     * @return {Color} Color data
     *
     * @author amalmohann
     */
    getColor = (colorConfig: SysData): Color => {
        const color: Color = {} as Color;
        const config = this.getConfigById(colorConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (color.name = config.name);
            isValidValue(config.code) && (color.code = convertColorToHex(config.code));
        }
        return color;
    };

    /**
     * @name getColorGradient
     * @type function/method
     * @description This function will take the gradient config as input and
     * return the color gradient data.
     * @param {SysData} colorGradientConfig - gradient config
     * @return {ColorGradient} color gradient data
     *
     * @author amalmohann
     */
    getColorGradient = (colorConfig: SysData): ColorGradient => {
        const colorGradient: ColorGradient = {} as ColorGradient;
        const config = this.getConfigById(colorConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (colorGradient.name = config.name);
            isValidValue(config.startColor) && (colorGradient.startColor = this.getColor(config.startColor));
            isValidValue(config.centerColor) && (colorGradient.centerColor = this.getColor(config.centerColor));
            isValidValue(config.endColor) && (colorGradient.endColor = this.getColor(config.endColor));
            isValidValue(config.centerX) && (colorGradient.centerX = config.centerX);
            isValidValue(config.centerY) && (colorGradient.centerY = config.centerY);
            isValidValue(config.angle) && (colorGradient.angle = config.angle);
            isValidValue(config.type) && (colorGradient.type = config.type);
        }
        return colorGradient;
    };

    /**
     * @name getColorPalette
     * @type function/method
     * @description This function will take color palette config as input and return
     * the base configuration data.
     * @param {SysData} colorPaletteConfig - color palette configuration
     * @return {ColorPalette} color palette data.
     *
     * @author amalmohann
     */
    getColorPalette = (colorConfig: SysData): ColorPalette => {
        const colorPalette: ColorPalette = {} as ColorPalette;
        const config = this.getConfigById(colorConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (colorPalette.name = config.name);
            //set primary color
            if (isValidValue(config.primary)) {
                const primaryConfig = this.getConfigById(config.primary.sys?.id);
                colorPalette.primary = primaryConfig.code ? this.getColor(config.primary) : this.getColorGradient(config.primary);
            }
            //set secondary color
            if (isValidValue(config.secondary)) {
                const secondaryConfig = this.getConfigById(config.secondary.sys?.id);
                colorPalette.secondary = secondaryConfig.code ? this.getColor(config.secondary) : this.getColorGradient(config.secondary);
            }
            //set tertiary color
            if (isValidValue(config.tertiary)) {
                const tertiaryConfig = this.getConfigById(config.tertiary.sys?.id);
                colorPalette.tertiary = tertiaryConfig.code ? this.getColor(config.tertiary) : this.getColorGradient(config.tertiary);
            }
            //set hover color
            if (isValidValue(config.hover)) {
                const hoverConfig = this.getConfigById(config.hover.sys?.id);
                colorPalette.hover = hoverConfig.code ? this.getColor(config.hover) : this.getColorGradient(config.hover);
            }
            //set disabled color
            if (isValidValue(config.disabled)) {
                const disabledConfig = this.getConfigById(config.disabled.sys?.id);
                colorPalette.disabled = disabledConfig.code ? this.getColor(config.disabled) : this.getColorGradient(config.disabled);
            }
            //set error color
            if (isValidValue(config.error)) {
                const errorConfig = this.getConfigById(config.error.sys?.id);
                colorPalette.error = errorConfig.code ? this.getColor(config.error) : this.getColorGradient(config.error);
            }
        }
        return colorPalette;
    };

    /**
     * @name setConfig
     * @type function/method
     * @description This function will take the base configuration as input and
     * will map the needed configuration and store it.
     * @param {BaseConfiguration} config - base configuration
     * @return {MappedAppBaseConfiguration} - app base configuration
     *
     * @author amalmohann
     */
    setConfig = async (config: BaseConfiguration) => {
        const configuration: MappedAppBaseConfiguration = {} as MappedAppBaseConfiguration;
        // get configuration arrays
        const assets = config.includes.Asset;
        const entry = config.includes.Entry;
        const items = config.items;
        // merge all the configuration arrays
        CONFIG_DATA['configs'] = [...items, ...assets, ...entry];
        await this.mapConfigArray();
        //get the application configuration tree.
        configuration.application = this.getApplicationConfiguration(config.appId);
        return configuration;
    };

    /**
     * @name getApplicationConfiguration
     * @type function/method
     * @description This function will return the application configuration data.
     * @param {string} appId - application id.
     * @return {MappedApplicationConfiguration} Application Configuration
     *
     * @author amalmohann
     */
    getApplicationConfiguration = (appId: string): MappedApplicationConfiguration => {
        const application = {} as MappedApplicationConfiguration;
        const config = this.getConfigById(appId) as ApplicationConfiguration;
        if (isValidValue(config)) {
            isValidValue(config.name) && (application.name = config.name);
            isValidValue(config.type) && (application.type = config.type);
            //set the base configuration in the application configuration
            if (isValidValue(config.baseConfiguration)) {
                const baseConfig = this.getBaseConfigConfiguration(config.baseConfiguration);
                isValidValue(baseConfig) && (application.baseConfiguration = baseConfig);
            }
            //set the navigation configuration in the application configuration
            if (isValidValue(config.navigation)) {
                const navConfig = this.getNavigationConfiguration(config.navigation);
                isValidValue(navConfig) && (application.navigation = navConfig);
            }
            // defaultComponentTheme
            if (isValidValue(config.defaultComponentTheme)) {
                const componentTheme = this.getThemeConfiguration(config.defaultComponentTheme);
                isValidValue(componentTheme) && (application.defaultComponentTheme = componentTheme);
            }
            // defaultPageTheme
            if (isValidValue(config.defaultPageTheme)) {
                const pageTheme = this.getThemeConfiguration(config.defaultPageTheme);
                isValidValue(pageTheme) && (application.defaultPageTheme = pageTheme);
            }
            // defaultPopupTheme
            if (isValidValue(config.defaultPopupTheme)) {
                const popupTheme = this.getThemeConfiguration(config.defaultPopupTheme);
                isValidValue(popupTheme) && (application.defaultPopupTheme = popupTheme);
            }
            // features
            if (isValidValue(config.features)) {
                const features = this.getFeatures(config.features);
                isValidValue(features) && (application.features = features);
            }
        }
        return application;
    };

    //-------------------
    // Feature configuration
    //-------------------
    /**
     * @name getFeatures
     * @type function/method
     * @description This function will take the features configuration as input
     * and will return the features array
     * @param {SysData[]} featuresConfig - features configs
     * @return {Feature[]} array of features data
     *
     * @author amalmohann
     */
    getFeatures = (featuresConfig: SysData[]): Feature[] => {
        const featuresList: Feature[] = [] as Feature[];
        featuresConfig.forEach((featureConf: SysData) => {
            const config = this.getConfigById(featureConf.sys?.id);
            switch (config?.contentId) {
                case Features.FeatureAnalytics:
                    featuresList.push(this.getFeatureAnalytics(config));
                    break;
                case Features.FeatureCatalog:
                    featuresList.push(this.getFeatureCatalog(config));
                    break;
                case Features.FeaturePlayer:
                    featuresList.push(this.getFeaturePlayer(config));
                    break;
                case Features.FeatureSearch:
                    featuresList.push(this.getFeatureSearch(config));
                    break;
                case Features.FeatureSupport:
                    featuresList.push(this.getFeatureSupport(config));
                    break;
                case Features.FeatureUserManagement:
                    featuresList.push(this.getFeatureUserManagement(config));
                    break;
                case Features.FeatureRevenue:
                    featuresList.push(this.getFeatureRevenue(config));
                    break;
                case Features.featureProfileManagement:
                    featuresList.push(this.getFeatureProfileManagement(config));
                    break;
                default:
                    break;
            }
        });
        return featuresList;
    };

    /**
     * @name getFeatureProfileManagement
     * @type function/method
     * @description This function will return the feature profile management configuration data.
     * @param {any} featProfileManagement - feature Revenue configs
     * @return {featureProfileManagement} feature Revenue data.
     *
     * @author amalmohann
     */
    getFeatureProfileManagement = (featProfile: any): FeatureProfileManagement => {
        const featureProfile: FeatureProfileManagement = {} as FeatureProfileManagement;
        isValidValue(featProfile.name) && (featureProfile.name = featProfile.name);
        isValidValue(featProfile.maximumProfiles) && (featureProfile.maximumProfiles = featProfile.maximumProfiles);
        isValidValue(featProfile.enableKidsMode) && (featureProfile.enableKidsMode = featProfile.enableKidsMode);
        isValidValue(featProfile.requireLoginToResetPin) && (featureProfile.requireLoginToResetPin = featProfile.requireLoginToResetPin);
        isValidValue(featProfile.avatars) && (featureProfile.avatars = featProfile.avatars);
        isValidValue(featProfile.showSelectionOnStart) && (featureProfile.showSelectionOnStart = featProfile.showSelectionOnStart);
        isValidValue(featProfile.requireKidsPin) && (featureProfile.requireKidsPin = featProfile.requireKidsPin);
        isValidValue(featProfile.initialAgeRatingEnabled) && (featureProfile.initialAgeRatingEnabled = featProfile.initialAgeRatingEnabled);
        isValidValue(featProfile.autoProfileSelection) && (featureProfile.autoProfileSelection = featProfile.autoProfileSelection);
        isValidValue(featProfile.initialRatingSelectionChoice) &&
            (featureProfile.initialRatingSelectionChoice = featProfile.initialRatingSelectionChoice);
        isValidValue(featProfile.profileNameMinChars) && (featureProfile.profileNameMinChars = featProfile.profileNameMinChars);
        isValidValue(featProfile.profileNameMaxChars) && (featureProfile.profileNameMaxChars = featProfile.profileNameMaxChars);
        isValidValue(featProfile.profiletNameValidationRegex) &&
            (featureProfile.profiletNameValidationRegex = featProfile.profiletNameValidationRegex);
        isValidValue(featProfile.contentId) && (featureProfile.contentId = featProfile.contentId);

        if (featProfile.themeProfileList && isValidValue(featProfile.themeProfileList)) {
            featureProfile.themeProfileList = this.getThemeConfiguration(featProfile.themeProfileList);
        }
        if (featProfile.themeProfilePopup && isValidValue(featProfile.themeProfilePopup)) {
            featureProfile.themeProfilePopup = this.getThemeConfiguration(featProfile.themeProfilePopup);
        }
        if (featProfile.themeProfileDetails && isValidValue(featProfile.themeProfileDetails)) {
            featureProfile.themeProfileDetails = this.getThemeConfiguration(featProfile.themeProfileDetails);
        }
        if (featProfile.profileConfig && isValidValue(featProfile.profileConfig)) {
            featureProfile.profileConfig = featProfile.profileConfig.flatMap((config: SysData) => {
                const profileConfig = this.getProfileConfig(config);
                if (isValidValue(profileConfig)) {
                    return [profileConfig];
                } else {
                    return [];
                }
            });
        }

        return featureProfile;
    };

    /**
     * @name getFeatureRevenue
     * @type function/method
     * @description This function will return the feature Revenue configuration data.
     * @param {any} featRevenue - feature Revenue configs
     * @return {featureRevenue} feature Revenue data.
     *
     * @author amalmohann
     */
    getFeatureRevenue = (featRevenue: any): FeatureRevenue => {
        const featureRevenue: FeatureRevenue = {} as FeatureRevenue;
        isValidValue(featRevenue.name) && (featureRevenue.name = featRevenue.name);
        isValidValue(featRevenue.contentId) && (featureRevenue.contentId = featRevenue.contentId);
        isValidValue(featRevenue.revenueMode) && (featureRevenue.revenueMode = featRevenue.revenueMode);
        isValidValue(featRevenue.allowPromoCodeField) && (featureRevenue.allowPromoCodeField = featRevenue.allowPromoCodeField);
        if (featRevenue.productListingPage && isValidValue(featRevenue.productListingPage)) {
            featureRevenue.productListingPage = featRevenue.productListingPage.flatMap((config: SysData) => {
                const pageConfig = this.getPageConfig(config);
                if (isValidValue(pageConfig)) {
                    return [pageConfig];
                } else {
                    return [];
                }
            });
        }
        if (featRevenue.productDetailsPage && isValidValue(featRevenue.productDetailsPage)) {
            featureRevenue.productDetailsPage = featRevenue.productDetailsPage.flatMap((config: SysData) => {
                const pageConfig = this.getPageConfig(config);
                if (isValidValue(pageConfig)) {
                    return [pageConfig];
                } else {
                    return [];
                }
            });
        }
        if (featRevenue.purchaseHistoryPage && isValidValue(featRevenue.purchaseHistoryPage)) {
            featureRevenue.purchaseHistoryPage = featRevenue.purchaseHistoryPage.flatMap((config: SysData) => {
                const pageConfig = this.getPageConfig(config);
                if (isValidValue(pageConfig)) {
                    return [pageConfig];
                } else {
                    return [];
                }
            });
        }
        if (featRevenue.purchaseRedirectionPage && isValidValue(featRevenue.purchaseRedirectionPage)) {
            featureRevenue.purchaseRedirectionPage = featRevenue.purchaseRedirectionPage.flatMap((config: SysData) => {
                const pageConfig = this.getPageConfig(config);
                if (isValidValue(pageConfig)) {
                    return [pageConfig];
                } else {
                    return [];
                }
            });
        }

        return featureRevenue;
    };

    /**
     * @name getFeatureUserManagement
     * @type function/method
     * @description This function will return the feature UserManagement configuration data.
     * @param {any} featUserManagement - feature UserManagement configs
     * @return {FeatureUserManagement} feature UserManagement data.
     *
     * @author amalmohann
     */
    getFeatureUserManagement = (featUM: any): FeatureUserManagement => {
        const featureUM: FeatureUserManagement = {} as FeatureUserManagement;
        isValidValue(featUM.name) && (featureUM.name = featUM.name);
        isValidValue(featUM.contentId) && (featureUM.contentId = featUM.contentId);
        isValidValue(featUM.showLoginPopup) && (featureUM.showLoginPopup = featUM.showLoginPopup);
        isValidValue(featUM.firstNameMinChars) && (featureUM.firstNameMinChars = featUM.firstNameMinChars);
        isValidValue(featUM.firstNameMaxChars) && (featureUM.firstNameMaxChars = featUM.firstNameMaxChars);
        isValidValue(featUM.lastNameMinChars) && (featureUM.lastNameMinChars = featUM.lastNameMinChars);
        isValidValue(featUM.lastNameMaxChars) && (featureUM.lastNameMaxChars = featUM.lastNameMaxChars);
        isValidValue(featUM.minPasswordChars) && (featureUM.minPasswordChars = featUM.minPasswordChars);
        isValidValue(featUM.maxPasswordChars) && (featureUM.maxPasswordChars = featUM.maxPasswordChars);
        isValidValue(featUM.ageMinimumYears) && (featureUM.ageMinimumYears = featUM.ageMinimumYears);
        isValidValue(featUM.ageMaxYears) && (featureUM.ageMaxYears = featUM.ageMaxYears);
        isValidValue(featUM.dobPickerMinimumDate) && (featureUM.dobPickerMinimumDate = featUM.dobPickerMinimumDate);
        isValidValue(featUM.dobPickerMaxDate) && (featureUM.dobPickerMaxDate = featUM.dobPickerMaxDate);
        isValidValue(featUM.dobDisplayFormat) && (featureUM.dobDisplayFormat = featUM.dobDisplayFormat);
        isValidValue(featUM.firstNameValidationRegex) && (featureUM.firstNameValidationRegex = featUM.firstNameValidationRegex);
        isValidValue(featUM.lastNameValidationRegex) && (featureUM.lastNameValidationRegex = featUM.lastNameValidationRegex);
        isValidValue(featUM.emailValidationRegex) && (featureUM.emailValidationRegex = featUM.emailValidationRegex);
        isValidValue(featUM.passwordRegex) && (featureUM.passwordRegex = featUM.passwordRegex);
        isValidValue(featUM.genderList) &&
            (featureUM.genderList = featUM.genderList.flatMap((gender: SysData) => {
                const config = this.getConfigById(gender.sys?.id);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            }));
        isValidValue(featUM.allowRegistrationWithoutTosAgreement) &&
            (featureUM.allowRegistrationWithoutTosAgreement = featUM.allowRegistrationWithoutTosAgreement);
        isValidValue(featUM.allowRegistrationWithoutPrivacyAgreement) &&
            (featureUM.allowRegistrationWithoutPrivacyAgreement = featUM.allowRegistrationWithoutPrivacyAgreement);
        isValidValue(featUM.allowProfileInfoSkipping) && (featureUM.allowProfileInfoSkipping = featUM.allowProfileInfoSkipping);
        isValidValue(featUM.allowPasswordReveal) && (featureUM.allowPasswordReveal = featUM.allowPasswordReveal);
        isValidValue(featUM.emailVerification) && (featureUM.emailVerification = featUM.emailVerification);
        isValidValue(featUM.resetPasswordHost) && (featureUM.resetPasswordHost = featUM.resetPasswordHost);
        isValidValue(featUM.forgotPasswordCodeTimer) && (featureUM.forgotPasswordCodeTimer = featUM.forgotPasswordCodeTimer);

        // setting authConfigurations if any
        if (isValidValue(featUM.authConfigurations)) {
            featureUM.authConfigurations = featUM.authConfigurations.flatMap((authConfig: SysData) => {
                const config = this.getAuthConfigurations(authConfig);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //setting the loginPage
        isValidValue(featUM.logInPage) &&
            (featureUM.logInPage = featUM.logInPage.flatMap((page: SysData) => {
                const config = this.getPageConfig(page);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            }));
        // setting registration Methods if any
        isValidValue(featUM.registrationMethods) && (featureUM.registrationMethods = featUM.registrationMethods);
        // setting login Methods if any
        isValidValue(featUM.loginMethods) && (featureUM.loginMethods = featUM.loginMethods);
        // setting login Theme if any
        isValidValue(featUM.loginTheme) && (featureUM.loginTheme = this.getThemeConfiguration(featUM.loginTheme));
        // setting profile Theme if any
        isValidValue(featUM.profileTheme) && (featureUM.profileTheme = this.getThemeConfiguration(featUM.profileTheme));
        // setting registration Theme if any
        isValidValue(featUM.registrationTheme) && (featureUM.registrationTheme = this.getThemeConfiguration(featUM.registrationTheme));
        // setting resetPassword Theme if any
        isValidValue(featUM.resetPasswordTheme) && (featureUM.resetPasswordTheme = this.getThemeConfiguration(featUM.resetPasswordTheme));
        return featureUM;
    };

    /**
     * @name getAuthConfigurations
     * @type function/method
     * @description This function will return the auth configuration data.
     * @param {SysData} authConfig - auth configs
     * @return {IdentityProviders} auth data.
     *
     * @author amalmohann
     */
    getAuthConfigurations = (authConfig: any): UserAuthConfiguration => {
        const userAuthConfiguration: UserAuthConfiguration = {} as UserAuthConfiguration;
        const config = this.getConfigById(authConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (userAuthConfiguration.name = config.name);
            isValidValue(config.identityProvider) && (userAuthConfiguration.identityProvider = config.identityProvider);
            isValidValue(config.authorizeUrl) && (userAuthConfiguration.authorizeUrl = config.authorizeUrl);
            isValidValue(config.redirectUri) && (userAuthConfiguration.redirectUri = config.redirectUri);
            isValidValue(config.authClientId) && (userAuthConfiguration.authClientId = config.authClientId);
            isValidValue(config.logoutExtendPeriod) && (userAuthConfiguration.logoutExtendPeriod = config.logoutExtendPeriod);
            isValidValue(config.accessTokenRefreshInterval) && (userAuthConfiguration.accessTokenRefreshInterval = config.accessTokenRefreshInterval);
            isValidValue(config.logoutRedirectUri) && (userAuthConfiguration.logoutRedirectUri = config.logoutRedirectUri);
            isValidValue(config.registrationUri) && (userAuthConfiguration.registrationUri = config.registrationUri);
            isValidValue(config.subscriptionUri) && (userAuthConfiguration.subscriptionUri = config.subscriptionUri);
            isValidValue(config.additionalConfiguration) && (userAuthConfiguration.additionalConfiguration = config.additionalConfiguration);
        }
        return userAuthConfiguration;
    };

    /**
     * @name getFeatureSupport
     * @type function/method
     * @description This function will return the feature Support configuration data.
     * @param {any} featSupport - feature Support configs
     * @return {FeatureSupport} feature Support data.
     *
     * @author amalmohann
     */
    getFeatureSupport = (featSupport: any): FeatureSupport => {
        const featureSupport: FeatureSupport = {} as FeatureSupport;
        isValidValue(featSupport.name) && (featureSupport.name = featSupport.name);
        isValidValue(featSupport.contentId) && (featureSupport.contentId = featSupport.contentId);
        isValidValue(featSupport.contactNo) && (featureSupport.contactNo = featSupport.contactNo);
        isValidValue(featSupport.contactEmail) && (featureSupport.contactEmail = featSupport.contactEmail);
        isValidValue(featSupport.contactLink) && (featureSupport.contactLink = featSupport.contactLink);
        isValidValue(featSupport.tosLink) && (featureSupport.tosLink = featSupport.tosLink);
        isValidValue(featSupport.tosData) && (featureSupport.tosData = featSupport.tosData);
        isValidValue(featSupport.faqLink) && (featureSupport.faqLink = featSupport.faqLink);
        isValidValue(featSupport.logLevel) && (featureSupport.logLevel = featSupport.logLevel);
        //set faq data item if any
        isValidValue(featSupport.faqData) &&
            (featureSupport.faqData = featSupport.faqData.flatMap((item: SysData) => {
                const config = this.getFAQItems(item);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            }));
        isValidValue(featSupport.privacyPolicyLink) && (featureSupport.privacyPolicyLink = featSupport.privacyPolicyLink);
        isValidValue(featSupport.privacyPolicyData) && (featureSupport.privacyPolicyData = featSupport.privacyPolicyData);
        //set error configuration item if any
        if (isValidValue(featSupport.errorConfiguration)) {
            featureSupport.errorConfiguration = featSupport.errorConfiguration.flatMap((config: SysData) => {
                const errorConfig = this.getErrorConfig(config);
                if (isValidValue(errorConfig)) {
                    return [errorConfig];
                } else {
                    return [];
                }
            });
        }
        //set theme configuration item if any
        isValidValue(featSupport.theme) && (featureSupport.theme = this.getThemeConfiguration(featSupport.theme));
        return featureSupport;
    };

    /**
     * @name getFeatureSearch
     * @type function/method
     * @description This function will return the feature Search configuration data.
     * @param {any} featSearch - feature Search configs
     * @return {FeatureSearch} feature Search data.
     *
     * @author amalmohann
     */
    getFeatureSearch = (featSearch: any): FeatureSearch => {
        const featureSearch: FeatureSearch = {} as FeatureSearch;
        isValidValue(featSearch.name) && (featureSearch.name = featSearch.name);
        isValidValue(featSearch.contentId) && (featureSearch.contentId = featSearch.contentId);
        //setting search page if any.
        isValidValue(featSearch.searchPage) &&
            (featureSearch.searchPage = featSearch.searchPage.flatMap((page: SysData) => {
                const config = this.getPageConfig(page);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            }));
        isValidValue(featSearch.enableSearchHistory) && (featureSearch.enableSearchHistory = featSearch.enableSearchHistory);
        isValidValue(featSearch.enableSearchSuggestions) && (featureSearch.enableSearchSuggestions = featSearch.enableSearchSuggestions);
        isValidValue(featSearch.maxSearchHistoryCount) && (featureSearch.maxSearchHistoryCount = featSearch.maxSearchHistoryCount);
        isValidValue(featSearch.maxSearchSuggestionCount) && (featureSearch.maxSearchSuggestionCount = featSearch.maxSearchSuggestionCount);
        isValidValue(featSearch.maxSearchResultsCount) && (featureSearch.maxSearchResultsCount = featSearch.maxSearchResultsCount);
        isValidValue(featSearch.minimumSearchQueryLength) && (featureSearch.minimumSearchQueryLength = featSearch.minimumSearchQueryLength);
        isValidValue(featSearch.maximumSearchQueryLength) && (featureSearch.maximumSearchQueryLength = featSearch.maximumSearchQueryLength);
        isValidValue(featSearch.searchSuggestionTypeRatio) && (featureSearch.searchSuggestionTypeRatio = featSearch.searchSuggestionTypeRatio);
        isValidValue(featSearch.searchResultTypeRatio) && (featureSearch.searchResultTypeRatio = featSearch.searchResultTypeRatio);
        isValidValue(featSearch.searchSuggestionsFilter) && (featureSearch.searchSuggestionsFilter = featSearch.searchSuggestionsFilter);
        isValidValue(featSearch.searchResultsFilter) && (featureSearch.searchResultsFilter = featSearch.searchResultsFilter);
        isValidValue(featSearch.searchFilters) && (featureSearch.searchFilters = featSearch.searchFilters);
        return featureSearch;
    };

    /**
     * @name getFeaturePlayer
     * @type function/method
     * @description This function will return the feature Player configuration data.
     * @param {any} featPlayer - feature player configs
     * @return {FeaturePlayer} feature Player data.
     *
     * @author amalmohann
     */
    getFeaturePlayer = (featPlayer: any): FeaturePlayer => {
        const featurePlayer: FeaturePlayer = {} as FeaturePlayer;
        isValidValue(featPlayer.name) && (featurePlayer.name = featPlayer.name);
        isValidValue(featPlayer.contentId) && (featurePlayer.contentId = featPlayer.contentId);
        isValidValue(featPlayer.alowCasting) && (featurePlayer.alowCasting = featPlayer.alowCasting);
        isValidValue(featPlayer.allowMobileBrowserPlayback) && (featurePlayer.allowMobileBrowserPlayback = featPlayer.allowMobileBrowserPlayback);
        isValidValue(featPlayer.playFromLastPosition) && (featurePlayer.playFromLastPosition = featPlayer.playFromLastPosition);
        isValidValue(featPlayer.progressSaveInterval) && (featurePlayer.progressSaveInterval = featPlayer.progressSaveInterval);
        isValidValue(featPlayer.maxResumePercent) && (featurePlayer.maxResumePercent = featPlayer.maxResumePercent);
        isValidValue(featPlayer.abrMode) && (featurePlayer.abrMode = featPlayer.abrMode);
        isValidValue(featPlayer.abrStartingProfile) && (featurePlayer.abrStartingProfile = featPlayer.abrStartingProfile);
        isValidValue(featPlayer.qualityMappingMode) && (featurePlayer.qualityMappingMode = featPlayer.qualityMappingMode);
        isValidValue(featPlayer.qualityMapping) && (featurePlayer.qualityMapping = this.getPlayerQualityConfiguration(featPlayer.qualityMapping));
        isValidValue(featPlayer.portraitPlayerEnabled) && (featurePlayer.portraitPlayerEnabled = featPlayer.portraitPlayerEnabled);
        isValidValue(featPlayer.pipPlayerEnabled) && (featurePlayer.pipPlayerEnabled = featPlayer.pipPlayerEnabled);
        isValidValue(featPlayer.debugModeEnabled) && (featurePlayer.debugModeEnabled = featPlayer.debugModeEnabled);
        isValidValue(featPlayer.allowOutsidePip) && (featurePlayer.allowOutsidePip = featPlayer.allowOutsidePip);
        //set fullscreen configuration if any.
        if (isValidValue(featPlayer.fullScreenConfig)) {
            featurePlayer.fullScreenConfig = featPlayer.fullScreenConfig.flatMap((fullscreen: SysData) => {
                const config = this.getPlayerControlConfiguration(fullscreen);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set portrait configuration if any.
        if (isValidValue(featPlayer.portraitConfig)) {
            featurePlayer.portraitConfig = featPlayer.portraitConfig.flatMap((portrait: SysData) => {
                const config = this.getPlayerControlConfiguration(portrait);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set linear configuration if any.
        if (isValidValue(featPlayer.linearPlayerConfig)) {
            featurePlayer.linearPlayerConfig = featPlayer.linearPlayerConfig.flatMap((linearPlayer: SysData) => {
                const config = this.getPlayerControlConfiguration(linearPlayer);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set cast configuration if any.
        if (isValidValue(featPlayer.castConfig)) {
            featurePlayer.castConfig = featPlayer.castConfig.flatMap((castConfig: SysData) => {
                const config = this.getPlayerControlConfiguration(castConfig);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set pip configuration if any.
        if (isValidValue(featPlayer.pipConfig)) {
            featurePlayer.pipConfig = featPlayer.pipConfig.flatMap((pipConfig: SysData) => {
                const config = this.getPlayerControlConfiguration(pipConfig);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }

        //set programme rail
        if (isValidValue(featPlayer.programComponent)) {
            featurePlayer.programComponent = featPlayer.programComponent.flatMap((componentConfig: SysData) => {
                const config = this.getPageComponentConfig(componentConfig);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }

        //set related rail
        if (isValidValue(featPlayer.relatedComponent)) {
            featurePlayer.relatedComponent = featPlayer.relatedComponent.flatMap((componentConfig: SysData) => {
                const config = this.getPageComponentConfig(componentConfig);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        return featurePlayer;
    };

    /**
     * @name getProfileConfig
     * @type function/method
     * @description This function will return the Profile configuration data.
     * @param {any} featProfileConfig - Profile configs
     * @return {ProfileConfig} Profile data.
     *
     * @author amalmohann
     */
    getProfileConfig = (featProfileConfig: any): ProfileConfig => {
        const profileConfig: ProfileConfig = {} as ProfileConfig;
        const profileConfiguration = this.getConfigById(featProfileConfig?.sys?.id);

        isValidValue(profileConfiguration.name) && (profileConfig.name = profileConfiguration.name);
        isValidValue(profileConfiguration.mandatoryPin) && (profileConfig.mandatoryPin = profileConfiguration.mandatoryPin);
        isValidValue(profileConfiguration.playbackPin) && (profileConfig.playbackPin = profileConfiguration.playbackPin);
        isValidValue(profileConfiguration.maxAge) && (profileConfig.maxAge = profileConfiguration.maxAge);
        isValidValue(profileConfiguration.ratingId) && (profileConfig.ratingId = profileConfiguration.ratingId);
        isValidValue(profileConfiguration.relatedRatingId) && (profileConfig.relatedRatingId = profileConfiguration.relatedRatingId);
        isValidValue(profileConfiguration.ratingLabel) && (profileConfig.ratingLabel = profileConfiguration.ratingLabel);
        isValidValue(profileConfiguration.ratingDescription) && (profileConfig.ratingDescription = profileConfiguration.ratingDescription);
        isValidValue(profileConfiguration.showAgeConfirmationDeclaration) &&
            (profileConfig.showAgeConfirmationDeclaration = profileConfiguration.showAgeConfirmationDeclaration);
        isValidValue(profileConfiguration.requirePasswordConfirmation) &&
            (profileConfig.requirePasswordConfirmation = profileConfiguration.requirePasswordConfirmation);
        isValidValue(profileConfiguration.contentId) && (profileConfig.contentId = profileConfiguration.contentId);

        return profileConfig;
    };

    /**
     * @name getPlayerQualityConfiguration
     * @type function/method
     * @description This function will return the player quality configuration data.
     * @param {SysData} playerControlConfig - player control configs
     * @return {PlayerControlConfiguration} player control data.
     *
     * @author amalmohann
     */
    getPlayerQualityConfiguration = (qualityConfig: SysData[]): QualityMapping[] => {
        const mappedQuality: QualityMapping[] = qualityConfig.flatMap((quality: SysData) => {
            const config = this.getConfigById(quality.sys?.id) as QualityMapping;
            if (isValidValue(config)) {
                const { key, value } = config;
                return [{ key, value } as QualityMapping];
            } else {
                return [];
            }
        });
        return mappedQuality;
    };

    /**
     * @name getPlayerControlConfiguration
     * @type function/method
     * @description This function will return the player control configuration data.
     * @param {SysData} playerControlConfig - player control configs
     * @return {PlayerControlConfiguration} player control data.
     *
     * @author amalmohann
     */
    getPlayerControlConfiguration = (playerControlConfig: SysData): PlayerControlConfiguration => {
        const playerControlConfiguration: PlayerControlConfiguration = {} as PlayerControlConfiguration;
        const config = this.getConfigById(playerControlConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (playerControlConfiguration.name = config.name);
            isValidValue(config.titleView) && (playerControlConfiguration.titleView = config.titleView);
            isValidValue(config.breadCrumbView) && (playerControlConfiguration.breadCrumbView = config.breadCrumbView);
            isValidValue(config.audioSelector) && (playerControlConfiguration.audioSelector = config.audioSelector);
            isValidValue(config.qualitySelector) && (playerControlConfiguration.qualitySelector = config.qualitySelector);
            isValidValue(config.subtitleSelector) && (playerControlConfiguration.subtitleSelector = config.subtitleSelector);
            isValidValue(config.fontSizeSelector) && (playerControlConfiguration.fontSizeSelector = config.fontSizeSelector);
            isValidValue(config.nextButton) && (playerControlConfiguration.nextButton = config.nextButton);
            isValidValue(config.prevButton) && (playerControlConfiguration.prevButton = config.prevButton);
            isValidValue(config.playPauseButton) && (playerControlConfiguration.playPauseButton = config.playPauseButton);
            isValidValue(config.fwdButton) && (playerControlConfiguration.fwdButton = config.fwdButton);
            isValidValue(config.rewButton) && (playerControlConfiguration.rewButton = config.rewButton);
            isValidValue(config.muteButton) && (playerControlConfiguration.muteButton = config.muteButton);
            isValidValue(config.totalDuration) && (playerControlConfiguration.totalDuration = config.totalDuration);
            isValidValue(config.remainingTime) && (playerControlConfiguration.remainingTime = config.remainingTime);
            isValidValue(config.elapsedTime) && (playerControlConfiguration.elapsedTime = config.elapsedTime);
            isValidValue(config.orientationSwitch) && (playerControlConfiguration.orientationSwitch = config.orientationSwitch);
            isValidValue(config.autoRotate) && (playerControlConfiguration.autoRotate = config.autoRotate);
            isValidValue(config.autoPlay) && (playerControlConfiguration.autoPlay = config.autoPlay);
            isValidValue(config.seekBar) && (playerControlConfiguration.seekBar = config.seekBar);
            isValidValue(config.seekPreview) && (playerControlConfiguration.seekPreview = config.seekPreview);
            isValidValue(config.seekPreviewWidth) && (playerControlConfiguration.seekPreviewWidth = config.seekPreviewWidth);
            isValidValue(config.seekPreviewHeight) && (playerControlConfiguration.seekPreviewHeight = config.seekPreviewHeight);
            isValidValue(config.bingeWatching) && (playerControlConfiguration.bingeWatching = config.bingeWatching);
            isValidValue(config.backToLive) && (playerControlConfiguration.backToLive = config.backToLive);
            isValidValue(config.watchFromStart) && (playerControlConfiguration.watchFromStart = config.watchFromStart);
            isValidValue(config.bingeCountdownDuration) && (playerControlConfiguration.bingeCountdownDuration = config.bingeCountdownDuration);
            isValidValue(config.fwdDuration) && (playerControlConfiguration.fwdDuration = config.fwdDuration);
            isValidValue(config.rewDuration) && (playerControlConfiguration.rewDuration = config.rewDuration);
            isValidValue(config.backButton) && (playerControlConfiguration.backButton = config.backButton);
            isValidValue(config.playbackAssetFormat) && (playerControlConfiguration.playbackAssetFormat = config.playbackAssetFormat);
            isValidValue(config.previewAssetFormat) && (playerControlConfiguration.previewAssetFormat = config.previewAssetFormat);
            isValidValue(config.additionalConfiguration) && (playerControlConfiguration.additionalConfiguration = config.additionalConfiguration);
            isValidValue(config.configVersion) && (playerControlConfiguration.configVersion = config.configVersion);
            isValidValue(config.seekPreviewType) && (playerControlConfiguration.seekPreviewType = config.seekPreviewType);
            isValidValue(config.seekPreviewFormat) && (playerControlConfiguration.seekPreviewFormat = config.seekPreviewFormat);
            //set theme configuration if any
            if (isValidValue(config.theme)) {
                playerControlConfiguration.theme = this.getThemeConfiguration(config.theme);
            }
            //set controller theme configuration if any
            if (isValidValue(config.controllerTheme)) {
                playerControlConfiguration.controllerTheme = this.getThemeConfiguration(config.controllerTheme);
            }
            //set selector theme configuration if any
            if (isValidValue(config.selectorTheme)) {
                playerControlConfiguration.selectorTheme = this.getThemeConfiguration(config.selectorTheme);
            }
        }
        return playerControlConfiguration;
    };

    /**
     * @name getFeatureAnalytics
     * @type function/method
     * @description This function will return the feature analytics configuration data.
     * @param {any} featAnalytics - analytics configs
     * @return {FeatureAnalytics} feature analytics data.
     *
     * @author amalmohann
     */
    getFeatureAnalytics = (featAnalytics: any): FeatureAnalytics => {
        const analytics: FeatureAnalytics = {} as FeatureAnalytics;
        isValidValue(featAnalytics.name) && (analytics.name = featAnalytics.name);
        isValidValue(featAnalytics.contentId) && (analytics.contentId = featAnalytics.contentId);
        if (isValidValue(featAnalytics.analyticsIntegrations)) {
            analytics.analyticsIntegrations = featAnalytics.analyticsIntegrations.flatMap((integration: SysData) => {
                const config = this.getAnalyticsIntegration(integration);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        return analytics;
    };

    /**
     * @name getAnalyticsIntegration
     * @type function/method
     * @description This function will return the  analytics Integration configuration data.
     * @param {SysData} analyticsIntegration - integration configs
     * @return {AnalyticsIntegration}  analytics Integration data.
     *
     * @author amalmohann
     */
    getAnalyticsIntegration = (integration: SysData): AnalyticIntegration => {
        const analyticsIntegration: AnalyticIntegration = {} as AnalyticIntegration;
        const config = this.getConfigById(integration.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (analyticsIntegration.name = config.name);
            isValidValue(config.analyticsService) && (analyticsIntegration.analyticsService = config.analyticsService);
            isValidValue(config.analyticsConfiguration) && (analyticsIntegration.analyticsConfiguration = config.analyticsConfiguration);
            if (isValidValue(config.analyticEvents)) {
                analyticsIntegration.analyticEvents = config.analyticEvents.flatMap((event: SysData) => {
                    const config = this.getAnalyticsEvent(event);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                });
            }
        }
        return analyticsIntegration;
    };

    /**
     * @name getAnalyticsEvent
     * @type function/method
     * @description This function will return the  analytics Event configuration data.
     * @param {SysData} analyticsEvent - analytics event configs
     * @return {AnalyticsEvent}  analytics Event data.
     *
     * @author amalmohann
     */
    getAnalyticsEvent = (event: SysData): AnalyticEvent => {
        const analyticsEvent: AnalyticEvent = {} as AnalyticEvent;
        const config = this.getConfigById(event.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (analyticsEvent.name = config.name);
            isValidValue(config.eventName) && (analyticsEvent.eventName = config.eventName);
            isValidValue(config.eventNameLabel) && (analyticsEvent.eventNameLabel = config.eventNameLabel);
            isValidValue(config.eventAction) && (analyticsEvent.eventAction = config.eventAction);
            isValidValue(config.eventAttributes) && (analyticsEvent.eventAttributes = config.eventAttributes);
        }
        return analyticsEvent;
    };

    /**
     * @name getFeatureCatalog
     * @type function/method
     * @description This function will return the feature Catalog configuration data.
     * @param {any} featCatalog - feature catalog configs
     * @return {FeatureCatalog} feature Catalog data.
     *
     * @author amalmohann
     */
    getFeatureCatalog = (featCatalog: any): FeatureCatalog => {
        const catalog: FeatureCatalog = {} as FeatureCatalog;
        isValidValue(featCatalog.name) && (catalog.name = featCatalog.name);
        isValidValue(featCatalog.contentId) && (catalog.contentId = featCatalog.contentId);
        isValidValue(featCatalog.cache) && (catalog.cache = featCatalog.cache);
        isValidValue(featCatalog.showVideoPreview) && (catalog.showVideoPreview = featCatalog.showVideoPreview);
        isValidValue(featCatalog.showPlayAction) && (catalog.showPlayAction = featCatalog.showPlayAction);
        isValidValue(featCatalog.showTrailers) && (catalog.showTrailers = featCatalog.showTrailers);
        isValidValue(featCatalog.showCategoryType) && (catalog.showCategoryType = featCatalog.showCategoryType);
        isValidValue(featCatalog.showPurchaseModeIcon) && (catalog.showPurchaseModeIcon = featCatalog.showPurchaseModeIcon);
        isValidValue(featCatalog.showMoreInfo) && (catalog.showMoreInfo = featCatalog.showMoreInfo);
        isValidValue(featCatalog.allowFavoriting) && (catalog.allowFavoriting = featCatalog.allowFavoriting);
        isValidValue(featCatalog.allowSharing) && (catalog.allowSharing = featCatalog.allowSharing);
        isValidValue(featCatalog.shareURL) && (catalog.shareURL = featCatalog.shareURL);
        isValidValue(featCatalog.allowDownloading) && (catalog.allowDownloading = featCatalog.allowDownloading);
        isValidValue(featCatalog.movieMetadata) && (catalog.movieMetadata = featCatalog.movieMetadata);
        isValidValue(featCatalog.seriesMetadata) && (catalog.seriesMetadata = featCatalog.seriesMetadata);
        isValidValue(featCatalog.sportsVodMetadata) && (catalog.sportsVodMetadata = featCatalog.sportsVodMetadata);
        isValidValue(featCatalog.sportsEventMetadata) && (catalog.sportsEventMetadata = featCatalog.sportsEventMetadata);
        isValidValue(featCatalog.collapseDescription) && (catalog.collapseDescription = featCatalog.collapseDescription);
        isValidValue(featCatalog.maxCollapsedLines) && (catalog.maxCollapsedLines = featCatalog.maxCollapsedLines);
        isValidValue(featCatalog.seoFields) && (catalog.seoFields = featCatalog.seoFields);
        isValidValue(featCatalog.apiInterval) && (catalog.apiInterval = featCatalog.apiInterval);
        isValidValue(featCatalog.theme) && (catalog.theme = this.getThemeConfiguration(featCatalog.theme));
        isValidValue(featCatalog.metaTheme) && (catalog.metaTheme = this.getThemeConfiguration(featCatalog.metaTheme));
        isValidValue(featCatalog.tab) && (catalog.tab = this.getMenuItemsConfig(featCatalog.tab));
        //set the product listing components if any.
        if (isValidValue(featCatalog.productListingComponent)) {
            catalog.productListingComponent = featCatalog.productListingComponent.flatMap((productList: SysData) => {
                const config = this.getPageComponentConfig(productList);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set the episode listing components if any.
        if (isValidValue(featCatalog.episodeListingComponent)) {
            catalog.episodeListingComponent = featCatalog.episodeListingComponent.flatMap((episodeList: SysData) => {
                const config = this.getPageComponentConfig(episodeList);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set the metadata link components if any.
        if (isValidValue(featCatalog.metadataLinkPage)) {
            catalog.metadataLinkPage = featCatalog.metadataLinkPage.flatMap((metadataLink: SysData) => {
                const config = this.getPageConfig(metadataLink);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set the people link components if any.
        if (isValidValue(featCatalog.peopleLinkPage)) {
            catalog.peopleLinkPage = featCatalog.peopleLinkPage.flatMap((peopleLink: SysData) => {
                const config = this.getPageConfig(peopleLink);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }
        //set the related Media components if any.
        if (isValidValue(featCatalog.relatedMediaComponent)) {
            catalog.relatedMediaComponent = featCatalog.relatedMediaComponent.flatMap((relatedMedia: SysData) => {
                const config = this.getPageComponentConfig(relatedMedia);
                if (isValidValue(config)) {
                    return [config];
                } else {
                    return [];
                }
            });
        }

        return catalog;
    };

    /**
     * @name getPageComponentConfig
     * @type function/method
     * @description This function will return the page component configuration data.
     * @param {SysData} pageComponentConfig - page component configs
     * @return {PageComponent} page component data.
     *
     * @author amalmohann
     */
    getPageComponentConfig = (pageComponentConfig: SysData): PageComponent => {
        const pageComponent: PageComponent = {} as PageComponent;
        const config: any = this.getConfigById(pageComponentConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (pageComponent.name = config.name);
            isValidValue(config.title) && (pageComponent.title = config.title);
            isValidValue(config.identifierExt) && (pageComponent.identifierExt = config.identifierExt);
            isValidValue(config.cache) && (pageComponent.cache = config.cache);
            isValidValue(config.landingPages) && (pageComponent.landingPages = config.landingPages);
            isValidValue(config.type) && (pageComponent.type = config.type);
            isValidValue(config.additionalButton) && (pageComponent.additionalButton = config.additionalButton);
            isValidValue(config.maxItems) && (pageComponent.maxItems = config.maxItems);
            isValidValue(config.landingPage) && (pageComponent.landingPage = config.landingPage);
            isValidValue(config.primaryDropdown) && (pageComponent.primaryDropdown = this.getNodeType(config.primaryDropdown));
            isValidValue(config.secondaryDropdown) && (pageComponent.secondaryDropdown = this.getNodeType(config.secondaryDropdown));
            // set theme config if any.
            isValidValue(config.theme) && (pageComponent.theme = this.getThemeConfiguration(config.theme));
            // set overflow Listing Theme config if any.
            if (isValidValue(config.overflowListingTheme)) {
                const overflowListingTheme = this.getThemeConfiguration([config.overflowListingTheme])[0];
                pageComponent.overflowListingTheme = overflowListingTheme ? overflowListingTheme : ({} as ThemeConfig);
            }
            //set the component style if any.
            if (isValidValue(config.componentStyle)) {
                pageComponent.componentStyle = config.componentStyle.flatMap((componentStyle: SysData) => {
                    const config = this.getComponentStyleConfig(componentStyle);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                });
            }

            //set the overflowComponentStyle if any
            if (isValidValue(config.overflowComponentStyle)) {
                // pageComponent.componentStyle =
                pageComponent.overflowComponentStyle = config.overflowComponentStyle.flatMap((componentStyle: SysData) => {
                    const config = this.getComponentStyleConfig(componentStyle);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                });
            }
            //set the tag-items if any.
            if (isValidValue(config.tagConfiguration)) {
                pageComponent.tagConfiguration = config.tagConfiguration.flatMap((tagConfig: SysData) => {
                    const config = this.getTagItem(tagConfig);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                });
            }
            //set the contents if any.
            if (isValidValue(config.contents)) {
                pageComponent.contents = config.contents.flatMap((content: SysData) => {
                    const config = this.getComponentDataConfig(content);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                });
            }
        }
        return pageComponent;
    };

    /**
     * @name getTagItem
     * @type function/method
     * @description This function will return the tag items.
     * @param {SysData} tagConfig - tag configs
     * @return {TagData} tag data.
     *
     * @author tonyaugustine
     */
    getTagItem = (tagConfig: SysData) => {
        let tagStyle: ThemeSection = {} as ThemeSection;
        let tagData = {} as TagData;
        const tagDataConfig = this.getConfigById(tagConfig.sys.id);
        if (tagDataConfig?.tagStyle) {
            tagStyle = this.getThemeSectionConfig(tagDataConfig.tagStyle[0]!);
        }
        tagData = { ...tagDataConfig, tagStyle };
        return tagData;
    };

    /**
     * @name getPageConfig
     * @type function/method
     * @description This function will return the page  configuration data.
     * @param {SysData} pageConfig - page configs
     * @return {Page} page data.
     *
     * @author amalmohann
     */
    getPageConfig = (pageConfig: SysData): Page => {
        const page: Page = {} as Page;
        const config = this.getConfigById(pageConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.label) && (page.label = config.label);
            isValidValue(config.title) && (page.title = config.title);
            isValidValue(config.identifierExt) && (page.identifierExt = config.identifierExt);
            isValidValue(config.type) && (page.type = config.type);
            isValidValue(config.urlIdentifier) && (page.urlIdentifier = config.urlIdentifier);
            isValidValue(config.showTitle) && (page.showTitle = config.showTitle);
            isValidValue(config.showAppLogo) && (page.showAppLogo = config.showAppLogo);
            isValidValue(config.titleAlignment) && (page.titleAlignment = config.titleAlignment);
            //set navigation if any.
            if (isValidValue(config.navigation)) {
                page.navigation = this.getNavigationConfiguration(config.navigation);
            }
            //set theme if any.
            if (isValidValue(config.theme)) {
                page.theme = this.getThemeConfiguration(config.theme);
            }
            //set the pop up theme if any.
            if (isValidValue(config.popupTheme)) {
                page.popupTheme = this.getThemeConfiguration(config.popupTheme);
            }
            //set the secondary menu item if any.
            if (isValidValue(config.secondaryMenuItem)) {
                page.secondaryMenuItem = this.getMenuItemsConfig(config.secondaryMenuItem);
            }
            //set the components if any
            if (isValidValue(config.components)) {
                page.components = config.components.flatMap((component: SysData) => {
                    const config = this.getConfigById(component.sys?.id);
                    if (!isValidValue(config)) {
                        return [];
                    }
                    if (isValidValue(config?.faqItem)) {
                        const errorConfig = this.getErrorConfig(component);
                        if (isValidValue(errorConfig)) {
                            return [errorConfig];
                        } else {
                            return [];
                        }
                    }
                    const pageComponentConfig = this.getPageComponentConfig(component);
                    if (isValidValue(pageComponentConfig)) {
                        return [pageComponentConfig];
                    } else {
                        return [];
                    }
                });
            }
        }
        return page;
    };

    /**
     * @name getErrorConfig
     * @type function/method
     * @description This function will return the error configuration data.
     * @param {SysData} errorConfig - error configs
     * @return {ErrorConfiguration}  error configuration data
     *
     * @author amalmohann
     */
    getErrorConfig = (errorConfig: SysData): ErrorConfiguration => {
        const errorConfiguration: ErrorConfiguration = {} as ErrorConfiguration;
        const config = this.getConfigById(errorConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (errorConfiguration.name = config.name);
            isValidValue(config.type) && (errorConfiguration.type = config.type);
            isValidValue(config.code) && (errorConfiguration.code = config.code);
            isValidValue(config.title) && (errorConfiguration.title = config.title);
            isValidValue(config.serverErrorCode) && (errorConfiguration.serverErrorCode = config.serverErrorCode);
            isValidValue(config.description) && (errorConfiguration.description = config.description);
            isValidValue(config.uiType) && (errorConfiguration.uiType = config.uiType);
            isValidValue(config.loggingLevel) && (errorConfiguration.loggingLevel = config.loggingLevel);
            isValidValue(config.primaryActionType) && (errorConfiguration.primaryActionType = config.primaryActionType);
            isValidValue(config.secondaryActionType) && (errorConfiguration.secondaryActionType = config.secondaryActionType);
            isValidValue(config.primaryActionLabel) && (errorConfiguration.primaryActionLabel = config.primaryActionLabel);
            isValidValue(config.secondaryActionLabel) && (errorConfiguration.secondaryActionLabel = config.secondaryActionLabel);
            isValidValue(config.secondaryActionDescription) && (errorConfiguration.secondaryActionDescription = config.secondaryActionDescription);
            isValidValue(config.separatorText) && (errorConfiguration.separatorText = config.separatorText);
            isValidValue(config.faqDescription) && (errorConfiguration.faqDescription = config.faqDescription);
            isValidValue(config.faqLabel) && (errorConfiguration.faqLabel = config.faqLabel);
            //set theme if any.
            if (isValidValue(config.theme)) {
                errorConfiguration.theme = this.getThemeConfiguration(config.theme);
            }
            //set FAQ Item if any.
            if (isValidValue(config.faqItem)) {
                errorConfiguration.faqItem = config.faqItem.flatMap((item: SysData) => {
                    const config = this.getFAQItems(item);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                });
            }
        }
        return errorConfiguration;
    };

    /**
     * @name getFAQItems
     * @type function/method
     * @description This function will return the FAQ configuration data.
     * @param {SysData} faqConfig - FAQ configs
     * @return {FAQItem}  FAQ data
     *
     * @author amalmohann
     */
    getFAQItems = (faqConfig: SysData): FAQItem => {
        const faqItem: FAQItem = {} as FAQItem;
        const config = this.getConfigById(faqConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (faqItem.name = config.name);
            isValidValue(config.question) && (faqItem.question = config.question);
            isValidValue(config.answer) && (faqItem.answer = config.answer);
            isValidValue(config.group) && (faqItem.group = config.group);
        }
        return faqItem;
    };

    /**
     * @name getComponentDataConfig
     * @type function/method
     * @description This function will return the component data configuration data.
     * @param {SysData} componentDataConfig - component data configs
     * @return {ComponentData}  component data configuration data.
     *
     * @author amalmohann
     */
    getComponentDataConfig = (componentDataConfig: SysData): ComponentData => {
        const componentData: ComponentData = {} as ComponentData;
        const config = this.getConfigById(componentDataConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (componentData.name = config.name);
            isValidValue(config.type) && (componentData.type = config.type);
            isValidValue(config.data) && (componentData.data = config.data);
            isValidValue(config.params) && (componentData.params = config.params);
            isValidValue(config.apiPageSize) && (componentData.apiPageSize = config.apiPageSize);
            if (isValidValue(config.curatedData)) {
                componentData.curatedData = config.curatedData.flatMap((data: SysData) => {
                    const config = this.getCuratedDataConfig(data);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                });
            }
        }
        return componentData;
    };

    /**
     * @name getCuratedDataConfig
     * @type function/method
     * @description This function will return the node configuration data.
     * @param {SysData} curatedData - curated Data configs
     * @return {CuratedDataEntry} curated Data entry type  data.
     *
     * @author amalmohann
     */
    getCuratedDataConfig = (curatedData: SysData): CuratedDataEntry => {
        const curatedDataEntry: CuratedDataEntry = {} as CuratedDataEntry;
        const config = this.getConfigById(curatedData.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (curatedDataEntry.name = config.name);
            isValidValue(config.title) && (curatedDataEntry.title = config.title);
            isValidValue(config.subTitle) && (curatedDataEntry.subTitle = config.subTitle);
            isValidValue(config.description) && (curatedDataEntry.description = config.description);
            isValidValue(config.type) && (curatedDataEntry.type = config.type);
            isValidValue(config.data) && (curatedDataEntry.data = config.data);
            isValidValue(config.params) && (curatedDataEntry.params = config.params);
            isValidValue(config.ctaData) && (curatedDataEntry.ctaData = config.ctaData);
            isValidValue(config.ctaDescription) && (curatedDataEntry.ctaDescription = config.ctaDescription);
            isValidValue(config.listData) && (curatedDataEntry.listData = this.getLabelsConfiguration(config.listData));
            isValidValue(config.graphics) &&
                (curatedDataEntry.graphics = config.graphics.flatMap((graphic: SysData) => {
                    const config = this.getGraphicsConfig(graphic);
                    if (isValidValue(config)) {
                        return [config];
                    } else {
                        return [];
                    }
                }));
            //set the page if any. checking the type to fetch the page / page component data.
            if (isValidValue(config.page)) {
                curatedDataEntry.page = config.page.flatMap((page: SysData) => {
                    const config = this.getConfigById(page.sys?.id);
                    if (!isValidValue(config)) {
                        return [];
                    }
                    if (config.contentId === 'pageComponent') {
                        return [this.getPageComponentConfig(page)];
                    }
                    if (config.contentId === 'page') {
                        return [this.getPageConfig(page)];
                    }
                    return [];
                });
            }
        }
        return curatedDataEntry;
    };

    /**
     * @name getNodeType
     * @type function/method
     * @description This function will return the node configuration data.
     * @param {SysData} nodeConfig - node configs
     * @return {NodeType} node type  data.
     *
     * @author amalmohann
     */
    getNodeType = (nodeConfig: SysData): NodeType => {
        const node: NodeType = {} as NodeType;
        const config = this.getConfigById(nodeConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.nodeName) && (node.nodeName = config.nodeName);
            isValidValue(config.nodeId) && (node.nodeId = config.nodeId);
            isValidValue(config.nodeKey) && (node.nodeKey = config.nodeKey);
            isValidValue(config.nodeValue) && (node.nodeValue = config.nodeValue);
            isValidValue(config.parentKey) && (node.parentKey = config.parentKey);
        }
        return node;
    };

    //-------------------
    // Theme configuration
    //-------------------
    /**
     * @name getThemeConfiguration
     * @type function/method
     * @description This function will return the theme configuration data.
     * @param {SysData[]} defaultComponentThemeConfigs - theme configs
     * @return {ThemeConfig[]} array of theme configuration data
     *
     * @author amalmohann
     */
    getThemeConfiguration = (defaultComponentThemeConfigs: SysData[]): ThemeConfig[] => {
        const componentThemeArray: ThemeConfig[] = [] as ThemeConfig[];
        defaultComponentThemeConfigs.forEach((compThemeConfig: SysData) => {
            const componentThemeConfig: ThemeConfig = {} as ThemeConfig;
            const config = this.getConfigById(compThemeConfig.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.name) && (componentThemeConfig.name = config.name);
                isValidValue(config.header) && (componentThemeConfig.header = this.getThemeSectionConfig(config.header));
                isValidValue(config.body) && (componentThemeConfig.body = this.getThemeSectionConfig(config.body));
                isValidValue(config.footer) && (componentThemeConfig.footer = this.getThemeSectionConfig(config.footer));
                isValidValue(config?.compositeStyle) && (componentThemeConfig.compositeStyle = this.getCompositeStyleConfig(config.compositeStyle));
                if (isValidValue(config.graphics)) {
                    componentThemeConfig.graphics = config.graphics.flatMap((graphicsConfig: SysData) => {
                        const config = this.getGraphicsConfig(graphicsConfig);
                        if (isValidValue(config)) {
                            return [config];
                        } else {
                            return [];
                        }
                    });
                }
                componentThemeArray.push(componentThemeConfig);
            }
        });
        return componentThemeArray;
    };

    /**
     * @name getThemeSectionConfig
     * @type function/method
     * @description This function will return the theme section configuration data.
     * @param {SysData} defaultComponentThemeConfigs - theme section configs
     * @return {ThemeSection} theme section data
     *
     * @author amalmohann
     */
    getThemeSectionConfig = (themeSectionConfig: SysData): ThemeSection => {
        const themeSection: ThemeSection = {} as ThemeSection;
        const config = this.getConfigById(themeSectionConfig.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (themeSection.name = config.name);
            isValidValue(config.curvedEdges) && (themeSection.curvedEdges = config.curvedEdges);
            isValidValue(config.accent) && (themeSection.accent = this.getColorPalette(config.accent));
            isValidValue(config.background) && (themeSection.background = this.getColorPalette(config.background));
            isValidValue(config.text) && (themeSection.text = this.getColorPalette(config.text));
        }
        return themeSection;
    };

    /**
     * @name getCompositeStyleConfig
     * @type function/method
     * @description This function will return the Composite style Config
     * @param {SysData} compositeStyleConfigs - composite style configs
     * @return {CompositeStyle} composite style  data
     *
     * @author amalmohann
     */
    getCompositeStyleConfig = (compositeStyleConfigs: SysData): CompositeStyle => {
        const compositeStyle: CompositeStyle = {} as CompositeStyle;
        const config = this.getConfigById(compositeStyleConfigs.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (compositeStyle.name = config.name);
            isValidValue(config.primaryButton) && (compositeStyle.primaryButton = this.getButtonStyleConfig(config.primaryButton));
            isValidValue(config.secondaryButton) && (compositeStyle.secondaryButton = this.getButtonStyleConfig(config.secondaryButton));
            isValidValue(config.primaryToggle) && (compositeStyle.primaryToggle = this.getButtonStyleConfig(config.primaryToggle));
            isValidValue(config.secondaryToggle) && (compositeStyle.secondaryToggle = this.getButtonStyleConfig(config.secondaryToggle));
            isValidValue(config.tertiaryButton) && (compositeStyle.tertiaryButton = this.getButtonStyleConfig(config.tertiaryButton));
            isValidValue(config.sliderIndicator) && (compositeStyle.sliderIndicator = this.getButtonStyleConfig(config.sliderIndicator));
            isValidValue(config.selectorStyle) && (compositeStyle.selectorStyle = this.getButtonStyleConfig(config.selectorStyle));
            isValidValue(config.dropdownStyle) && (compositeStyle.dropdownStyle = this.getButtonStyleConfig(config.dropdownStyle));
            isValidValue(config.toastTheme) && (compositeStyle.toastTheme = this.getThemeSectionConfig(config.toastTheme));
            isValidValue(config.calendarStyle) && (compositeStyle.calendarStyle = this.getThemeSectionConfig(config.calendarStyle));
            isValidValue(config.inputBox) && (compositeStyle.inputBox = this.getThemeSectionConfig(config.inputBox));
            isValidValue(config?.overlaySelector) && (compositeStyle.overlaySelector = this.getThemeSectionConfig(config.overlaySelector));
            if (isValidValue(config.keyboard)) {
                compositeStyle.keyboard = this.getThemeSectionConfig(config.keyboard);
            }
        }
        return compositeStyle;
    };

    /**
     * @name getComponentStyleConfig
     * @type function/method
     * @description This function will return the Component style Config
     * @param {SysData} componentStyleConfigs - Component style configs
     * @return {ComponentStyle} Component style  data
     *
     * @author amalmohann
     */
    getComponentStyleConfig = (componentStyleConfigs: SysData): ComponentStyle => {
        const componentStyle: ComponentStyle = {} as ComponentStyle;
        const config = this.getConfigById(componentStyleConfigs.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (componentStyle.name = config.name);
            isValidValue(config.type) && (componentStyle.type = config.type);
            isValidValue(config.subType) && (componentStyle.subType = config.subType);
            isValidValue(config.showViewAll) && (componentStyle.showViewAll = config.showViewAll);
            isValidValue(config.itemOrientation) && (componentStyle.itemOrientation = config.itemOrientation);
            isValidValue(config.itemEdgeRadius) && (componentStyle.itemEdgeRadius = config.itemEdgeRadius);
            isValidValue(config.showComponentTitle) && (componentStyle.showComponentTitle = config.showComponentTitle);
            isValidValue(config.showItemTitle) && (componentStyle.showItemTitle = config.showItemTitle);
            isValidValue(config.showItemTopLabel) && (componentStyle.showItemTopLabel = config.showItemTopLabel);
            isValidValue(config.showItemCountIndicator) && (componentStyle.showItemCountIndicator = config.showItemCountIndicator);
            isValidValue(config.showScrollArrows) && (componentStyle.showScrollArrows = config.showScrollArrows);
            isValidValue(config.itemSize) && (componentStyle.itemSize = config.itemSize);
            isValidValue(config.maxItemTitleLines) && (componentStyle.maxItemTitleLines = config.maxItemTitleLines);
            isValidValue(config.maxItemTopLabelLines) && (componentStyle.maxItemTopLabelLines = config.maxItemTopLabelLines);
            isValidValue(config.autoScrollEnabled) && (componentStyle.autoScrollEnabled = config.autoScrollEnabled);
            isValidValue(config.autoscrollDelay) && (componentStyle.autoscrollDelay = config.autoscrollDelay);
            isValidValue(config.autoscrollDuration) && (componentStyle.autoscrollDuration = config.autoscrollDuration);
            isValidValue(config.focusStyle) && (componentStyle.focusStyle = config.focusStyle);
            isValidValue(config.autoscrollDelayAfterInteraction) &&
                (componentStyle.autoscrollDelayAfterInteraction = config.autoscrollDelayAfterInteraction);
            isValidValue(config.showItemBottomLabel) && (componentStyle.showItemBottomLabel = config.showItemBottomLabel);
            isValidValue(config.maxItemBottomLabelLines) && (componentStyle.maxItemBottomLabelLines = config.maxItemBottomLabelLines);
            isValidValue(config.bottomLabelPosition) && (componentStyle.bottomLabelPosition = config.bottomLabelPosition);
            isValidValue(config.showMetadataPreview) && (componentStyle.showMetadataPreview = config.showMetadataPreview);
            isValidValue(config.showVideoPreview) && (componentStyle.showVideoPreview = config.showVideoPreview);
            isValidValue(config.showItemCountdown) && (componentStyle.showItemCountdown = config.showItemCountdown);
            isValidValue(config.showItemTypeImage) && (componentStyle.showItemTypeImage = config.showItemTypeImage);
            isValidValue(config.showBottomField) && (componentStyle.showBottomField = config.showBottomField);
        }
        return componentStyle;
    };

    //-------------------
    // Navigation configuration
    //-------------------
    /**
     * @name getNavigationConfiguration
     * @type function/method
     * @description This function will return the base configuration data.
     * @param {SysData[]} navConfigurations - Navigation configuration array.
     * @return {Navigation} Navigation configuration data
     *
     * @author amalmohann
     */
    getNavigationConfiguration = (navConfigurations: SysData[]): Navigation[] => {
        const navConfigArray: Navigation[] = [] as Navigation[];
        navConfigurations.forEach((navConfiguration: SysData) => {
            const navConfig: Navigation = {} as Navigation;
            const config = this.getConfigById(navConfiguration.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.name) && (navConfig.name = config.name);
                //set menu items configuration
                if (isValidValue(config.menuItems)) {
                    const menuItemConfig = config.menuItems;
                    navConfig.menuItems = this.getMenuItemsConfig(menuItemConfig);
                }
                isValidValue(config.menuStyle) && (navConfig.menuStyle = config.menuStyle);
                isValidValue(config.navigationCategory) && (navConfig.navigationCategory = config.navigationCategory);
                //set overflow item configurations
                if (isValidValue(config.overflowItem)) {
                    const overFlowItemConfig: SysData[] = [] as SysData[];
                    overFlowItemConfig.push(config.overflowItem);
                    navConfig.overflowItem = this.getMenuItemsConfig(overFlowItemConfig)[0] as MenuItem;
                }
                isValidValue(config.maxVisibleItems) && (navConfig.maxVisibleItems = config.maxVisibleItems);
                isValidValue(config.theme) && (navConfig.theme = this.getThemeConfiguration(config.theme));
                isValidValue(config.overflowTheme) && (navConfig.overflowTheme = config.overflowTheme);
                isValidValue(config.partnerItems) && (navConfig.partnerItems = config.partnerItems);
                isValidValue(config.staticMenuItems) && (navConfig.staticMenuItems = config.staticMenuItems);
                navConfigArray.push(navConfig);
            }
        });
        return navConfigArray;
    };

    /**
     * @name getMenuItemsConfig
     * @type function/method
     * @description This function will return the menu item config data.
     * @param {SysData[]} navMenuItemConfigs - menu items config array.
     * @return {MenuItem[]} Menu Items data array
     *
     * @author amalmohann
     */
    getMenuItemsConfig = (navMenuItemConfigs: SysData[]): MenuItem[] => {
        const navMenuItemConfigArray: MenuItem[] = [] as MenuItem[];
        navMenuItemConfigs.forEach((navMenuItemConfiguration: SysData) => {
            const navMenuItemConfig: MenuItem = {} as MenuItem;
            const config: any = this.getConfigById(navMenuItemConfiguration.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.id) && (navMenuItemConfig.id = config.id);
                isValidValue(config.name) && (navMenuItemConfig.name = config.name);
                isValidValue(config.title) && (navMenuItemConfig.title = config.title);
                isValidValue(config.description) && (navMenuItemConfig.description = config.description);
                isValidValue(config.actionLabel) && (navMenuItemConfig.actionLabel = config.actionLabel);
                isValidValue(config.itemStyle) && (navMenuItemConfig.itemStyle = config.itemStyle);
                isValidValue(config.anchor) && (navMenuItemConfig.anchor = config.anchor);
                isValidValue(config.showSeparatorBefore) && (navMenuItemConfig.showSeparatorBefore = config.showSeparatorBefore);
                isValidValue(config.menuGroup) && (navMenuItemConfig.menuGroup = config.menuGroup);
                isValidValue(config.page) &&
                    (navMenuItemConfig.page = config.page.flatMap((page: SysData) => {
                        const pagConfig = this.getPageConfig(page);
                        if (isValidValue(pagConfig)) {
                            return [pagConfig];
                        } else {
                            return [];
                        }
                    }));
                isValidValue(config.buttonStyle) && (navMenuItemConfig.buttonStyle = this.getButtonStyleConfig(config.buttonStyle));
                navMenuItemConfigArray.push(navMenuItemConfig);
            }
        });
        return navMenuItemConfigArray;
    };

    /**
     * @name getButtonStyleConfig
     * @type function/method
     * @description This function will return the button style config data.
     * @param {SysData} buttonStyleConfigs - button style config.
     * @return {ButtonStyle} Button style data
     *
     * @author amalmohann
     */
    getButtonStyleConfig = (buttonStyleConfigs: SysData): ButtonStyle => {
        const buttonStyle: ButtonStyle = {} as ButtonStyle;
        const config: any = this.getConfigById(buttonStyleConfigs.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.name) && (buttonStyle.name = config.name);
            isValidValue(config.edgeRadius) && (buttonStyle.edgeRadius = config.edgeRadius);
            isValidValue(config.normal) && (buttonStyle.normal = this.getButtonStateConfig(config.normal));
            isValidValue(config.focussed) && (buttonStyle.focussed = this.getButtonStateConfig(config.focussed));
            isValidValue(config.selectedFocussed) && (buttonStyle.selectedFocussed = this.getButtonStateConfig(config.selectedFocussed));
            isValidValue(config.pressed) && (buttonStyle.pressed = this.getButtonStateConfig(config.pressed));
            isValidValue(config.selected) && (buttonStyle.selected = this.getButtonStateConfig(config.selected));
            isValidValue(config.disabled) && (buttonStyle.disabled = this.getButtonStateConfig(config.disabled));
        }
        return buttonStyle;
    };

    /**
     * @name getButtonStateConfig
     * @type function/method
     * @description This function will return the button state config data.
     * @param {SysData} buttonStateConfigs - button state config
     * @return {ButtonState} button state date
     *
     * @author amalmohann
     */
    getButtonStateConfig = (buttonStateConfigs: SysData): ButtonState => {
        const buttonState: ButtonState = {} as ButtonState;
        const config: any = this.getConfigById(buttonStateConfigs.sys?.id);
        if (isValidValue(config)) {
            config.name && (buttonState.name = config.name);
            // fetch background Color or color gradient after check
            if (isValidValue(config.background)) {
                const backgroundConfig = this.getConfigById(config.background.sys?.id);
                const background = backgroundConfig.code ? this.getColor(config.background) : this.getColorGradient(config.background);
                buttonState.background = background;
            }
            isValidValue(config.text) && (buttonState.text = this.getColor(config.text));
            isValidValue(config.secondaryText) && (buttonState.secondaryText = this.getColor(config.secondaryText));
            isValidValue(config.shadow) && (buttonState.shadow = config.shadow);
            isValidValue(config.stroke) && (buttonState.stroke = this.getColor(config.stroke));
            isValidValue(config.image) && (buttonState.image = this.getColor(config.image));
            if (isValidValue(config.buttonGraphics)) {
                const buttonGraphicsConfig = this.getGraphicsConfig(config.buttonGraphics);
                const buttonGraphics = buttonGraphicsConfig ?? ({} as Graphics);
                buttonState.graphics = buttonGraphics;
            }
        }
        return buttonState;
    };

    /**
     * @name getGraphicsConfig
     * @type function/method
     * @description This function will return the graphic config data.
     * @param {SysData} GraphicsConfigs - graphics config.
     * @return {Graphics} - graphics data.
     *
     * @author amalmohann
     */
    getGraphicsConfig = (graphicsConfigs: SysData): Graphics => {
        const graphics: Graphics = {} as Graphics;
        const config: any = this.getConfigById(graphicsConfigs.sys?.id);
        if (isValidValue(config)) {
            isValidValue(config.id) && (graphics.id = config.id);
            isValidValue(config.name) && (graphics.name = config.name);
            isValidValue(config.anchor) && (graphics.anchor = config.anchor);
            isValidValue(config.images) && (graphics.images = this.getImagesConfig(config.images));
        }
        return graphics;
    };

    /**
     * @name getImagesConfig
     * @type function/method
     * @description This function will return the images config data.
     * @param {SysData[]} imagesConfigs - images config array.
     * @return {Images[]} array of Images
     *
     * @author amalmohann
     */
    getImagesConfig = (imagesConfigs: SysData[]): Image[] => {
        const images: Image[] = [] as Image[];
        imagesConfigs.forEach((imageConfig: SysData) => {
            const image: Image = {} as Image;
            const config: any = this.getConfigById(imageConfig.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.name) && (image.name = config.name);
                isValidValue(config.imageUrl) && (image.imageUrl = config.imageUrl);
                isValidValue(config.videoUrl) && (image.videoUrl = config.videoUrl);
                isValidValue(config.media) && (image.media = this.getConfigById(config.media.sys?.id));
                isValidValue(config.preloadImage) && (image.preloadImage = config.preloadImage);
                isValidValue(config.width) && (image.width = config.width);
                isValidValue(config.height) && (image.height = config.height);
                images.push(image);
            }
        });
        return images;
    };

    //-------------------
    // Base configuration
    //-------------------
    /**
     * @name getBaseConfigConfiguration
     * @type function/method
     * @description This function will return the base configuration data.
     * @param {SysData[]} baseConfigurations - base configuration array
     * @return {MappedBaseConfiguration} Base configuration data
     *
     * @author amalmohann
     */
    getBaseConfigConfiguration = (baseConfigurations: SysData[]): MappedBaseConfiguration => {
        const baseConfigArray: MappedBaseConfiguration[] = [] as MappedBaseConfiguration[];
        baseConfigurations.forEach((baseConfiguration: SysData) => {
            const baseConfig: MappedBaseConfiguration = {} as MappedBaseConfiguration;
            const config: any = this.getConfigById(baseConfiguration.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.name) && (baseConfig.name = config.name);
                isValidValue(config.baseApiUrl) && (baseConfig.baseApiUrl = config.baseApiUrl);
                isValidValue(config.baseArticleUrl) && (baseConfig.baseArticleUrl = config.baseArticleUrl);
                isValidValue(config.allowedTimeDifference) && (baseConfig.allowedTimeDifference = config.allowedTimeDifference);
                isValidValue(config.configUpdateInterval) && (baseConfig.configUpdateInterval = config.configUpdateInterval);
                isValidValue(config.configUpdateAppBackgroundDuration) &&
                    (baseConfig.configUpdateAppBackgroundDuration = config.configUpdateAppBackgroundDuration);
                //assign app store configuration
                const appStoreConfig = config.appStoreConfig;
                if (isValidValue(appStoreConfig)) {
                    baseConfig.appStoreConfig = this.getAppStoreConfig(appStoreConfig);
                }
                //assign maintenance Config
                const maintenanceConfig = config.maintenanceConfig;
                if (isValidValue(maintenanceConfig)) {
                    baseConfig.maintenanceConfig = this.getMaintenanceConfig(maintenanceConfig);
                }
                //assign localization Config
                const localizationConfig = config.localizationConfig;
                if (isValidValue(localizationConfig)) {
                    baseConfig.localizationConfig = this.getAppLocaleConfiguration(localizationConfig);
                }
                baseConfigArray.push(baseConfig);
            }
        });
        return baseConfigArray[0] || ({} as MappedBaseConfiguration);
    };

    /**
     * @name getAppStoreConfig
     * @type function/method
     * @description This function will return the app store config data.
     * @param {SysData[]} appStoreConfigs - app store configurations
     * @return {MappedAppStoreConfig} App store  Configuration
     *
     * @author amalmohann
     */
    getAppStoreConfig = (appStoreConfigs: SysData[]): MappedAppStoreConfig => {
        const appStoreConfigArray: MappedAppStoreConfig[] = [] as MappedAppStoreConfig[];
        appStoreConfigs.forEach((appStoreConfiguration: SysData) => {
            const appStoreConfig: MappedAppStoreConfig = {} as MappedAppStoreConfig;
            const config: any = this.getConfigById(appStoreConfiguration.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.name) && (appStoreConfig.name = config.name);
                isValidValue(config.androidAppStoreUrl) && (appStoreConfig.androidAppStoreUrl = config.androidAppStoreUrl);
                isValidValue(config.googlePlayStoreIcon) && (appStoreConfig.googlePlayStoreIcon = config.googlePlayStoreIcon);
                isValidValue(config.iosAppStoreUrl) && (appStoreConfig.iosAppStoreUrl = config.iosAppStoreUrl);
                isValidValue(config.appleStoreIcon) && (appStoreConfig.appleStoreIcon = config.appleStoreIcon);
                isValidValue(config.showAppstoreBanner) && (appStoreConfig.showAppstoreBanner = config.showAppstoreBanner);
                isValidValue(config.facebookUrl) && (appStoreConfig.facebookUrl = config.facebookUrl);
                isValidValue(config.instagramUrl) && (appStoreConfig.instagramUrl = config.instagramUrl);
                isValidValue(config.twitterUrl) && (appStoreConfig.twitterUrl = config.twitterUrl);
                isValidValue(config.youtubeUrl) && (appStoreConfig.youtubeUrl = config.youtubeUrl);
                isValidValue(config.rssUrl) && (appStoreConfig.rssUrl = config.rssUrl);
                appStoreConfigArray.push(appStoreConfig);
            }
        });
        return appStoreConfigArray[0] || ({} as MappedAppStoreConfig);
    };

    /**
     * @name getMaintenanceConfig
     * @type function/method
     * @description This function will return the maintenance configuration data
     * @param {SysData[]} maintenanceConfigs - maintenance configurations
     * @return {MappedMaintenanceConfig} maintenance data
     *
     * @author amalmohann
     */
    getMaintenanceConfig = (maintenanceConfigs: SysData[]): MappedMaintenanceConfig => {
        const appStoreConfigArray: MappedMaintenanceConfig[] = [] as MappedMaintenanceConfig[];
        maintenanceConfigs.forEach((maintenanceConfig: SysData) => {
            const appStoreConfig: MappedMaintenanceConfig = {} as MappedMaintenanceConfig;
            const config: any = this.getConfigById(maintenanceConfig.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.name) && (appStoreConfig.name = config.name);
                isValidValue(config.showForceUpdate) && (appStoreConfig.showForceUpdate = config.showForceUpdate);
                isValidValue(config.minimumBuildNumber) && (appStoreConfig.minimumBuildNumber = config.minimumBuildNumber);
                isValidValue(config.forceUpdateMessage) && (appStoreConfig.forceUpdateMessage = config.forceUpdateMessage);
                isValidValue(config.forceUpdateUrl) && (appStoreConfig.forceUpdateUrl = config.forceUpdateUrl);
                isValidValue(config.showMaintenanceMessage) && (appStoreConfig.showMaintenanceMessage = config.showMaintenanceMessage);
                isValidValue(config.maintenanceMessage) && (appStoreConfig.maintenanceMessage = config.maintenanceMessage);
                isValidValue(config.supportRootedDevices) && (appStoreConfig.supportRootedDevices = config.supportRootedDevices);
                appStoreConfigArray.push(appStoreConfig);
            }
        });
        return appStoreConfigArray[0] || ({} as MappedMaintenanceConfig);
    };

    /**
     * @name getAppLocaleConfiguration
     * @type function/method
     * @description This function will return the app locale config data.
     * @param {SysData[]} localizationConfigs - app locale configs
     * @return {AppLocales} Application locale Configuration data
     *
     * @author amalmohann
     */
    getAppLocaleConfiguration = (localizationConfigs: SysData[]): AppLocales => {
        const appLocaleArray: AppLocales[] = [] as AppLocales[];
        localizationConfigs.forEach((localizationConfig: SysData) => {
            const appLocale: AppLocales = {} as AppLocales;
            const config: any = this.getConfigById(localizationConfig.sys?.id);
            if (isValidValue(config)) {
                //assign app store configuration
                const labelGroups = config.labelGroups as SysData[];
                if (isValidValue(labelGroups)) {
                    appLocale.labelGroups = this.getLabelGroupsConfiguration(labelGroups);
                }

                //assign languages Config
                const languages = config?.languages as SysData[];
                if (isValidValue(languages)) {
                    appLocale.languages = this.getLanguagesConfiguration(languages);
                }
                appLocaleArray.push(appLocale);
            }
        });
        return appLocaleArray[0] || ({} as AppLocales);
    };

    /**
     * @name getLanguagesConfiguration
     * @type function/method
     * @description This function will return the languages configuration.
     * @param {SysData[]} languages - languages configs
     * @return {Language[]} Language Configuration Data
     *
     * @author tonyaugustine
     */
    getLanguagesConfiguration = (languages: SysData[]) => {
        const mappedLanguages: Language[] = [] as Language[];
        languages.forEach((language: SysData) => {
            const config = this.getConfigById(language.sys?.id);
            isValidValue(config) && mappedLanguages.push(config);
        });
        return mappedLanguages;
    };

    /**
     * @name getLabelGroupsConfiguration
     * @type function/method
     * @description This function will return the app locale label group data.
     * @param {SysData[]} labelGroups - application id.
     * @return {LabelGroup[]} label group Configuration array
     *
     * @author amalmohann
     */
    getLabelGroupsConfiguration = (labelGroups: SysData[]): LabelGroup[] => {
        const mappedLabelGroups: LabelGroup[] = [] as LabelGroup[];
        const labels: Label[] = [] as Label[];
        const reversedLabelGroup = labelGroups.slice().reverse();
        reversedLabelGroup.forEach((group: SysData) => {
            const labelGroup: LabelGroup = {} as LabelGroup;
            const config = this.getConfigById(group.sys?.id);
            if (isValidValue(config)) {
                isValidValue(config.name) && (labelGroup.name = config.name);
                //assign the labels config
                if (isValidValue(config.labels)) {
                    const labelsArray = this.getLabelsConfiguration(config.labels);
                    labelGroup.labels = labelsArray;
                    labels.push(...labelsArray);
                }
            }
            mappedLabelGroups.push(labelGroup);
        });
        setState(StorageKeys.LABELS, labels);
        return mappedLabelGroups;
    };

    /**
     * @name getLabelsConfiguration
     * @type function/method
     * @description This function will return the app locale label data.
     * @param {SysData[]} labels - labels configuration array.
     * @return {Label[]} label data array
     *
     * @author amalmohann
     */
    getLabelsConfiguration = (labels: SysData[]): Label[] => {
        const labelsArray: Label[] = [] as Label[];
        labels.forEach((label: SysData) => {
            const config = this.getConfigById(label.sys?.id);
            isValidValue(config) && labelsArray.push(config);
        });
        return labelsArray;
    };

    /**
     * @name setErrorCode
     * @type function/method
     * @description Creates a mapping of error codes to error objects.
     * @param {ErrorConfiguration[]} errors - An array of error objects.
     * @return {Map<string, ErrorConfiguration>} A map of error codes to error objects.
     */
    setErrorCode = (errors: ErrorConfiguration[]): Map<string, ErrorConfiguration> => {
        const errorCodeMap = new Map<string, ErrorConfiguration>();

        errors?.forEach(error => {
            // If serverErrorCode is present, map each key with the error
            if (error.serverErrorCode && error.serverErrorCode.length > 0) {
                error.serverErrorCode.forEach(code => {
                    // Check if the key is already in the map
                    if (!errorCodeMap.has(code)) {
                        errorCodeMap.set(code, error);
                    }
                });
            } else {
                // If serverErrorCode is not present, use error.code or error.type as the key
                const key = error.type || error.code;

                // Check if the key is already in the map
                if (!errorCodeMap.has(key)) {
                    errorCodeMap.set(key, error);
                }
            }
        });

        return errorCodeMap;
    };
}

export default ConfigurationController;
