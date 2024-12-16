import {
    AiringType,
    Championship,
    ComponentStyleType,
    ProgramType,
    PurchaseMode,
    Scheme,
    TypesWrcTimeZone,
    Image,
    APIMapping,
} from './../../index';

export interface EPGResponse {
    middlewareRequestCid: string;
    $xmlns: Xmlns;
    startIndex: number;
    itemsPerPage: number;
    entryCount: number;
    title: string;
    description: string;
    entries: Entry[];
    apiMapping: APIMapping[];
    railType: ComponentStyleType;
}

export interface Xmlns {
    wrc: string;
}

export interface Entry {
    id: string;
    guid: string;
    updated: number;
    title: string;
    callSign: string;
    listings: Listing[];
    stations: Stations;
}

export interface Listing {
    id: string;
    airingType: AiringType;
    liveUrl: string;
    mediaUrl: string;
    station: Station;
    program: Program;
    startTime: number;
    endTime: number;
    localTime: number;
    localStartTime: number;
    localEndTime: number;
    recordingStartTime: number;
    recordingEndTime: number;
    dummyLiveEvent: string;
    images: Image[];
}

export interface Program {
    $xmlns: Xmlns;
    $types: Types;
    id: string;
    title: string;
    guid: string;
    description: null;
    descriptionLocalized: OrderPhoneNumber;
    longDescription: null;
    longDescriptionLocalized: OrderPhoneNumber;
    longTitle: null;
    longTitleLocalized: OrderPhoneNumber;
    programType: ProgramType;
    pubDate: null;
    ratings: any[];
    secondaryTitle: null;
    secondaryTitleLocalized: OrderPhoneNumber;
    seriesId: string;
    shortDescription: null;
    shortDescriptionLocalized: OrderPhoneNumber;
    shortTitle: string;
    shortTitleLocalized: OrderPhoneNumber;
    tags: Tag[];
    thumbnails: { [key: string]: Thumbnail };
    titleLocalized: OrderPhoneNumber;
    tvSeasonEpisodeNumber: number;
    tvSeasonNumber: number;
    year: number;
    wrc$timeZone: SVGStringList;
    championship: Championship;
    purchaseMode: PurchaseMode;
    championshipLogo: Image[];
}

export interface Types {
    wrc$timeZone: TypesWrcTimeZone;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrderPhoneNumber {
    //TODO: complete the response, remove the ts ignore
}

export interface Tag {
    scheme: Scheme;
    title: string;
    titleLocalized: OrderPhoneNumber;
}

export interface Thumbnail {
    url: string;
    width: number;
    height: number;
    title: string;
    assetTypes: any[];
}

export interface Station {
    stationId: string;
    guid: string;
}

export interface Stations {
    'http://data.entertainment.tv.theplatform.eu/entertainment/data/Station/381058600165': HTTPDataEntertainmentTvTheplatformEuEntertainmentDataStation381058600165;
}

export interface HTTPDataEntertainmentTvTheplatformEuEntertainmentDataStation381058600165 {
    id: string;
    title: string;
    guid: string;
    description: string;
    updated: number;
    callSign: string;
    onScreenCallSign: MediaPID;
    isHd: boolean;
    isPayPerView: boolean;
    shortTitle: null;
    isVirtual: boolean;
    price: OrderPhoneNumber;
    orderPhoneNumber: OrderPhoneNumber;
    thumbnails: OrderPhoneNumber;
    mediaPid: MediaPID;
}

export interface MediaPID {
    'urn:theplatform:tv:location:any': string;
}
