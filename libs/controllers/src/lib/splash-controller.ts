'use client'

/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  AnalyticsServices,
  LogglyServices,
} from '@enlight-webtv/analytics-services';
import {
  ActionType,
  BaseConfiguration,
  ErrorConfigurationType,
  ErrorPageData,
  FeatureUserManagement,
  Features,
  IdentityProviders,
  Routes,
  StorageKeys,
  GeneralModuleErrorType,
  LogLevel,
  LogType,
  ModuleType,
  FeatureProfileManagement,
  Project,
  TimeResponse,
  ErrorConfiguration,
  EventType,
  CountryInfo,
  HTMLEvents,
} from '@enlight-webtv/models';
import {
  AuthServices,
  ConfigurationService,
  LocationServices,
  NetworkConnectivityServices,
  PaymentServices,
} from '@enlight-webtv/network-services';
import {
  appUtilities,
  commonUtilities,
  configurationUtilities,
  deviceUtilities,
  errorUtilities,
  htmlUtilities,
  projectUtilities,
  storageUtilities,
  timeUtilities,
} from '@enlight-webtv/utilities';
import { handleAppConfigFailure } from './error-controller';
import { setupBasicApplication, setup } from './application-setup-controller';
import { AxiosResponse } from 'axios';
import { redirect } from 'next/navigation';
import { PlayerContinueWatchingServices } from '@enlight-webtv/player-services';
import { preFetchHomepageContents } from './catalog-controller';

const { getAppMetaData } = appUtilities;
const { has24HoursPassed } = timeUtilities;
const { getProjectConfig } = projectUtilities;
const { getState, setState } = storageUtilities;
const { addWindowEventListener } = htmlUtilities;
const { initializeDeviceDetails } = deviceUtilities;
const {
  generateSessionID,
  isValidValue,
  extractValueFromParentheses,
  generateEngageClientID,
} = commonUtilities;
const {
  getErrorByCode,
  getMaintenanceModeConfig,
  getAuthConfigurations,
  getFeatureByKey,
  shouldUpdateConfiguration,
  getRequiredAnalyticsServices,
} = configurationUtilities;
const { getErrorPopActionHandling } = errorUtilities;
// const { checkIsVideoSplash } = splashUtilities;

//import services
const { sendLog } = new LogglyServices();
const { getLocation } = new LocationServices();
const { subscriptionStatus } = new PaymentServices();
const { sendMixPanelEvent } = new AnalyticsServices();
const { getCurrentCountryInfo } = new LocationServices();
const { refreshToken, getIsAuthenticated } = new AuthServices();
const { getServerTime, fetchEntries } = new ConfigurationService();
const { checkInternetConnection } = new NetworkConnectivityServices();
const { setRecentlyWatchingContents } = new PlayerContinueWatchingServices();

/**
 * @name _prepareRoute
 * @type function/method
 * @description this function checks if the user is authenticated and the login method.
 *
 * @author amalmohann
 */
const prepareRoute = async () => {
  const isAuthenticated = await getIsAuthenticated();

  // get the login info
  const loginInfo = getState(StorageKeys.LOGIN_INFO);
  if (loginInfo) {
    //get user management and profile configuration
    const featureUserManagement: FeatureUserManagement = getFeatureByKey(
      Features.FeatureUserManagement
    ) as FeatureUserManagement;
    const loginMethod = featureUserManagement.loginMethods[0];
    const profileManagement = getFeatureByKey(
      Features.featureProfileManagement
    ) as FeatureProfileManagement;

    if (
      loginMethod &&
      (loginMethod === IdentityProviders.VDT ||
        loginMethod === IdentityProviders.COGNITO)
    ) {
      const authConfigurations = getAuthConfigurations();
      loginInfo && refreshToken(loginInfo, authConfigurations!);
      return;
    }
  } else if (isAuthenticated) {
    _getUserAccountData();
  }
  if (!isAuthenticated) {
    redirect(Routes.LOGIN);
  }

  _proceedNavigation();
};

/**
 * @name _checkAppGeoRestricted
 * @type function/method
 * @description this function checks if the app is available at this location
 *
 * @author tonyaugustine
 */
