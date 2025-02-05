import { QRCodeToDataURLOptions } from 'qrcode';
import {
    Color,
    ErrorConfigurationType,
    ErrorPopupData,
    FeatureUserManagement,
    Features,
    IdentityProviders,
    InputBoxType,
    InputType,
    LabelKey,
    LoaderId,
    MediaPageSectionDescription,
    PageType,
    QrErrorCorrectionLevel,
    Token,
} from '@enlight-webtv/models';
import { commonUtilities, configurationUtilities, deviceUtilities, pageUtilities, storageUtilities } from '@enlight-webtv/utilities';
import { AuthServices } from '@enlight-webtv/network-services';

//import utility functions
const {
    getDefaultBodyTextPrimaryColor,
    getDefaultBodyTextSecondaryColor,
    getDefaultBodyTextTertiaryColor,
    getDefaultCompositeStyle,
    getFeatureByKey,
    getLabel,
    getLoginListData,
    getAuthConfigurations,
    getErrorByCode,
} = configurationUtilities;
const { generateQR, isValidValue } = commonUtilities;
const { getLoginPageData } = pageUtilities;
const { getAndroidObject,  } = deviceUtilities;
const { getState } =storageUtilities;

//import services
const { getActivationCode, destroy: destroyAuthServices } = new AuthServices();

const IS_ANDROID = false;
const ANDROID = {};

