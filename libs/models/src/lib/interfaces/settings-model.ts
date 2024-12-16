import { RightSideMenuItem, SettingsRightSideMenuOptions, SettingsTabType, ComponentType, ButtonStateStyles } from './../../index';

export type SettingsTabToComponentMappingType = {
    [K in SettingsTabType]: { type: ComponentType<any>; reuseInstance: boolean; receiveFocus: boolean };
};

export interface ListIndexChangeData {
    index: number;
    previousIndex: number;
    dataLength: number;
}

export interface SettingsTabDataModel {
    id: SettingsTabType;
    tabTitle: string;
    descriptionLabel?: string;
    description?: string;
    urlLabel?: string;
    scanCodeLabel?: string;
    pageTitle: string;
    showPageTitle: boolean;
    menuItems?: SettingsMenuItem[];
    qrCodeUrl?: string;
    buttonStyle: ButtonStateStyles;
}

export interface SettingsMenuItem {
    type: SettingsRightSideMenuOptions;
    menuText: string;
    rightMenuItems: RightSideMenuItem[];
    menuButtonText: string;
}

export interface LanguageData {
    code: string;
    name: string;
}
