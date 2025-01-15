import {
    ButtonVariants,
    ComponentStyleType,
    ContentType,
    CurrentEventStatus,
    LabelKey,
    MenuItem,
    MenuItemID,
    PageComponent,
    PreviewComponentDataNew,
    Project,
    RailContentModel,
    RailHandlingType,
} from '@enlight-webtv/models';
import { configurationUtilities, timeUtilities, commonUtilities } from '.';

//import.meta having type config issue.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const project = import.meta.env.VITE_PROJECT_NAME;

//utilities
const { getCatalogConfig, getLabel } = configurationUtilities;
const { has24HoursPassed, getCurrentStatus } = timeUtilities;
const { isValidValue, cloneObject } = commonUtilities;

/**
 * @name getTabsFromCatalogConfig
 * @type function/method
 * @description This function will get the tabs from the catalog config
 *
 * @author alwin-baby
 */
const getTabsFromCatalogConfig = () => {
    const catalogConfig = getCatalogConfig();
    const tabs = catalogConfig?.tab || [];

    // Create a Map to track unique tabs by id
    const uniqueTabsMap = new Map();

    tabs.forEach(tab => {
        if (tab.id && !uniqueTabsMap.has(tab.id)) {
            uniqueTabsMap.set(tab.id, tab);
        }
    });

    // Convert the Map values back to an array
    return Array.from(uniqueTabsMap.values());
};

/**
 * @name getButtonGroupProperties
 * @type function/method
 * @description This function will get the button group properties.
 * @param {string[]} tabItems - the type of the content to be displayed.
 *
 * @author amalmohann
 */
const getButtonGroupProperties = (tabItems: MenuItem[]): object => {
    tabItems = tabItems.map((menuItem: MenuItem) => {
        return {
            ...menuItem,
            variant: ButtonVariants.textButton,
        };
    });
    const relatedItems = {
        buttonMarginRight: 24,
        buttons: tabItems,
        buttonLabels: tabItems.map((menuItem: MenuItem) => menuItem.title),
    };
    return relatedItems;
};

/**
 * @name getTabItems
 * @type function/method
 * @description This function will return the proper tab item labels for the current content content.
 * @param {PreviewComponentDataNew} data - parsed data used in preview component.
 *
 * @author alwin-baby
 */
const getTabItems = (data: PreviewComponentDataNew) => {
    if (project === Project.RALLY_TV) return getTabItemsForRallyTv(data);

    const tabs = getTabsFromCatalogConfig();
    return cloneObject(tabs);
};

/**
 * @name getTabItemsForRallyTv
 * @type function/method
 * @description This function will return the proper tab item labels for the rally tv project.
 * @param {PreviewComponentDataNew} data - parsed data used in preview component.
 *
 * @author alwin-baby
 */
const getTabItemsForRallyTv = (data: PreviewComponentDataNew) => {
    const { eventStartTime = null, eventEndTime = null, type = '', railType = '' } = data;
    let tabArray: (MenuItem | undefined)[] = [];

    const isCalenderEvent = type === ContentType.CALENDAR || railType === ComponentStyleType.NEXT_RALLIES;
    const isVod = type !== ContentType.CALENDAR && railType !== ComponentStyleType.NEXT_RALLIES;
    const is24HoursAfter = has24HoursPassed(eventStartTime);

    const currentStatus = getCurrentStatus(eventStartTime, eventEndTime);
    if (isCalenderEvent) {
        const highlightsComponent = getTabComponentById(MenuItemID.HIGHLIGHTS_DETAILS_MENU);
        const scheduleComponent = getTabComponentById(MenuItemID.SCHEDULE_DETAILS_MENU);
        const fullReplayComponent = getTabComponentById(MenuItemID.FULL_REPLAY_DETAILS_MENU);

        switch (currentStatus) {
            case CurrentEventStatus.UPCOMING:
            case CurrentEventStatus.LIVE:
                tabArray = [scheduleComponent, highlightsComponent];
                break;

            case CurrentEventStatus.COMPLETED:
                tabArray = is24HoursAfter ? [fullReplayComponent, highlightsComponent] : [scheduleComponent, highlightsComponent];
                break;

            default:
                tabArray = [scheduleComponent, highlightsComponent];
                break;
        }
    }
    if (isVod) {
        const relatedComponent = getTabComponentById(MenuItemID.RELATED_DETAILS_MENU);
        if (relatedComponent?.title) {
            tabArray.push(relatedComponent);
        }
    }

    return tabArray;
};

