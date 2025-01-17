import {
  ActionType,
  BaseConfiguration,
  ErrorConfigurationType,
  ErrorPageData,
  ErrorPopupData,
  GeneralModuleErrorType,
  LabelKey,
  LoaderId,
  LogLevel,
  LogType,
  ModuleType,
  Routes,
} from '@enlight-webtv/models';
import {
  AuthServices,
  NetworkConnectivityServices,
} from '@enlight-webtv/network-services';
import { LogglyServices } from '@enlight-webtv/analytics-services';
import {
  configurationUtilities,
  deviceUtilities,
  splashUtilities,
  projectUtilities,
  errorUtilities,
} from '@enlight-webtv/utilities';
import LoginController from './login-controller';
import {setup } from './application-setup-controller';
import { redirect } from 'next/navigation';

//import utilities
const { exitApp, isAndroid, getAndroidObject } = deviceUtilities;
const { getLabel, getErrorByCode } = configurationUtilities;
const { checkIsVideoSplash } = splashUtilities;
const { getErrorPopActionHandling } = errorUtilities;

//services
const { checkInternetConnection } = new NetworkConnectivityServices();
const logglyServices = new LogglyServices();
const { logout } = new AuthServices();

// controllers
const { getIsAuthenticated } = new LoginController();

const IS_ANDROID = false;
const ANDROID = {};

/**
 * @name errorPageDataProvider
 * @type function
 * @description This function will provide the data required to populate the Error page as well as the contentful configurations.
 * @param page - Instance of Error Page
 * @return {Promise}
 * @author anandpatel
 */
