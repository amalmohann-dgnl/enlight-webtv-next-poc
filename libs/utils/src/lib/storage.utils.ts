import { StorageKeys } from '@enlight-webtv/models';

/**
 * @name clearUserDataInStorage
 * @type function/method
 * @description This function will clear all user related data in storage
 *
 * @author tonyaugustine
 */
const clearUserDataInStorage = () => {
    removeState(StorageKeys.FAVOURITES);
    removeState(StorageKeys.USER_CONSUMER_TOKEN);
    removeState(StorageKeys.USER_PROFILE_TOKEN);
    removeState(StorageKeys.RECENTLY_WATCHED);
    removeState(StorageKeys.RECENT_SEARCH);
    removeState(StorageKeys.USER_DATA);
    removeState(StorageKeys.USER_NAME);
    removeState(StorageKeys.USER_ID);
    removeState(StorageKeys.IS_USER_SUBSCRIBED);
    removeState(StorageKeys.LOGIN_INFO);
    removeState(StorageKeys.PROFILE);
    removeState(StorageKeys.PROFILE_ID);
};

/**
 * @name clearProfileDataInStorage
 * @type function/method
 * @description This function will clear all profile related data in storage
 *
 * @author tonyaugustine
 */
const clearProfileDataInStorage = () => {
    removeState(StorageKeys.FAVOURITES);
    removeState(StorageKeys.RECENTLY_WATCHED);
    removeState(StorageKeys.RECENT_SEARCH);
    removeState(StorageKeys.PROFILE);
    removeState(StorageKeys.PROFILE_ID);
};

/**
 * @name clearLanguageDependentCacheDataInStorage
 * @type function
 * @description This function will remove any cached non config data in storage
 *
 * @author tonyaugustine
 */
const clearLanguageDependentCacheDataInStorage = () => {
    removeState(StorageKeys.FAVOURITES);
    removeState(StorageKeys.RECENTLY_WATCHED);
    removeState(StorageKeys.RECENT_SEARCH);
};


/**
* @name setState
* @type service
* @description This service will store the data on a key value pair basis.
* @param {string} key - key of the storage
* @param {any} value - value to be stored.
*
* @author amalmohann
*/
const setState = (key: string, value: any) => {
  localStorage.setItem(key, value);
}

/**
* @name getState
* @type service
* @description This service will store the data on a key value pair basis.
* @param {string} key - key of the storage
* @return {any} value - value that is stored on the key. else null.
*
* @author amalmohann
*/
const getState = (key: string): any => {
  return localStorage.getItem(key);
}

/**
* @name removeState
* @type service
* @description This service will remove the data associated with the specified key.
* @param {string} key - key of the storage
* @author anandpatel
*/
const removeState = (key: string): any => {
  return localStorage.removeItem(key);
}


export { removeState, getState, setState ,clearUserDataInStorage, clearProfileDataInStorage, clearLanguageDependentCacheDataInStorage };
