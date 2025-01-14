import { UAParser } from 'ua-parser-js';
import { UserAgentDetails } from '@enlight-webtv/models';
/**
 * @name getUserAgentDetails
 * @type function/method
 * @description This function will get all the user agent details
 * @return {userAgentDetils} user agent details
 *
 * @author amalmohann
 */
const getUserAgentDetails = (): UserAgentDetails => {
    const parser = new UAParser(window.navigator.userAgent);
    const ua = parser.getResult();
    const userAgent: UserAgentDetails = {
        browserName: ua.browser.name,
        browserVersion: ua.browser.version,
        cpu: ua.cpu.architecture,
        deviceType: ua.device.type,
        deviceModel: ua.device.model,
        deviceVendor: ua.device.vendor,
        engineName: ua.engine.name,
        engineVersion: ua.engine.version,
        osName: ua.os.name,
        osVersion: ua.os.version,
        ua: ua.ua,
    } as UserAgentDetails;
    return userAgent;
};

export { getUserAgentDetails };