export const errorPageDataProvider = (page: any, params: ErrorPageData) => {
  return new Promise<void>((resolve, reject) => {
    try {
      if (params.error) {
        _getNoInternetConfig(page, params.route);
      } else {
        page.ErrorPageBody._paramsData = params;
        resolve();
      }
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
};

/**
 * @name getNoInternetErrorPageConfig
 * @type function/method
 * @param {string} code - The error code to get the error page configuration.
 * @description Retrieves the configuration for a no internet error page based on the error code.
 * @return {ErrorPageData} - The configuration data for the no internet error page.
 * @author anandpatel
 */
export const getNoInternetErrorPageConfig = async (
  code: string,
  icon: any,
  page: any,
  route: Routes
) => {
  const infoBase64Img = icon;
  const errorConfig = getErrorByCode(code);
  const isAuthenticated = await getIsAuthenticated();
  const secondaryLabel = getLabel(LabelKey.LABEL_EXIT_SECONDARY_BUTTON);
  const data = {
    logoSrc: infoBase64Img,
    title: errorConfig?.title || '',
    description: errorConfig?.description || '',
    errorCode: errorConfig?.code || errorConfig?.serverErrorCode?.[0],
    showErrorCode: true,
    buttons: [
      {
        label: errorConfig?.primaryActionLabel || '',
        handleEnterPress: async () => {
          page.disablePrimaryButton = true;
          const isOnline = await checkInternetConnection();
          if (!isOnline) {
            page.disablePrimaryButton = false;
          }
        },
        handleBackPress: () => null,
      },
      {
        label: secondaryLabel,
        handleEnterPress: () => exitApp(),
        handleBackPress: () => null,
      },
    ],
  } as ErrorPageData;
  return data;
};

/**
 * @name _getNoInternetConfig
 * @type function
 * @param {ErrorPage} page - The ErrorPage object to update with the configuration data.
 * @description Retrieves the configuration for the no internet error page and updates the provided ErrorPage object with the configuration data. It also checks the online status.
 * @return {void}
 * @author AuthorName
 */
export const _getNoInternetConfig = async (page: any, route: Routes) => {
  // Retrieve the configuration for the no internet error page
  const noInternetErrorConfig = await getNoInternetErrorPageConfig(
    ErrorConfigurationType.APP_NO_NETWORK,
    '',
    page,
    route
  );

  // Update the ErrorPage object with the configuration data
  page.ErrorPageBody._paramsData = noInternetErrorConfig;

  // Check the online status
  const cleanupFunction = await checkIsOnline(route);
  page.ErrorPageBody._cleanupFunction = cleanupFunction;
  page.ErrorPageBody._handleBackPress = exitApp;
};

/**
 * @name getLogoutPopupConfig
 * @type function
 * @description Returns a configuration object for a logout popup.
 * @return {ErrorPopupData} - Configuration object for the logout popup.
 * @author anandpatel
 */
export const getLogoutPopupConfig = async () => {
  const data = {
    logoSrc: 'icons/error/logout.png',
    title: getLabel(LabelKey.LABEL_LOGOUT_POPUP_TITLE),
    description: getLabel(LabelKey.LABEL_LOGOUT_POPUP_DESCRIPTION),
    buttons: [
      {
        label:
          getLabel(LabelKey.LABEL_STAY_SIGNED_IN) ||
          getLabel(LabelKey.LABEL_LOGOUT_CANCEL),
      },
      {
        label: getLabel(LabelKey.LABEL_LOGOUT_BUTTON),
        handleEnterPress: async () => {
          // Router.focusWidget('Loader');
          // removing await to handle the logout api failing case
          logout();
          redirect(Routes.LOGIN);
        },
      },
    ],
  } as ErrorPopupData;
  return data;
};

/**
 * @name handleAppConfigFailure
 * @type function
 * @description This function will throw app config failure and throw a server error page
 * @return {Promise}
 * @author tonyaugustine
 */
export const handleAppConfigFailure = async (response?: BaseConfiguration) => {
  console.trace('handleAppConfigFailure')
  try {
    const fallbackConfig = await projectUtilities.getProjectFallbackConfig();
    await setup(fallbackConfig as BaseConfiguration);
    const errorConfig = configurationUtilities.getErrorByCode(
      ErrorConfigurationType.SERVER_ERROR
    );
    const data = {
      title: errorConfig?.title,
      description: errorConfig?.description,
      errorCode: errorConfig?.code,
      buttons: [
        {
          label: errorConfig?.primaryActionLabel,
          handleEnterPress: getErrorPopActionHandling(
            errorConfig?.primaryActionType ?? ActionType.EXIT
          ),
        },
      ],
    } as ErrorPageData;

    //send logs to the loggly.
    logglyServices.sendLog({
      module: ModuleType.General,
      logType: LogType.ERROR,
      errorPathObject: new Error(),
      logLevel: LogLevel.ERROR,
      errorShown: true,
      errorCode: GeneralModuleErrorType.ServerError,
      data: {
        responseData: response,
      },
    });
  } catch (error) {
    console.error('Error retreiving fallback config', error);
  }
};

/**
 * @name _checkIsOnline
 * @type function
 * @description Continuously checks for internet connectivity and takes actions when the internet is available.
 * @returns {void}
 * @author anandpatel
 */
export const checkIsOnline = async (route: Routes) => {
  // close the splash if it is there
  const isSplashVideo = checkIsVideoSplash();
  const splash = document.getElementById(
    isSplashVideo ? LoaderId.VIDEOSPLASH : LoaderId.SPLASH
  );
  if (splash) {
    setTimeout(() => {
      splash.style.opacity = '0';
      isSplashVideo && (splash as HTMLVideoElement).pause();
      if (IS_ANDROID) {
        const isTransparent = false;
        ANDROID.stopSplashAnimation();
        ANDROID.showDismissProgress(false, isTransparent);
      }
    });
  }
  const loader = document.getElementById(LoaderId.LOADER);
  if (loader) {
    // If a custom loading element is provided, hide it by setting opacity to 0.
    loader.style.opacity = '0';
  }
  /**
   * Function to handle actions when the internet is available.
   * This function clears the interval and performs necessary routing and authentication checks.
   */
};
