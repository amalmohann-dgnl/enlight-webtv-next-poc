'use client'

import {
  BaseConfiguration,
  Color,
  ConfigurationKey,
  ErrorConfiguration,
  FeatureSupport,
  Features,
  MappedAppBaseConfiguration,
  StorageKeys,
} from '@enlight-webtv/models';
import { ConfigController } from '.';
import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import {
  configurationUtilities,
  storageUtilities,
  stylesUtilities,
} from '@enlight-webtv/utilities';

//import controller
const {
  setConfig,
  setErrorCode,
} = new ConfigController();

// import utilities
const {
  getDefaultPageBodyTheme,
  getDefaultGraphicsByID,
  clearConfigCache,
  getFeatureByKey,
} = configurationUtilities;
const { convertColorToHexString } = stylesUtilities;
const { setState } = storageUtilities;


/**
 * @name setupBasicApplication
 * @type function/method
 * @description This function will setup all the basics of the application splash screen.
 *
 * @author amalmohann
 */
export const setupBasicApplication = (
  configMap: MappedAppBaseConfiguration
) => {
  const networkRequestor = new NetworkRequestor();
  //setting the web page title
  document.title = configMap.application.name;
  //setting the base network url for the application
  // if (configMap.application.baseConfiguration?.baseApiUrl)
  //   (networkRequestor as any)!.defaults.baseURL =
  //     configMap.application.baseConfiguration.baseApiUrl;
};

/**
 * @name setupSplash
 * @type function/method
 * @description This function will setup all the basics of the application splash screen.
 *
 * @author amalmohann
 */
export const setupSplash = () => {
  const splashConfigs = getDefaultGraphicsByID(
    ConfigurationKey.APP_SPLASH_LOGO
  );
  setState(StorageKeys.SPLASH, splashConfigs?.images.splice(0, 2));
};

/**
 * @name setup
 * @type function/method
 * @description This function will setup all the basics of the application.
 * @param {BaseConfiguration} configuration - labels configuration array.
 *
 * @author amalmohann
 */
export const setup = async (configuration: BaseConfiguration) => {
  clearConfigCache();
  setState(StorageKeys.CHECKSUM, configuration.checksum);
  setState(StorageKeys.ENTRIES_RESPONSE, configuration);

  setState(StorageKeys.CONFIGURATION_DEPENDENCIES, {
    checksum: configuration.checksum || '',
  });

  //creating the configuration Map
  const configMap: MappedAppBaseConfiguration = await setConfig(configuration);
  //saving the configuration in the storage
  setState(StorageKeys.CONFIG, configMap);

  //saving errorCodes configuration in the storage
  const featureSupport = getFeatureByKey(
    Features.FeatureSupport
  ) as FeatureSupport;
  const errorCodeMap: Map<string, ErrorConfiguration> = setErrorCode(
    featureSupport?.errorConfiguration
  );
  // Convert the Map to a JSON string
  const errorCodeMapString = JSON.stringify(Array.from(errorCodeMap.entries()));
  setState(StorageKeys.ERRORCODE, errorCodeMapString);

  // Set the current locale in storage
  setState(StorageKeys.LOCALE, configuration.contentLocale);

  //saving the app background color
  const defaultBodyTheme = getDefaultPageBodyTheme()?.background
    .primary as Color;
  const appBackgroundColor = defaultBodyTheme.code;
  setState(StorageKeys.APP_BACKGROUND_COLOR, appBackgroundColor);
  //update the body background color same as canvas
  document.body.style.background = convertColorToHexString(appBackgroundColor);

  //saving the splash animation
  setupSplash();
  //setup some basic application items
  setupBasicApplication(configMap);

  // Recreate sidebar after a new configuration setup
  setState(StorageKeys.RECREATE_SIDEBAR, true);
  //TODO: Add spinner configuration after adding in the contentful
  //saving the spinner animation
  //const spinner = defaultGraphics?.filter(graphic => graphic.id === ConfigurationKey.APP_SPINNER)[0];
};
