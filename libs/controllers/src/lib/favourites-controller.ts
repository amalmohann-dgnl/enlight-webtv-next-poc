/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ContentType, Project } from '@enlight-webtv/models';
import { ProfileServices } from '@enlight-webtv/network-services';
import { favouriteUtilities } from '@enlight-webtv/utilities';

//services
const { checkFavourites, addFavourites, removeFavourites, destroy: destroyProfileServices } = new ProfileServices();
//utilities
const { retrieveFavourites, storeFavouritesObject } = favouriteUtilities;

/**
 * @name FavouritesController
 * @type class
 * @description This controller will have all the controller functions related to the favourites
 *
 * @author amalmohann
 */
class FavouritesController {
    static instance: FavouritesController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (FavouritesController.instance) {
            return FavouritesController.instance;
        }
        FavouritesController.instance = this;
    }

    destroy() {
        if (FavouritesController.instance === this) {
            FavouritesController.instance = null;
            destroyProfileServices();
        }
    }

    /**
     * @name checkIsFavourite
     * @type function
     * @param {string} id - The uid or seriesUid of the content.
     * @param {any} detailsData - Details data for adding to the storage.
     * @param {boolean} isFav - isFav is used for checking if the item is there in the local storage or not.
     * @description Checks if a content is favourite in the server or not. If yes then check with local storage if it is there or not.
     * If the content is there in the server and storage we will ignore, but if the content if there in the server but not in storage, so we will add.
     * If content if not there in the server and it is there is the storage we will remove from the storage
     * @returns {Promise<void>} - A promise that resolves once the check and actions are completed.
     */
    checkIsFavourite = async (id: string, detailsData: any, isFav: boolean) => {
        const isFavouriteData: any = await checkFavourites(id);
        if (isFavouriteData?.isFavorite !== isFav) {
            if (isFavouriteData?.isFavorite) {
                this.addFavourite(detailsData);
            } else {
                this.removeFavourite(id);
            }
        }
    };

    /**
     * @name addFavourite
     * @type function/method
     * @description Adds a new seriesUid to the list of favorite items.
     * @param {any} item - The item to add to favorites.
     * @return {boolean} - Returns true if the seriesUid was added successfully; otherwise, returns false.
     * @author anandpatel
     */
    addFavourite = async (item: any): Promise<boolean> => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const project = Project.VIDEOTRON;
        const favoritesObj = await retrieveFavourites();
        // Add the new seriesUid to the content array
        favoritesObj.content.unshift(item);
        //call add favourites api
        let id = item.type === ContentType.CALENDAR ? item.seriesUid : item.uid;
        addFavourites(id, item.type);
        // Store the updated favorites object back in storage
        return storeFavouritesObject(favoritesObj);
    };

    /**
     * @name checkFavourites
     * @type function/method
     * @description Checks if a given seriesUid is in the list of favorites.
     * @param {string} id - The seriesUid to check for in favorites.
     * @return {boolean} - Returns true if the seriesUid is in favorites; otherwise, returns false.
     * @author anandpatel
     */
    checkFavourite = async (id?: string, detailsData?: any): Promise<boolean> => {
        if (id) {
            const favoritesObj = await retrieveFavourites();
            if (favoritesObj) {
                // Check if the id is in any object within the content array
                const isFavourite = favoritesObj?.content?.some((item: any) => item.seriesUid === id || item.uid === id);
                //Checking in server if the id is there or not
                this.checkIsFavourite(id, detailsData, isFavourite);
                return isFavourite;
            }
            return false;
        }
        return false;
    };

    /**
     * @name removeFavourite
     * @type function/method
     * @description Removes a specific seriesUid from the list of favorite items.
     * @param {string} id - The id to remove from favorites.
     * @return {boolean} - Returns true if the seriesUid was removed successfully; otherwise, returns false.
     * @author anandpatel
     */
    removeFavourite = async (id?: string): Promise<boolean> => {
        if (id) {
            const favoritesObj = await retrieveFavourites();
            // Find the index of the id in the content array
            const index = favoritesObj.content.findIndex((item: any) => item.seriesUid === id || item.uid === id);
            if (index !== -1) {
                // Remove the specified id from the content array
                favoritesObj.content.splice(index, 1);
                //call remove favourites api
                removeFavourites(id);
                // Store the updated favorites object back in storage
                return storeFavouritesObject(favoritesObj);
            }
            return false; // seriesUid not found in favorites
        }
        return false;
    };
}

export default FavouritesController;
