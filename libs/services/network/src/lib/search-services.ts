import { AxiosResponse } from 'axios';
import { NetworkRequestor } from '@enlight-webtv/network';
import {
    Content,
    ContentRequestModel,
    ContentResponse,
    RecentSearch,
    RecentSearchResponse,
    SearchRequestModel,
    SearchSuggestionRequestModel,
    Platform,
    StorageKeys,
    FeatureSearch,
    Features,
    PageComponentType,
    PageComponent,
    CountryInfo,
    RecentSearchRequestModel,
} from '@enlight-webtv/models';
import { networkUtilities, configurationUtilities, commonUtilities, storageUtilities } from '@enlight-webtv/utilities';

const { prepareParams } = networkUtilities;
const { getFeatureByKey } = configurationUtilities;
const { extractCommaSeparatedParams } = commonUtilities;
const { getState, setState } = storageUtilities;

/**
 * @name SearchService
 * @type service class
 * @description This class will have all the network services that need to be used for configuration.
 *
 * @author amalmohann
 */
class SearchService {
    static instance: SearchService | null;
    private networkRequestor;

    constructor(create = false) {
        if (create) this.destroy();
        if (SearchService.instance) {
            return SearchService.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        SearchService.instance = this;
    }

    destroy() {
        if (SearchService.instance === this) {
            SearchService.instance = null;
        }
    }

    /**
     * @name getSearchSuggestions
     * @type service
     * @param {SearchSuggestionRequestModel} params - object of parameters
     * @description This service will use to get the Search Suggestions data
     * @return {Promise<AxiosResponse<ContentResponse, any>>} - The AxiosResponse containing the search suggestions data.
     *
     * @author anandpatel
     */
    getSearchSuggestions = async (param: SearchSuggestionRequestModel): Promise<AxiosResponse<ContentResponse, any>> => {
        const response: AxiosResponse<ContentResponse, any> = await this.networkRequestor!.get('/searchSuggestions', {
            params: prepareParams(param),
        });
        return response;
    };

    /**
     * @name getSearchQuery
     * @type service
     * @param {SearchSuggestionRequestModel} param - An object containing parameters for the search query request.
     * @description This service will use to get the result of searched query.
     * @return {Promise<AxiosResponse<ContentResponse, any>>} - The AxiosResponse containing the search query results data.
     * @author anandpatel
     */
    getSearchQuery = async (param: SearchRequestModel): Promise<AxiosResponse<ContentResponse, any>> => {
        const response: AxiosResponse<ContentResponse, any> = await this.networkRequestor!.get('/search', {
            params: prepareParams(param),
        });
        return response;
    };

    /**
     * @name getContentDetails
     * @type service
     * @param {SearchSuggestionRequestModel} param - An object containing parameters for the content details request.
     * @param {string} uid - The UID of the content for which details are requested.
     * @description This service will use to get the Content details of the UID
     * @return {Promise<AxiosResponse<Content, any>>} - The AxiosResponse containing the content details data.
     *
     * @author anandpatel
     */
    getContentDetails = async (param: ContentRequestModel, uid: string): Promise<AxiosResponse<Content, any>> => {
        const response: AxiosResponse<Content, any> = await this.networkRequestor!.get(`/content/${uid}`, {
            params: prepareParams(param),
        });
        return response;
    };

    /**
     * @name getRecentSearch
     * @type function/method
     * @description Retrieves the most recent search.
     * @return {Promise<AxiosResponse<RecentSearchResponse, any>>} - The AxiosResponse containing the recent search data.
     * @author anandpatel
     */
    getRecentSearch = async (): Promise<AxiosResponse<RecentSearchResponse, any>> => {
        const featureSearch = getFeatureByKey(Features.FeatureSearch) as FeatureSearch;
        const searchHistoryComponent = (featureSearch?.searchPage?.[0]?.components as PageComponent[])?.find(
            comp => comp?.type === PageComponentType.SEARCH_HISTORY,
        ) as PageComponent;
        const paramString = searchHistoryComponent?.contents?.[0]?.params;
        const paramMap = extractCommaSeparatedParams(paramString || '');
        const preparedAdditionalParams = prepareParams(paramMap);

        const response: AxiosResponse<RecentSearchResponse, any> = await this.networkRequestor!.get('/recentSearch', {
            params: {
                fetchDetails: true, // this will fetch recent search with all the details
                ...preparedAdditionalParams,
            },
        });

        //Store the recent search items in the local storage
        if (response?.data) {
            setState(StorageKeys.RECENT_SEARCH, response?.data?.searchList || response?.data?.content || []);
        }

        return response;
    };

    /**
     * @name setSearchResult
     * @type function/method
     * @param {string} searchKey - The search key to be stored on the server.
     * @description Sets the search result on the server for the specified search key.
     * @author anandpatel
     */
    setRecentSearch = async (recentSearch: RecentSearch) => {
        const region = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
        let param: RecentSearchRequestModel = {
            searchKey: recentSearch.title,
            searchMode: recentSearch.searchMode,
            uid: recentSearch.uid,
            type: recentSearch.type,
            platform: Platform.WebTv,
            region: region || undefined,
        };
        !recentSearch.uid && (param = { searchKey: recentSearch.title });
        await this.networkRequestor!.put('/recentSearch', {
            ...param,
        });
    };

    /**
     * @name removeRecentSearch
     * @type function/method
     * @description Removes all the recent search data.
     * @author anandpatel
     */
    removeRecentSearch = async () => {
        await this.networkRequestor!.delete('/recentSearch', {
            params: {
                platform: Platform.WebTv,
            },
        });
    };
}

export default SearchService;