export const _checkAppGeoRestricted = async (icon?: any) => {
  // check if geo-restriction check needs to be made for the current project
  let isAppRestricted = false;
  let geoRestrictionErrorConfig: ErrorConfiguration | undefined;
  const checkAppGeoRestriction =
    (getProjectConfig as any)()?.[Project.VIDEOTRON]?.checkAppGeoRestriction;
  if (!checkAppGeoRestriction) return false;

  //call location api to check if app is geo-restricted. If yes, it returns the error config.Else false
  const response = await getLocation();

  if (response && response.status !== 200) {
    const errorConfig = configurationUtilities.getErrorByCode(
      response?.data?.error?.errorCode?.toString()
    );
    if (
      isValidValue(errorConfig) &&
      errorConfig?.type === ErrorConfigurationType.APP_GEO_RESTRICTED
    ) {
      isAppRestricted = true;
      geoRestrictionErrorConfig = errorConfig;
    }
  }

  if (isAppRestricted) {
    //construct error page data
    const data = {
      title: geoRestrictionErrorConfig?.title,
      description: geoRestrictionErrorConfig?.description,
      logoSrc: icon,
      errorCode: geoRestrictionErrorConfig?.code,
      buttons: [
        {
          label: geoRestrictionErrorConfig?.primaryActionLabel,
          handleEnterPress: getErrorPopActionHandling(
            geoRestrictionErrorConfig?.primaryActionType ?? ActionType.EXIT
          ),
        },
      ],
    } as ErrorPageData;

    //send geo-restriction error log
    sendLog({
      module: ModuleType.General,
      logType: LogType.ERROR,
      errorPathObject: new Error(),
      logLevel: LogLevel.WARNING,
      errorShown: true,
      errorCode: GeneralModuleErrorType.AppGeoRestricted,
    });

    //route to error page
    redirect(Routes.ERROR);
  }
  return false;
};

/**
 * @name _isSubscribed
 * @type function/method
 * @description this function checks if the user has an active subscription.
 *
 * @author alwin-baby
 */
const _isSubscribed = async (): Promise<boolean> => {
  const subscriptionStatusResponse = await subscriptionStatus();
  const isSubscribed =
    !!subscriptionStatusResponse?.data?.entitlement?.subscriptionStatus;
  return isSubscribed;
};

/**
 * @name checkMaintenanceMode
 * @type function/method
 * @description this function checks if the app is in maintenance mode or not
 *
 * @author anandpatel
 */
const checkMaintenanceMode = (icon: any, version: string) => {
  const maintenanceConfig = getMaintenanceModeConfig();
  // check the build number inside brackets 1.0.0(10)
  const buildNumberExtracted = extractValueFromParentheses(version);

  // If a match is found, extract the number
  let buildNumber;
  if (buildNumberExtracted) {
    buildNumber = Number(buildNumberExtracted[1]);
  }

  const showForceUpdate =
    !!maintenanceConfig?.showForceUpdate &&
    buildNumber &&
    buildNumber < maintenanceConfig?.minimumBuildNumber;

  if (maintenanceConfig?.showMaintenanceMessage || showForceUpdate) {
    const errorConfigType = showForceUpdate
      ? ErrorConfigurationType.APP_FORCE_UPDATE
      : ErrorConfigurationType.APP_MAINTENANCE;
    const errorConfig = getErrorByCode(errorConfigType);
    const data = {
      title: errorConfig?.title,
      description: errorConfig?.description,
      logoSrc: icon,
      errorCode: errorConfig?.code,
      buttons: [
        {
          label: errorConfig?.primaryActionLabel,
          handleEnterPress: getErrorPopActionHandling(
            errorConfig?.primaryActionType || ActionType.EXIT,
            ErrorConfigurationType.APP_FORCE_UPDATE
          ),
        },
      ],
    } as ErrorPageData;

    //send maintenance log
    sendLog({
      module: ModuleType.General,
      logType: LogType.ERROR,
      errorPathObject: new Error(),
      logLevel: LogLevel.WARNING,
      errorShown: true,
      errorCode: GeneralModuleErrorType.AppMaintenance,
    });
    redirect(Routes.ERROR);
    return true;
  }
  return false;
};

/**
 * @name _getUserData
 * @type function/method
 * @description this function will get the user related data.
 *
 * @author amalmohann
 */
export const _getUserAccountData = async () => {
  //get the recently watched contents
  const [isSubscribed] = await Promise.all([
    _isSubscribed(),
    setRecentlyWatchingContents(),
    // preFetchHomepageContents(),
  ]);
  //set the user subscribed data
  setState(StorageKeys.IS_USER_SUBSCRIBED, isSubscribed);
  _proceedNavigation();
};

