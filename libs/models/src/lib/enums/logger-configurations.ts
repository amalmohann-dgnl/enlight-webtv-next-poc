/**
 * @name logger-configurations
 * This Model will export all the defaults for logger module as enums.
 * properties will exported are :
 * @enum LogType - default logging types used for logging.
 *
 * @author amalmohann
 */

/**
 * @name LogType
 * @type enum
 * @description This enum will have all the default logging types used for logging.
 * @author amalmohann
 */
export enum LogType {
    INFO = 'info',
    DEBUG = 'debug',
    ERROR = 'error',
    WARN = 'warning',
}
