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


  setState(StorageKeys.LOGIN_INFO,{"LoginMode":"vdt","time":1738572168704,"firstName":null,"lastName":null,"gender":null,"subscription":{"source":"VIDEOTRON","subscriptionType":"BASIC","customerType":"CLUB-ILLICO-SOLO"},"token":"eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiJyV19leFg0eHhhYTNXMkdhLzRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NSIsImlzcyI6IjEiLCJleHAiOjE3Mzg2NTg1NjgsImlhdCI6MTczODU3MjE2ODIwOSwianRpIjoiYTEyODliNTUtOTJmYS00M2E5LWJjYzQtZjgxNWI2NWE4ZjJiIiwiZGlkIjoicldfZXhYNHh4YWEzVzJHYSIsInVubSI6IjRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NSIsImN0eCI6IntcInVzZXJOYW1lXCI6XCI0ZmJjZDMyYi1iYzVlLTRmNWUtOTY0Ni1lNWRlMzkzYzcyNDVcIixcImF0dHJpYnV0ZXNcIjp7XCJ1c2VySURcIjpcIjRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NVwiLFwidXNlclR5cGVcIjpcIkNMVUItSUxMSUNPLVNPTE9cIixcImVudGl0bGVtZW50XCI6XCJCQVNJQ1wiLFwic291cmNlXCI6XCJWSURFT1RST05cIixcInN1YnNjcmlwdGlvblN0YXR1c1wiOlwiQUNUSVZFXCIsXCJwbGF0Zm9ybVwiOlwib3RoZXJcIn19XG4iLCJvaWQiOiIyNzA3NTcwMjIxIn0.lcZC6jAM6mpujuUolEUS7ErAoO_mOJ46sPLJoQwBEuLDYlsNycVlEivh2k1FhqE0i0VXqkUZjGYfz5D4MWAdS6oYDvUWYcojdXJec-4ABs_EZu1xgwLjzW1oahcpTsMcnSVtUnoKQLaB4yxfzFNAmT-iL9uyWhXCw8DTemDkTctqeSzeLRiWfZsEB9AkVGab-wQcCfHY4PlBUVk7AY-Vn7Et4gVFZNv-4IZV9xKYrBZE4igadjlGbOZ6ib8zhbzLkdsfCrXAQTf48X_7qU6D8ZRkUVLJz2qrhR_efOwXG_PjyGY8rFFfyCL7Rlu57RKl46t-t3zBx3ET0qKEAEJUYQ","userId":"4fbcd32b-bc5e-4f5e-9646-e5de393c7245","userName":"4fbcd32b-bc5e-4f5e-9646-e5de393c7245","authInfo":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWZyZXNoVG9rZW4iOiJleUpqZEhraU9pSktWMVFpTENKbGJtTWlPaUpCTWpVMlIwTk5JaXdpWVd4bklqb2lVbE5CTFU5QlJWQWlmUS5yeXFheUQtXy01cWhrTzdnb1k5UFpjNFh1M1k3NWotQTFLR1FKM1NucS1JVVlrSV9fZHM3ZXQ3QzZRdjJuLUpyZmZack9qcV8wekpyZ1lkSDdaeGk4dzNCNE1ZNUxlMVZTV0lQSVp5b0VYb3pYcXc5U005S1lXNEZhdHhDMVUwam02ZE8xdTZmOHdVaTJ3bG5hM3pnVUgzUEFFdnA2WFcyeDZidl9XUUZCbnZvUllvQ1A2SzMzaG12NGI1TTl5OF9JR0tmT2Y1Z3dPZ1ZPOHM1MS1COEJRRHp0TFFZMVhpM3VqZ1JjM3hSamFCWWNSdzRNazdPaW8xM1Y3bTRXRDBscVVockxuV1RBMHBCdG5HbVBqZndDb0Z3OW9qMTF6c0pyMXUtZzJfU2t0bWI1ZVpWTTJ6Y3V3NVQ0bktlU05icC1ZNHRDemREMHNkMHdIa25LM0VvbEEuUnhTc2poY3k5c0RHMnFmei5WWDRIbzFKeTNjMHR1TXMxWm5MMmhRS2tuZFY3RjdFYU9QUTlkMm9RaEVkRk9aRjdfZGJ2REE4RWIyTFVaZ2FJZV9IY1BpYkljZXlIemZoazY1czFTRFozc0tDNXltaTkwSmhKOFVIa2x1cUoyeTcxdGZUalN6YTVFZm5wbjdvWjV4YTFtaXd4R1lmckxxZm5RaHgxdHF5RDJKdU5OVzJBa3NvcWVGZ0VJdDlab29ERG15N3VMM0N1eGd4ZzJic1laNkp3d2VnVEJDR09mak02LVdYaW9Qb0s0dnEwVmRvazJyWFY2TENSWXhZSmtmaklwUVk5WXhWX0twRGl5VDR6OHFjeVVsSjc5bGplM3RzUW9YZWN1TFRGcS1kRER1aFRkZEtCQjgtblpjSzM0cTAyRmR5RGJtUmxfamZOUEk5ZTdwcUF0SS1zbWNoXzczTV9Xc3BaYkNCNVBaaU9QZVJaRkxzLThUOW1BNjJCQkk3UWNkZ1ZrRnlxenQ5Mmw5aXRiOG9IakZHbU8tLW5ja0RBYkM1dG9JME9nSjJZdUZ4YVN4Qi1qTkV5Q1o2UWwxREgxMnpqR0d5Q2xyVUQ2ay1HTFZzcVE5WG5RY3lERXJJQUVDQ3B6ZktFV0FOZ1ZrTl92ZE9heGZKcmtWLXkybVl2ZGo5aEh3WGRQN1JBYUdjN0czNUJXbGNPX1dRSWFKVzhIS0RRQUtocFVfZkZmOHdkUHJjZDdmcjY5eUU4cmxudTdkQnQ0dzBCUUFqOElQdFA1OXIzeXpNbHB0WV9ramRoRmRVOXlDckJnZ3Q1bXFySHFSalBQWFlVc2JTYllsakFHV0h2MWtvX18xX3FKYk9Nc2tXTWYwdGNFZHRoa0V4MUtPcjdrU3pRcVVnRlNUakhIbDhVd195S1BKU1RnaDVWOW04bFA1dXlBMHREYXpCY2lxdGY5YzlSSDhvSDR5T3BreG91UzhPOXprZ2tGMkdmdmNQcWk5eUlWZjZJUXlQRmlhMmZhM3lFUUxXM3M0Umxra0hzR0NRRU1hNjhTRkM3RG1iaXJJM0hha19EbkRMbkNuTFVBbEZpM3FRbXE0ZzdBRkxKRG9MUFhsTUZBQUc1cDl6QjFGYUZxUzJnQ0NqZ1ZUU00wT3ZrQW9LYUlyVjA5SXpmTkgzcWZuU3IxODNCbjUzZ1djODhsRkJ4THotUzV6NnhjcS10XzIweVFYUE1PRXFuVUxvY2N3ZXVsN0RrSTBsN1VfZXB3Q0NwNGpUMkVHaFlIYVFVeExDOHMtUUUwNFBzVjl2SjhYOVdvdDhBS2EyOURteWJ2UGxqZks1UEppb1RIMUIxbVJ1SXNuZXIzS3ptY3A1T3JWSE9EREJDQlB6LUdrOGpNMENGRkxKTF9mQXlGMDdFX2JYWndfenZTSGpRNXNpMy1VdkpORkxYMnkxRmducGpGSGpiMm5yRUJWaERIV1lRSDhMZXgzU2hMVkVNaTlRZVhyaVl3czZkYkVyQ0NSbVJ2VW9VZnlBTC1mRVdGSzFLMFdoM3RYUXhSeUY0aWdoYlJRUV93Y09HRHd6R1puWnk2S0tzQ2JfVVlobUMwTTI5c21FemNwcXZsUGNpUnJTUTdwY29KZ0Uzd2txdTdJZ3E1TmRndzNMVzNiX1FIaDJzZWNyLWk0ZWp6eVNHaGhpUVpmOExWaE5sdkRialluLTJlWks0cFlZOVFwcFM2VWRqbUlFaW5MQUlaWG5vNDJhZWcyZ3BWc3IyaWx3TVl0RFlDN01WVkdxMUJsM1VScl9WRzhsTFh4RFlZaGtYdnZrSUJKUi1FUHFEclp6LUdRLjk5VHpxSE5zdHJ1b2lhU2FvMERPOGciLCJ0b2tlblZhbGlkaXR5IjoxNzM4NTc1NzY3LCJleHBpcmVzSW4iOjM2MDAsImlhdCI6MTczODU3MjE2OH0.xyNwFNiZiHFN15rOEpds7TJaJ2hoPaK8nv0oji0loDA","duration":3600,"isNewUser":false,"ikt":"eyJhbGciOiJIUzI1NiJ9.ZXlKcmFXUWlPaUp3V21WRlNqUkRRUzF4ZFhGNldEWlVjMjVIZEVvMk5YSndRemswZWs4dGRsUnNRVXRuV2xOamQwVm5JaXdpWVd4bklqb2lVbE15TlRZaWZRLmV5SnpkV0lpT2lJd01IVmtiemRqTlhGblV6UlhUVzVaVnpZNU55SXNJblpsY2lJNk1Td2lhWE56SWpvaWFIUjBjSE02THk5aGRYUm9MbWxzYkdsamIzQnNkWE11WTJFdmIyRjFkR2d5TDJGMWN6TjVlR0UxT1hwWE5HcFJOVFowTmprM0lpd2lZWFZrSWpvaVkzUnpYMk5zZFdKZlkyOW5ibWwwYnlJc0ltbGhkQ0k2TVRjek9ETXdOakkzTnl3aVpYaHdJam94TnpNNE16QTVPRGMzTENKcWRHa2lPaUpKUkM1SmJrcDFWa2xITUZFNGMyWmlUWFJ4ZUhaUFNFRmtYM2g0VHpFMWVEQlRMWGRSU0VGWVRFOTBjalozSWl3aVlXMXlJanBiSW5CM1pDSmRMQ0pwWkhBaU9pSXdNRzlyWlc1cGNEVnFRVFkxVWtkRk5UWTVOaUlzSW1GMWRHaGZkR2x0WlNJNk1UY3pPRE13TmpJM05Td2lZWFJmYUdGemFDSTZJa1ZSVFZZM1RFWkVURkF6VUVOaFpXcEVaVEEyYm5jaUxDSjJiRVZ6Y0dGalpVTnNhV1Z1ZEZKdmJHVWlPaUpZUVNJc0luWnNWVzVwY1hWbFNXUWlPaUkwWm1KalpETXlZaTFpWXpWbExUUm1OV1V0T1RZME5pMWxOV1JsTXprell6Y3lORFVpTENKMmJFRmpkR2wyWlV0bGVVOTBkQ0k2SWpSbVltTmtNekppTFdKak5XVXROR1kxWlMwNU5qUTJMV1UxWkdVek9UTmpOekkwTlNJc0ltUnRjR1JwWjJWemRDSTZJbWRvYUcwd2VqSklPRTk0VjI4dk1IcENVMk5DWW1Sck1GbHBNakZGS3pCU09YbFhTV0ZWVGxscE1UZzlJaXdpZG14SlpHVnVkR2wwZVZCeWIyWnBiR1VpT2lKMmFXUXRiR1ZuWVdONUxXTnNkV0lpZlEud0JaMXgzUDlCRzlMZC13NEpMYWNzTW5lOTRob0EweUlUYW0tVC04R0FLcVVZZ2hRNnlZZkNiZzZWWEUyRHpqVmd0NnltU0ZvMU0zN1g3U3lPaXRiUjUxN3VyU25mZ2J3djhIS3FMZWtacU1fRGU3NkJzSWxtZjRRYWg2Z2VLQXBybUhjR1JiY0hVSGFwT29XUzZFemNOSHFxSWROYW82TmlBNUc3Nkkxc0pYRFZhcTNXSE9JMzU4VER2cWphOHBCalhjanIwWGpHUW53QTVuVWFoMmxtYWpuc3dYdDVOQ0l2TW1kckUxNy1HVEZWWElCR3JPU0JFWk1QdmVSaktnY0M2UTZkZ1FPTTBwUWFCRjRPSUswV2RyTXhHMW9XYTJjc1lHaWs2S1VKeHRvcUpYdFp2OGdabWxCTWVpeTBWVW14THNMR1NLX1ZOX1NCQlJZYy1zVWR3.-AInXkxHN7lD-ZNHpUxVEfMDpUmhMZCThouHvPUgals"})
  setState(StorageKeys.USER_CONSUMER_TOKEN,"eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiJyV19leFg0eHhhYTNXMkdhLzRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NSIsImlzcyI6IjEiLCJleHAiOjE3Mzg2NTg1NjgsImlhdCI6MTczODU3MjE2ODIwOSwianRpIjoiYTEyODliNTUtOTJmYS00M2E5LWJjYzQtZjgxNWI2NWE4ZjJiIiwiZGlkIjoicldfZXhYNHh4YWEzVzJHYSIsInVubSI6IjRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NSIsImN0eCI6IntcInVzZXJOYW1lXCI6XCI0ZmJjZDMyYi1iYzVlLTRmNWUtOTY0Ni1lNWRlMzkzYzcyNDVcIixcImF0dHJpYnV0ZXNcIjp7XCJ1c2VySURcIjpcIjRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NVwiLFwidXNlclR5cGVcIjpcIkNMVUItSUxMSUNPLVNPTE9cIixcImVudGl0bGVtZW50XCI6XCJCQVNJQ1wiLFwic291cmNlXCI6XCJWSURFT1RST05cIixcInN1YnNjcmlwdGlvblN0YXR1c1wiOlwiQUNUSVZFXCIsXCJwbGF0Zm9ybVwiOlwib3RoZXJcIn19XG4iLCJvaWQiOiIyNzA3NTcwMjIxIn0.lcZC6jAM6mpujuUolEUS7ErAoO_mOJ46sPLJoQwBEuLDYlsNycVlEivh2k1FhqE0i0VXqkUZjGYfz5D4MWAdS6oYDvUWYcojdXJec-4ABs_EZu1xgwLjzW1oahcpTsMcnSVtUnoKQLaB4yxfzFNAmT-iL9uyWhXCw8DTemDkTctqeSzeLRiWfZsEB9AkVGab-wQcCfHY4PlBUVk7AY-Vn7Et4gVFZNv-4IZV9xKYrBZE4igadjlGbOZ6ib8zhbzLkdsfCrXAQTf48X_7qU6D8ZRkUVLJz2qrhR_efOwXG_PjyGY8rFFfyCL7Rlu57RKl46t-t3zBx3ET0qKEAEJUYQ")
  setState(StorageKeys.USER_DATA,{
    "firstName": null,
    "lastName": null,
    "gender": null,
    "subscription": {
        "source": "VIDEOTRON",
        "subscriptionType": "BASIC",
        "customerType": "CLUB-ILLICO-SOLO"
    },
    "token": "eyJhbGciOiJSUzUxMiJ9.eyJzdWIiOiJyV19leFg0eHhhYTNXMkdhLzRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NSIsImlzcyI6IjEiLCJleHAiOjE3MzcwODQzMTIsImlhdCI6MTczNjk5NzM3MjA1MiwianRpIjoiYzE3YjE5OGUtYjgxNi00ZmI4LWFmY2YtNTg0OWNjNzkzZjY2IiwiZGlkIjoicldfZXhYNHh4YWEzVzJHYSIsInVubSI6IjRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NSIsImN0eCI6IntcInVzZXJOYW1lXCI6XCI0ZmJjZDMyYi1iYzVlLTRmNWUtOTY0Ni1lNWRlMzkzYzcyNDVcIixcImF0dHJpYnV0ZXNcIjp7XCJ1c2VySURcIjpcIjRmYmNkMzJiLWJjNWUtNGY1ZS05NjQ2LWU1ZGUzOTNjNzI0NVwiLFwidXNlclR5cGVcIjpcIkNMVUItSUxMSUNPLVNPTE9cIixcImVudGl0bGVtZW50XCI6XCJCQVNJQ1wiLFwic291cmNlXCI6XCJWSURFT1RST05cIixcInN1YnNjcmlwdGlvblN0YXR1c1wiOlwiQUNUSVZFXCIsXCJwbGF0Zm9ybVwiOlwib3RoZXJcIn19XG4iLCJvaWQiOiIyNzA3NTcwMjIxIn0.FvxINPal4tS0fPBjOVQeN6AUQ9BPfXxJtThhcIs0s9tDSqUa1sO1CNAgHwyk4dIolJBqXCNpxIr0slpkz81NZbEaB4Yqb3Cqg2zJh7gCug6oVhAKcwJGRpDW4H1ccHGMs1EIrsB2gQ_q23G1E1peNX-MmSHwRBGnpOwzEQlPbJDqtTnKZRymdbjipDP9QMd6938LOqzvUwsXR6wBlpM9r-vwaPer-CheHEi9fNCr9V50gTTAO-_CH5n3Cbm6BwY-86OVl6KWMhQO1EFfpDISouXNca_M25c3Uhb74CtcJEZ6gW9f5fa2ggRROeL03AcJe--cNibStAcu-HySN5bclg",
    "userId": "4fbcd32b-bc5e-4f5e-9646-e5de393c7245",
    "userName": "4fbcd32b-bc5e-4f5e-9646-e5de393c7245",
    "authInfo": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWZyZXNoVG9rZW4iOiJleUpqZEhraU9pSktWMVFpTENKbGJtTWlPaUpCTWpVMlIwTk5JaXdpWVd4bklqb2lVbE5CTFU5QlJWQWlmUS5yeXFheUQtXy01cWhrTzdnb1k5UFpjNFh1M1k3NWotQTFLR1FKM1NucS1JVVlrSV9fZHM3ZXQ3QzZRdjJuLUpyZmZack9qcV8wekpyZ1lkSDdaeGk4dzNCNE1ZNUxlMVZTV0lQSVp5b0VYb3pYcXc5U005S1lXNEZhdHhDMVUwam02ZE8xdTZmOHdVaTJ3bG5hM3pnVUgzUEFFdnA2WFcyeDZidl9XUUZCbnZvUllvQ1A2SzMzaG12NGI1TTl5OF9JR0tmT2Y1Z3dPZ1ZPOHM1MS1COEJRRHp0TFFZMVhpM3VqZ1JjM3hSamFCWWNSdzRNazdPaW8xM1Y3bTRXRDBscVVockxuV1RBMHBCdG5HbVBqZndDb0Z3OW9qMTF6c0pyMXUtZzJfU2t0bWI1ZVpWTTJ6Y3V3NVQ0bktlU05icC1ZNHRDemREMHNkMHdIa25LM0VvbEEuUnhTc2poY3k5c0RHMnFmei5WWDRIbzFKeTNjMHR1TXMxWm5MMmhRS2tuZFY3RjdFYU9QUTlkMm9RaEVkRk9aRjdfZGJ2REE4RWIyTFVaZ2FJZV9IY1BpYkljZXlIemZoazY1czFTRFozc0tDNXltaTkwSmhKOFVIa2x1cUoyeTcxdGZUalN6YTVFZm5wbjdvWjV4YTFtaXd4R1lmckxxZm5RaHgxdHF5RDJKdU5OVzJBa3NvcWVGZ0VJdDlab29ERG15N3VMM0N1eGd4ZzJic1laNkp3d2VnVEJDR09mak02LVdYaW9Qb0s0dnEwVmRvazJyWFY2TENSWXhZSmtmaklwUVk5WXhWX0twRGl5VDR6OHFjeVVsSjc5bGplM3RzUW9YZWN1TFRGcS1kRER1aFRkZEtCQjgtblpjSzM0cTAyRmR5RGJtUmxfamZOUEk5ZTdwcUF0SS1zbWNoXzczTV9Xc3BaYkNCNVBaaU9QZVJaRkxzLThUOW1BNjJCQkk3UWNkZ1ZrRnlxenQ5Mmw5aXRiOG9IakZHbU8tLW5ja0RBYkM1dG9JME9nSjJZdUZ4YVN4Qi1qTkV5Q1o2UWwxREgxMnpqR0d5Q2xyVUQ2ay1HTFZzcVE5WG5RY3lERXJJQUVDQ3B6ZktFV0FOZ1ZrTl92ZE9heGZKcmtWLXkybVl2ZGo5aEh3WGRQN1JBYUdjN0czNUJXbGNPX1dRSWFKVzhIS0RRQUtocFVfZkZmOHdkUHJjZDdmcjY5eUU4cmxudTdkQnQ0dzBCUUFqOElQdFA1OXIzeXpNbHB0WV9ramRoRmRVOXlDckJnZ3Q1bXFySHFSalBQWFlVc2JTYllsakFHV0h2MWtvX18xX3FKYk9Nc2tXTWYwdGNFZHRoa0V4MUtPcjdrU3pRcVVnRlNUakhIbDhVd195S1BKU1RnaDVWOW04bFA1dXlBMHREYXpCY2lxdGY5YzlSSDhvSDR5T3BreG91UzhPOXprZ2tGMkdmdmNQcWk5eUlWZjZJUXlQRmlhMmZhM3lFUUxXM3M0Umxra0hzR0NRRU1hNjhTRkM3RG1iaXJJM0hha19EbkRMbkNuTFVBbEZpM3FRbXE0ZzdBRkxKRG9MUFhsTUZBQUc1cDl6QjFGYUZxUzJnQ0NqZ1ZUU00wT3ZrQW9LYUlyVjA5SXpmTkgzcWZuU3IxODNCbjUzZ1djODhsRkJ4THotUzV6NnhjcS10XzIweVFYUE1PRXFuVUxvY2N3ZXVsN0RrSTBsN1VfZXB3Q0NwNGpUMkVHaFlIYVFVeExDOHMtUUUwNFBzVjl2SjhYOVdvdDhBS2EyOURteWJ2UGxqZks1UEppb1RIMUIxbVJ1SXNuZXIzS3ptY3A1T3JWSE9EREJDQlB6LUdrOGpNMENGRkxKTF9mQXlGMDdFX2JYWndfenZTSGpRNXNpMy1VdkpORkxYMnkxRmducGpGSGpiMm5yRUJWaERIV1lRSDhMZXgzU2hMVkVNaTlRZVhyaVl3czZkYkVyQ0NSbVJ2VW9VZnlBTC1mRVdGSzFLMFdoM3RYUXhSeUY0aWdoYlJRUV93Y09HRHd6R1puWnk2S0tzQ2JfVVlobUMwTTI5c21FemNwcXZsUGNpUnJTUTdwY29KZ0Uzd2txdTdJZ3E1TmRndzNMVzNiX1FIaDJzZWNyLWk0ZWp6eVNHaGhpUVpmOExWaE5sdkRialluLTJlWks0cFlZOVFwcFM2VWRqbUlFaW5MQUlaWG5vNDJhZWcyZ3BWc3IyaWx3TVl0RFlDN01WVkdxMUJsM1VScl9WRzhsTFh4RFlZaGtYdnZrSUJKUi1FUHFEclp6LUdRLjk5VHpxSE5zdHJ1b2lhU2FvMERPOGciLCJ0b2tlblZhbGlkaXR5IjoxNzM3MDAwOTY4LCJleHBpcmVzSW4iOjM2MDAsImlhdCI6MTczNjk5NzM3Mn0.2AuWvLCPiB0vt0mCemOJnUkSW6TpIIpFv-alQ56WuaY",
    "duration": 3600,
    "isNewUser": false,
    "ikt": "eyJhbGciOiJIUzI1NiJ9.ZXlKcmFXUWlPaUoxVG01WGNtVjFlRmN0TlU5SmEwMUxNVXB0ZVZad1dXbFVhREEwV0ZkRWFEUTJWMGxYU2psTWFWTkpJaXdpWVd4bklqb2lVbE15TlRZaWZRLmV5SnpkV0lpT2lJd01IVmtiemRqTlhGblV6UlhUVzVaVnpZNU55SXNJblpsY2lJNk1Td2lhWE56SWpvaWFIUjBjSE02THk5aGRYUm9MbWxzYkdsamIzQnNkWE11WTJFdmIyRjFkR2d5TDJGMWN6TjVlR0UxT1hwWE5HcFJOVFowTmprM0lpd2lZWFZrSWpvaVkzUnpYMk5zZFdKZlkyOW5ibWwwYnlJc0ltbGhkQ0k2TVRjek5qazVOek0yTnl3aVpYaHdJam94TnpNM01EQXdPVFkzTENKcWRHa2lPaUpKUkM1T2IxcDNlbDl1YUV3NE56UlpXRVIzYXpaeFVsUlRZV014VjNrMFNWTlZiWEZtUzFCRFNXRkZOamh2SWl3aVlXMXlJanBiSW5CM1pDSmRMQ0pwWkhBaU9pSXdNRzlyWlc1cGNEVnFRVFkxVWtkRk5UWTVOaUlzSW1GMWRHaGZkR2x0WlNJNk1UY3pOams1TnpNMk5Td2lZWFJmYUdGemFDSTZJbVp1Y1hJNVFTMUJTVXhtZVV4MFRuVkdMVU5WY0VFaUxDSjJiRVZ6Y0dGalpVTnNhV1Z1ZEZKdmJHVWlPaUpZUVNJc0luWnNWVzVwY1hWbFNXUWlPaUkwWm1KalpETXlZaTFpWXpWbExUUm1OV1V0T1RZME5pMWxOV1JsTXprell6Y3lORFVpTENKMmJFRmpkR2wyWlV0bGVVOTBkQ0k2SWpSbVltTmtNekppTFdKak5XVXROR1kxWlMwNU5qUTJMV1UxWkdVek9UTmpOekkwTlNJc0ltUnRjR1JwWjJWemRDSTZJbWRvYUcwd2VqSklPRTk0VjI4dk1IcENVMk5DWW1Sck1GbHBNakZGS3pCU09YbFhTV0ZWVGxscE1UZzlJaXdpZG14SlpHVnVkR2wwZVZCeWIyWnBiR1VpT2lKMmFXUXRiR1ZuWVdONUxXTnNkV0lpZlEuUVEzLXl5cmFDczduZk0tS25ONlpUQWlwanJSd0hKUGVFX1M1bmctcktwYUtNeVJjQW1zMzRMcTJRaWhlNnd1TTJQVHBzS1hSSTZYTFZONHhWaUkwNGlTY3hKdm5yWVNqVElVa2JkbVNRMXpUS3N5UGFianB6ZlYtZGR1aVFoNVVTaUVuZ0Y2TkdFa01PZ0RSUUZpRzJDUDJfYmwwY0JqUlZYbUZUUEY3UEtPOEltWnIzVGRDS0I0WmtGWmstY1g2WGZrRF9XNXNIbmYtWDU4dzEwSkpEWlNlYnV0R0l3X3RVSk9lV2FocVdkOFBfRVhBaTlvakZURV9aYzdweGlGYTBUNUhFZE9DcndnZlN3VTFRX3psekJNZWdENmd0Y2FqSXpDTjFhQWQxSDdFeVplNXFESklhOWZzYURKOUpNenY5WE1KQkUxZDV6YjFpMVE4ekNZNDJn.bHvHhgFczxjS-wZW73B9RhRe9AdCouMbDOVPijzrymo"
})
  setState(StorageKeys.USER_ID,"4fbcd32b-bc5e-4f5e-9646-e5de393c7245")
  setState(StorageKeys.USER_NAME,"4fbcd32b-bc5e-4f5e-9646-e5de393c7245")
  setState(StorageKeys.USER_PROFILE_TOKEN,"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyZWZyZXNoVG9rZW4iOiJleUpqZEhraU9pSktWMVFpTENKbGJtTWlPaUpCTWpVMlIwTk5JaXdpWVd4bklqb2lVbE5CTFU5QlJWQWlmUS5yeXFheUQtXy01cWhrTzdnb1k5UFpjNFh1M1k3NWotQTFLR1FKM1NucS1JVVlrSV9fZHM3ZXQ3QzZRdjJuLUpyZmZack9qcV8wekpyZ1lkSDdaeGk4dzNCNE1ZNUxlMVZTV0lQSVp5b0VYb3pYcXc5U005S1lXNEZhdHhDMVUwam02ZE8xdTZmOHdVaTJ3bG5hM3pnVUgzUEFFdnA2WFcyeDZidl9XUUZCbnZvUllvQ1A2SzMzaG12NGI1TTl5OF9JR0tmT2Y1Z3dPZ1ZPOHM1MS1COEJRRHp0TFFZMVhpM3VqZ1JjM3hSamFCWWNSdzRNazdPaW8xM1Y3bTRXRDBscVVockxuV1RBMHBCdG5HbVBqZndDb0Z3OW9qMTF6c0pyMXUtZzJfU2t0bWI1ZVpWTTJ6Y3V3NVQ0bktlU05icC1ZNHRDemREMHNkMHdIa25LM0VvbEEuUnhTc2poY3k5c0RHMnFmei5WWDRIbzFKeTNjMHR1TXMxWm5MMmhRS2tuZFY3RjdFYU9QUTlkMm9RaEVkRk9aRjdfZGJ2REE4RWIyTFVaZ2FJZV9IY1BpYkljZXlIemZoazY1czFTRFozc0tDNXltaTkwSmhKOFVIa2x1cUoyeTcxdGZUalN6YTVFZm5wbjdvWjV4YTFtaXd4R1lmckxxZm5RaHgxdHF5RDJKdU5OVzJBa3NvcWVGZ0VJdDlab29ERG15N3VMM0N1eGd4ZzJic1laNkp3d2VnVEJDR09mak02LVdYaW9Qb0s0dnEwVmRvazJyWFY2TENSWXhZSmtmaklwUVk5WXhWX0twRGl5VDR6OHFjeVVsSjc5bGplM3RzUW9YZWN1TFRGcS1kRER1aFRkZEtCQjgtblpjSzM0cTAyRmR5RGJtUmxfamZOUEk5ZTdwcUF0SS1zbWNoXzczTV9Xc3BaYkNCNVBaaU9QZVJaRkxzLThUOW1BNjJCQkk3UWNkZ1ZrRnlxenQ5Mmw5aXRiOG9IakZHbU8tLW5ja0RBYkM1dG9JME9nSjJZdUZ4YVN4Qi1qTkV5Q1o2UWwxREgxMnpqR0d5Q2xyVUQ2ay1HTFZzcVE5WG5RY3lERXJJQUVDQ3B6ZktFV0FOZ1ZrTl92ZE9heGZKcmtWLXkybVl2ZGo5aEh3WGRQN1JBYUdjN0czNUJXbGNPX1dRSWFKVzhIS0RRQUtocFVfZkZmOHdkUHJjZDdmcjY5eUU4cmxudTdkQnQ0dzBCUUFqOElQdFA1OXIzeXpNbHB0WV9ramRoRmRVOXlDckJnZ3Q1bXFySHFSalBQWFlVc2JTYllsakFHV0h2MWtvX18xX3FKYk9Nc2tXTWYwdGNFZHRoa0V4MUtPcjdrU3pRcVVnRlNUakhIbDhVd195S1BKU1RnaDVWOW04bFA1dXlBMHREYXpCY2lxdGY5YzlSSDhvSDR5T3BreG91UzhPOXprZ2tGMkdmdmNQcWk5eUlWZjZJUXlQRmlhMmZhM3lFUUxXM3M0Umxra0hzR0NRRU1hNjhTRkM3RG1iaXJJM0hha19EbkRMbkNuTFVBbEZpM3FRbXE0ZzdBRkxKRG9MUFhsTUZBQUc1cDl6QjFGYUZxUzJnQ0NqZ1ZUU00wT3ZrQW9LYUlyVjA5SXpmTkgzcWZuU3IxODNCbjUzZ1djODhsRkJ4THotUzV6NnhjcS10XzIweVFYUE1PRXFuVUxvY2N3ZXVsN0RrSTBsN1VfZXB3Q0NwNGpUMkVHaFlIYVFVeExDOHMtUUUwNFBzVjl2SjhYOVdvdDhBS2EyOURteWJ2UGxqZks1UEppb1RIMUIxbVJ1SXNuZXIzS3ptY3A1T3JWSE9EREJDQlB6LUdrOGpNMENGRkxKTF9mQXlGMDdFX2JYWndfenZTSGpRNXNpMy1VdkpORkxYMnkxRmducGpGSGpiMm5yRUJWaERIV1lRSDhMZXgzU2hMVkVNaTlRZVhyaVl3czZkYkVyQ0NSbVJ2VW9VZnlBTC1mRVdGSzFLMFdoM3RYUXhSeUY0aWdoYlJRUV93Y09HRHd6R1puWnk2S0tzQ2JfVVlobUMwTTI5c21FemNwcXZsUGNpUnJTUTdwY29KZ0Uzd2txdTdJZ3E1TmRndzNMVzNiX1FIaDJzZWNyLWk0ZWp6eVNHaGhpUVpmOExWaE5sdkRialluLTJlWks0cFlZOVFwcFM2VWRqbUlFaW5MQUlaWG5vNDJhZWcyZ3BWc3IyaWx3TVl0RFlDN01WVkdxMUJsM1VScl9WRzhsTFh4RFlZaGtYdnZrSUJKUi1FUHFEclp6LUdRLjk5VHpxSE5zdHJ1b2lhU2FvMERPOGciLCJ0b2tlblZhbGlkaXR5IjoxNzM4NTc1NzY3LCJleHBpcmVzSW4iOjM2MDAsImlhdCI6MTczODU3MjE2OH0.xyNwFNiZiHFN15rOEpds7TJaJ2hoPaK8nv0oji0loDA")
  setState(StorageKeys.APP_BACKGROUND_COLOR,"0xff1B1B1B")

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
