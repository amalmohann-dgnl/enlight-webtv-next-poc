import {
    FeatureUserManagement,
    Features,
    IdentityProviders,
    ProfileListData,
    RecombeeServerRegion,
    StorageKeys,
    RecommendationTransformDataType,
    RecommendationQueryParamModel,
    AssetTypeIconType,
    CountryInfo,
    Project,
    ContentType,
} from '@enlight-webtv/models';
import { commonUtilities, configurationUtilities, networkUtilities, storageUtilities } from '.';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const projectName: Project = Project.VIDEOTRON;

//import utilities
const { isValidValue } = commonUtilities;
const { getFeatureByKey } = configurationUtilities;
const { extractParams } = networkUtilities;
const { getState } = storageUtilities;

/**
 * @name getRecommendationUserID
 * @type function
 * @description Retrives the userID of the user
 * @returns {string | null} - Returns the user recommendation ID and null if not found
 *
 * @author tonyaugustine
 */
const getRecommendationUserID = (): string | null => {
    const featureUserManagement: FeatureUserManagement = getFeatureByKey(Features.FeatureUserManagement) as FeatureUserManagement;
    const loginMethod = featureUserManagement.loginMethods[0];

    if (loginMethod && loginMethod === IdentityProviders.COGNITO) {
        // get currently stored profile data
        const profileData = getState(StorageKeys.PROFILE) as ProfileListData;
        if (isValidValue(profileData)) {
            return profileData.recommendationUserId ?? null;
        }
    } else {
        const userData = getState(StorageKeys.USER_DATA);
        if (isValidValue(userData)) {
            return (projectName === Project.VIDEOTRON ? userData.userId : userData.recommendationUserId) ?? null;
        }
    }
    return null;
};

/**
 * @name constructRecombeeConfigQueryParams
 * @type function
 * @description Takes a query param string and replaces it with the required properties and returns an object
 * @param {string} queryString - Query param string obtained from configuration
 * @param {string} [initiatedItemID] - ID of the item initiating the request
 * @param {ContentType} [initiatedItemType] - Type of the item initiating the request
 * @returns {Promise<RecommendationQueryParamModel>}
 * @throws {Error} If values to contstruct params are not availbale
 *
 * @author tonyaugustine
 */
const constructRecombeeConfigQueryParams = async (queryString: string, initiatedItemID?: string, initiatedItemType?: ContentType) => {
    const countryCode = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
    if (!countryCode) throw new Error(`Invalid country code: ${countryCode}`);
    const region = countryCode.toLocaleLowerCase();

    const locale = getState(StorageKeys.LOCALE);
    if (!locale) throw new Error(`Invalid locale: ${locale}`);

    const recommendationUserID = getRecommendationUserID();
    if (!recommendationUserID) {
        throw new Error(`Invalid recombee user id ${recommendationUserID}`);
    }

    const configuredQueryString = queryString
        .replace(/\{region\}/g, region)
        .replace(/\{country\}/g, countryCode)
        .replace(/\{language\}/g, locale.toLocaleLowerCase())
        .replace(/\{country_code\}/g, region)
        .replace(/\{user_id\}/g, recommendationUserID)
        .replace(/\{item_id\}/g, initiatedItemID ?? '')
        .replace(/\{media_type\}/g, initiatedItemType ?? '');

    const queryParams = extractParams(configuredQueryString) as RecommendationQueryParamModel;

    // special handling for booster and filter as " " are required to be added around the replaced params (As it is not being handled from config)
    const queryString_QueryFormat = queryString
        .replace(/\{region\}/g, `"${region}"`)
        .replace(/\{country\}/g, `"${countryCode}"`)
        .replace(/\{language\}/g, `"${locale.toLocaleLowerCase()}"`)
        .replace(/\{country_code\}/g, `"${region}"`)
        .replace(/\{user_id\}/g, `"${recommendationUserID}"`)
        .replace(/\{item_id\}/g, `"${initiatedItemID ?? ''}"`)
        .replace(/\{media_type\}/g, `"${initiatedItemType ?? ''}"`);
    const queryParams_QueryFormat = extractParams(queryString_QueryFormat) as RecommendationQueryParamModel;

    //set filter and booster seperately
    queryParams.booster = queryParams_QueryFormat?.booster;
    queryParams.filters = queryParams_QueryFormat?.filters;

    return queryParams;
};

/**
 * @name transformRecombeeData
 * @type Function
 * @description Transform the data receviced from recombee to the format specified
 * @param {any[]}data - Data to transform
 * @param {RecommendationTransformDataType} transformAssetDataType - Data type to transform data to
 * @param {string} [recommendationID] - Recommendation id of the recombee response
 * @returns {Promise<any[]>}
 *
 * @author tonyaugustine
 */
const transformRecombeeData = async (data: any[], transformAssetDataType: RecommendationTransformDataType, recommendationID?: string) => {
    switch (transformAssetDataType) {
        case RecommendationTransformDataType.ENLIGHT_ASSET_TYPE: {
            const transformedData = await transformContentData(data, recommendationID);
            return transformedData;
        }
        default: {
            console.error('Doesnt support required data transformation type ' + transformAssetDataType);
            return [];
        }
    }
};

/**
 * @name transformContentData
 * @type Function
 * @description Transform recombee data to Content format
 * @param {any[]} assetData - Recombee data to transform
 * @param {string} recommendationID - Recommendation id of the recombee response
 * @returns {Promise<any[]>}
 * @throws {Error} - If data transformation fails
 *
 * @author tonyaugustine
 */
