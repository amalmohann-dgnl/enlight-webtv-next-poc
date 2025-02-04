import {
    Graphics,
    ContinueWatchingData,
    AssetTypeIcon,
    CurrentEventStatus,
    EpochSpecificationUpto,
    PreviewActionComponent,
    PurchaseMode,
    TopLabelType,
    Person,
    Trailers,
    RailContentModel,
} from './../../index';

export interface PreviewComponentData {
    title: string;
    availableOn: number | null;
    typeImageSrc: string;
    availableTill: number | null;
    description: string;
    type: string;
    page: string;
    flagSrc: string;
    images: AssetTypeIcon[];
    railType: string;
    purchaseMode: string;
    startDate: number | null;
    endDate: number | null;
    startTime: number | null;
    endTime: number | null;
    onNextItem: boolean;
    localRallyTime: string;
    streamUrl: string;
    progress: number | null;
    duration: number | null;
    continueWatchingData: ContinueWatchingData;
    seriesUid: string;
}

export interface SubscriptionBadge {
    name: string;
    src: string;
    width: number;
    height: number;
    mountY: number;
}

export interface EpochToDaysHrsMinsSecsSpecifications {
    upto: EpochSpecificationUpto | '';
}

export interface PreviewComponentDataNew {
    showVideoPreview: boolean;
    showBadges: boolean;
    showBadgeText: boolean;
    badgeTextLabel: string;
    badgeTextColor: string;
    showTypeLogo: boolean;
    typeImageSrc: string;
    showContentSubscription: boolean;
    subscriptionBadge: SubscriptionBadge;
    showFlag: boolean;
    flagSrc: string;
    showStatus: boolean;
    statusLabelType: TopLabelType;
    statusLabel: string;
    showTimer: boolean;
    timerString: string;
    showTitle: boolean;
    titleLabel: string;
    showContentInfo: boolean;
    showTime: boolean;
    timeLabelText: string;
    showAdditionalTimeInfo: boolean;
    additionalTimeInfoLabel: string;
    showDuration: boolean;
    durationLabel: string;
    showYear: boolean;
    yearLabel: string;
    showParentalRating: boolean;
    parentalRating: string;
    showQuality: boolean;
    qualityRating: string;
    showCaptions: boolean;
    captionsIconSrc: string;
    showProgress: boolean;
    progressStartText: string;
    progressEndText: string;
    progress: number;
    primaryActionType: false | PreviewActionComponent;
    secondaryActionType: false | PreviewActionComponent;
    showMoreInfo: boolean;
    tertiaryActionType: false | PreviewActionComponent;
    showDescription: boolean;
    descriptionText: string;
    showActors: boolean;
    actors: Person[] | [];
    showDirector: boolean;
    director: Person[] | [];
    showGenre: boolean;
    genre: string[] | [];
    showCountryOfOrigin: boolean;
    countryOfOrigin: string;
    showDetailedRating: boolean;
    detailedRating: string;
    showOriginalLanguages: boolean;
    originalLanguages: string;
    showAudioLanguages: boolean;
    audioLanguages: string;
    showSubtitleLanguages: boolean;
    subtitleLanguages: string;
    images: AssetTypeIcon[];
    graphics: Graphics[];
    purchaseMode: PurchaseMode;
    isSubscribed: boolean;
    currentEventStatus: CurrentEventStatus | null;
    streamUrl: string;
    type: string;
    seriesUid: string;
    continueWatchingData: ContinueWatchingData;
    uid: string;
    eventStartTime: number | null;
    eventEndTime: number | null;
    railType: string;
    cardId: string;
    trailers: Trailers[];
    cardData: RailContentModel;
    seasonCount?: number;
    showSeasonCount?: boolean;
    fromRelatedrail?: boolean;
    previewImageUrl?: string;
    seasonCountLabel?: string;
    showActions?: boolean;
    descriptionWordWrapWidth?: number;
    mediaId?: string;
    handlePreviewLeft?: () => void;
    handlePreviewRight?: () => void;
    handlePreviewDown?: () => void;
    handlePreviewUp?: () => void;
    showSeasonButton?: boolean;
    seasonText?: string;
    seasonIconSrc?: string;
    seasonIconBackgroundColor?: string;
    showSeasonIcon?: boolean;
    showRelatedInfo?: boolean;
    relatedInfoLabel?: string;
    thumbnailType?: string;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
}
