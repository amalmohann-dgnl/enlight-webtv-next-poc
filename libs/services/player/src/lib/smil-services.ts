import { ProfileListData, SMILRequest, StorageKeys, SMILConstructionData, CountryInfo } from '@enlight-webtv/models';
import { playerUtilities, projectUtilities, storageUtilities } from '@enlight-webtv/utilities';
import { v4 as uuidv4 } from 'uuid';

//utilities
const { getState } =storageUtilities;
const { getProjectSMILUrl } = projectUtilities;
const { preparePlaybackAuthenticationToken } = playerUtilities;

class SMILServices {
    static instance: SMILServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (SMILServices.instance) {
            return SMILServices.instance;
        }
        SMILServices.instance = this;
    }

    destroy() {
        if (SMILServices.instance === this) {
            SMILServices.instance = null;
        }
    }

    /**
     * @name prepareSMILUrl
     * @type function/method
     * @description This function will parse the string to Playback Data
     * @param {string} streamUrl - string that need to be parsed
     * @return {Promise<SMILRequest>} - smil request data
     *
     * @author amalmohann
     */
    prepareSMILUrl = async (streamUrl: string, formats = 'MPEG-DASH+none'): Promise<SMILRequest> => {
        //create auth token
        const authorization = (await preparePlaybackAuthenticationToken()) ?? '';
        const profile: ProfileListData = getState(StorageKeys.PROFILE);
        const userId: string = await getState(StorageKeys.USER_ID);
        const uuid = uuidv4();

        const smilConstructionData: SMILConstructionData = {
            clientId: uuid,
            language: profile?.preferences.language,
            locale: getState(StorageKeys.LOCALE),
            region: (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode,
            maxParentalRatings: profile?.maxParentalRatings?.[0] ?? '',
            format: 'SMIL',
            formats,
            tracking: true,
            userId,
        };

        const smilUrl = getProjectSMILUrl(streamUrl, smilConstructionData);

        //Set the return object
        const smilRequest: SMILRequest = {
            smilUrl: smilUrl,
            authorization: authorization,
        };

        return smilRequest;
    };
}

export default SMILServices;