/**
 * @name _proceedNavigation
 * @type function/method
 * @description this function checks if navigation is possible and redirects to the Navigation Route.
 *
 * @author amalmohann
 */
export const _proceedNavigation = () => {
  //check if navigable to homepage
  // @ts-ignore
  if (window._canNavigate) {
    //route to home page
    redirect('/home');
    return;
  }
  //set the navigable if the api call is slow.
  // @ts-ignore
  window._canNavigate = true;
};

/**
 * @name initializeBooting
 * @type function/method
 * @description This function will be called for the booting of the application.
 * @param {Promise<void>}
 *
 * @author amalmohann
 */

export const initializeBooting = async () => {
  addWindowEventListener(HTMLEvents.BEFORE_UNLOAD, () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    if (window?.has_session_ended === false) {
      sendMixPanelEvent(
        EventType.SESSION_END,
        {
          session_duration:
            Math.round(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              (Date.now() - Number(window.sessionStartTime)) / 60000
            ) ?? 0,
        },
        false
      );
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      window.has_session_ended = true;
    }
  });

  const appVersion = getAppMetaData().appVersion;
  // Initialize the device utilities
  initializeDeviceDetails();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  window.has_session_ended = false;

  // This will generate the sessionID and store in the local storage
  generateSessionID();
  // This will generate a unique client ID similar to Engage SDK implementation
  generateEngageClientID();

  // get the server time data and current country and save it to storage
  const timeData = getState(StorageKeys.SERVER_TIME) as TimeResponse;
  let countryCode: string | null = null;
  let countryName: string | null = null;
  let countryInfo: CountryInfo | null = null;

  if (
    !timeData ||
    has24HoursPassed((timeData?.time as unknown as number) || 0)
  ) {
    const timeResponse = await getServerTime();
    setState(StorageKeys.SERVER_TIME, timeResponse);
    countryCode = timeResponse?.countryCode ?? null;
    countryName = timeResponse?.country ?? null;
  }

  //get country code from location api if it is not available fom time api
  if (!countryCode || !countryName) {
    countryInfo = await getCurrentCountryInfo();

    if (countryInfo?.countryCode) countryCode = countryInfo.countryCode;
    if (countryInfo?.countryName) countryName = countryInfo?.countryName;
  }

  setState(StorageKeys.COUNTRY_INFO, {
    countryCode: countryCode ?? null,
    countryName: countryName ?? null,
  });

  if (!countryName || !countryCode) {
    console.warn('Unable to get country code');
    if (getProjectConfig()?.['videotron']?.isCountryCodeMandatory) {
      handleAppConfigFailure();
      return Promise.resolve();
    }
  }

  const storedAutoPlayValue = getState(StorageKeys.AUTO_PLAY_VIDEO);
  setState(StorageKeys.AUTO_PLAY_VIDEO, storedAutoPlayValue ?? true);

  //check for configuration changes
  const [entries, config]: [AxiosResponse<BaseConfiguration, any>, any] =
    await Promise.all([fetchEntries(), getState(StorageKeys.CONFIG)]);

  if (entries?.status !== 200) {
    handleAppConfigFailure();
    return Promise.resolve();
  }

  const shouldUpdateConfig = await shouldUpdateConfiguration({
    checksum: entries?.data?.checksum,
  });
  if (!shouldUpdateConfig && isValidValue(config)) {
    setupBasicApplication(config);
  } else {
    //fetch configuration and setup application
    try {
      await setup(entries?.data);
    } catch (e) {
      console.error(e);
      handleAppConfigFailure();
      return Promise.resolve();
    }
  }

  // Not required any more as geo-block implementation is handled at server level
  //check if app is allowed at this geo-location
  // if (await this._checkAppGeoRestricted()) return;

  // check if the app is under maintenance or not
  if (checkMaintenanceMode(null, appVersion)) return;

  // Retrive the required Analytics integration for the project from config
  const requiredAnalyticsServices = getRequiredAnalyticsServices();
  AnalyticsServices.requiredAnalyticsServices = requiredAnalyticsServices;
  setState(StorageKeys.ANALYTICS_SERVICES, requiredAnalyticsServices);

  //send session start analytics log
  sendMixPanelEvent(
    EventType.SESSION_START,
    { entry_point: 'App Launch' },
    false
  );

  // attaching event listener for No Network
  window.addEventListener('offline', () => checkInternetConnection());

  prepareRoute();
  return Promise.resolve();
};
