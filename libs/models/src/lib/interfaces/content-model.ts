import {
    ContentType,
    CuratedDataEntryType,
    RailHandlingType,
    Routes,
    Graphics,
    ContinueWatchingData,
    AssetTypeIcon,
    Program,
    Station,
    Tag,
    Thumbnail,
    Types,
    Xmlns,
    CreditType,
    LabelTag,
} from './../../index';

export interface RailContentModel {
    actor: Person[];
    director: Person[];
    articleId: any;
    id: string;
    airingType: any;
    liveUrl: string;
    mediaUrl: string;
    station: Station;
    program: Program;
    startTime: number;
    endTime: number;
    localTime: number;
    localStartTime: number | null;
    localEndTime: number;
    recordingStartTime: number;
    recordingEndTime: number;
    dummyLiveEvent: string;
    images: AssetTypeIcon[];
    graphics: Graphics[];
    displayTag: LabelTag;
    title: string;
    guid: string;
    description: string;
    descriptionLocalized: DescriptionLocalized;
    longDescription: string;
    longDescriptionLocalized: DescriptionLocalized;
    longTitle: string;
    longTitleLocalized: DescriptionLocalized;
    programType: string;
    pubDate: any;
    ratings: any[];
    secondaryTitle: string;
    secondaryTitleLocalized: DescriptionLocalized;
    seriesId: string;
    shortDescription: string;
    shortDescriptionLocalized: DescriptionLocalized;
    shortTitle: string;
    shortTitleLocalized: DescriptionLocalized;
    tags: Tag[];
    thumbnails: { [key: string]: Thumbnail };
    titleLocalized: DescriptionLocalized;
    tvSeasonEpisodeNumber: number;
    tvSeasonId: any;
    tvSeasonNumber: number;
    year: number;
    championship: string;
    countryOfOrigin: string;
    mediatype: string;
    event: string;
    purchaseMode: string;
    championshipLogo: AssetTypeIcon[];
    showVideoPreview: boolean;
    action: string;
    country: Country | string;
    category: string;
    $xmlns: Xmlns;
    $types: Types;
    wrc$timeZone: string;
    uid: string;
    name: string;
    key: any;
    type: ContentType | CuratedDataEntryType;
    availableOn: number;
    availableSeasons: any[];
    availableTill: number;
    eventId: string;
    rallyId: string;
    seriesUid: string;
    displayDuration: number;
    duration: number;
    progress: number;
    progressPercent?: number;
    location: string;
    startDate: number;
    endDate: number;
    round: number;
    sponsor: DescriptionLocalized;
    season: Season;
    competition: Competition;
    asset: Asset;
    __typename: string;
    releaseYear: number;
    startDateLocal: Date | string;
    endDateLocal: Date;
    finishDate: number;
    railType: string;
    cvpSeriesLink: string;
    seasonUid: string;
    episodeNumber: number;
    episodeId: number;
    genre: any[];
    categoryId: string[];
    originalLanguages: string[];
    audioLanguages: string[];
    subtitleLanguages: string[];
    mediaGuid: string;
    maxQualityAvailable: string;
    catchUpUrl: string;
    downloadUrl: string;
    streams: string;
    trailers: Trailers[];
    parentalControl: ParentalControl[];
    isDownloadable: boolean;
    isCastable: boolean;
    isCcAvailable: boolean;
    countries: any[];
    contentGuid: string;
    availableDays: any;
    assetTypeIcon: AssetTypeIcon[];
    listings: any[];
    displayTitle: string;
    updatedTime: number;
    onNextItem: boolean;
    isOver: boolean;
    isLive: boolean;
    page: Routes;
    continueWatchingData: ContinueWatchingData;
    railHandlingType: RailHandlingType | null;
    cardId: string;
    isAssetAvailable?: boolean;
    isNewItem?: boolean;
    isComingSoonItem?: boolean;
    isGoingToBeNew?: boolean;
    prevIdentifier?: string;
    seasonCount?: number;
    fromRelatedrail?: boolean;
    previewImageUrl?: string;
    numberOfEpisodes?: number;
}

export interface Asset {
    id: string;
    contents: AssetContent[];
    __typename: string;
}

export interface AssetContent {
    id: string;
    __typename: string;
}

export interface Competition {
    id: string;
    title: string;
    competitionId: string;
    __typename: string;
}

export type DescriptionLocalized = Record<string, any>;

export interface Season {
    id: string;
    name: string;
    seasonId: string;
    title: string;
    __typename: string;
}

export interface Country {
    id: string;
    countryId: string;
    iso3: string;
    iso2: string;
    name: string;
    flag: Flag[];
    __typename: string;
}

export interface Flag {
    url: string;
    width: number;
    height: number;
    type: string;
}

export interface ParentalControl {
    rating: string;
    ratingTag: string[];
}

export interface Person {
    creditType: CreditType;
    personId: string;
    personName: string;
}

export interface SeasonData {
    key?: string | number;
    value?: string;
}

export interface Trailers {
    streams: string;
}