/**
 * @name getComponentAndRailHandlingType
 * @type function/method
 * @param {string} tabItem - Tab item
 * @description This function will get the required component each tabItem.
 *
 * @author alwin-baby
 */
const getComponentAndRailHandlingType = (tabItem: string | undefined) => {
    let railHandlingType: RailHandlingType | null = null;
    let addToQueue = false;

    if (project === Project.RALLY_TV) return getComponentAndRailHandlingTypeForRallyTv(tabItem);

    const tabs = getTabsFromCatalogConfig();
    const menuItem = tabs.find((tab: MenuItem) => tab.title === tabItem) || ({} as MenuItem);
    const component: PageComponent = menuItem?.page?.[0]?.components?.[0] as PageComponent;
    railHandlingType = RailHandlingType.RELATED_RAIL;

    if (menuItem?.id === MenuItemID.TRAILERS_DETAILS_TAB) {
        railHandlingType = RailHandlingType.TRAILERS_RAIL;
        addToQueue = true;
    }

    if (menuItem?.id === MenuItemID.EPISODE_DETAILS_MENU) {
        railHandlingType = RailHandlingType.EPISODES_RAIL;
        addToQueue = true;
    }

    return { component, railHandlingType, addToQueue };
};

/**
 * @name getComponentAndRailHandlingTypeForRallyTv
 * @type function/method
 * @param {string} tabItem - Tab item
 * @description This function will get the required component for each tabItem for the rally tv project.
 *
 * @author alwin-baby
 */
const getComponentAndRailHandlingTypeForRallyTv = (tabItem: string | undefined) => {
    let component: PageComponent = {} as PageComponent;
    let railHandlingType: RailHandlingType | null = null;
    let addToQueue = false;

    const relatedComponent = getTabComponentById(MenuItemID.RELATED_DETAILS_MENU);
    const highlightsComponent = getTabComponentById(MenuItemID.HIGHLIGHTS_DETAILS_MENU);
    const scheduleComponent = getTabComponentById(MenuItemID.SCHEDULE_DETAILS_MENU);
    const fullReplayComponent = getTabComponentById(MenuItemID.FULL_REPLAY_DETAILS_MENU);

    if (tabItem) {
        switch (tabItem) {
            case relatedComponent?.title:
                component = relatedComponent?.page?.[0]?.components?.[0] as PageComponent;
                railHandlingType = RailHandlingType.RELATED_RAIL;
                break;

            case highlightsComponent?.title:
                component = highlightsComponent?.page?.[0]?.components?.[0] as PageComponent;
                railHandlingType = RailHandlingType.HIGHLIGHTS_RAIL;
                break;

            case scheduleComponent?.title:
                component = scheduleComponent?.page?.[0]?.components?.[0] as PageComponent;
                railHandlingType = RailHandlingType.SCHEDULES_RAIL;
                addToQueue = true;
                break;

            case fullReplayComponent?.title:
                component = fullReplayComponent?.page?.[0]?.components?.[0] as PageComponent;
                railHandlingType = RailHandlingType.FULL_REPLAY_RAIL;
                addToQueue = true;
                break;

            default:
                break;
        }
    }

    return { component, railHandlingType, addToQueue };
};

/**
 * @name replaceRelatedParams
 * @type function/method
 * @param {string} str - the string to be replaced
 * @param {Details} detailsComponent - the details component
 * @description This function will replace the different params with appropriate data.
 * @return {string} String with replaced params.
 *
 * @author alwin-baby
 */
