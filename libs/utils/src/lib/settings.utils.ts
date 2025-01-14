import { deviceUtilities, configurationUtilities, appUtilities, storageUtilities } from '.';
import { MenuItem, PageComponent, ProfileListData, StorageKeys } from '@enlight-webtv/models';

// import utilities
const { getState } = storageUtilities;

// import utilities
const { getPlatformName } = deviceUtilities;
const { getAppConfig } = configurationUtilities;
const { getAppVersionWithPrefix, getAppMetaData } = appUtilities;

/**
 * @name getSettingsQRCodeURL
 * @type function
 * @description This util functions retuns the url to construct a qrcode for the seettings tab qrcode
 * @param {MenuItem} menuItem - Settings menuitem config
 * @returns {string} constructed URL
 */
const getSettingsQRCodeURL = (menuItem: MenuItem) => {
    const qrUrl = (menuItem?.page?.[0]?.components as PageComponent[])?.[0]?.contents?.[0]?.data ?? '';
    const locale = getState(StorageKeys.LOCALE) ?? '';
    const appMetaData = getAppMetaData();
    const sessionID = getState(StorageKeys.SESSIONID);
    const profileData = getState(StorageKeys.PROFILE) as ProfileListData;
    const profileMaxParentalRating = profileData?.maxParentalRatings?.[0] ?? '';
    const userEmail = getState(StorageKeys.USER_EMAIL) ?? '';

    if (qrUrl) {
        const baseArticleURL = getAppConfig()?.application?.baseConfiguration?.baseArticleUrl;
        const constructedQRUrl = qrUrl
            .replace('{base_article_url}', baseArticleURL)
            .replace('{platform}', getPlatformName())
            .replace('{lang}', locale)
            .replace('{session_id}', sessionID)
            .replace('{app_version}', getAppVersionWithPrefix(appMetaData?.appVersion) ?? '')
            .replace('{profile}', profileMaxParentalRating)
            .replace('{user_name}', profileData?.profileName ?? '')
            .replace('{email}', userEmail);
        return constructedQRUrl ?? '';
    }
    return '';
};

export { getSettingsQRCodeURL };
