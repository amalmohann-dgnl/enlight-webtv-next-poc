import { AnalyticsServices } from '@enlight-webtv/analytics-services';
import { ActionType,
  BaseConfiguration,
  EntriesRequestModel,
  ErrorConfigurationType,
  ErrorPageData,
  FeatureUserManagement,
  Features,
  IdentityProviders,
  LoaderId,
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
  HTMLEvents, } from '@enlight-webtv/models';
import { appUtilities, commonUtilities, deviceUtilities, htmlUtilities, projectUtilities, storageUtilities, timeUtilities } from '@enlight-webtv/utilities';

const { addWindowEventListener } = htmlUtilities;
const { getAppMetaData } = appUtilities;
const { initializeDeviceDetails } = deviceUtilities;
const { generateEngageClientID, generateSessionID } = commonUtilities;
const { getState, setState } = storageUtilities;
const { has24HoursPassed } = timeUtilities;
const { getProjectConfig } = projectUtilities;


const { sendMixPanelEvent } = new AnalyticsServices();

/**
 * @name initializeBooting
 * @type function/method
 * @description This function will be called for the booting of the application.
 * @param {Promise<void>}
 *
 * @author amalmohann
 */

const initializeBooting = () => {
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

  if (!timeData || has24HoursPassed((timeData?.time as unknown as number) || 0)) {
    const timeResponse = await getServerTime();
    setState(StorageKeys.SERVER_TIME, timeResponse);
    countryCode = timeResponse?.countryCode ?? null;
    countryName = timeResponse?.country ?? null;
  }

  //get country code from location api if it is not available fom time api
  if (!countryCode || !countryName) {
    countryInfo = await locationServices.getCurrentCountryInfo();

    if (countryInfo?.countryCode) countryCode = countryInfo.countryCode;
    if (countryInfo?.countryName) countryName = countryInfo?.countryName;
  }


  setState(StorageKeys.COUNTRY_INFO, { countryCode: countryCode ?? null, countryName: countryName ?? null });

        if (!countryName || !countryCode) {
            console.warn('Unable to get country code');
            if (getProjectConfig()?.['videotron']?.isCountryCodeMandatory) {
                errorPageController.handleAppConfigFailure();
                return Promise.resolve();
            }
        }


};

export { initializeBooting };
