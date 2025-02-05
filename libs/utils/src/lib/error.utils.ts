import { configurationUtilities } from '.';
import { ActionType, ErrorConfigurationType, ErrorPopupData, LabelKey, Routes } from '@enlight-webtv/models';

import * as deviceUtilities from './device.utils';

//Utilities
const { getErrorByCode, getLabel } = configurationUtilities;
const { exitApp } = deviceUtilities;

/**
 * @name getExitPopupConfig
 * @type function
 * @description Returns a configuration object for a exit popup.
 * @return {ErrorPopupData} - Configuration object for the exit popup.
 * @author anandpatel
 */
let EXIT_POPUP_CONFIG: ErrorPopupData;
let ERROR_POPUP_INSTANCE: any = null;
const getExitPopupConfig = () => {
    if (EXIT_POPUP_CONFIG) {
        return EXIT_POPUP_CONFIG;
    }
    const data = {
        logoSrc: 'icons/error/logout.png',
        title: getLabel(LabelKey.LABEL_EXIT_TITLE),
        description: getLabel(LabelKey.LABEL_EXIT_DESCRIPTION),
        buttons: [
            {
                label: getLabel(LabelKey.LABEL_EXIT_PRIMARY_BUTTON),
            },
            {
                label: getLabel(LabelKey.LABEL_EXIT_SECONDARY_BUTTON),
                handleEnterPress: () => {
                    exitApp();
                },
            },
        ],
    } as ErrorPopupData;
    EXIT_POPUP_CONFIG = data;
    return data;
};

/**
 * @name getErrorPopupConfigByCode
 * @type function
 * @param {string | number} code - Error code used to retrieve error details.
 * @description Returns a configuration object for an error popup based on the provided error code.
 * @return {ErrorPopupData} - Configuration object for the error popup.
 * @author anandpatel
 */
const getErrorPopupConfigByCode = (code: string | number, type: ErrorConfigurationType = ErrorConfigurationType.GENERIC_ERROR) => {
    const error = getErrorByCode(code.toString()) || getErrorByCode(type);
    const data = {
        logoSrc: 'icons/error/info.png',
        title: error?.title,
        description: error?.description,
        buttons: [
            {
                label: error?.primaryActionLabel,
            },
        ],
    } as ErrorPopupData;
    return data;
};

/**
 * @name getErrorPopActionHandling
 * @type function
 * @param {string | number} code - Error code used to retrieve error details.
 * @description Returns a configuration object for an error popup based on the provided error code.
 * @return {ErrorPopupData} - Configuration object for the error popup.
 * @author anandpatel
 */
const getErrorPopActionHandling = (actionType: ActionType, errorType?: ErrorConfigurationType): (() => any) | undefined | void => {
    switch (actionType) {
        case ActionType.CANCEL:
            return undefined;
        case ActionType.EXIT:
            return exitApp;
        case ActionType.RETRY:
            //complete this when use case occurs
            return undefined;
        case ActionType.BACK:
            return () => {
                // Router.getHistory().length > 0 && Router.back();
                // Router.focusPage();
            };
        case ActionType.CUSTOM:
            switch (errorType) {
                case ErrorConfigurationType.PURCHASE_REQUIRED:
                    return () => {
                        // Router.navigate(Routes.SUBSCRIPTION);
                        // Router.focusPage();
                    };
                case ErrorConfigurationType.PLAYBACK_CONCURRENCY:
                    return () => {
                        // Router.getHistory().length > 0 && Router.back();
                        // Router.focusPage();
                    };
                case ErrorConfigurationType.APP_FORCE_UPDATE:
                    return exitApp;
            }
            return undefined;
    }
};

/**
 * @name getActionType
 * @type function
 * @description Gives the primary and secondary action types based on the error config type.
 * @returns {{ primaryActionType: ActionType, secondaryActionType: ActionType } | undefined}
 *
 * @author alwin-baby
 */
const getActionType = (
    errorConfigurationType: ErrorConfigurationType,
): { primaryActionType?: ActionType; secondaryActionType?: ActionType } | undefined => {
    if (errorConfigurationType === ErrorConfigurationType.PLAYBACK_CONCURRENCY) {
        return { primaryActionType: ActionType.CUSTOM, secondaryActionType: undefined };
    } else {
        return;
    }
};

/**
 * @name setupErrorPopup
 * @type function
 * @description This method is responsible for setting up the error page by taking in data containing information about
 * the logo source, title, description, and button labels.
 * @type function/method (fire ancestor)
 * @param {Object} data - An object containing error page data.
 * @param {string} data.logoSrc - The source of the error page logo.
 * @param {string} data.title - The title text for the error page.
 * @param {string} data.description - The description text for the error page.
 * @param {string[]} data.buttons - An array of labels and handleEnter functions for buttons on the error page.
 *
 * @author amalmohann
 */
const setupErrorPopup = (data: ErrorPopupData) => {
    // Pass the errorPopupData
    getErrorPopupInstance().createErrorPage({ ...data });
};

/**
 * @name getErrorPopupInstance
 * @type function
 * @description This function will fetch the error popup instance.
 * @returns error popup instance
 *
 * @author amalmohann
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const getErrorPopupInstance = () => ERROR_POPUP_INSTANCE;

/**
 * @name setErrorPopupInstance
 * @type function
 * @description This function will set the error popup instance.
 * @returns error popup instance
 *
 * @author amalmohann
 */
const setErrorPopupInstance = (instance: any) => {
    ERROR_POPUP_INSTANCE = instance;
};

export {
    getErrorPopupConfigByCode,
    getExitPopupConfig,
    getErrorPopActionHandling,
    getActionType,
    getErrorPopupInstance,
    setupErrorPopup,
    setErrorPopupInstance,
};