const replaceRelatedParams = (str = '', data: any = {}): string => {
    const {
        availableOn = null,
        availableTill = null,
        startDate = null,
        endDate = null,
        type = '',
        seriesUid = '',
        seasonId = '',
        releaseYear = null,
        championship = '',
        country = {},
        genre = '',
        endDateLocal = null,
    } = data;
    const listingTime = `${availableOn || startDate}~${availableTill || endDate}`;
    const media_type = type === ContentType.EPISODE ? ContentType.SERIES : type;
    str = str?.replace(/\{listing_time\}/g, listingTime);
    str = str?.replace(/\{media_type\}/g, media_type || '');

    str = str?.replace(/\{seriesUid\}/g, seriesUid || '');
    str = str?.replace(/\{series_id\}/g, seriesUid || '');

    str = str?.replace(/\{season_id\}/g, seasonId || '');

    str = str?.replace(/\{year\}/g, releaseYear || (endDateLocal ? new Date(endDateLocal).getFullYear() : '') || '');
    str = str?.replace(/\{calendar_year\}/g, releaseYear || '');

    str = str?.replace(/\{tag\}/g, championship || '');
    str = str?.replace(/\{championship_type\}/g, championship || '');

    str = str?.replace(/\{country_name\}/g, country?.name || '');
    str = str?.replace(/\{genre\}/g, genre || '');
    str = str.replace(/,/g, '&');

    return str;
};

/**
 * @name getTabComponentById
 * @type function/method
 * @param {MenuItemID} menuItemId
 * @description This function will get the tab component according to its id.
 * @return {PageComponent} The related media component.
 *
 * @author alwin-baby
 */
const getTabComponentById = (menuItemId: MenuItemID) => {
    const tabs = getTabsFromCatalogConfig();
    const menuItem = tabs.find(item => item.id === menuItemId);
    return menuItem;
};

let placeholderCardDataCache = {} as RailContentModel;
/**
 * @name getPlaceholderCardData
 * @type function/method
 * @description This function will return the placeholder data if there is no schedule available.
 * @return {RailContentModel} Placeholder data.
 *
 * @author alwin-baby
 */
const getPlaceholderCardData = () => {
    if (isValidValue(placeholderCardDataCache)) {
        return placeholderCardDataCache;
    }

    const data = {
        title: getLabel(LabelKey.LABEL_PLACEHOLDER_TITLE) as string,
        images: [
            {
                url: 'images/SchedulePlaceholeder.png',
            },
        ],
    } as RailContentModel;
    placeholderCardDataCache = data;
    return data;
};

/**
 * @name clearThumbnailPlaybackTimer
 * @type function/method
 * @description This function will clear the thumbnail playback timer if any
 *
 * @author amalmohann
 */
const clearThumbnailPlaybackTimer = () => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (window.thumbnailPlaybackTimer) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        clearTimeout(window.thumbnailPlaybackTimer);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.thumbnailPlaybackTimer = null;
    }
};

/**
 * @name getCurrentDetailsState
 * @type function/method
 * @description This function will return the current data of details page and remove that from stack
 *
 * @author anandpatel
 */
const CURRENT_STATE: any = [];
const getCurrentDetailsState = () => {
    return CURRENT_STATE.pop();
};

/**
 * @name updateDetailsState
 * @type function/method
 * @description This function will store the current state of details page to stack
 *
 * @author anandpatel
 */
const updateDetailsState = (data: any) => {
    CURRENT_STATE.push(data);
};

export {
    getButtonGroupProperties,
    getTabItems,
    getComponentAndRailHandlingType,
    replaceRelatedParams,
    getTabComponentById,
    getPlaceholderCardData,
    getTabsFromCatalogConfig,
    getComponentAndRailHandlingTypeForRallyTv,
    getTabItemsForRallyTv,
    clearThumbnailPlaybackTimer,
    getCurrentDetailsState,
    updateDetailsState,
};
