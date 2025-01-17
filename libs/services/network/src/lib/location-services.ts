'use client'
import { CountryInfo, Project, StorageKeys } from '@enlight-webtv/models';
import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import ConfigurationService from './configuration-services';
import { storageUtilities } from '@enlight-webtv/utilities';
import { AxiosResponse } from 'axios';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const projectName: Project = Project.VIDEOTRON;

//import utilities
const { getState } = storageUtilities;
//import services
const { getServerTime } = new ConfigurationService();

//import axios instance
const networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();

class LocationServices {
    /**
     * @name getLocation
     * @type method
     * @description this function returns the response of after calling location api
     * @returns {Promise<AxiosResponse<any, any>>}
     *
     * @author tonyaugustine
     */
    getLocation = async (): Promise<AxiosResponse<any, any>> => {
        const response = await networkRequestor.get('/location');
        return response;
    };

    /**
     * @name getCurrentCountryInfo
     * @type function
     * @description This functions returns the country code of the current location of user
     * @param {boolean} [checkCacheValue] - If the cached valued from stroage is to be used or not
     * @returns {Promise<CountryInfo | null>} - Retuns null if country code is unable to be found
     *
     * @author tonyaugustine
     */
    getCurrentCountryInfo = async (checkCacheValue = false): Promise<CountryInfo | null> => {
        if (checkCacheValue) {
            const countryInfo = getState(StorageKeys.COUNTRY_INFO);
            if (countryInfo) return countryInfo;
        }

        if (projectName === Project.VIDEOTRON) {
            return { countryCode: 'fr', countryName: 'France' };
        }

        if (projectName === Project.CMGO) {
            const response = await this.getLocation();
            if (response.status === 200)
                return { countryCode: response?.data?.countryCode?.toString() ?? null, countryName: response?.data?.country?.toString() ?? null };
        } else {
            const timeResponse = await getServerTime();
            return { countryCode: timeResponse?.countryCode?.toString() ?? null, countryName: timeResponse?.country?.toString() ?? null };
        }

        return null;
    };
}

export default LocationServices;
