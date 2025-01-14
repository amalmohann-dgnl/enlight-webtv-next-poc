import { MenuItemID, Routes } from '@enlight-webtv/models';

/**
 * @name ROUTE_MAP
 * @type Map
 * @description This have all the different route mapping for various menu items.
 * @author alwin-baby
 */
const ROUTE_MAP: Record<string, string> = {
    [MenuItemID.MENU_HOME]: Routes.HOMEPAGE,
    [MenuItemID.MENU_SHOWS]: Routes.SHOWS,
    [MenuItemID.MENU_MOVIE]: Routes.MOVIE,
    [MenuItemID.MENU_DIVERTISSEMENT]: Routes.DIVERTISSEMENT,
    [MenuItemID.MENU_KIDS]: Routes.KIDS,
    [MenuItemID.SEARCH_BAR]: Routes.SEARCH,
    [MenuItemID.SEARCH_MENU_ITEM]: Routes.SEARCH,
    [MenuItemID.MENU_LIVE_TV]: Routes.LIVE_TV,
    [MenuItemID.ON_DEMAND_MENU]: Routes.ON_DEMAND,
    [MenuItemID.ARCHIVE_MENU]: Routes.ARCHIVE,
    [MenuItemID.MENU_CATEGORIES]: Routes.CATEGORIES,
    [MenuItemID.FAVOURITES]: Routes.FAVOURITES,
    [MenuItemID.MENU_FAVORITES]: Routes.FAVOURITES,
    [MenuItemID.MENU_PROFILE]: Routes.PROFILES,
    [MenuItemID.FAQ_ITEM]: Routes.HELP,
    [MenuItemID.MENU_SETTINGS]: Routes.SETTINGS,
    [MenuItemID.LOGOUT]: Routes.LOGOUT,
};

/**
 * @name ROUTE_MAP
 * @type Map
 * @description This have all the different route maping for various menu items.
 * @author alwin-baby
 */
const ROUTE_MAP_MENUID: Record<string, string> = {
    [Routes.HOMEPAGE]: MenuItemID.MENU_HOME,
    [Routes.SHOWS]: MenuItemID.MENU_SHOWS,
    [Routes.MOVIE]: MenuItemID.MENU_MOVIE,
    [Routes.DIVERTISSEMENT]: MenuItemID.MENU_DIVERTISSEMENT,
    [Routes.KIDS]: MenuItemID.MENU_KIDS,
    [Routes.SEARCH]: MenuItemID.SEARCH_BAR,
    [Routes.LIVE_TV]: MenuItemID.MENU_LIVE_TV,
    [Routes.ON_DEMAND]: MenuItemID.ON_DEMAND_MENU,
    [Routes.ARCHIVE]: MenuItemID.ARCHIVE_MENU,
    [Routes.CATEGORIES]: MenuItemID.MENU_CATEGORIES,
    [Routes.FAVOURITES]: MenuItemID.FAVOURITES,
    [Routes.HELP]: MenuItemID.FAQ_ITEM,
    [Routes.LOGOUT]: MenuItemID.LOGOUT,
    [Routes.SETTINGS]: MenuItemID.MENU_SETTINGS,
};

export { ROUTE_MAP, ROUTE_MAP_MENUID };
