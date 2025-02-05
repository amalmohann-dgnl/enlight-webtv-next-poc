import { MediaPageSectionDescription, QrErrorCorrectionLevel } from '@enlight-webtv/models';
//import qr package
import { QRCodeToDataURLOptions } from 'qrcode';
import { configurationUtilities, commonUtilities, pageUtilities } from '@enlight-webtv/utilities';

//import the utility functions
const { generateQR } = commonUtilities;
const { getFaqExternalLink, getFaqData } = pageUtilities;
const { getDefaultBodyTextPrimaryColor, getDefaultBodyTextSecondaryColor, getDefaultBodyTextTertiaryColor, getNavigationConfig } =
    configurationUtilities;

class HelpController {
    static instance: HelpController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (HelpController.instance) {
            return HelpController.instance;
        }
        HelpController.instance = this;
    }

    destroy() {
        if (HelpController.instance === this) {
            HelpController.instance = null;
        }
    }

    /**
     * @name helpPageDataProvider
     * @param page - Instance of Help Page
     * @type function
     * @description This function will provide the data required to populate the Help page as well as the contentful configurations.
     * @return {Promise}
     *
     * @author alwin-baby
     */
    helpPageDataProvider = (page: any) => {
        const LeftSection = page.LeftSection;
        const LeftSectionContent = LeftSection.tag('SectionContent')!;
        const RightSection = page.RightSection;
        const RightSectionContent = RightSection.tag('SectionContent')!;

        const navigationConfiguration = getNavigationConfig();
        const faqData = navigationConfiguration && getFaqData(navigationConfiguration);
        const link = navigationConfiguration && getFaqExternalLink(faqData.subTitle);

        const backgroundImageSrc = faqData.graphics?.[0]?.images?.[0]?.imageUrl || 'images/image1.png';
        const title = faqData.title;
        const descriptionArray: MediaPageSectionDescription[] = [
            { type: 'text', content: faqData.description },
            { type: 'link', content: faqData.subTitle },
        ];
        const buttonLabel = faqData.ctaData;

        page._backgroundImageSrc = backgroundImageSrc;
        LeftSectionContent._buttonDisabled = false;
        LeftSectionContent._containerMarginTop = 306;
        LeftSectionContent._wordWrapWidth = 699;
        LeftSectionContent._title = title;
        LeftSectionContent._buttonLabel = buttonLabel;
        LeftSectionContent._startIconSrc = 'images/arrow_back.png';
        LeftSectionContent._handleEnterPress = null;
        LeftSectionContent._primaryTextColor = getDefaultBodyTextPrimaryColor()?.code;
        LeftSectionContent._secondaryTextColor = getDefaultBodyTextSecondaryColor()?.code;
        LeftSectionContent._tertiaryTextColor = getDefaultBodyTextTertiaryColor()?.code;
        LeftSectionContent._showDeviceCode = false;
        LeftSectionContent._showCode = true;
        LeftSectionContent._enableResetCodeButton = true;
        LeftSectionContent._descriptionArray = descriptionArray;
        RightSectionContent._qrCodeWidth = 483;
        RightSectionContent._qrCodeHeight = 483;
        RightSectionContent._qrMarginRight = 235;

        return new Promise<void>(resolve => {
            if (link) {
                const qrOptions: QRCodeToDataURLOptions = {
                    errorCorrectionLevel: QrErrorCorrectionLevel.HIGH,
                    margin: 3,
                };
                generateQR(link, qrOptions).then(qrCode => {
                    page._showBackdrop = !!qrCode;
                    RightSectionContent._qrUrl = qrCode ? qrCode : '';
                    RightSectionContent._qrSkeletonLoading = false;
                    resolve();
                });
            }
            RightSectionContent._qrSkeletonLoading = false;
        });
    };
}

export default HelpController;
