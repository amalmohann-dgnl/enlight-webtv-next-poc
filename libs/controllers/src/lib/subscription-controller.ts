import { configurationUtilities, pageUtilities, commonUtilities } from '@enlight-webtv/utilities';
import { FeatureRevenue, Features, MediaPageSectionDescription, QrErrorCorrectionLevel } from '@enlight-webtv/models';
import { QRCodeToDataURLOptions } from 'qrcode';

//fetch the utility functions
const { getSubscriptionPageData } = pageUtilities;
const { getDefaultBodyTextPrimaryColor, getDefaultBodyTextSecondaryColor, getDefaultBodyTextTertiaryColor, getFeatureByKey } = configurationUtilities;
const { generateQR } = commonUtilities;

class SubscriptionController {
    static instance: SubscriptionController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (SubscriptionController.instance) {
            return SubscriptionController.instance;
        }
        SubscriptionController.instance = this;
    }

    destroy() {
        if (SubscriptionController.instance === this) {
            SubscriptionController.instance = null;
        }
    }

    /**
     * @name subscriptionPageDataProvider
     * @param page - Instance of Subscription Page
     * @type function
     * @description This function will provide the data required to populate the Subscription page as well as the
     * contentful configurations.
     * @return {Promise}
     *
     * @author alwin-baby
     */
    subscriptionPageDataProvider = (page: any) => {
        const LeftSection = page.LeftSection;
        const LeftSectionContent = LeftSection.tag('SectionContent')!;
        const RightSection = page.RightSection;
        const RightSectionContent = RightSection.tag('SectionContent')!;

        const featureRevenueData = getFeatureByKey(Features.FeatureRevenue) as FeatureRevenue;
        const subscriptionPageData = getSubscriptionPageData(featureRevenueData);

        const backgroundImageSrc = subscriptionPageData.graphics?.[0]?.images?.[0]?.imageUrl || '';
        const title = subscriptionPageData.title || '';
        const descriptionArray: MediaPageSectionDescription[] = [
            { type: 'text', content: subscriptionPageData.subTitle },
            { type: 'text', content: subscriptionPageData.description },
        ];
        const buttonLabel = subscriptionPageData.ctaData || '';

        page._backgroundImageSrc = backgroundImageSrc;
        page._showBackdrop = true;
        LeftSectionContent._buttonDisabled = false;
        LeftSectionContent._title = title;
        LeftSectionContent._descriptionArray = descriptionArray;
        LeftSectionContent._buttonLabel = buttonLabel;
        LeftSectionContent._enableResetCodeButton = true;
        LeftSectionContent._startIconSrc = 'images/arrow_back.png';
        LeftSectionContent._handleEnterPress = page._handleBackPress;
        LeftSectionContent._primaryTextColor = getDefaultBodyTextPrimaryColor()?.code;
        LeftSectionContent._secondaryTextColor = getDefaultBodyTextSecondaryColor()?.code;
        LeftSectionContent._tertiaryTextColor = getDefaultBodyTextTertiaryColor()?.code;
        LeftSectionContent._showDeviceCode = false;

        return new Promise<void>(resolve => {
            const subscription_link = subscriptionPageData.data;
            const getQrCode = async () => {
                if (subscription_link) {
                    const qrOptions: QRCodeToDataURLOptions = {
                        errorCorrectionLevel: QrErrorCorrectionLevel.HIGH,
                        margin: 3,
                    };
                    const qrCode = await generateQR(subscription_link, qrOptions);
                    RightSectionContent._qrUrl = qrCode;
                }
                RightSectionContent._qrSkeletonLoading = false;
                LeftSectionContent._showCode = true;
            };
            getQrCode();
            resolve();
        });
    };
}

export default SubscriptionController;
