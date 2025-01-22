import axios from 'axios';
import {
  authUtilities,
  commonUtilities,
  configurationUtilities,
  deviceUtilities,
  userAgentUtilities,
  logglyUtilities,
  appUtilities,
  storageUtilities,
} from '@enlight-webtv/utilities';
import {
  ErrorLogData,
  SearchModuleData,
  SendLogParameterType,
  ErrorConfiguration,
  Platform,
  StorageKeys,
  UserAgentDetails,
  LogLevel,
  ModuleType,
  TypeToUICode,
  ProfileListData,
  CountryInfo,
  BuildType,
} from '@enlight-webtv/models';

//import utilities
const { generatePathFromErrorObject, isValidValue } = commonUtilities;
const {
  getConnectionType,
  getDeviceModel,
  isAndroid,
  getDeviceCategory,
  getFormattedPlatformVersion,
} = deviceUtilities;
const { getErrorByCode } = configurationUtilities;
const { getIsAuthenticated } = authUtilities;
const { getUserAgentDetails } = userAgentUtilities;
const { getDeviceData } = logglyUtilities;
const { getAppVersionWithPrefix, getAppMetaData } = appUtilities;
const { getState } = storageUtilities;

const IS_ANDROID = false;
//import env variables
const LOGGLY_API_KEY = '';
const LOGGLY_BASE_URL = '';
//eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore

/**
 * @name LogglyServices
 * @type service class
 * @description This class will have all the log services that is to be sent to loggly.
 *
 * @author tonyaugustine
 */

