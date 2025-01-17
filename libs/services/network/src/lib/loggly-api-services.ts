/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  Platform,
  StorageKeys,
  UserAgentDetails,
  GeneralModuleErrorType,
  LogLevel,
  ModuleType,
  TypeToUICode,
  ProfileListData,
  CountryInfo,
  BuildType,
} from '@enlight-webtv/models';
import {
  logglyUtilities,
  userAgentUtilities,
  appUtilities,
  authUtilities,
  deviceUtilities,
  storageUtilities,
} from '@enlight-webtv/utilities';
import axios from 'axios';

//utilities
const { getIsAuthenticated } = authUtilities;
const { getUserAgentDetails } = userAgentUtilities;
const { getDeviceData } = logglyUtilities;
const { getDeviceCategory, getFormattedPlatformVersion } = deviceUtilities;
const { getAppVersionWithPrefix, getAppMetaData } = appUtilities;
const { getState } = storageUtilities;

// import env variables
//import.meta having type config issue.
const LOGGLY_API_KEY = '';
const LOGGLY_BASE_URL = '';

// @ts-ignore

/**
 * @name LogglyAPIServices
 * @type service class
 * @description This class will have all the api module log services that is to be sent to loggly.
 *
 * @author tonyaugustine
 */
export default class LogglyAPIServices {
  static instance: LogglyAPIServices | null;

  constructor(create = false) {
    if (create) this.destroy();
    if (LogglyAPIServices.instance) {
      return LogglyAPIServices.instance;
    }
    LogglyAPIServices.instance = this;
  }

  destroy() {
    if (LogglyAPIServices.instance === this) {
      LogglyAPIServices.instance = null;
    }
  }

  /**
   * @name sendLog
   * @type function/method
   * @param {any} errorInfo - This contains the data required to construct the log
   * @description function to construct the log which is to be sent to loggly
   * @return {void} - No return value.
   * @author tonyaugustine
   */
  async sendLog(errorInfo: any) {
    const appMetaData = getAppMetaData();
    const appName = appMetaData.appName;
    const appVersion = appMetaData.appVersion;
    // constructs the default log attributes
    const authAttributes = await this.initializeAuthAttributes();
    const stableAttributes = await this.initializeStableLogAttributes(
      appName,
      appVersion
    );
    const extraAttributes = this.initializeExtraAttributes();

    //contains the response data
    const apiError = errorInfo?.data?.responseData;
    //constructs the url
    const urlParams = new URLSearchParams(apiError.config?.params);
    const sendData = {
      request_url: `${apiError?.config?.baseURL}/${apiError?.config?.url}/?${urlParams}`,
      request_id: apiError?.response?.headers['x-amzn-requestid'],
      response_code: apiError?.response?.status,
      request_code: apiError?.request?.status,
      response_message:
        apiError?.response?.data?.errorMessage ?? apiError?.message,
      error_location: window?.location?.href,
    };
    const finalLog = {
      module: ModuleType.General,
      level: LogLevel.ERROR,
      type: GeneralModuleErrorType.APIError,
      code: TypeToUICode.APIError,
      mw_error_code: errorInfo?.errorCode || null,
      error_shown: false,
      debug_message: apiError?.message ?? null,
      retry_count: 0,
      ...stableAttributes,
      ...extraAttributes,
      ...authAttributes,
      api_error_info: { ...sendData },
    };

    //send post request to loggly
    axios.post(
      `${LOGGLY_BASE_URL}/${LOGGLY_API_KEY}/tag/${appName}/`,
      finalLog,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * @name initializeAuthAttributes
   * @type function/method
   * @description  - it constructs the auth related properties for the log
   * @return {void} - No return value
   *
   * @author tonyaugustine
   */
  async initializeAuthAttributes() {
    const isAuth = await getIsAuthenticated();

    //get user values if authenticated
    if (isAuth) {
      const userData = await getState(StorageKeys.USER_DATA);
      const authAttributes = {
        user_id: userData.userId ?? null,
        subscription_type: userData.subscription?.subscriptionType ?? null,
      };
      return authAttributes;
    } else {
      // returns default null values
      const authAttributes = { user_id: null, subscription_type: null };
      return authAttributes;
    }
  }

  /**
   * @name initializeExtraAttributes
   * @type function/method
   * @description  - it constructs extra error related properties related to the log
   * @return {void} - No return value
   *
   * @author tonyaugustine
   */
  initializeExtraAttributes() {
    // get page related attributes
    const pageURL = window.location.href;
    return {
      timestamp: new Date().toISOString(),
      event: null,
      page_url: pageURL,
    };
  }

  /**
   * @name initializeStableLogAttributes
   * @type function/method
   * @description  - it constructs the properties that are stable in nature
   * @return {void} - No return value
   *
   * @author tonyaugustine
   */
  async initializeStableLogAttributes(appName: string, appVersion: string) {

    //@ts-ignore
    const platformValue = window.Android
      ? getDeviceData().deviceType
      : Platform.WebTv;
    // retrieve session related data
    const sessionID = await getState(StorageKeys.SESSIONID);
    // retrieve device related data
    const deviceInfo = await getState(StorageKeys.DEVICEINFO);
    const userAgent: UserAgentDetails = getUserAgentDetails();

    const stableLogAttributes = {
      app_name: appName,
      app_version: getAppVersionWithPrefix(appVersion),
      //import.meta having type config issue.

      //@ts-ignore
      app_env: BuildType.Dev,
      browser: userAgent?.browserName,
      browser_version: userAgent?.browserVersion,
      device_brand: deviceInfo?.brand || null,
      device_model: getDeviceData().deviceModel,
      device_category: getDeviceCategory(),
      lang:
        (getState(StorageKeys.PROFILE) as ProfileListData)?.preferences
          ?.language ?? 'en-US',
      os_name: userAgent?.osName || null,
      os_version: getFormattedPlatformVersion() ?? userAgent?.osVersion ?? null,
      platform: platformValue,
      session_id: sessionID,
      country: (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryName,
    };
    return stableLogAttributes;
  }
}
