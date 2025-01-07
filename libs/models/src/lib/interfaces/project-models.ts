export interface ProjectConfigurationModel {
    checkAppGeoRestriction: boolean;
    topLabel: TopLabelProjectConfigModel;
    sidebar: SidebarProjectConfigModel;
    isCountryCodeMandatory: boolean;
}

export interface SidebarProjectConfigModel {
    expandedWidth: number;
    expandedMenuItemWidth: number;
    translatePageOnExpand: boolean;
}

export interface TopLabelProjectConfigModel {
    showTopLabelSlantingEdge: boolean;
}
