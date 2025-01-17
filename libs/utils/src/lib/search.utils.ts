import { RecentSearch, StorageKeys } from '@enlight-webtv/models';
import { getState } from './storage.utils';

/**
 * @name retrieveRecentSearch
 * @type function/method
 * @description Retrieves the recent search data from storage.
 * @return {string[]} Array of recent search items.
 * @author anandpatel
 */
const retrieveRecentSearch = async (): Promise<RecentSearch[]> => {
    const recentSearch = await getState(StorageKeys.RECENT_SEARCH);
    return recentSearch;
};

/**
 * @name getSearchSuggestionSkeleton
 * @type function/method
 * @param {string} gradientBackgroundColor - color for the skeleton loader.
 * @param {number} width - width the skeleton loader.
 * @param {number} height - height the skeleton loader.
 * @description This function will generate the skeleton loaders for suggestion tile.
 * @return {SkeletonLoaderGradient[]} Array of suggestionTile items.
 * @author anandpatel
 */
const getSearchSuggestionSkeleton = (SkeletonLoaderGradient: any, gradientBackgroundColor: string, width?: number, height?: number) => {
    const suggestionTile = {
        type: SkeletonLoaderGradient,
        width: width || 300,
        height: height || 70,
        backgroundColor: gradientBackgroundColor,
        borderRadius: (height || 70) / 2,
        gradientDarkness: 0.9,
        flexItem: {
            marginRight: 20,
        },
    };
    return Array(5).fill(suggestionTile);
};

export { retrieveRecentSearch, getSearchSuggestionSkeleton };
