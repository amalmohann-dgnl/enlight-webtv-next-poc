import { ContentType, RecommendationServiceType, RecommendationTransformDataType } from './../../index';

export interface RecommendationQueryParamModel {
    databaseId: string;
    recommendation_filter: string;
    userId?: string;
    scenario?: string;
    itemId?: string;
    filters?: string;
    region?: string;
    logic?: string;
    booster?: string;
    minRelevance?: string;
    rotationRate?: number;
    rotationTime: number;
    returnProperties?: boolean;
    includedProperties?: [string];
}

export interface RecombeeItemsThroughQueryStringParamModel {
    queryString: string;
    source: RecommendationServiceType;
    count: number;
    shouldTransFormData: boolean;
    transformDataType?: RecommendationTransformDataType;
    searchQuery?: string;
    initiatedItemID?: string;
    initiatedItemType?: ContentType;
    baseURL?: string;
}

export interface RecommendationModifiers {
    searchQuery?: string;
    selectedRecombeeItemID?: string;
    prevRecommendationID?: string;
    scenario?: string;
    logic?: string | object;
    filter?: string;
    booster?: string;
    minRelevance?: string;
    rotationRate?: number;
    rotationTime?: number;
}

export interface RecommendationBaseConfig {
    databaseId: string;
    cascadeCreate?: boolean;
    region?: string;
    baseURL?: string;
}

export interface RecommendationReturnConfig {
    count: number;
    returnProperties?: boolean;
    includedProperties?: [string];
}

export interface RecombeeServiceResponseDataType {
    recommendationID: string;
    content: any[];
}

export interface RecommendationTransformConfig {
    shouldTransFormData: boolean;
    transformDataType?: RecommendationTransformDataType;
}