class LoginController {
    static instance: LoginController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (LoginController.instance) {
            return LoginController.instance;
        }
        LoginController.instance = this;
    }

    destroy() {
        if (LoginController.instance === this) {
            LoginController.instance = null;
            destroyAuthServices();
        }
    }

    /**
     * @name loginPageDataProvider
     * @param page - Instance of Login Page
     * @type function
     * @description This function will provide the data required to populate the login page as well as the contentful configurations.
     * @return {Promise}
     * @author alwin-baby
     */
    loginPageDataProvider = async (page: any) => {
        const featureUserManagement = getFeatureByKey(Features.FeatureUserManagement) as FeatureUserManagement;
        const loginMethod = featureUserManagement.loginMethods[0];
        const loginType = featureUserManagement?.logInPage?.[0]?.type;
        const LeftSection = page.LeftSection;
        const LeftSectionContent = LeftSection.tag('SectionContent')!;
        const RightSection = page.RightSection;
        const RightSectionContent = RightSection.tag('SectionContent')!;
        const loginPageData = getLoginPageData(featureUserManagement);
        const backgroundImageSrc = loginPageData?.graphics?.[0]?.images?.[0]?.imageUrl;
        if (loginType === PageType.DEVICECODE && loginMethod !== IdentityProviders.MPX) {
            const authConfigurations = getAuthConfigurations();
            const title = loginPageData?.title;

            const description: MediaPageSectionDescription[] = [
                {
                    content: loginPageData?.subTitle || '',
                    type: 'text',
                },
                {
                    content: loginPageData?.description || '',
                    type: 'text',
                },
            ];

            page._backgroundImageSrc = backgroundImageSrc;
            LeftSectionContent._authConfigurations = authConfigurations;
            LeftSectionContent._showCodeFeat = true;
            LeftSectionContent._showDeviceCode = false;
            LeftSectionContent._buttonDisabled = true; // initially disables the button
            LeftSectionContent._title = title;
            LeftSectionContent._guestModeEnable = false;
            LeftSectionContent._buttonLabel = loginPageData?.ctaData ?? null;
            LeftSectionContent._descriptionArray = description;
            LeftSectionContent._primaryTextColor = getDefaultBodyTextPrimaryColor()?.code;
            LeftSectionContent._secondaryTextColor = getDefaultBodyTextSecondaryColor()?.code;
            LeftSectionContent._tertiaryTextColor = getDefaultBodyTextTertiaryColor()?.code;
            LeftSectionContent.startSpinner?.();
            RightSectionContent._qrSkeletonLoading = false;

            return new Promise<void>((resolve, reject) => {
                getActivationCode(authConfigurations?.authClientId)
                    .then(async (data: any) => {
                        this.updateLoginPageDeviceCodeData(page, LeftSectionContent, RightSectionContent, data);
                        resolve();
                    })
                    .catch((e: any) => {
                        // Hide the splash if any error occurred
                        const splash = document.getElementById(LoaderId.SPLASH);
                        splash && (splash.style.opacity = '0');
                        setTimeout(() => {
                            // if (IS_ANDROID) {
                            //     ANDROID.stopSplashAnimation();
                            // }
                        }, 500);
                        // show login page load failed popup
                        const LoginPageLoadFailed = getErrorByCode(ErrorConfigurationType.LOGIN_PAGE_LOAD_FAILED);
                        const data = {
                            logoSrc: 'icons/error/logout.png',
                            title: LoginPageLoadFailed?.title,
                            description: LoginPageLoadFailed?.description,
                            buttons: [
                                {
                                    label: LoginPageLoadFailed?.primaryActionLabel,
                                    handleEnterPress: async () => {
                                        // location.reload();
                                    },
                                    handleBackPress: () => null,
                                },
                            ],
                        } as ErrorPopupData;
                        page.fireAncestors('$setupErrorPopup' as any, data);
                        LeftSectionContent._showCode = true;
                        RightSectionContent._qrSkeletonLoading = false;
                        console.log(e);
                        reject(e);
                    });
                resolve();
            });
        } else {
            return new Promise<void>((resolve, reject) => {
                try {
                    this.updateLoginPageEmailData(
                        page,
                        LeftSectionContent,
                        loginPageData,
                        featureUserManagement,
                        RightSectionContent,
                        backgroundImageSrc,
                    );
                    resolve();
                } catch (error) {
                    console.log(error);
                    reject(error);
                }
            });
        }
    };

    /**
     * @name updateLoginPageDeviceCodeData
     * @type function/method
     * @description this function updates the login page data for device code.
     *
     * @author anandpatel
     */
    updateLoginPageDeviceCodeData = async (page: any, LeftSectionContent: any, RightSectionContent: any, data: any) => {
        LeftSectionContent._userCode = data?.data?.user_code ?? data?.data?.data?.userCode;
        LeftSectionContent._showCode = true;

        LeftSectionContent._showDeviceCode = true;
        LeftSectionContent._deviceCodeRes = data?.data?.data ?? data?.data;
        LeftSectionContent._handleDeviceCode();
        const verificationUri = data?.data?.verification_uri_complete ?? data?.data?.data?.verificationUriComplete;
        if (verificationUri) {
            const qrOptions: QRCodeToDataURLOptions = {
                errorCorrectionLevel: QrErrorCorrectionLevel.HIGH,
                margin: 3,
            };
            const qrCode = await generateQR(verificationUri, qrOptions);

            page._showBackdrop = false;
            RightSectionContent._qrUrl = qrCode;
        }
        LeftSectionContent._enableResetCodeButton = true;
        LeftSectionContent._buttonDisabled = false;
        LeftSectionContent._startIconSrc = '';
        RightSectionContent._qrSkeletonLoading = false;
        // Hide the splash once we get the QR code
        const splash = document.getElementById(LoaderId.SPLASH);
        splash && (splash.style.opacity = '0');
        setTimeout(() => {
            if (IS_ANDROID) {
                // ANDROID.stopSplashAnimation();
            }
            LeftSectionContent.stopSpinner?.();
        }, 500);
    };

    /**
     * @name updateLoginPageEmailData
     * @type function/method
     * @description this function updates the login page data for Email section.
     *
     * @author anandpatel
     */
    updateLoginPageEmailData = (
        page: any,
        LeftSectionContent: any,
        loginPageData: any,
        featureUserManagement: FeatureUserManagement,
        RightSectionContent: any,
        backgroundImageSrc?: string,
    ) => {
        RightSectionContent._qrSkeletonLoading = false;
        LeftSectionContent._showCodeFeat = false;
        const inputBoxBackgroundPrimary = getDefaultCompositeStyle()?.inputBox.background.primary as Color;
        const inputBoxFillColor = inputBoxBackgroundPrimary.code;
        const title = loginPageData?.title;
        const description = loginPageData?.description || '';
        const signUpDescription = loginPageData?.listData[0]?.value;

        const buttonLabel = getLabel(LabelKey.LABEL_SIGNUP_BUTTON);
        const mailPlaceholder = getLoginListData(LabelKey.LABEL_LOGIN_PLACEHOLDER_MAIL, featureUserManagement)?.value;
        const passwordPlaceholder = getLoginListData(LabelKey.LABEL_LOGIN_PLACEHOLDER_PASSWORD, featureUserManagement)?.value;

        const inputBox: InputBoxType[] = [
            {
                placeholdertext: mailPlaceholder || '',
                type: InputType.EMAIL,
            },
            {
                placeholdertext: passwordPlaceholder || '',
                type: InputType.PASSWORD,
            },
        ];

        page._backgroundImageSrc = backgroundImageSrc;
        LeftSectionContent._title = title;
        LeftSectionContent._loginDescription = description;
        LeftSectionContent._signUpDescription = signUpDescription;
        LeftSectionContent._buttonLabel = buttonLabel;
        LeftSectionContent._primaryTextColor = getDefaultBodyTextPrimaryColor()?.code;
        LeftSectionContent._secondaryTextColor = getDefaultBodyTextSecondaryColor()?.code;
        LeftSectionContent._tertiaryTextColor = getDefaultBodyTextTertiaryColor()?.code;
        LeftSectionContent._maxPasswordChars = featureUserManagement.maxPasswordChars;
        LeftSectionContent._minPasswordChars = featureUserManagement.minPasswordChars;
        LeftSectionContent._inputBoxFillColor = inputBoxFillColor;
        LeftSectionContent._inputBoxStrokeColor = inputBoxFillColor;
        LeftSectionContent._inputBoxes = inputBox;
    };

    /**
     * @name isAuthenticated
     * @type function/method
     * @description this function checks if the user is authenticated.
     *
     * @author amalmohann
     */
    getIsAuthenticated = (): Promise<boolean> => {
        return new Promise(resolve => {
            const isAuthenticated = isValidValue(getState(Token.USER_CONSUMER_TOKEN)) && isValidValue(getState(Token.USER_PROFILE_TOKEN));
            resolve(isAuthenticated);
        });
    };
}
export default LoginController;
