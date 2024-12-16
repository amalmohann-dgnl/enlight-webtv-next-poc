import { AssetTypeIconType, ParentalControl } from './../../index';

export interface ContentResponse {
    middlewareRequestCid: string;
    content: Content[];
    totalElements: number;
    totalPages: number;
    apiMapping: APIMapping[];
}

export interface APIMapping {
    url: string;
    method: string;
    timestamp: number;
    timeTaken: number;
}

export interface Content {
    uid: string;
    seasonUid: string;
    seriesUid: string;
    title: string;
    description: string;
    availableSeasons?: any[];
    shortDescription?: string;
    releaseYear?: number;
    genre: any[];
    displayDuration: number;
    duration: number;
    type: string;
    categoryId: string[];
    championship: string;
    event: string;
    images: AssetTypeIcon[];
    mediaGuid: string;
    purchaseMode: string;
    availableOn: number;
    availableTill: number;
    catchUpUrl: string;
    downloadUrl: string;
    streams: string;
    trailers: any[];
    liveUrl: string;
    parentalControl: ParentalControl[];
    isDownloadable: boolean;
    isCastable: boolean;
    countries: string[];
    contentGuid: string;
    tags: string[];
    championshipLogo: AssetTypeIcon[];
    episodeNumber?: number;
    availableDays: null;
    assetTypeIcon: AssetTypeIcon[];
    startDate: number;
    endDate: number;
    mediatype: string;
    action: string;
    category: string;
    maxQualityAvailable: string;
    listings: any[];
    progress: number;
    isAssetAvailable?: boolean;
    searchMode?: string;
    seasonNumber?: number;
    allowFavoriting?: string;
    recommendationID?: string;
    isCcAvailable?: boolean;
    actor?: any[];
    director?: any[];
    supportedCountries?: string[];
    recombeeItemID?: string;
}

export interface AssetTypeIcon {
    width: number;
    height: number;
    url: string;
    type: AssetTypeIconType;
}

export interface Series {
    uid: string;
    contentGuid: string;
    title: string;
    type: string;
    genre: string[];
    images: AssetTypeIcon[];
    seasons: Content[];
    apiMapping: APIMapping[];
}
