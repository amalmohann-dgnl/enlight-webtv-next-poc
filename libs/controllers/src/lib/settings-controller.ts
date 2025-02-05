import { QRCodeToDataURLOptions } from 'qrcode';
import { commonUtilities, configurationUtilities, pageUtilities, settingsUtilities, storageUtilities } from '@enlight-webtv/utilities';
import {
    AutoPlayVideoMenuOptions,
    Color,
    FeatureSupport,
    Features,
    LabelKey,
    Language,
    LanguageData,
    Page,
    QrErrorCorrectionLevel,
    RightSideMenuItem,
    SettingsRightSideMenuOptions,
    SettingsTabDataModel,
    SettingsTabType,
    StorageKeys,
} from '@enlight-webtv/models';
import { theme } from '@enlight-webtv/themes';


//import the utility functions
const { generateQR } = commonUtilities;
const { getState } = storageUtilities;
const { getFaqExternalLink, getSettingsPageComponent } = pageUtilities;
const { getFeatureByKey, getLabel, getLanguageConfig, getNavigationConfig } = configurationUtilities;
const { isValidValue } = commonUtilities;
const { getSettingsQRCodeURL } = settingsUtilities;

class SettingsController {
    static instance: SettingsController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (SettingsController.instance) {
            return SettingsController.instance;
        }
        SettingsController.instance = this;
    }

    destroy() {
        if (SettingsController.instance) {
            SettingsController.instance = null;
        }
    }

    /**
     * @name settingsPageDataProvider
     * @param page - Instance of Settings Page
     * @type method
     * @description This method will provide the data required to populate the settings page as well as the
     * contentful configurations.
     * @return {Promise<void>}
     *
     * @author tonyaugustine
     */
    settingsPageDataProvider = async (page: any) => {
        const navigationConfiguration = getNavigationConfig();

        // get settings configuration
        const settingsPageComponent = navigationConfiguration && getSettingsPageComponent(navigationConfiguration);
        if (settingsPageComponent) {
            //get settings page config
            const settingsTabConfigurations = this.getSettingsTabConfigurations(settingsPageComponent);

            //set the page title for tabbed page template
            const pageTitle = settingsPageComponent?.title;
            if (pageTitle) page.pageTitle = pageTitle?.toUpperCase();

            //set if page title is shown
            const showPageTitle = settingsPageComponent?.showTitle;
            if (showPageTitle) page.showPageTitle = showPageTitle;

            //sets if app logo header is to be shown
            const showAppLogo = settingsPageComponent?.showAppLogo;
            if (showAppLogo) page.showAppLogo = showAppLogo;

            //set the text color
            const pageTextPrimaryColor = (settingsPageComponent?.theme?.[0]?.body?.text?.primary as Color)?.code ?? theme.colors.primary[300];
            if (pageTextPrimaryColor) page.pageTextPrimaryColor = pageTextPrimaryColor;

            //get faq and contact link from feature support
            const featureSupport = getFeatureByKey(Features.FeatureSupport) as FeatureSupport;
            const faqLink = featureSupport.faqLink;
            const contactLink = featureSupport?.contactLink?.[0];
            const privacyPolicyLink = featureSupport?.privacyPolicyLink;
            const tosLink = featureSupport?.tosLink;

            const createDescriptionTab = (tabData: any, labelKey: string, linkLabelKey: LabelKey, scanCodeLabel?: string, link?: string | null) => ({
                ...tabData,
                descriptionLabel: getLabel(labelKey),
                urlLabel: link ?? getLabel(linkLabelKey),
                description: `${getLabel(labelKey)}\n${getLabel(linkLabelKey) ?? link ?? ''}\n\n${scanCodeLabel}`,
            });

            //construct settings tab data
            const settingsTabsData: SettingsTabDataModel[] = [];
            settingsTabConfigurations.forEach(tabData => {
                switch (tabData.id) {
                    case SettingsTabType.AUTO_PLAY_VIDEO: {
                        const autoPlayVideoConfigList = [
                            {
                                key: AutoPlayVideoMenuOptions.ON,
                                value: getLabel(LabelKey.LABEL_SETTINGS_AUTO_PLAY_ON),
                            },
                            {
                                key: AutoPlayVideoMenuOptions.OFF,
                                value: getLabel(LabelKey.LABEL_SETTINGS_AUTO_PLAY_OFF),
                            },
                        ];
                        const autoPlayVideoList: RightSideMenuItem[] = autoPlayVideoConfigList.map(config => ({
                            name: config.value!,
                            label: config.value!,
                            data: { name: config.value, code: config.key } as LanguageData,
                            id: config.key,
                        }));

                        settingsTabsData.push({
                            ...tabData,
                            menuItems: [
                                {
                                    type: SettingsRightSideMenuOptions.AUTO_PLAY_VIDEO,
                                    menuText: getLabel(LabelKey.AUTO_PLAY_VIDEO_SUBTITLE),
                                    menuButtonText:
                                        getState(StorageKeys.AUTO_PLAY_VIDEO) === true
                                            ? getLabel(LabelKey.LABEL_SETTINGS_AUTO_PLAY_ON)
                                            : getLabel(LabelKey.LABEL_SETTINGS_AUTO_PLAY_OFF),
                                    rightMenuItems: autoPlayVideoList,
                                },
                            ],
                        });
                        break;
                    }
                    case SettingsTabType.LANGUAGE: {
                        const languageConfigList = getLanguageConfig();
                        const languageList: RightSideMenuItem[] = languageConfigList.map((language: Language) => ({
                            name: language.name,
                            label: language.name,
                            data: { name: language.name, code: language.code } as LanguageData,
                            id: language.code,
                        }));

                        settingsTabsData.push({
                            ...tabData,
                            menuItems: [
                                {
                                    type: SettingsRightSideMenuOptions.LANGUAGE,
                                    menuText: getLabel(LabelKey.LANGUAGE_SUBTITLE),
                                    menuButtonText: getLabel(LabelKey.LANGUAGE_BUTTON),
                                    rightMenuItems: languageList,
                                },
                            ],
                        });
                        break;
                    }
                    case SettingsTabType.CONTACT: {
                        const qrLink = tabData.qrCodeURL.length > 0 ? tabData.qrCodeURL : contactLink;
                        settingsTabsData.push(
                            createDescriptionTab(
                                tabData,
                                LabelKey.CONTACT_US_SUBTITLE,
                                LabelKey.CONTACT_US_LINK,
                                getLabel(LabelKey.CONTACT_US_LINK_DESCRIPTION) ?? '',
                                qrLink,
                            ),
                        );
                        break;
                    }
                    case SettingsTabType.FAQ: {
                        const qrLink = tabData.qrCodeURL.length > 0 ? tabData.qrCodeURL : faqLink;
                        settingsTabsData.push(
                            createDescriptionTab(
                                tabData,
                                LabelKey.FAQ_SUBTITLE,
                                LabelKey.FAQ_LINK,
                                getLabel(LabelKey.FAQ_LINK_DESCRIPTION) ?? '',
                                qrLink,
                            ),
                        );
                        break;
                    }
                    case SettingsTabType.SUBSCRIPTION: {
                        const qrLink = tabData.qrCodeURL.length > 0 ? tabData.qrCodeURL : getLabel(LabelKey.SUBSCRIPTION_LINK);
                        settingsTabsData.push(
                            createDescriptionTab(tabData, LabelKey.SUBSCRIPTION_SUBTITLE, LabelKey.SUBSCRIPTION_LINK, undefined, qrLink),
                        );
                        break;
                    }
                    case SettingsTabType.PRIVACY_POLICY: {
                        const qrLink = tabData.qrCodeURL.length > 0 ? tabData.qrCodeURL : privacyPolicyLink;
                        settingsTabsData.push(
                            createDescriptionTab(
                                tabData,
                                LabelKey.PRIVACY_POLICY_SUBTITLE,
                                LabelKey.PRIVACY_POLICY_LINK,
                                getLabel(LabelKey.PRIVACY_POLICY_LINK_DESCRIPTION) ?? '',
                                qrLink,
                            ),
                        );
                        break;
                    }
                    case SettingsTabType.TERMS_AND_CONDITIONS: {
                        const qrLink = tabData.qrCodeURL.length > 0 ? tabData.qrCodeURL : tosLink;
                        settingsTabsData.push(
                            createDescriptionTab(
                                tabData,
                                LabelKey.TERMS_AND_CONDITIONS_SUBTITLE,
                                LabelKey.TERMS_AND_CONDITIONS_LINK,
                                getLabel(LabelKey.TOS_LINK_DESCRIPTION) ?? '',
                                qrLink,
                            ),
                        );
                        break;
                    }
                }
            });

            //QR code settings
            const qrOptions: QRCodeToDataURLOptions = {
                errorCorrectionLevel: QrErrorCorrectionLevel.HIGH,
                margin: 3,
            };

            //get qr code url if link available
            for (const tabData of settingsTabsData) {
                if (tabData.urlLabel) {
                    const link = getFaqExternalLink(tabData.urlLabel);
                    if (link) {
                        const qrCode = await generateQR(link, qrOptions);
                        tabData.qrCodeUrl = qrCode ?? '';
                    }
                }
            }

            //assign data to SettingsPage
            if (isValidValue(settingsTabsData)) page.data = settingsTabsData;
        }
    };

    /**
     * @name getSettingsTabConfigurations
     * @param {Page} config - settings page component
     * @type method
     * @description This method will provide the data required to populate the settings page
     * @return {Promise<void>}
     *
     * @author tonyaugustine
     */
    getSettingsTabConfigurations = (config: Page) => {
        const tabsData: any[] = [];
        //get tab items from config
        const menuItems = config?.navigation?.[0]?.menuItems;

        if (menuItems) {
            //for each tab set its properties
            menuItems.forEach(menuItem => {
                const qrCodeURL = getSettingsQRCodeURL({ ...menuItem });
                const menuData: any = {};
                menuData.id = menuItem?.id;
                menuData.tabTitle = menuItem?.title;
                menuData.pageTitle = menuItem?.page?.[0]?.title;
                menuData.showPageTitle = menuItem?.page?.[0]?.showTitle;
                menuData.qrCodeURL = qrCodeURL;
                menuData.buttonStyle = menuItem.buttonStyle;
                tabsData.push(menuData);
            });
        }
        return tabsData;
    };
}

export default SettingsController;
