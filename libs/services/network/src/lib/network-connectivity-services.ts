'use client'
import { AxiosErrCode } from '@enlight-webtv/models';
import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import { AxiosError } from 'axios';

/**
 * @name NetworkConnectivityServices
 * @type class
 * @description This controller will have all the controller functions related to the favourites
 *
 * @author amalmohann
 */
class NetworkConnectivityServices {
    static instance: NetworkConnectivityServices | null;
    private networkRequestor;

    constructor(create = false) {
        if (create) this.destroy();
        if (NetworkConnectivityServices.instance) {
            return NetworkConnectivityServices.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        NetworkConnectivityServices.instance = this;
    }

    destroy() {
        if (NetworkConnectivityServices.instance === this) {
            NetworkConnectivityServices.instance = null;
        }
    }

    /**
     * @name checkInternetConnection
     * @type function
     * @description Checks the availability of the internet connection by making a request to 'https://api-preprod.rally.tv/health'.
     * @return {boolean} - Returns true if the internet connection is available; otherwise, returns false.
     * @author anandpatel
     */
    checkInternetConnection = async () => {
        try {
            const response = (await this.networkRequestor!.get('health')) as AxiosError;
            const isOnline = response.code !== AxiosErrCode.ERR_NETWORK && navigator.onLine;
            if (!isOnline) {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                window.healthApiErrorResponseData = response;
            }
            return isOnline;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            window.healthApiErrorResponseData = error;
            return false;
        }
    };
}

export default NetworkConnectivityServices;