const transformContentData = async (assetData: any[], recommendationID?: string) => {
    if (!Array.isArray(assetData)) {
        console.error('Data to transform is not iterable');
        return [];
    }

    const countryCode = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;
    if (!countryCode) throw new Error(`Invalid country code: ${countryCode}`);

    const locale = getState(StorageKeys.LOCALE);
    if (!locale) throw new Error(`Invalid locale: ${locale}`);

    const localeLowerCase = locale.toLocaleLowerCase()?.replace('-', '_');

    // Transform each asset
    const transformedData: any[] = assetData.flatMap((asset: any) => {
        if (isValidValue(asset) && !isValidValue(asset.values)) return [];
        const transformedAsset = {
            uid: asset.values.uid,
            recommendationID,
            recombeeItemID: asset.id,
            allowFavoriting: asset.values.allow_favoriting,
            seasonUid: asset.values.season_uid ?? asset.values?.seasonUid ?? '',
            title: asset.values[`title_${localeLowerCase}`] ?? asset.values['title'] ?? '',
            shortDescription:
                asset.values[`short_description_${localeLowerCase}`] ?? asset.values['short_description'] ?? asset.values?.shortDescription ?? '',
            description: asset.values[`description_${localeLowerCase}`] ?? asset.values['description'] ?? '',
            episodeNumber: asset.values?.episode_number ?? asset.values?.episodeNumber,
            releaseYear: asset.values?.release_year,
            genre: asset.values[`genre_${localeLowerCase}`] ?? asset.values['genre'] ?? [],
            displayDuration: asset.values.display_duration,
            type: asset.values.type,
            streams: asset.values.streams ?? '',
            trailers: asset.values.first_trailer_stream ? [{ streams: asset.values.first_trailer_stream }] : [],
            availableOn: asset.values[`available_on_${countryCode.toLocaleLowerCase()}`] ?? asset.values['available_on'] ?? asset.values?.availableOn,
            availableTill:
                asset.values[`available_till_${countryCode.toLocaleLowerCase()}`] ?? asset.values['available_till'] ?? asset.values?.availableTill,
            isCcAvailable: asset.values.is_cc_available ?? false,
            contentGuid: asset.values.content_guid ?? asset.values.contentGuid ?? '',
            parentalControl: [{ rating: asset.values[`parental_control_${countryCode.toLocaleLowerCase()}`] ?? '' }],
            images: [
                {
                    url: asset.values[`default_image_landscape_${localeLowerCase}`] ?? asset.values['default_image_landscape'],
                    width: 724,
                    height: 407,
                    type: AssetTypeIconType.LANDSCAPE,
                },
                {
                    url: asset.values[`default_image_portrait_${localeLowerCase}`] ?? asset.values['default_image_portrait'],
                    width: 724,
                    height: 407,
                    type: AssetTypeIconType.PORTRAIT,
                },
            ],
            purchaseMode: asset.values?.purchase_mode ?? asset.values?.purchaseMode,
            maxQualityAvailable: asset.values?.max_quality_available,
            actor: { personName: asset.values[`actor_list_${localeLowerCase}`] ?? asset.values['actor_list'] ?? [] },
            director: { personName: asset.values[`director_list_${localeLowerCase}`] ?? asset.values['director_list'] ?? [] },
            supportedCountries: asset.values?.supported_countries ?? [],
            downloadUrl: asset.values?.download_url,
            displayTag: asset.values[`display_tag_${countryCode.toLocaleLowerCase()}`] ?? asset.values['display_tag'] ?? null,
            tags: asset.values?.tags ?? [],
            seriesUid: asset.values?.seriesUid,
            seriesTitle: asset.values?.seriesTitle,
            seasons: asset.values?.seasons,
            seasonNumber: asset.values?.seasonNumber,
            hasTrailer: asset.values?.hasTrailer,
            isDeleted: asset.values?.deleted,
            availableSeasons: asset.values?.availableSeasons,
        };
        return [transformedAsset];
    });

    return transformedData;
};

/**
 * @name getRecombeeServerRegionBaseUrl
 * @type function
 * @description Returns the base url based on the region
 * @param region - Region of the recombee server
 * @returns {string}
 * @throws {Error} - If invalid region is passed
 *
 * @author tonyaugustine
 */
const getRecombeeServerRegionBaseUrl = (region: string) => {
    const regionBaseURLMapping: Record<RecombeeServerRegion, string> = {
        [RecombeeServerRegion.AP_SE]: 'https://client-rapi-ap-se.recombee.com',
        [RecombeeServerRegion.CA_EAST]: 'https://client-rapi-ca-east.recombee.com',
        [RecombeeServerRegion.EU_WEST]: 'https://client-rapi-eu-west.recombee.com',
        [RecombeeServerRegion.US_WEST]: 'https://client-rapi-us-west.recombee.com',
    };
    if (!Object.values(RecombeeServerRegion).includes(region as RecombeeServerRegion)) {
        throw new Error(`Region "${region}" is unknown. Falling back to base url`);
    }

    const baseURL = regionBaseURLMapping[region as RecombeeServerRegion];
    return baseURL;
};

export { getRecommendationUserID, constructRecombeeConfigQueryParams, transformRecombeeData, getRecombeeServerRegionBaseUrl };
