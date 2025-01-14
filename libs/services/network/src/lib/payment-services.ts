import { AxiosResponse } from 'axios';
import { NetworkRequestor } from '@enlight-webtv/network';
import { SubscriptionResponse } from '@enlight-webtv/models';

/**
 * @name PaymentServices
 * @type service class
 * @description This class will have all the network services that need to be used for payments and subscription.
 *
 * @author alwin-baby
 */
class PaymentServices {
    static instance: PaymentServices | null;
    private networkRequestor;

    constructor(create = false) {
        if (create) this.destroy();
        if (PaymentServices.instance) {
            return PaymentServices.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        PaymentServices.instance = this;
    }

    destroy() {
        if (PaymentServices.instance === this) {
            PaymentServices.instance = null;
        }
    }

    subscriptionStatus = async () => {
        try {
            const response: AxiosResponse<SubscriptionResponse, any> = await this.networkRequestor!.get('subscription/status');
            return response;
        } catch (error) {
            return null;
        }
    };
}

export default PaymentServices;
