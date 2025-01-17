'use client'
/* eslint-disable no-case-declarations */
import { CacheValue, ComponentData, ComponentStyleType, ContentType, Page, PageComponent, PageComponentType, Routes } from '@enlight-webtv/models';
import { commonUtilities, configurationUtilities, favouriteUtilities, sideMenuUtilities } from '@enlight-webtv/utilities';
import { ContentService, ProfileServices } from '@enlight-webtv/network-services';
import { PlayerContinueWatchingServices } from '@enlight-webtv/player-services';

//import utilities
const { promiseAllSettled, isValidValue } = commonUtilities;
const { ROUTE_MAP_MENUID } = sideMenuUtilities;
const { retrieveFavourites } = favouriteUtilities;
const {
    getHomePageConfig,
    getLiveTvPageConfig,
    getOnDemandPageConfig,
    getArchivePageConfig,
    getFavouritesPageConfig,
    getCategoryPageConfig,
    getPageConfig,
} = configurationUtilities;
// //import services
const { getChannelData, getComponentData, destroy: destroyContentService } = new ContentService();
const { getFavourites, destroy: destroyProfileServices } = new ProfileServices();
const { getRecentlyWatched, setRecentlyWatchingContents } = new PlayerContinueWatchingServices();

class CatalogPageController {
    static instance: CatalogPageController | null;

    constructor(create = false) {
        if (create) this.destroy();
        if (CatalogPageController.instance) {
            return CatalogPageController.instance;
        }
        CatalogPageController.instance = this;
    }

    destroy() {
        if (CatalogPageController.instance === this) {
            CatalogPageController.instance = null;
            destroyContentService();
            destroyProfileServices();
        }
    }

    /**
     * @name CatalogPageDataProvider
     * @param page - Instance of CatalogPage Page
     * @type function
     * @description This function will provide the data required to populate the CatalogPage page as well as the
     * contentful configurations.
     * @return {Promise}
     *
     * @author alwin-baby
     */
    catalogPageDataProvider = async (page: any, route: Routes, catalogConfig?: Page) => {
        let config: Page | undefined;
        let data: any;
        let isFavourite = false;
        //check the route and getting the configuration
        switch (route) {
            case Routes.HOMEPAGE:
                config = getHomePageConfig();
                // call the recently wathcing and update to the local storage
                await setRecentlyWatchingContents();
                break;
            case Routes.LIVE_TV:
                config = getLiveTvPageConfig();
                break;
            case Routes.ON_DEMAND:
                config = getOnDemandPageConfig();
                break;
            case Routes.ARCHIVE:
                config = getArchivePageConfig();
                break;
            case Routes.CATEGORIES:
                config = getCategoryPageConfig();
                break;
            case Routes.FAVOURITES:
                config = getFavouritesPageConfig();
                isFavourite = true;
                break;
            case Routes.CATALOG:
                config = catalogConfig ?? ({} as Page);
                break;
            default:
                config = getPageConfig(ROUTE_MAP_MENUID[route]);
                break;
        }

        if (isFavourite) {
            const favouritesData = await retrieveFavourites();
            data = isValidValue(favouritesData) ? [favouritesData] : [];
            page.pageConfig = config ?? {};
            page._data = data;
        } else if (page._data.length <= 0) {
            const fetchData: any[] = (config?.components as PageComponent[]).map((component: PageComponent) =>
                this.getDataBasedOnRailType(
                    component.type as unknown as ComponentStyleType,
                    component.cache,
                    component.contents?.[0] ?? ({} as ComponentData),
                ),
            );
            data = await promiseAllSettled(fetchData);
        }

        //setting the configuration directly to the page if data is empty
        page._data.length === 0 && (page._data = data ?? []);
        page.pageConfig = config ?? ({} as Page);
    };

    /**
     * @name preFetchHomepageContents
     * @type function
     * @description This function will prefetch all the cached APIs to speed up the startup.
     *
     * @author amalmohann
     */
    preFetchHomepageContents = () => {
        const config: Page | undefined = getHomePageConfig();
        (config?.components as PageComponent[]).forEach((component: PageComponent) => {
            if (component.cache !== CacheValue.NEVER) {
                this.getDataBasedOnRailType(
                    component.type as unknown as ComponentStyleType,
                    component.cache,
                    component.contents?.[0] ?? ({} as ComponentData),
                );
            }
        });
    };

    /**
     * @name getDataBasedOnRailType
     * @type function/method
     * @description This function will take ComponentStyleType as input and fetch different api based on the
     * type of the component.
     * @param {ComponentStyleType} railType - component type
     * @param {CacheValue | string} cache - component type
     * @param {ComponentData} componentData - [optional] component data
     * @param {string} [initiatedItemID] - ID of the item that initiated the rail fetch
     * It is used in recombee to get related rail recommendations
     * @param {ContentType} [initiatedItemType] - Type of the item that initiated the rail fetch
     * It is used in recombee to get related rail recommendations
     * @return {any} result
     *
     * @author amalmohann
     */
    getDataBasedOnRailType = async (
        railType: ComponentStyleType | PageComponentType,
        cache: CacheValue | string,
        componentData?: ComponentData,
        initiatedItemID?: string,
        initiatedItemType?: ContentType,
    ) => {
        let result: any;
        const now = new Date().getTime();
        //calculate the 12 hours from now in epoch milliseconds
        const twelve_hours_from_now = now + 12 * 3600 * 1000;
        //calculate the 12 hours before now in epoch milliseconds
        const twelve_hours_before_now = now - 12 * 3600 * 1000;

        switch (railType) {
            case ComponentStyleType.LIVE_TV:
                result = await getChannelData({ byListingTime: `${now}~${twelve_hours_from_now}`, range: -1 }, cache);
                result = {
                    ...result,
                    railType: ComponentStyleType.LIVE_TV,
                };
                break;
            case ComponentStyleType.CATCH_UP:
                result = await getChannelData({ byListingTime: `${twelve_hours_before_now}~${now}`, range: -1 }, cache);
                result = {
                    ...result,
                    railType: ComponentStyleType.CATCH_UP,
                };
                break;
            case ComponentStyleType.RECENTLY_WATCHED:
                result = await getRecentlyWatched();
                result = {
                    ...result,
                    railType: ComponentStyleType.RECENTLY_WATCHED,
                };
                break;
            case ComponentStyleType.NEXT_RALLIES:
                result = await getComponentData(componentData ?? ({} as ComponentData), cache);
                result = {
                    ...result,
                    railType: ComponentStyleType.NEXT_RALLIES,
                };
                break;
            case ComponentStyleType.FAVOURITES:
                //Get the favourites from localStorage
                result = retrieveFavourites();
                //Update the localStorage from api
                getFavourites();
                break;
            default:
                result = await getComponentData(componentData ?? ({} as ComponentData), cache, initiatedItemID, initiatedItemType);
        }
        return result;
    };
}

export default CatalogPageController;
