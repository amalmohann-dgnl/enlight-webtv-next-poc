import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import {
    ArchiveListResponse,
    CacheValue,
    ComponentData,
    ComponentDataType,
    Content,
    Series,
    ContentResponse,
    CuratedDataEntry,
    EPGResponse,
    RecommendationServiceType,
    RecommendationTransformDataType,
    ContentType,
    Platform,
} from '@enlight-webtv/models';
import {
    cacheUtilities,
    commonUtilities,
    networkUtilities,
    // transformed
} from '@enlight-webtv/utilities';
import { AxiosResponse } from 'axios';
import { RecombeeService } from '@enlight-webtv/recombee-services';

//utilities
const { generateCacheKey, getAxiosCachedResponse, setAxiosCachedResponse, clearCachedResponses } = cacheUtilities;
const { prepareParams, extractParams } = networkUtilities;
const { isValidValue } = commonUtilities;

//services
const recombeeService = new RecombeeService();

const CACHE_API: Record<string, number> = {};

class ContentService {
    static instance: ContentService | null;
    private networkRequestor;

    constructor(create = false) {
        if (create) this.destroy();
        if (ContentService.instance) {
            return ContentService.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        ContentService.instance = this;
    }

    destroy() {
        clearCachedResponses();
        if (ContentService.instance === this) {
            ContentService.instance = null;
        }
    }

    /**
     *
     * @name getChannelData
     * @type function/method
     * @description This function will fetch the data for channels
     * @param {any} params - api parameters.
     * @param {CacheValue} cache - cache the response.
     *
     * @author amalmohann
     */
    getChannelData = async (params: any, cache: CacheValue | string): Promise<EPGResponse | null> => {
        const channelParams = prepareParams(params);
        try {
            const response = (await this.cachedGetRequester('content/channels', cache, channelParams)) as unknown as EPGResponse | null;
            return response;
        } catch (error) {
            console.log(error);
            return null;
        }
    };

    /**
     *
     * @name getComponentData
     * @type function/method
     * @description This function will fetch the data for components
     * @param {ComponentData} component - api details.
     * @param {CacheValue | string} cache - cache timeout
     * @param {string} [initiatedItemID] - ID o the item that initiated the component data fetch
     * @param {ContentType} [initiatedItemType] - Type of the item initiating request
     * @param {number} page - pagination page
     * @return {Promise<ContentResponse | { content: CuratedDataEntry[]; contentType: string } | null>}
     *
     * @author amalmohann
     */
    getComponentData = async (
        component: ComponentData,
        cache: CacheValue | string,
        initiatedItemID?: string,
        initiatedItemType?: ContentType,
        page: number = 1,
    ): Promise<ContentResponse | { content: CuratedDataEntry[]; contentType: string } | ArchiveListResponse | null> => {
        let endPoint = '';
        let contentData: ContentResponse | null = null;
        const param = {
            ...extractParams(component.params),
            page: page,
            size: component.apiPageSize ?? undefined,
            platform: Platform.WebTv,
        };

        //handling different types
        switch (component.type) {
            case ComponentDataType.OTHER:
                //check for curated data
                if (component.curatedData && isValidValue(component.curatedData)) {
                    const content = component.curatedData;
                    const data: any = { ...component, content: content, contentType: 'curatedData' };
                    delete data['curatedData'];
                    return data;
                }
                break;
            case ComponentDataType.FEED_ID:
                endPoint = `/content/filters/${component.data.replace('filter://', '')}`;
                break;
            case ComponentDataType.ARCHIVE_DATA:
                endPoint = '/content/archive';
                break;
            case ComponentDataType.LISTING_PARAMS:
                endPoint = '/content/items';
                break;
            case ComponentDataType.LISTING:
                endPoint = '/content/items';
                break;
            case ComponentDataType.CALENDAR:
                endPoint = `/content/filters/${component.data.replace('filter://', '')}`;
                break;
            case ComponentDataType.HIGHLIGHTS:
                endPoint = `/content/filters/${component.data.replace('filter://', '')}`;
                break;
            case ComponentDataType.RECOMMENDATION: {
                //TODO: Change implementation to switch-case when/if additional recommendation services are added
                if (!component?.source || (component?.source && component?.source === RecommendationServiceType.RECOMBEE)) {
                    let recommendedAssets: any = {};
                    try {
                        recommendedAssets = await recombeeService.getRecombeeItemsThroughQueryString({
                            baseURL: component?.data,
                            queryString: component?.params,
                            source: RecommendationServiceType.RECOMBEE,
                            count: component.apiPageSize,
                            shouldTransFormData: true,
                            transformDataType: RecommendationTransformDataType.ENLIGHT_ASSET_TYPE,
                            initiatedItemID,
                            initiatedItemType,
                        });
                    } catch (e) {
                        console.error(e);
                    }
                    const returnData = {
                        content: recommendedAssets?.content ?? [],
                        status: recommendedAssets?.content?.length ? 'Success' : 'Error',
                        totalPages: recommendedAssets?.content?.length ? 1 : 0,
                        recommendationID: recommendedAssets?.recommendationID,
                        totalElements: recommendedAssets?.content?.length ?? 0,
                        totalCount: recommendedAssets?.content?.length ?? 0,
                    };

                    return returnData as unknown as ContentResponse;
                }
                break;
            }

            default:
                console.warn('Caught Unhandled ContentDataType', component.type);
                return new Promise<null>(resolve => {
                    return resolve(null);
                });
        }
        //returning the result
        contentData = ((await this.cachedGetRequester(endPoint, cache, { ...param })) as unknown as ContentResponse) ?? ({} as ContentResponse);

        return contentData;
    };

    /**
     *
     * @name getFeedData
     * @type function/method
     * @description This function will fetch the data for components with type FeedId
     * @param {string} endPoint - api endpoint
     * @param {Record<string, string>} params - param
     *
     * @author amalmohann
     */
    getFeedData = async (endPoint: string, params?: Record<string, any>) => {
        try {
            const feedData = await this.networkRequestor!.get<ContentResponse>(endPoint, {
                params: prepareParams(params),
            });
            return feedData.data;
        } catch (err) {
            console.error(`failed to fetch from ${endPoint}`, err);
            return null;
        }
    };

    /**
     *
     * @name getDetails
     * @type function/method
     * @description This function will fetch the details of an asset
     * @param {string} uid - asset uid.
     * @param {string} type - asset type.
     * @param {CacheValue} cache - cache.
     * @return {Promise<Conten | null>}
     *
     * @author alwin-baby
     */
    getDetails = async (uid: string, type: string, cache?: CacheValue | string): Promise<Content | null> => {
        const endPoint = `/content/${uid}`;
        let contentData: Content | null = null;
        const param = { type };

        //returning the result
        contentData = await this.cachedGetRequester(endPoint, cache ?? '', param);

        return (contentData as unknown as Content) ?? ({} as Content);
    };

    /**
     *
     * @name getSeriesDetails
     * @type function/method
     * @description This function will fetch the series detail of an asset
     * @param {string} uid - asset uid.
     * @return {Promise<Conten | null>}
     *
     * @author alwin-baby
     */
    getSeriesDetails = async (uid: string, cache?: CacheValue): Promise<Series | null> => {
        const endPoint = `/getSeriesDetails/${uid}`;
        let contentData: Content | null = null;
        const param = { language: 'fr' };

        //returning the result
        contentData = await this.cachedGetRequester(endPoint, cache ?? '', param);

        return (contentData as unknown as Series) ?? ({} as Series);
    };

    /**
     * @name cachedGetRequester
     * @type function
     * @description this function will add the cache capability for an get api
     * @author amalmohann
     */
    cachedGetRequester = async (url: string, cache: CacheValue | string, requestParams: any) => {
        const params = prepareParams(requestParams);
        const cacheKey: string = generateCacheKey(url ?? '', params ?? {});
        if (!!cache && (cache === CacheValue.FOREVER || (Number.isInteger(cache) && Number(cache) > 0))) {
            //remove the cache param if any
            CACHE_API[cacheKey] = Date.now();
            const cachedResponse: AxiosResponse | boolean = await getAxiosCachedResponse(cacheKey, {
                cache: true,
                cachedTime: Number.isInteger(cache) ? Number(cache) : 24 * 60 * 60, //24 hours in second
            });
            //check for the response is available
            if (cachedResponse) {
                return (cachedResponse as AxiosResponse).data;
            }
        }
        const response = await this.networkRequestor!.get(url, { params });
        const requestUrl = response?.request?.responseURL;
        if (CACHE_API[cacheKey] && response.data && isValidValue(response.data)) {
            setAxiosCachedResponse(cacheKey, requestUrl, response);
        }
        return response.data ?? {};
    };
}

export default ContentService;