class LogglyServices {
  /**
   * @name sendLog
   * @type function/method
   * @param {SendLogParameterType} errorInfo - This contains the data required to construct the log
   * @description function to construct the log which is to be sent to loggly
   * @return {void} - No return value.
   * @author tonyaugustine
   */
  async sendLog(errorInfo: SendLogParameterType) {
    const appMetaData = getAppMetaData();
    const appName = 'appMetaData.appName';
    const appVersion = appMetaData.appVersion;
    // constructs the default log attributes
    const stableAttributes = await this.initializeStableLogAttributes(
      appName,
      appVersion
    );
    const authAttributes = await this.initializeAuthAttributes();
    const extraAttributes = this.initializeExtraAttributes(
      errorInfo.errorPathObject,
      errorInfo?.eventType ?? ''
    );

    //contains module related error data
    let errorData: object = {};

    //pass the data to the  module-error-generator function depending on the module
    switch (errorInfo.module) {
      case ModuleType.Search:
        errorData = await this.constructSearchModuleData(
          errorInfo.logLevel,
          errorInfo.data as SearchModuleData,
          errorInfo.errorCode!
        );
        break;
      case ModuleType.Authentication:
        errorData = await this.constructAuthenticationModuleErrorData(
          errorInfo.logLevel,
          errorInfo.data,
          errorInfo.errorCode ?? ''
        );
        break;
      case ModuleType.General:
        errorData = await this.constructGeneralModuleErrorData(
          errorInfo.logLevel,
          errorInfo.data,
          errorInfo.errorCode!
        );
        break;
      case ModuleType.Profile:
        errorData = await this.constructProfileModuleErrorData(
          errorInfo.logLevel,
          errorInfo.data,
          errorInfo.errorCode!
        );
        break;
      case ModuleType.Player:
        errorData = await this.constructPlayerModuleErrorData(
          errorInfo.data,
          errorInfo.errorCode,
          errorInfo.logLevel
        );
        break;
    }

    let apiErrorData = null;
    // Check if it contains api error info
    if (isValidValue(errorInfo?.apiErrorData)) {
      //contains the response data
      const apiError = errorInfo?.apiErrorData?.responseData;
      //constructs the url
      const urlParams = new URLSearchParams(apiError.config?.params);
      apiErrorData = {
        request_url: `${apiError?.config?.baseURL}/${apiError?.config?.url}/?${urlParams}`,
        request_id: apiError?.response?.headers['x-amzn-requestid'],
        response_code: apiError?.response?.status,
        request_code: apiError?.request?.status,
        response_message:
          apiError?.response?.data?.errorMessage ?? apiError?.message,
        error_location: window?.location?.href,
      };
    }

    //final log data that is required to be sent to loggly
    const logData = {
      ...stableAttributes,
      ...authAttributes,
      ...extraAttributes,
      ...errorData,
      action: errorInfo?.action ?? null,
      module: errorInfo?.module,
      error_shown: errorInfo?.errorShown,
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      ...(apiErrorData && {
        api_error_info: { ...apiErrorData },
        mw_error_code:
          errorInfo?.apiErrorData?.responseData?.response?.data?.errorCode ??
          errorInfo?.apiErrorData?.responseData?.response?.data?.error
            ?.errorCode,
      }),
    };

    // send post request to loggly
    axios.post(
      `${LOGGLY_BASE_URL}/${LOGGLY_API_KEY}/tag/${appName}/`,
      logData,
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  /**
   * @name constructPlayerModuleErrorData
   * @type function/method
   * @description function which is used to construct the error log for the player module
   * @param {LogLevel} logLevel - log level of the log
   * @param {ErrorLogData} data - object containing attributes to construct log
   * @param {string} errorCode - - contains the errorcode
   * @return {object} - data containing player log data
   *
   * @author gowripriyadileep
   */
  async constructPlayerModuleErrorData(
    data?: ErrorLogData,
    errorCode?: string,
    logLevel: LogLevel = LogLevel.WARNING
  ) {
    const errorData = await this.constructErrorLog(logLevel, data, errorCode);
    return errorData;
  }

  /**
   * @name constructAuthenticationModuleErrorData
   * @type function/method
   * @description function which is used to construct the error log for the authentication module
   * @param {LogLevel} logLevel - log level of the log
   * @param {any} data - object containing attributes to construct log
   * @param {string} errorCode - - contains the errorcode
   * @return {object} - data containing the authentication log data
   *
   * @author tonyaugustine
   */
  async constructAuthenticationModuleErrorData(
    logLevel: LogLevel,
    data: any,
    errorCode: string
  ) {
    const errorData = await this.constructErrorLog(logLevel, data, errorCode);
    return errorData;
  }

  /**
   * @name constructSearchModuleData
   * @type function/method
   * @description function which is used to construct the error log for the search module
   * @return {object} - data containing the search log data
   * @author gowripriyadileep
   */
  async constructSearchModuleData(
    logLevel: LogLevel,
    data: SearchModuleData,
    errorCode: string
  ) {
    const errorData = await this.constructErrorLog(logLevel, data, errorCode);
    return { ...errorData };
  }

  /**
   * @name constructGeneralModuleErrorData
   * @type function/method
   * @param {LogLevel} logLevel - defines the log level
   * @param {string} errorCode - corresponding error code of the error
   * @description function which is used to construct the error log for the general module
   * @return {object} - data containing the general log data
   * @author gowripriyadileep
   */
  async constructGeneralModuleErrorData(
    logLevel: LogLevel,
    data: any,
    errorCode: string
  ) {
    const errorData = await this.constructErrorLog(logLevel, data, errorCode);
    return errorData;
  }

  /**
   * @name constructProfileModuleErrorData
   * @type function/method
   * @param {LogLevel} logLevel - defines the log level
   * @param {string} errorCode - corresponding error code of the error
   * @description  - it constructs the profile related properties for the log
   * @return {object} - data containing the profile module log data
   *
   * @author tonyaugustine
   */
  async constructProfileModuleErrorData(
    logLevel: LogLevel,
    data: any,
    errorCode: string
  ) {
    const errorData = await this.constructErrorLog(logLevel, data, errorCode);
    return errorData;
  }

  /**
   * @name getUICode
   * @param {string} errorCode - This contains the errorcode
   * @description it returns the UI code corresponding to the typeCode
   * @return {string | null} returns the UI code, if not found returns null
   * @author tonyaugustine
   */
  getUICode(errorCode = '') {
    let UICode: string | null = null;
    // returns null if error code is an empty string or a falsy value
    if (!errorCode) {
      return null;
    }
    // gets UI code from contentful configuration
    UICode = getErrorByCode(errorCode?.toString())?.code ?? null;
    if (UICode) {
      return UICode;
    }
    // gets the UI code from TypeToUICode enum
    if (Object.keys(TypeToUICode).includes(errorCode as any)) {
      UICode = TypeToUICode[errorCode as keyof typeof TypeToUICode];
      return UICode;
    } else {
      return null;
    }
  }

  /**
   * @name constructErrorLog
   * @type function/method
   * @param {string} logLevel - contains log level of the log
   * @param { ErrorLogData} data - contains errorlog data
   * @param {string} errorCode - contains the errorcode
   * @description function which is used to construct the log that is used to sent to loggly
   * @return {void} - No return value
   * @author tonyaugustine
   */
  async constructErrorLog(
    logLevel: string = LogLevel.INFO,
    data?: ErrorLogData,
    errorCode?: string
  ) {
    // get error data from contentful config using the error code
    let contentfulDataError: ErrorConfiguration | undefined;
    if (errorCode) {
      contentfulDataError = getErrorByCode(errorCode);
    } else if (data?.responseData?.errorCode) {
      contentfulDataError = getErrorByCode(
        data?.responseData?.errorCode?.toString()
      );
    }

    let level = logLevel;
    let errorDescription = null;
    let typeCode = null;
    if (contentfulDataError) {
      typeCode = contentfulDataError.type;
      errorDescription = contentfulDataError.description;
      const tempLevel: string = contentfulDataError.loggingLevel || logLevel;
      level = tempLevel[0]?.toUpperCase() + tempLevel?.slice(1);
      level = level ?? tempLevel;
    }

    //get the UI code from type code
    const UICode = this.getUICode(
      errorCode ?? data?.responseData?.errorCode?.toString() ?? ''
    );

    // check if the log level is an error
    if (logLevel == LogLevel.ERROR) {
      const middlewareErrorCode = data?.responseData?.errorCode || null;
      // constructs the error log data
      const logData = {
        mw_error_code: middlewareErrorCode,
        code: UICode,
        error_message: errorDescription,
        type: typeCode,
        level: level,
        ...data?.infoData,
      };
      return logData;
    }

    // constructs the error log data
    const logData = {
      code: UICode,
      type: typeCode,
      level: level,
      ...data?.infoData,
    };
    return logData;
  }

  /**
   * @name initializeExtraAttributes
   * @type function/method
   * @param {Error} errorObj - it is an Error object instance required to construct the  file error path
   * @param {string} eventType - type of the event
   * @description  - it constructs extra error related properties related to the log
   * @return {void} - No return value
   *
   * @author tonyaugustine
   */
  initializeExtraAttributes(errorObj: Error, eventType = '') {
    // generate the error location path
    const errorPath = generatePathFromErrorObject(errorObj);

    // get page related attributes
    const pageURL = window.location.href;
    return {
      timestamp: new Date().toISOString(),
      sourcelocation: errorPath?.slice(2).trim(),
      event: eventType,
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
    const platformValue = IS_ANDROID
      ? getDeviceData().deviceType
      : Platform.WebTv;
    // retrieve session related data
    const sessionID = await getState(StorageKeys.SESSIONID);
    // retrieve device related data
    const deviceInfo = await getState(StorageKeys.DEVICEINFO);
    const connectionType = getConnectionType()?.toString();
    const userAgent: UserAgentDetails = getUserAgentDetails();

    const stableLogAttributes = {
      app_name: appName,
      app_version: getAppVersionWithPrefix(appVersion),
      //import.meta having type config issue.
      //eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      app_env: BuildType.Dev,
      browser: userAgent?.browserName,
      browser_version: userAgent?.browserVersion,
      device_brand: deviceInfo?.brand,
      device_model: getDeviceModel(),
      device_category: getDeviceCategory(),
      lang:
        (getState(StorageKeys.PROFILE) as ProfileListData)?.preferences
          ?.language ?? 'en-US',
      os_name: userAgent?.osName || null,
      network: connectionType,
      os_version: getFormattedPlatformVersion() ?? userAgent?.osVersion ?? null,
      platform: platformValue,
      session_id: sessionID,
      country: (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryName,
    };

    return stableLogAttributes;
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
    const isAuthenticated = await getIsAuthenticated();
    // return auth related attributes if the user is logged in
    if (isAuthenticated) {
      const userData = await getState(StorageKeys.USER_DATA);
      const authAttributes = {
        user_id: userData?.userId,
        subscription_type: userData?.subscription?.subscriptionType,
      };
      return authAttributes;
    } else {
      // returns default null values
      const authAttributes = { user_id: null, subscription_type: null };
      return authAttributes;
    }
  }
}

export default LogglyServices;
