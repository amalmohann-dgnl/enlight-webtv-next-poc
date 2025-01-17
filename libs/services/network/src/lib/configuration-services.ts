'use client'
import { AxiosResponse } from 'axios';
import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import {
    Platform,
    BaseConfiguration,
    EntriesRequestModel,
    UserAgentDetails,
    StorageKeys,
    ContentChangeRequestModel,
    ChangeResponse,
    DeviceCategory,
    TimeResponse,
    BuildType,
} from '@enlight-webtv/models';
import {
    commonUtilities,
    configurationUtilities,
    deviceUtilities,
    networkUtilities,
    userAgentUtilities,
    appUtilities,
    storageUtilities,
} from '@enlight-webtv/utilities';

//services

//utilities
const { getUserAgentDetails } = userAgentUtilities;
const { prepareParams } = networkUtilities;
const { getClientIdForConfig } = configurationUtilities;
const { isValidValue, extractValueFromParentheses } = commonUtilities;
const { getDeviceMake, getDeviceModel } = deviceUtilities;
const { getAppMetaData } = appUtilities;
const { getState } = storageUtilities;

/**
 * @name ConfigurationService
 * @type service class
 * @description This class will have all the network services that need to be used for configuration.
 *
 * @author amalmohann
 */
class ConfigurationService {
    static instance: ConfigurationService | null;
    private networkRequestor;
    //import.meta having type config issue.
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    private buildType = BuildType.Dev;
    private userAgent: UserAgentDetails = getUserAgentDetails();
    private param: EntriesRequestModel = {
        minimumBuildNumber: 1,
        deviceCategory: DeviceCategory.TV,
        platform: Platform.WebTv,
        deviceModel: getDeviceModel() || this.userAgent.deviceModel,
        deviceMake: getDeviceMake() || this.userAgent.deviceVendor,
        filtering: true,
        locale: 'en-US',
        buildType: this.buildType,
    } as EntriesRequestModel;

    constructor(create = false) {
        if (create) this.destroy();
        if (ConfigurationService.instance) {
            return ConfigurationService.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        ConfigurationService.instance = this;
    }

    destroy() {
        if (ConfigurationService.instance === this) {
            ConfigurationService.instance = null;
        }
    }

    /**
     * @name fetchEntries
     * @type service
     * @description This service will connect with the configuration server and fetch all the configurations.
     * This service is commonly known as the Entries API. This function will take params as input and return
     * response data.
     * @param {string} [locale] - locale of the cofiguration required.
     * @return {AxiosResponse<BaseConfiguration, any>}
     *
     * @author amalmohann
     */
    fetchEntries = async (data?: EntriesRequestModel) => {
        //update the build Number
        const appVersion = getAppMetaData()?.appVersion;
        // check the build number inside brackets 1.0.0(10)
        const buildNumberExtracted = extractValueFromParentheses(appVersion);

        // If a match is found, extract the number
        if (buildNumberExtracted) {
            this.param.minimumBuildNumber = Number(buildNumberExtracted[1]);
        }

        const response: AxiosResponse<BaseConfiguration, any> = await this.networkRequestor!.get('/config/entries', {
            params: prepareParams({
                ...this.param,
                ...(data && { ...data }),
            }),
        });
        //when contentful configuration fails to load
        if (response.status !== 200) {
            return response;
        }

        return response;
    };

    /**
     * @name checkForConfigChanges
     * @type service
     * @description This service will connect with the configuration server and check if any changes are made
     * to the existing configuration.
     * @return {AxiosResponse<, any>}
     *
     * @author amalmohann
     */
    checkForConfigChanges = async (): Promise<AxiosResponse<ChangeResponse, any> | null> => {
        //get checksum and clientID
        const checksum: string = await getState(StorageKeys.CHECKSUM);
        const clientId: string = await getClientIdForConfig();

        if (isValidValue(checksum) && isValidValue(clientId)) {
            //set the request payload
            const contentChangeRequest: ContentChangeRequestModel = {
                clientId: clientId,
                platform: Platform.WebTv,
                contentful: {
                    checksum: checksum,
                    queryStringParams: this.param,
                },
            };
            //fetch api
            const response: AxiosResponse<ChangeResponse, any> = await this.networkRequestor!.post('/content/change', contentChangeRequest);
            return response;
        }
        return null;
    };

    /**
     * @name getServerTime
     * @type function
     * @description this service will be used to get time serverTime and user country information
     * @return {Promise<TimeResponse | null>}
     *
     * @author anandpatel
     */
    getServerTime = async (): Promise<TimeResponse | null> => {
        try {
            //api call
            const response: AxiosResponse<any, any> = await this.networkRequestor!.get('/time', {
                params: {
                    platform: Platform.WebTv,
                },
            });
            return response.data;
        } catch (err) {
            console.error(err);
            return null;
        }
    };
}

export default ConfigurationService;
