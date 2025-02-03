import {
    RecommendationBaseConfig,
    RecommendationModifiers,
    RecommendationReturnConfig,
    RecommendationTransformConfig,
    RecombeeRecommendItemsType,
    RecombeeServerRegion,
    StorageKeys,
    RecommendationTransformDataType,
    RecommendationServiceType,
    RecombeeSearchItemsType,
    RecombeeItemsThroughQueryStringParamModel,
    RecombeeServiceResponseDataType,
    RecombeeRecommendationResponse,
    CountryInfo,
} from '@enlight-webtv/models';
import axios from 'axios';
import { commonUtilities, recommendationUtilities, storageUtilities } from '@enlight-webtv/utilities';

//import services
const { getState } = storageUtilities;

//import utilities
const { generate_HMAC_Signature, isValidUrl, isValidValue } = commonUtilities;
const { getRecommendationUserID, constructRecombeeConfigQueryParams, transformRecombeeData, getRecombeeServerRegionBaseUrl } =
    recommendationUtilities;

class RecombeeService {
    // Class instance
    static instance: RecombeeService | null;

    // Private class properties
    #baseURL: string | null = null;
    #publicToken: string | null = null;
    #databaseID: string | null = null;
    #countryCode: string | null = null;
    #region: string | null = null;
    #locale: string | null = null;
    #recombeeUserID: string | null = null;
    #regionBaseURLMapping: Record<RecombeeServerRegion, string> = {
        [RecombeeServerRegion.AP_SE]: 'https://client-rapi-ap-se.recombee.com',
        [RecombeeServerRegion.CA_EAST]: 'https://client-rapi-ca-east.recombee.com',
        [RecombeeServerRegion.EU_WEST]: 'https://client-rapi-eu-west.recombee.com',
        [RecombeeServerRegion.US_WEST]: 'https://client-rapi-us-west.recombee.com',
    };

    // constructor
    constructor(create = false) {
        // Reuse previous class instance if already available
        if (create) this.destroy();
        if (RecombeeService.instance) {
            return RecombeeService.instance;
        }
        RecombeeService.instance = this;
    }

    /**
     * @name initializeRequiredServiceProperties
     * @type Public method
     * @description This function initializes the requried class properties like country code,
     * recommendation userID, locale, tokens etc
     * @returns {Promise<void>}
     * @throws {Error} - Throws error if required properties are not able to be initialized
     *
     * @author tonyaugustine
     */
    initializeRequiredServiceProperties = async () => {
        // Sets the public token and fallback base url properties from env variables
        if (!this.#publicToken || !this.#baseURL) {
            //import.meta having type config issue.

                const publicToken = '';
                const baseURL = '';
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore

            // Throw error if recombee public token not found
            // if (typeof publicToken !== 'string' || !publicToken) {
            //     throw new Error(`Invalid recombee token ${publicToken}`);
            // }

            this.#publicToken = publicToken;
            this.#baseURL = baseURL;
        }

        // Sets the country code and region properties
        const countryCode = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
        if (countryCode) {
            this.#countryCode = countryCode;
            this.#region = this.#countryCode?.toLocaleLowerCase() ?? null;
        } else {
            console.warn(`Invalid country code ${countryCode}`);
        }

        const recombeeUserID = getRecommendationUserID();

        // Throw error if recombee user id not found
        if (!recombeeUserID) {
            throw new Error(`Invalid recombee user id ${recombeeUserID}`);
        }
        this.#recombeeUserID = recombeeUserID;

        // Locale needs to be refetched every time from storage as it can change during app language changes
        const locale = getState(StorageKeys.LOCALE);
        if (!locale) {
            console.warn('Locale not available');
        } else this.#locale = locale;
    };

    /**
     * @name getRecombeeItemsThroughQueryString
     * @type Public method
     * @description This function retrives the required assets from recombee by parsing and
     * constructing params using the query string passed to it
     * @param {RecommendationsThroughQueryStringParamModel} paramData - Data required to fetch items from recombee
     * through through a query param string
     *
     * @returns {Promise<RecombeeServiceResponseDataType>}
     * @throws {Error} - Throws error if invalid recommendan database, filter if source is not recombee
     *
     * @author tonyaugustine
     */
    getRecombeeItemsThroughQueryString = async (paramData: RecombeeItemsThroughQueryStringParamModel) => {
        // Construct the query params and return the data as an onbject
        const params = await constructRecombeeConfigQueryParams(paramData.queryString, paramData.initiatedItemID, paramData.initiatedItemType);

        //throw error if params dont contain the required data
        if (paramData.source !== RecommendationServiceType.RECOMBEE) {
            throw new Error('Recommendation source is not recombee');
        }

        if (!params.databaseId) {
            throw new Error(`Invalid recombee databse: ${params.databaseId}`);
        }

        if (!params.recommendation_filter) {
            throw new Error(`Recommendation fiter not available: ${params.recommendation_filter}`);
        }

        // Get items from recombee using the params from the query string
        const retreivedRecommendations = await this.getRecombeeItems(
            params.recommendation_filter as RecombeeRecommendItemsType | RecombeeSearchItemsType,
            { databaseId: params.databaseId, region: params.region, baseURL: paramData.baseURL },
            {
                searchQuery: paramData.searchQuery,
                selectedRecombeeItemID: params.itemId,
                scenario: params.scenario,
                logic: params.logic,
                filter: params.filters,
                booster: params.booster,
                minRelevance: params.minRelevance,
                rotationRate: params.rotationRate,
                rotationTime: params.rotationTime,
            },
            {
                count: paramData.count,
                returnProperties: params.returnProperties,
                includedProperties: params.includedProperties,
            },
            {
                shouldTransFormData: paramData.shouldTransFormData,
                transformDataType: paramData.transformDataType,
            },
        );

        return retreivedRecommendations;
    };

    /**
     * @name getRecombeeItems
     * @type Public method
     * @description This method retrives the items from recombee
     * @param {RecombeeRecommendItemsType | RecombeeSearchItemsType} itemRecommendationType -Recommendation type
     * @param {RecommendationBaseConfig} baseConfig - Base configuration to make a request to recombee
     * @param {RecommendationModifiers} recommendationModifiers - Properties to modify the recommendation algorithm
     * @param {RecommendationReturnConfig} returnDataConfig - Properites to modify the format of data retriveved from recombee
     * @param {RecommendationTransformConfig} dataTransformationConfig - Properties to determine the post retreival data transformation process
     *
     * @returns {Promise<RecombeeServiceResponseDataType>} - Data retreived from recombee
     * @throws {Error} - Throws error if invalid recommendan database, filter if source is not recombee
     *
     * @author tonyaugustine
     */
    async getRecombeeItems(
        itemRecommendationType: RecombeeRecommendItemsType | RecombeeSearchItemsType,
        baseConfig: RecommendationBaseConfig,
        recommendationModifiers: RecommendationModifiers,
        returnDataConfig: RecommendationReturnConfig,
        dataTransformationConfig: RecommendationTransformConfig,
    ) {
        //Set required service properties
        await this.initializeRequiredServiceProperties();

        let finalBaseURL: string | null = baseConfig.baseURL ?? this.#baseURL ?? null;
        let requestPathSegment = '';
        let httpRequestMethod: string | undefined;
        let requestParams: any = {};

        // Set the databse id from params
        this.#databaseID = baseConfig.databaseId;

        // Retreive the base url based on the recombe server region
        if (baseConfig.region) {
            try {
                finalBaseURL = getRecombeeServerRegionBaseUrl(baseConfig.region);
            } catch (error) {
                console.error(error);
            }
        }

        if (!finalBaseURL) throw new Error(`Invalid recombee base url ${finalBaseURL}`);

        // Fomrat the request and params based on the recombee filter taken from config
        switch (itemRecommendationType) {
            case RecombeeRecommendItemsType.RECOMMEND_ITEMS_TO_USER: {
                const requestData = this.#getRecommendedItemsToUser(
                    { databaseId: baseConfig.databaseId, region: baseConfig.region, baseURL: baseConfig.baseURL },
                    {
                        scenario: recommendationModifiers.scenario,
                        logic: recommendationModifiers.logic,
                        filter: recommendationModifiers.filter,
                        booster: recommendationModifiers.booster,
                        minRelevance: recommendationModifiers.minRelevance,
                        rotationRate: recommendationModifiers.rotationRate,
                        rotationTime: recommendationModifiers.rotationTime,
                    },
                    {
                        count: returnDataConfig.count,
                        returnProperties: returnDataConfig.returnProperties,
                        includedProperties: returnDataConfig.includedProperties,
                    },
                );
                requestPathSegment = requestData.requestPathSegment;
                httpRequestMethod = requestData.httpRequestMethod;
                requestParams = requestData.requestParams;
                break;
            }

            case RecombeeRecommendItemsType.RECOMMEND_ITEMS_TO_ITEM: {
                const requestData = this.#getRecommendedItemsToItem(
                    recommendationModifiers.selectedRecombeeItemID ?? '',
                    { databaseId: baseConfig.databaseId, region: baseConfig.region, baseURL: baseConfig.baseURL },
                    {
                        scenario: recommendationModifiers.scenario,
                        logic: recommendationModifiers.logic,
                        filter: recommendationModifiers.filter,
                        booster: recommendationModifiers.booster,
                        minRelevance: recommendationModifiers.minRelevance,
                        rotationRate: recommendationModifiers.rotationRate,
                        rotationTime: recommendationModifiers.rotationTime,
                    },
                    {
                        count: returnDataConfig.count,
                        returnProperties: returnDataConfig.returnProperties,
                        includedProperties: returnDataConfig.includedProperties,
                    },
                );
                requestPathSegment = requestData.requestPathSegment;
                httpRequestMethod = requestData.httpRequestMethod;
                requestParams = requestData.requestParams;
                break;
            }

            case RecombeeRecommendItemsType.RECOMMEND_NEXT_ITEMS: {
                const requestData = this.#getNextRecommendedItems(recommendationModifiers.prevRecommendationID ?? '', {
                    count: returnDataConfig.count,
                });
                requestPathSegment = requestData.requestPathSegment;
                httpRequestMethod = requestData.httpRequestMethod;
                requestParams = requestData.requestParams;
                break;
            }

            case RecombeeSearchItemsType.SEARCH_ITEMS: {
                const requestData = this.#getSearchItems(
                    recommendationModifiers.searchQuery ?? '',
                    { databaseId: baseConfig.databaseId, region: baseConfig.region, baseURL: baseConfig.baseURL },
                    {
                        scenario: recommendationModifiers.scenario,
                        logic: recommendationModifiers.logic,
                        filter: recommendationModifiers.filter,
                        booster: recommendationModifiers.booster,
                    },
                    {
                        count: returnDataConfig.count,
                        returnProperties: returnDataConfig.returnProperties,
                        includedProperties: returnDataConfig.includedProperties,
                    },
                );
                requestPathSegment = requestData.requestPathSegment;
                httpRequestMethod = requestData.httpRequestMethod;
                requestParams = requestData.requestParams;
                break;
            }
        }

        // Send the constructed query to recombee
        const response = await this.#sendQuery(httpRequestMethod, finalBaseURL, requestPathSegment, requestParams);

      const responseData: RecombeeRecommendationResponse = {} as RecombeeRecommendationResponse;
      return;

        if (!isValidValue(responseData)) throw new Error('Unable to retreive data');

        // If result data needs to be transfromed, transform it the the requried format
        if (dataTransformationConfig.shouldTransFormData) {
            const transformedData = await transformRecombeeData(
                responseData?.recomms,
                RecommendationTransformDataType.ENLIGHT_ASSET_TYPE,
                responseData?.recommId,
            );
            return { content: transformedData, recommendationID: responseData?.recommId } as RecombeeServiceResponseDataType;
        }

        return { content: responseData?.recomms ?? [], recommendationID: responseData?.recommId } as RecombeeServiceResponseDataType;
    }

    /**
     * @name #getRecommendedItemsToItem
     * @type Private method
     * @description Used to get recommendation that are reated to the currently selected item (selectedRecombeeItemID)
     * @param {string} selectedRecombeeItemID - Recombee item id of the item viewed
     * @param {RecommendationBaseConfig} baseConfig - Base configuration to make a request to recombee
     * @param {RecommendationModifiers} recommendationModifiers - Properties to modify the recommendation algorithm
     * @param {RecommendationReturnConfig} returnDataConfig - Properites to modify the format of data retriveved from recombee
     *
     * @returns {any}
     * @throws {Error} - If item id is invalid
     *
     * @author tonyaugustine
     */
    #getRecommendedItemsToItem(
        selectedRecombeeItemID: string,
        baseConfig: RecommendationBaseConfig,
        recommendationModifiers: RecommendationModifiers,
        returnDataConfig: RecommendationReturnConfig,
    ) {
        if (!selectedRecombeeItemID) {
            throw new Error(`Invalid recombee item id ${selectedRecombeeItemID}`);
        }

        const requestPathSegment = `/recomms/items/${encodeURIComponent(selectedRecombeeItemID)}/items/`;
        const httpRequestMethod = 'POST';

        return {
            httpRequestMethod,
            requestPathSegment,
            requestParams: {
                count: returnDataConfig.count,
                cascadeCreate: baseConfig.cascadeCreate ?? true,
                returnProperties: returnDataConfig.returnProperties ?? true,
                targetUserId: this.#recombeeUserID,
                ...(recommendationModifiers.scenario && { scenario: recommendationModifiers.scenario }),
                ...(returnDataConfig.includedProperties && { includedProperties: returnDataConfig.includedProperties }),
                ...(recommendationModifiers.filter && { filter: recommendationModifiers.filter }),
                ...(recommendationModifiers.booster && { booster: recommendationModifiers.booster }),
                ...(recommendationModifiers.logic && { logic: recommendationModifiers.logic }),
                ...(recommendationModifiers.minRelevance && { minRelevance: recommendationModifiers.minRelevance }),
                ...(recommendationModifiers.rotationRate && { rotationRate: recommendationModifiers.rotationRate }),
                ...(recommendationModifiers.rotationTime && { rotationTime: recommendationModifiers.rotationTime }),
            },
        };
    }

    /**
     * @name #getSearchItems
     * @type Private method
     * @description Get items from recombee through a search query term
     * @param {string} searchQuery - Query to search for
     * @param {RecommendationBaseConfig} baseConfig - Base configuration to make a request to recombee
     * @param {RecommendationModifiers} recommendationModifiers - Properties to modify the recommendation algorithm
     * @param {RecommendationReturnConfig} returnDataConfig - Properites to modify the format of data retriveved from recombee
     *
     * @returns {any}
     * @throws {Error} - Throws error if search query is invalid
     *
     * @author tonyaugustine
     */
    #getSearchItems(
        searchQuery: string,
        baseConfig: RecommendationBaseConfig,
        recommendationModifiers: RecommendationModifiers,
        returnDataConfig: RecommendationReturnConfig,
    ) {
        if (!searchQuery) {
            throw new Error(`Invalid recombee search query term ${searchQuery}`);
        }

        if (!this.#recombeeUserID) {
            throw new Error('Invalid recombee user id');
        }

        const requestPathSegment = `/search/users/${encodeURIComponent(this.#recombeeUserID)}/items/`;
        const httpRequestMethod = 'POST';

        return {
            httpRequestMethod,
            requestPathSegment,
            requestParams: {
                count: returnDataConfig.count,
                cascadeCreate: baseConfig.cascadeCreate ?? true,
                returnProperties: returnDataConfig.returnProperties ?? true,
                searchQuery,
                ...(recommendationModifiers.scenario && { scenario: recommendationModifiers.scenario }),
                ...(returnDataConfig.includedProperties && { includedProperties: returnDataConfig.includedProperties }),
                ...(recommendationModifiers.filter && { filter: recommendationModifiers.filter }),
                ...(recommendationModifiers.booster && { booster: recommendationModifiers.booster }),
                ...(recommendationModifiers.logic && { logic: recommendationModifiers.logic }),
                ...(recommendationModifiers.minRelevance && { minRelevance: recommendationModifiers.minRelevance }),
                ...(recommendationModifiers.rotationRate && { rotationRate: recommendationModifiers.rotationRate }),
                ...(recommendationModifiers.rotationTime && { rotationTime: recommendationModifiers.rotationTime }),
            },
        };
    }

    /**
     * @name #getNextRecommendedItems
     * @type Private method
     * @description Used to get a next set of recommended item based on previous recommendation ID
     * It is is used for pagination implementation
     * @param {string} recommendationID - Recommendation id of the previous recommendation from recombee
     * @param {RecommendationReturnConfig} returnDataConfig - Properites to modify the format of data retriveved from recombee
     *
     * @returns {any}
     * @throws {Error} - Throws error if recommendation id is invalid
     *
     * @author tonyaugustine
     */
    #getNextRecommendedItems(recommendationID: string, returnDataConfig: RecommendationReturnConfig) {
        if (!recommendationID) {
            throw new Error(`Invalid recommendation id ${recommendationID}`);
        }

        const requestPathSegment = `/recomms/next/items/${encodeURIComponent(recommendationID)}`;
        const httpRequestMethod = 'POST';

        return {
            httpRequestMethod,
            requestPathSegment,
            requestParams: {
                count: returnDataConfig.count,
            },
        };
    }

    /**
     * @name #recommendItemsToUser
     * @type Private method
     * @description Returns the recommended items interested to a user
     * @param {RecommendationBaseConfig} baseConfig - Base configuration to make a request to recombee
     * @param {RecommendationModifiers} recommendationModifiers - Properties to modify the recommendation algorithm
     * @param {RecommendationReturnConfig} returnDataConfig - Properites to modify the format of data retriveved from recombee
     *
     * @returns {any}
     * @author tonyaugustine
     */
    #getRecommendedItemsToUser(
        baseConfig: RecommendationBaseConfig,
        recommendationModifiers: RecommendationModifiers,
        returnDataConfig: RecommendationReturnConfig,
    ) {
        if (!this.#recombeeUserID) {
            throw new Error(`Invalid recommendation id ${this.#recombeeUserID}`);
        }

        const requestPathSegment = `/recomms/users/${encodeURIComponent(this.#recombeeUserID)}/items/`;
        const httpRequestMethod = 'POST';

        return {
            httpRequestMethod,
            requestPathSegment,
            requestParams: {
                count: returnDataConfig.count,
                cascadeCreate: baseConfig.cascadeCreate ?? true,
                returnProperties: returnDataConfig.returnProperties ?? true,
                ...(recommendationModifiers.scenario && { scenario: recommendationModifiers.scenario }),
                ...(returnDataConfig.includedProperties && { includedProperties: returnDataConfig.includedProperties }),
                ...(recommendationModifiers.filter && { filter: recommendationModifiers.filter }),
                ...(recommendationModifiers.booster && { booster: recommendationModifiers.booster }),
                ...(recommendationModifiers.logic && { logic: recommendationModifiers.logic }),
                ...(recommendationModifiers.minRelevance && { minRelevance: recommendationModifiers.minRelevance }),
                ...(recommendationModifiers.rotationRate && { rotationRate: recommendationModifiers.rotationRate }),
                ...(recommendationModifiers.rotationTime && { rotationTime: recommendationModifiers.rotationTime }),
            },
        };
    }

    /**
     * @name #sendQuery
     * @type Private method
     * @description Send the http request to recombee to fetch items
     * @param {string} httpRequestMethod
     * @param {string} baseURL
     * @param {string} requestPathSegment
     * @param {any} requestBody
     *
     * @returns {Promise<AxiosResponse<any,any>>}
     * @throws {Error} Throws error query is in invalid request format or signing process fails
     *
     * @author tonyaugustine
     */
    async #sendQuery(httpRequestMethod: string, baseURL: string, requestPathSegment: string, requestBody: any) {
        if (!isValidUrl(baseURL)) {
            throw new Error(`Invalid url format ${baseURL}`);
        }

        if (httpRequestMethod !== 'GET' && httpRequestMethod !== 'POST') {
            throw new Error(`invalid http request method ${httpRequestMethod}`);
        }

        // If request type if POST send a post request
        if (httpRequestMethod === 'POST') {
            // Retrived the signed request path segemnt
            const signedRequestPathSegment = this.#signURL(requestPathSegment);
            // Construct the final url
            const finalRequstURL = baseURL + signedRequestPathSegment;

            // const data = await axios.post(
            //     finalRequstURL,
            //     { ...requestBody },
            //     { headers: { Accept: 'application/json', 'Content-Type': 'application/json' } },
            // );
            return {};
        } else {
            throw new Error('Recombee GET requests not yet handled');
        }
    }

    /**
     * @name #signURL
     * @description Sign the url using HMAC Signature and HMAC timestamp
     * @param {string} requestPath - Url segment to be signed
     *
     * @returns {string} - Url segment with signatures added as url query params
     * @throws {Error} - If Signature process fails
     * @author tonyaugustine
     */
    #signURL(requestPath: string): string | any {
        // Append database id to the request path
        let url = '/' + this.#databaseID + requestPath;

        // Add HMAC timestamp to the request path. Also check if URL params are already present
        url += (requestPath.indexOf('?') == -1 ? '?' : '&') + 'frontend_timestamp=' + Math.trunc(new Date().getTime() / 1000);

        if (url && this.#publicToken) {
            // Generate and append the HMAC SHA-1 signature as a url param
            const HMAC_Signature = generate_HMAC_Signature(url, this.#publicToken);

            url += '&frontend_sign=' + HMAC_Signature;
            return url;
        } else {
            // throw new Error('Unable to sign URL');
        }
    }

    // Destructor
    destroy() {
        if (RecombeeService.instance === this) {
            RecombeeService.instance = null;
        }
    }

    // Getter for region-url mapping
    get regionBaseURLMapping() {
        return this.#regionBaseURLMapping;
    }

    // Getter for locale
    get locale() {
        return this.#locale;
    }

    // Getter for region
    get region() {
        return this.#region;
    }

    //  Getter for basurl
    get baseURL() {
        return this.#baseURL;
    }
}

export default RecombeeService;
