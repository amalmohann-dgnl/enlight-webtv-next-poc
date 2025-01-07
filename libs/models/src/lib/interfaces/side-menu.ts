import {
    AudioData,
    LanguageData,
    PlayerRightSideMenuOptions,
    QualityData,
    SeasonData,
    SettingsRightSideMenuOptions,
    TextStreamInfo,
} from './../../index';

/**
 * @name side-menu-items
 * This Model will export all the type related to the side menu.
 * properties will exported are :
 * @interface SideMenuItems - custom type for side menu items.
 * @interface RightSideMenuItem - right side menu items type
 *
 * @author amalmohann
 */

/**
 * @name SideMenuItems
 * @type interface
 * @description This interface defines the type of side menu items.
 * @author amalmohann
 */
export interface SideMenuItem {
    name: string;
    label: string;
    iconLight: string;
    iconDark: string;
    route: string;
}

/**
 * @name RightSideMenuItem
 * @type interface
 * @description This interface defines the type of right side menu items.
 * @author amalmohann
 */
export interface RightSideMenuItem {
    id: string;
    name: string;
    label: string;
    icon?: string;
    data: AudioData | QualityData | LanguageData | SeasonData | TextStreamInfo;
}

/**
 * @name RightSideMenuItemMap
 * @type interface
 * @description This interface defines the map type of right side menu items.
 * @author amalmohann
 */
export interface RightSideMenuItemMap {
    title: string;
    option: PlayerRightSideMenuOptions | SettingsRightSideMenuOptions;
    menuItems: RightSideMenuItem[];
}
