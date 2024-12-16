import { PlayerState, LogLevel, LogType, ModuleType, LogglyActionType } from './../../index';

/**
 * @name SendLogParameterType
 * @type interface
 * @description This enum will have the parameters passed to the Send log function
 * @author tonyaugustine
 */
export interface SendLogParameterType {
    module: ModuleType;
    logType: LogType;
    errorPathObject: Error;
    logLevel: LogLevel;
    action?: LogglyActionType | PlayerState;
    eventType?: string;
    errorShown?: boolean;
    retryCount?: number;
    errorCode?: string;
    data?: ErrorLogData;
    apiErrorData?: any;
    country?: string;
}

/**
 * @name ErrorLogData
 * @type interface
 * @description - defines the extra log data format for the send log function
 * @author tonyaugustine
 */
export interface ErrorLogData {
    responseData?: any;
    infoData?: object;
}

/**
 * @name SearchModuleData
 * @type interface
 * @description - defines the search module parameter type
 * @author gowripriyadileep
 */
export interface SearchModuleData {
    infoData: {
        searchTerm: string;
    };
}
