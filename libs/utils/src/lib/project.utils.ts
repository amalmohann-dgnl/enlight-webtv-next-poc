import { BaseConfiguration, Platform, Project, ProjectConfigurationModel, SMILConstructionData } from '@enlight-webtv/models';
import axios from 'axios';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const projectName: Project = Project.VIDEOTRON;

/**
 * @name getProjectName
 * @type function
 * @description This method will return the project name.
 * @returns {Project}
 *
 * @author amalmohann
 */
const getProjectName = (): Project => projectName;

/**
 * @name getProjectConfig
 * @type function
 * @description this function will get the project configurations
 *
 * @author alwin-baby
 */
const getProjectConfig = () => {
    const projectConfig: Record<Project, ProjectConfigurationModel> = {
        [Project.ENLIGHT]: {
            checkAppGeoRestriction: false,
            isCountryCodeMandatory: true,
            topLabel: { showTopLabelSlantingEdge: false },
            sidebar: { expandedWidth: 447, expandedMenuItemWidth: 329, translatePageOnExpand: true },
        },
        [Project.RALLY_TV]: {
            checkAppGeoRestriction: false,
            isCountryCodeMandatory: true,
            topLabel: { showTopLabelSlantingEdge: false },
            sidebar: { expandedWidth: 447, expandedMenuItemWidth: 329, translatePageOnExpand: true },
        },
        [Project.CMGO]: {
            checkAppGeoRestriction: true,
            isCountryCodeMandatory: true,
            topLabel: { showTopLabelSlantingEdge: true },
            sidebar: { expandedWidth: 568, expandedMenuItemWidth: 418, translatePageOnExpand: true },
        },
        [Project.VIDEOTRON]: {
            checkAppGeoRestriction: false,
            isCountryCodeMandatory: false,
            topLabel: { showTopLabelSlantingEdge: true },
            sidebar: { expandedWidth: 568, expandedMenuItemWidth: 418, translatePageOnExpand: true },
        },
    };
    return projectConfig;
};

/**
 * @name getSidebarProjectConfig
 * @type function
 * @description This method project related sidebar properties
 *
 * @author tonyaugustine
 */
const getSidebarProjectConfig = () => getProjectConfig()[projectName]?.sidebar;

/**
 * @name getTopLabelProjectConfig
 * @type function
 * @description This method project related toplabel properties
 *
 * @author tonyaugustine
 */
const getTopLabelProjectConfig = () => getProjectConfig()[projectName]?.topLabel;

/**
 * @name getProjectFallbackConfig
 * @type function
 * @description This method retrives the fallback config
 * @returns {Partial<BaseConfiguration> | undefined}
 *
 * @author tonyaugustine
 */
const getProjectFallbackConfig = async () => {
    const fallbackConfigResponse = await axios.get('configs/fallback-config.json');
    const fallbackConfig = await fallbackConfigResponse?.data;
    return fallbackConfig as Partial<BaseConfiguration>;
};

/**
 * @name getProjectSpecificSMILUrl
 * @type function
 * @description This method will return the project specific smil URL.
 *
 * @author amalmohann
 */
const getProjectSMILUrl = (streamURL: string, smilConstructionData: SMILConstructionData = {} as SMILConstructionData): string => {
    const { format, formats, userId, tracking, maxParentalRatings, clientId, locale, language, region } = smilConstructionData;

    let updatedSMILUrl = streamURL;
    updatedSMILUrl = updatedSMILUrl + (projectName === Project.VIDEOTRON ? '&' : '?');
    updatedSMILUrl = updatedSMILUrl + (format ? `format=${encodeURIComponent(format)}` : '');
    updatedSMILUrl = updatedSMILUrl + (formats ? `&formats=${encodeURIComponent(formats)}` : '');
    updatedSMILUrl = updatedSMILUrl + (userId ? `&userId=${encodeURIComponent(userId)}` : '');
    updatedSMILUrl = updatedSMILUrl + (tracking ? `&tracking=${tracking}` : '');

    switch (projectName) {
        case Project.CMGO:
            updatedSMILUrl = updatedSMILUrl + (maxParentalRatings ? `&maxParentalRatings=${encodeURIComponent(maxParentalRatings)}` : '');
            updatedSMILUrl = updatedSMILUrl + `&platform=${Platform.WebTv}`;
            updatedSMILUrl = updatedSMILUrl + (clientId ? `&clientId=${encodeURIComponent(clientId)}` : '');
            updatedSMILUrl = updatedSMILUrl + (locale ? `&locale=${encodeURIComponent(locale)}` : '');
            updatedSMILUrl = updatedSMILUrl + (language ? `&language=${encodeURIComponent(language)}` : '');
            updatedSMILUrl = updatedSMILUrl + (region ? `&region=${encodeURIComponent(region)}` : '');
            break;
        case Project.VIDEOTRON:
        case Project.RALLY_TV:
        default:
    }

    return updatedSMILUrl;
};

export { getProjectConfig, getSidebarProjectConfig, getTopLabelProjectConfig, getProjectFallbackConfig, getProjectSMILUrl, getProjectName };
