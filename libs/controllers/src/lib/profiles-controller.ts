'use client'
import { Color, FeatureProfileManagement, LabelKey, LoaderId, StorageKeys, Typography } from '@enlight-webtv/models';
import { ProfileServices } from '@enlight-webtv/network-services';
import { configurationUtilities, splashUtilities, deviceUtilities, storageUtilities } from '@enlight-webtv/utilities';

//services
const { getProfiles, destroy: destroyProfileServices } = new ProfileServices();

const { setState } = storageUtilities;

//controllers
const { getLabel, getProfileManagementConfig } = configurationUtilities;
const { checkIsVideoSplash } = splashUtilities;
const { isAndroid, getAndroidObject } = deviceUtilities;

const IS_ANDROID = false;
const ANDROID = {};

class ProfilesController {
    static instance: ProfilesController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (ProfilesController.instance) {
            return ProfilesController.instance;
        }
        ProfilesController.instance = this;
    }

    destroy() {
        if (ProfilesController.instance === this) {
            ProfilesController.instance = null;
            destroyProfileServices();
        }
    }

    /**
     * @name profilesPageDataProvider
     * @param page - Instance of Profiles Page
     * @type function
     * @description This function will provide the data required to populate the profiles page as well as the
     * contentful configurations.
     * @return {Promise}
     *
     * @author alwin-baby
     */
    profilesPageDataProvider = (page: any) => {
        const title = getLabel(LabelKey.LABEL_PROFILE_MANAGE_TITLE);
        const footerText = getLabel(LabelKey.LABEL_PROFILE_MANAGE_DESCRIPTION);
        const pinPopupTitle = getLabel(LabelKey.LABEL_PROFILE_POPUP_CHANGE_PIN_POPUP_TITLE);
        const pinPopupDescription1 = getLabel(LabelKey.LABEL_PROFILE_KIDS_PIN_FORGOT_SWITCH_DESC);
        const pinPopupDescription2 = getLabel(LabelKey.LABEL_PROFILE_PIN_FORGOT_DESCRIPTION);
        const pinPopupButtonLabel = getLabel(LabelKey.LABEL_PROFILE_MANAGE_BUTTON);
        const pinPopupIncorrectPinLabel = getLabel(LabelKey.LABEL_PROFILE_POPUP_WRONG_PIN);

        const profileManagemantConfig = getProfileManagementConfig() as FeatureProfileManagement;
        const profilePopupHeaderConfig = profileManagemantConfig?.themeProfilePopup?.[0]?.header;
        const headerTextErrorColor = (profilePopupHeaderConfig?.text?.error as Color)?.code;

        const Profile = page?.Profile;
        Profile._title = typeof title === 'string' ? title : '';
        Profile._titleTypography = Typography.headerL;
        Profile._footerText = typeof footerText === 'string' ? footerText : '';
        Profile._footerTypography = Typography.bodyL;
        Profile._pinLength = 4;
        Profile._pinPopupTitle = typeof pinPopupTitle === 'string' ? pinPopupTitle : '';
        Profile._pinPopupDescription1 = typeof pinPopupDescription1 === 'string' ? pinPopupDescription1 : '';
        Profile._pinPopupDescription2 = typeof pinPopupDescription2 === 'string' ? pinPopupDescription2 : '';
        Profile._pinPopupButtonLabel = typeof pinPopupButtonLabel === 'string' ? pinPopupButtonLabel : '';
        Profile._incorrectPinLabel = typeof pinPopupIncorrectPinLabel === 'string' ? pinPopupIncorrectPinLabel : '';
        Profile._incorrectPinColor = headerTextErrorColor ?? '';

        return new Promise<void>(resolve => {
            this.addProfiles(Profile).then(() => resolve());
        });
    };

    /**
     * @name addProfiles
     * @param profile - profile section
     * @type function
     * @description This function will provide the data required to populate the profiles page as well as the
     * contentful configurations.
     * @return {Promise}
     *
     * @author alwin-baby
     */
    addProfiles = async (profileSection: any) => {
        const data = await getProfiles();
        const profiles = (data as any)?.profiles;

        const userID = (data as any)?.account?.userId;
        if (userID) {
            setState(StorageKeys.USER_ID, userID);
        } else {
            console.error('UserID of user not found');
        }

        const userEmail = (data as any)?.account?.email;
        if (userEmail) setState(StorageKeys.USER_EMAIL, (data as any)?.account?.email);

        profileSection._profileList = profiles;
        const isSplashVideo = checkIsVideoSplash();
        const splash = document.getElementById(isSplashVideo ? LoaderId.VIDEOSPLASH : LoaderId.SPLASH);
        if (splash) {
            setTimeout(() => {
                splash.style.opacity = '0';
                isSplashVideo && (splash as HTMLVideoElement).pause();
                if (IS_ANDROID) {
                    const isTransparent = false;
                    // ANDROID.stopSplashAnimation();
                    // ANDROID.showDismissProgress(false, isTransparent);
                }
            });
        }
    };
}

export default ProfilesController;
