import { StorageKeys } from '@enlight-webtv/models';
import { storageUtilities } from '.';

// Utilities
const { getState, setState } = storageUtilities;

/**
 * @name retrieveFavouritesObject
 * @type function/method
 * @description Retrieves the favorites object from storage.
 * @return {Object} - The favorites object retrieved from storage.
 * @author anandpatel
 */
const retrieveFavourites = async () => {
    const storedData = await getState(StorageKeys.FAVOURITES);
    if (storedData) {
        return JSON.parse(storedData);
    }
    return undefined;
};

/**
 * @name storeFavouritesObject
 * @type function/method
 * @description Stores the favorites object in storage.
 * @param {Object} favoritesObj - The favorites object to store in storage.
 * @return {boolean} - Returns true if the storage operation was successful; otherwise, returns false.
 * @author anandpatel
 */
const storeFavouritesObject = (favoritesObj: { content: Array<{ seriesUid: string }> }): boolean => {
    try {
        setState(StorageKeys.FAVOURITES, JSON.stringify(favoritesObj));
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
};

export { retrieveFavourites, storeFavouritesObject };
