import { ComponentData, CuratedDataEntry, FeatureRevenue, FeatureUserManagement, MenuItemID, Navigation, PageComponent } from '@enlight-webtv/models';
import { getImageUrl } from './configuration.utils';

/**
 * @name getLoginBackgroundImageUrl
 * @param featureUserManagement - User Management config from contentful
 * @type Function/method
 * @description This function will return the background Image url for the Login page.
 * @return {string} login page background image url
 *
 * @author alwin-baby
 */
const getLoginBackgroundImageUrl = (featureUserManagement: FeatureUserManagement) => {
    const loginThemeGraphics = featureUserManagement?.loginTheme?.[0]?.graphics;
    const tvPlaceholderGraphics = loginThemeGraphics?.find(item => item?.id === 'tv_placeholder_graphics');
    const loginBackgroundImageObject = tvPlaceholderGraphics?.images?.[0];
    const loginBackgroundImageUrl = loginBackgroundImageObject && getImageUrl(loginBackgroundImageObject);
    return loginBackgroundImageUrl;
};

/**
 * @name getFaqExternalLink
 * @param faqLink - Faq string from contentful
 * @type Function/method
 * @description This function will return the external link for help page.
 * @return {string} help page url
 * @author anandpatel
 */
const getFaqExternalLink = (faqLink: string) => {
    // Regular expression to match URLs
    const urlRegex = /(\bhttps?:\/\/\S+\b)|(\bwww\.(\S+)?\.\S+\b)/gi;

    const matches = faqLink?.match(urlRegex);
    return matches?.[0];
};

/**
 * @name getSettingsPageComponent
 * @type Function/method
 * @description This function will return the settings component config.
 * @param {Navigation} navigationConfig - Navigation config from contentful
 * @return {CuratedDataEntry} settings page component
 * @author tonyaugustine
 */
const getSettingsPageComponent = (navigationConfig: Navigation) => {
    const settingsItem = navigationConfig?.menuItems?.find(item => item?.id === MenuItemID.MENU_SETTINGS);
    const settingsPageComponent = settingsItem?.page?.[0];
    return settingsPageComponent;
};

/**
 * @name getFaqData
 * @type Function/method
 * @description This function will return the FAQ data for help page.
 * @param {Navigation} navigationConfig - Navigation config from contentful
 * @return {CuratedDataEntry} help page data
 * @author anandpatel
 */
const getFaqData = (navigationConfig: Navigation) => {
    const faqItem = navigationConfig?.menuItems.find(item => item?.id === MenuItemID.FAQ_ITEM);
    const faqPageComponent = faqItem?.page?.[0]?.components?.[0];
    const faqData = (faqPageComponent as PageComponent)?.contents?.[0]?.curatedData?.[0];

    return faqData as CuratedDataEntry;
};

/**
 * @name getLoginPageData
 * @type Function/method
 * @description This function will return the Login Page data for Login page.
 * @param {FeatureUserManagement} featureUserManagement - User Management feature config from contentful
 * @return {CuratedDataEntry} login page data
 *
 * @author anandpatel
 */
const getLoginPageData = (featureUserManagement: FeatureUserManagement) => {
    const pageComp = featureUserManagement?.logInPage?.[0]?.components?.[0] as PageComponent;
    const compData = pageComp?.contents?.[0] as ComponentData;
    const data = compData?.curatedData?.[0];

    return data as CuratedDataEntry;
};

/**
 * @name getSubscriptionPageData
 * @type Function/method
 * @description This function will return the RedirectionPage data for Subscriptionn page.
 * @param {FeatureRevenue} featureRevenue - Revenue feature config from contentful
 * @return {CuratedDataEntry} Redirection Page Data
 *
 * @author anandpatel
 */
const getSubscriptionPageData = (featureRevenue: FeatureRevenue) => {
    const pageComp = featureRevenue?.purchaseRedirectionPage?.[0]?.components?.[0] as PageComponent;
    const compData = pageComp?.contents?.[0] as ComponentData;
    const data = compData?.curatedData?.[0];
    return data as CuratedDataEntry;
};

/**
 * @name getScreenName
 * @type function/method
 * @description Gets the corrent screen name and return that.
 * @return {screenName} - returns current screenName.
 * @author anandpatel
 */
const getScreenName = () => {
    let screenName;
    // switch (Router.getActiveRoute()) {
    //     case '$':
    //         screenName = 'splash';
    //         break;
    //     case '!':
    //         screenName = 'error';
    //         break;
    //     case 'details/:assetUID':
    //         screenName = 'details';
    //         break;
    //     default:
    //         screenName = Router.getActiveRoute()?.toLocaleLowerCase();
    // }
    return screenName;
};

export {
    getLoginBackgroundImageUrl,
    getFaqExternalLink,
    getFaqData,
    getLoginPageData,
    getSubscriptionPageData,
    getScreenName,
    getSettingsPageComponent,
};
