import {
    AssetTypeIcon,
    ComponentStyleType,
    PreviewAnimationTypes,
    PurchaseMode,
    ContentType,
    CuratedDataEntryType,
    CurrentEventStatus,
    Image,
    LabelKey,
    Content,
    StorageKeys,
    PreviewActionComponent,
    PreviewActionType,
    IconLabelMode,
    RailContentModel,
    Country,
    Flag,
    TopLabelType,
    Routes,
    EpochSpecificationUpto,
    RailHandlingType,
    PreviewComponentDataNew,
    AssetMetadata,
    ParentalControl,
    Features,
    FeatureCatalog,
    Project,
    Color,
    Trailers,
} from '@enlight-webtv/models';
import { getOptimizedImage, isValidValue } from './common.utils';
import { getLabel, getCatalogConfig, getFeatureByKey, getFullScreenPlayerSelectorTheme } from './configuration.utils';
import { convertEpochToDaysHrsMinsSecs, convertLocalRallyTimeToHHMM, formatTime, getCurrentStatus } from './time.utils';
import { formatDate, getDifferenceInDaysHoursMinutes } from './date.utils';
import { getProgressByProgress, getProgressByTime } from './progress.utils';
import { v4 as uuidv4 } from 'uuid';
import { getAllowAnimations } from './app.utils';
import { getCardIdFromData } from './rail.utils';
import { theme } from '@enlight-webtv/themes';
import  { getState }  from './storage.utils';

const subscriptionBaseConfig = {
    lock: {
        name: 'locked',
        src: 'images/lock.png',
        width: 33.135,
        height: 48.25,
        mountY: -0.12,
    },
    free: {
        name: 'free',
        src: 'images/free.png',
        width: 48.25,
        mountY: -0.4,
        height: 18,
    },
};

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const project: Project = Project.VIDEOTRON;

/**
 * @name getActionButtonProperties
 * @type function/method
 * @description This function will check for action button type and attach all the button properties needed
 * @param {ContentType} actionButtonType - the type of the content to be displayed.
 * @param {boolean} isLocked - if the content is locked
 * @param {string} label - size of the card to be displayed. Default is Medium.
 * @param {string} icon - data associated to the card to be displayed.
 * @return {object} properties -the button properties that need to be shared to card components
 *
 * @author amalmohann
 */
const getActionButtonProperties = (data: RailContentModel): { label: string; startIconSrc: string } => {
    const {
        availableOn = null,
        availableTill = null,
        type = '',
        railType = '',
        startDate = null,
        endDate = null,
        purchaseMode = PurchaseMode.PAID,
        uid,
        progress,
    } = data;

    const buttonLabels = getButtonLabels();
    const { howToWatchLabel, playLiveLabel, watchReplayLabel, playNowLabel, continueWatchingLabel } = buttonLabels;

    let label = howToWatchLabel;
    let startIconSrc = '';

    const isSubscribed = getState(StorageKeys.IS_USER_SUBSCRIBED);
    // const isCalenderEvent = type === ContentType.CALENDAR || railType === ComponentStyleType.NEXT_RALLIES;
    const currentStatus = getCurrentStatus(availableOn || startDate, availableTill || endDate);
    const allowAccess =
        isSubscribed || purchaseMode === PurchaseMode.FREE || purchaseMode === PurchaseMode.REGISTER || purchaseMode === PurchaseMode.RENTAL;
    const isRecentlyWatchedItem = !!checkRecentlyWatched(uid);
    if (allowAccess) {
        // vod
        label =
            (isRecentlyWatchedItem || progress > 0) && ![ContentType.PREVIEW, ContentType.LIVE].includes(data?.type as ContentType)
                ? continueWatchingLabel
                : playNowLabel;
        startIconSrc = 'icons/play/play-light.png';

        // if (project === Project.RALLY_TV && isCalenderEvent) {
        //     switch (currentStatus) {
        //         case CurrentEventStatus.LIVE:
        //             label = playLiveLabel;
        //             break;
        //         case CurrentEventStatus.COMPLETED:
        //             label = isRecentlyWatchedItem ? continueWatchingLabel : watchReplayLabel;
        //             break;

        //         default:
        //             break;
        //     }
        // }
    }

    if (currentStatus === CurrentEventStatus.UPCOMING) {
        // if (project === Project.RALLY_TV) {
        //     if (isCalenderEvent && currentStatus === CurrentEventStatus.UPCOMING) {
        //         label = '';
        //         startIconSrc = 'icons/timer/timer-light.png';
        //     }
        // } else {
            label = '';
            startIconSrc = 'icons/timer/timer-light.png';
        // }
    }

    return { label, startIconSrc };
};

/**
 * @name getButtonLabels
 * @type function/method
 * @description This function will get all the corresponding button labels
 *
 * @author amalmohann
 */
const getButtonLabels = () => {
    const howToWatchLabel = getLabel(LabelKey.LABEL_TV_HOW_TO_WATCH) as string;
    const playLiveLabel = getLabel(LabelKey.LABEL_TV_PLAY_LIVE) as string;
    const watchReplayLabel = getLabel(LabelKey.LABEL_TV_WATCH_REPLAY) as string;
    const playNowLabel = getLabel(LabelKey.LABEL_TV_PLAY_NOW) as string;
    const continueWatchingLabel = getLabel(LabelKey.LABEL_RECENTLY_WATCHED_PLAY_BUTTON) as string;
    return { howToWatchLabel, playLiveLabel, watchReplayLabel, playNowLabel, continueWatchingLabel };
};

/**
 * @name checkRecentlyWatched
 * @type function/method
 * @param {string} programUid
 * @description This function will check for recently watched item
 * @return {Content | undefined} Returns the item if it is recently watched. Else return undefined
 *
 * @author alwin-baby
 */
const checkRecentlyWatched = (programUid: string) => {
    const recentlyWatchedItems: Content[] = getState(StorageKeys.RECENTLY_WATCHED)?.content || [];
    const recentlyWatched = recentlyWatchedItems.find(item => programUid === item.uid && item.progress > 0);
    return recentlyWatched;
};

/**
 * @name getDetailsPreviewPrimaryActionLabel
 * @type function/method
 * @param {PreviewComponent} comp
 * @description This function will return the primary action button label for the details preview
 * @returns {string} - label.
 *
 * @author alwin-baby
 */
const getDetailsPreviewPrimaryActionLabel = (comp: any) => {
    const primaryActionButtonProps = getActionButtonProperties(comp._additionalData);
    const { label = '' } = primaryActionButtonProps;
    return label;
};

/**
 * @name getDetailsPreviewPrimaryActionIconSrc
 * @type function/method
 * @param {PreviewComponent} comp
 * @description This function will return the primary action button icon src for the details preview
 * @returns {string} - startIconSrc.
 *
 * @author alwin-baby
 */
const getDetailsPreviewPrimaryActionIconSrc = (comp: any) => {
    const primaryActionButtonProps = getActionButtonProperties(comp._additionalData);
    const { startIconSrc = '' } = primaryActionButtonProps;
    return startIconSrc;
};

/**
 * @name createActionButton
 * @type function/method
 * @param {PreviewComponent} comp
 * @description This function will create the the primary preview action for the details preview.
 *
 * @author alwin-baby
 */
const createActionButton = (buttonType: any, comp: any, actionType: PreviewActionType) => {
    try {
        if (actionType === PreviewActionType.Primary) {
            comp.Info.primaryAction = {
                visible: comp._showActions,
                type: buttonType,
                variant: comp._primaryActionButtonVariant,
                label: comp._primaryActionButtonLabel,
                handleEnterPress: comp._handlePrimaryActionButton,
                buttonAlpha: comp._primaryActionButtonAlpha,
                startIconSrc: comp._primaryActionButtonIconSrc,
                enableFocusAndUnfocusIcon: project === Project.VIDEOTRON,
                focusStartIconSrc: comp._primaryActionButtonFocusStartIconSrc,
                startIconWidth: 45,
                startIconHeight: 45,
                glowColor: theme.colors.white,
                glowIntensity: 0.26,
                glowMagnitude: 1.9,
            };
            comp._isPrimaryActionCreated = true;
        }

        if (actionType === PreviewActionType.Secondary) {
            comp.Info.secondaryAction = {
                visible: comp._showActions,
                type: buttonType,
                glowColor: theme.colors.white,
                glowIntensity: 0.26,
                glowMagnitude: 1.9,
                variant: comp._secondaryActionButtonVariant,
                label: comp._secondaryActionButtonLabel,
                handleEnterPress: comp._handleSecondaryActionButton,
                labelAlign: comp._secondaryActionButtonLabelAlign,
                buttonAlpha: comp._secondaryActionButtonAlpha,
                endIconSrc: comp._secondaryActionButtonIconSrc,
                enableFocusAndUnfocusIcon: project === Project.VIDEOTRON,
                focusEndIconSrc: comp._secondaryActionButtonFocusEndIconSrc,
                endIconWidth: 35,
                endIconHeight: 35,
                flexItem: { marginLeft: 16 },
            };
            comp._isSecondaryActionCreated = true;
        }
    } catch (error) {
        console.error(error);
    }
};

/**
 * @name createActionIcon
 * @type function/method
 * @param {PreviewComponent} comp
 * @description This function will create the the secondary preview action for the details preview.
 *
 * @author alwin-baby
 */
const createActionIcon = (iconType: any, comp: any, actionType: PreviewActionType) => {
    try {
        if (actionType === PreviewActionType.Primary) {
            //
        }

        if (actionType === PreviewActionType.Tertiary) {
            comp.Info.tertiaryAction = {
                visible: comp._showActions,
                flexItem: { marginLeft: 40 },
                type: iconType,
                width: 60,
                height: 60,
                backgroundColor: comp._componentAccentColor,
                labelLeftMargin: 30,
                labelShowMode: IconLabelMode.ON_FOCUS,
                labeltype: comp._iconLabelType,
                onEnterPress: comp._handleTertiaryActionButton,
                showBackground: true,
                bodyAccentConfiguration: comp._bodyAccentConfiguration,
                labelColor: comp._iconLabelColor,
            };
            comp._isTertiaryActionCreated = true;
        }

        if (actionType === PreviewActionType.Quaternary) {
            comp.Info.quaternaryAction = {
                visible: comp._showActions,
                flexItem: { marginLeft: 40 },
                type: iconType,
                width: 60,
                height: 60,
                backgroundColor: comp._componentAccentColor,
                labelLeftMargin: 30,
                labelShowMode: IconLabelMode.ON_FOCUS,
                labeltype: comp._iconLabelType,
                onEnterPress: comp._handleQuaternaryActionButton,
                showBackground: true,
                bodyAccentConfiguration: comp._bodyAccentConfiguration,
                labelColor: comp._iconLabelColor,
            };
            comp._isQuaternaryActionCreated = true;
        }

        if (actionType === PreviewActionType.Quinary) {
            comp.Info.quinaryAction = {
                visible: comp._showActions,
                flexItem: { marginLeft: 40 },
                type: iconType,
                width: 60,
                height: 60,
                backgroundColor: comp._componentAccentColor,
                labelLeftMargin: 30,
                labelShowMode: IconLabelMode.ON_FOCUS,
                labeltype: comp._iconLabelType,
                onEnterPress: comp._handleQuinaryActionButton,
                showBackground: true,
                bodyAccentConfiguration: comp._bodyAccentConfiguration,
                labelColor: comp._iconLabelColor,
            };
            comp._isQuinaryActionCreated = true;
        }
    } catch (error) {
        console.error(error);
    }
};

/**
 * @name getStatusVisibility
 * @type function/method
 * @param {string} railType
 * @param {string} type
 * @param {CurrentEventStatus} currentEventStatus
 * @description This function will return a boolean to decide weather to show the status of an event.
 * @returns {boolean} showStatus
 *
 * @author alwin-baby
 */
// The comp should be the component that is passed. Eg: any, Details, Player etc..
const getStatusVisibility = (railType: string, type: string, currentEventStatus: CurrentEventStatus | null) => {
    if (!currentEventStatus) return false;
    if (railType === ComponentStyleType.LIVE_TV && currentEventStatus === CurrentEventStatus.LIVE) return true;
    if ((type === ContentType.CALENDAR || railType === ComponentStyleType.NEXT_RALLIES) && currentEventStatus !== CurrentEventStatus.UPCOMING)
        return true;
    return false;
};

/**
 * @name getTimeLabel
 * @type function/method
 * @param {number | null} eventStartTime
 * @param {number | null} eventEndTime
 * @param {CurrentEventStatus | null} currentEventStatus
 * @param {string} type
 * @param {string} railType
 * @description This function will get the corresponding date info to be displayed in the preview component.
 * @returns {string} date information
 *
 * @author alwin-baby
 */
const getTimeLabel = (
    eventStartTime: number | null,
    eventEndTime: number | null,
    currentEventStatus: CurrentEventStatus | null,
    type: string,
    railType: string,
    page: Routes,
) => {
    if (!eventStartTime || !eventEndTime || !currentEventStatus) return '';

    let label = formatDate(new Date(eventStartTime), 'EEE dd MMM yyyy', ' ').toUpperCase();

    if (railType === ComponentStyleType.LIVE_TV) {
        const datePart = formatDate(new Date(eventStartTime), 'EEE dd', ' ').toUpperCase();

        const startTimeLabel = formatTime(new Date(eventStartTime)).toLowerCase();
        const endTimeLabel = formatTime(new Date(eventEndTime)).toLowerCase();
        const timePart = `${startTimeLabel} - ${endTimeLabel}`;

        label = `${datePart} ${timePart}`;

        if (currentEventStatus === CurrentEventStatus.LIVE) {
            label = datePart;
        }

        // for catchup programs in live rail
        const isProgramOver = eventEndTime < Date.now();
        if (isProgramOver) {
            const yesterdayLabel = getLabel(LabelKey.TV_GUIDE_YESTERDAY);
            const todayLabel = getLabel(LabelKey.TV_GUIDE_TODAY);

            let dayPart = yesterdayLabel;
            const startDate = new Date(eventStartTime).toLocaleDateString();
            const dateNow = new Date().toLocaleDateString();
            if (startDate === dateNow) {
                dayPart = todayLabel;
            }

            label = `${dayPart}, ${datePart}`;
        }
    }

    if (railType === ComponentStyleType.CATCH_UP) {
        const datePart = formatDate(new Date(eventStartTime), 'EEE dd', ' ').toUpperCase();
        const yesterdayLabel = getLabel(LabelKey.TV_GUIDE_YESTERDAY);
        const todayLabel = getLabel(LabelKey.TV_GUIDE_TODAY);

        let dayPart = yesterdayLabel;
        const startDate = new Date(eventStartTime).toLocaleDateString();
        const dateNow = new Date().toLocaleDateString();
        if (startDate === dateNow) {
            dayPart = todayLabel;
        }

        label = `${dayPart}, ${datePart}`;
    }

    const isBingeWatchingPopup = page === Routes.PLAYER && type === ContentType.EPISODE;
    if (type === ContentType.CALENDAR || railType === ComponentStyleType.NEXT_RALLIES || isBingeWatchingPopup) {
        const startDateLabel = formatDate(new Date(eventStartTime), 'EEE dd', ' ').toUpperCase();
        const endDateLabel = formatDate(new Date(eventEndTime), 'EEE dd MMM yyyy', ' ').toUpperCase();

        label = `${startDateLabel} - ${endDateLabel}`;
    }

    return label || '';
};

/**
 * @name includesMetadata
 * @type function/method
 * @param {string[]} metadataArray
 * @param {AssetMetadata} metadata
 * @description This function will check if the metadata type exists in the metadata array, both passed as params.
 * @returns {boolean} weather the array includes the metadata or not
 *
 * @author alwin-baby
 */
const includesMetadata = (metadataArray: string[], metadata: AssetMetadata) => metadataArray?.includes?.(metadata);

/**
 * @name getDataForPreview
 * @type function/method
 * @param {RailContentModel | Content} cardData
 * @description This function will parse the data to display the preview component.
 * @returns {PreviewComponentDataNew} preview component data
 *
 * @author alwin-baby
 */
const getDataForPreview = (cardData: RailContentModel | Content): PreviewComponentDataNew => {
    const {
        championshipLogo = [],
        purchaseMode = PurchaseMode.PAID,
        country = {},
        railType = '',
        type = '',
        availableOn = null,
        startDate = null,
        startTime = null,
        availableTill = null,
        endDate = null,
        endTime = null,
        page = '' as Routes,
        title = '',
        startDateLocal = null,
        progress = null,
        progressPercent = 0,
        duration = null,
        displayDuration = null,
        description = '',
        images,
        graphics,
        streams,
        seriesUid,
        continueWatchingData,
        uid,
        maxQualityAvailable = '',
        railHandlingType = null,
        cardId = '',
        localStartTime = null,
        releaseYear = '',
        parentalControl = [{} as ParentalControl],
        isCcAvailable,
        actor = [],
        director = [],
        genre = [],
        countryOfOrigin = '',
        originalLanguages = [''],
        audioLanguages = [''],
        subtitleLanguages = [''],
        showVideoPreview,
        trailers = [] as Trailers[],
        fromRelatedrail,
        previewImageUrl = '',
        numberOfEpisodes = null,
    } = cardData as RailContentModel;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const project: Project = Project.VIDEOTRON;
    const catalogConfig = getCatalogConfig();
    const featureCatalog = getFeatureByKey(Features.FeatureCatalog) as FeatureCatalog;
    const movieMetadata = catalogConfig?.movieMetadata || [];
    const seriesMetadata = catalogConfig?.seriesMetadata || [];

    const eventStartTime = availableOn || startDate || startTime;
    let eventEndTime = availableTill || endDate || endTime;
    // If eventEndTime is not there but display duration is there, use that to calculate eventEndTime
    !eventEndTime && availableOn && displayDuration && (eventEndTime = availableOn + displayDuration);
    const currentEventStatus = getCurrentStatus(eventStartTime, eventEndTime);

    const showBadges = true;
    const isBingeWatchingPopup = page === Routes.PLAYER && type === ContentType.EPISODE;

    let showBadgeText = false;
    let badgeTextLabel = '';
    let badgeTextColor = '';

    if (isBingeWatchingPopup) {
        const upNextLabel = getLabel(LabelKey.LABEL_BINGE_NOW_PLAYING) as string;
        const upNextLabelColor = (getFullScreenPlayerSelectorTheme()?.header?.text?.secondary as Color)?.code;
        showBadgeText = true;
        badgeTextLabel = upNextLabel;
        badgeTextColor = upNextLabelColor || '';
    }

    const showCategoryType = featureCatalog?.showCategoryType;
    const optimizedTypeImage = getOptimizedImage(championshipLogo, { width: 40, height: 40 });
    const typeImageSrc = ((optimizedTypeImage as AssetTypeIcon).url ?? (optimizedTypeImage as Image).imageUrl) || '';
    const showTypeLogo = showCategoryType && !!typeImageSrc;

    const isSubscribed = getState(StorageKeys.IS_USER_SUBSCRIBED);
    const showPurchaseModeIcon = featureCatalog?.showPurchaseModeIcon;
    const showContentSubscription =
        showPurchaseModeIcon &&
        !isSubscribed &&
        !(type === CuratedDataEntryType.PAGE || type === CuratedDataEntryType.ARCHIVE || type === ContentType.CALENDAR);
    const subscriptionBadge = purchaseMode === PurchaseMode.PAID ? subscriptionBaseConfig.lock : subscriptionBaseConfig.free;

    let flagSrc = '';
    const flag = (country as Country)?.flag ?? ([] as Flag[]);
    if (type === ContentType.CALENDAR || railType === ComponentStyleType.NEXT_RALLIES) {
        flagSrc = flag?.[0]?.url || '';
    }
    const showFlag = !!flagSrc;

    const showStatus = getStatusVisibility(railType, type, currentEventStatus);
    const statusLabelType = currentEventStatus === CurrentEventStatus.LIVE ? TopLabelType.important : TopLabelType.normal;
    const statusLabel = currentEventStatus || '';

    // let showTimer = false;
    if (currentEventStatus === CurrentEventStatus.UPCOMING) {
        // if (project === Project.RALLY_TV) {
        //     if (type === ContentType.CALENDAR || railType === ComponentStyleType.NEXT_RALLIES) showTimer = true;
        // } else showTimer = true;
    }
    let timerString = '';
    // if (project === Project.RALLY_TV) {
    //     timerString = eventStartTime ? convertEpochToDaysHrsMinsSecs(eventStartTime - Date.now()) : '';
    // } else {
        const upComingLabel = getLabel(LabelKey.LABEL_DETAILS_UPCOMING_BUTTON) as string;
        timerString = `${upComingLabel} ${eventStartTime && formatDate(new Date(eventStartTime), 'dd MMM yyyy', ' ')}`;
    // }

    const showTitle = true;
    const seriesTitle = (cardData as any)?.seriesTitle;
    const titleLabel =
        railType === ComponentStyleType.RECENTLY_WATCHED && type === ContentType.EPISODE && seriesTitle ? seriesTitle : title.split('\n')[1] || title;

    const showContentInfo = type !== CuratedDataEntryType.PAGE;

    const showTime = type !== CuratedDataEntryType.PAGE && false;
    const timeLabelText = getTimeLabel(eventStartTime, eventEndTime, currentEventStatus, type, railType, page);

    let localRallyTime = '';

    /**
     * According to figma, the only rails where local rally time doesn't need to be shown is for:
     * - On Demand Rail (CuratedDataEntryType.PAGE)
     * - Archive Rail (CuratedDataEntryType.ARCHIVE)
     */
    if (!(type === CuratedDataEntryType.ARCHIVE || type === CuratedDataEntryType.PAGE) && (localStartTime || startDateLocal)) {
        if (localStartTime) {
            localRallyTime = formatTime(new Date(localStartTime)).toLowerCase();
        } else if (startDateLocal) {
            localRallyTime = convertLocalRallyTimeToHHMM(startDateLocal as string);
        }
    }
    const showAdditionalTimeInfo = !!localRallyTime;
    const localRallyTimeLabel = getLabel(LabelKey.LABEL_TIME_TITLE) as string;
    const additionalTimeInfoLabel = `${localRallyTimeLabel}${localRallyTime && ' ' + localRallyTime}`;

    let showDurationFromConfig = false;
    if (type === ContentType.SERIES && includesMetadata(seriesMetadata, AssetMetadata.DURATION)) {
        showDurationFromConfig = true;
    }
    if ((type === ContentType.MOVIE || type === ContentType.PREVIEW) && includesMetadata(movieMetadata, AssetMetadata.DURATION)) {
        showDurationFromConfig = true;
    }
    if (type === ContentType.EPISODE && true && includesMetadata(seriesMetadata, AssetMetadata.DURATION)) {
        showDurationFromConfig = true;
    }
    const [showDur = false, durLabel = ''] = getDurationData(cardData, project, showDurationFromConfig);
    let showDuration = showDur as boolean;
    const durationLabel = durLabel as string;

    if (
        !(durationLabel?.trim()?.length > 0) ||
        type === ContentType.SERIES ||
        (type === ContentType.EPISODE && typeof numberOfEpisodes === 'number' && numberOfEpisodes > 0)
    ) {
        showDuration = false;
    }

    let showYear = false;
    if (type === ContentType.SERIES && includesMetadata(seriesMetadata, AssetMetadata.YEAR) && releaseYear) {
        showYear = true;
    }
    if ((type === ContentType.MOVIE || type === ContentType.PREVIEW) && includesMetadata(movieMetadata, AssetMetadata.YEAR) && releaseYear) {
        showYear = true;
    }
    if (type === ContentType.EPISODE && true && includesMetadata(seriesMetadata, AssetMetadata.YEAR) && releaseYear) {
        showYear = true;
    }
    const yearLabel = releaseYear?.toString?.();

    let showParentalRating = false;
    if (
        type === ContentType.SERIES &&
        (includesMetadata(seriesMetadata, AssetMetadata.PARENTAL_CONTROL) || includesMetadata(seriesMetadata, AssetMetadata.PARENTAL_RATING)) &&
        isValidValue(parentalControl?.[0])
    ) {
        showParentalRating = true;
    }
    if (
        (type === ContentType.MOVIE || type === ContentType.PREVIEW) &&
        (includesMetadata(movieMetadata, AssetMetadata.PARENTAL_CONTROL) || includesMetadata(movieMetadata, AssetMetadata.PARENTAL_RATING)) &&
        isValidValue(parentalControl?.[0])
    ) {
        showParentalRating = true;
    }
    if (
        type === ContentType.EPISODE &&
        true &&
        (includesMetadata(seriesMetadata, AssetMetadata.PARENTAL_CONTROL) || includesMetadata(seriesMetadata, AssetMetadata.PARENTAL_RATING)) &&
        isValidValue(parentalControl?.[0])
    ) {
        showParentalRating = true;
    }
    const parentalRating = parentalControl?.[0]?.rating ?? '';
    if (!parentalRating) showParentalRating = false;

    let showQuality = false;
    if (type === ContentType.SERIES && includesMetadata(seriesMetadata, AssetMetadata.QUALITY_INDICATOR) && !!maxQualityAvailable) {
        showQuality = true;
    }
    if (
        (type === ContentType.MOVIE || type === ContentType.PREVIEW) &&
        includesMetadata(movieMetadata, AssetMetadata.QUALITY_INDICATOR) &&
        !!maxQualityAvailable
    ) {
        showQuality = true;
    }
    const qualityRating = maxQualityAvailable ?? '';
    let showCaptions = false;
    if (
        (type === ContentType.SERIES || type === ContentType.EPISODE) &&
        includesMetadata(seriesMetadata, AssetMetadata.CLOSED_CAPTION_AVAILABILITY) &&
        isCcAvailable
    ) {
        showCaptions = true;
    }
    if (
        (type === ContentType.MOVIE || type === ContentType.PREVIEW) &&
        includesMetadata(movieMetadata, AssetMetadata.CLOSED_CAPTION_AVAILABILITY) &&
        isCcAvailable
    ) {
        showCaptions = true;
    }
    let captionsIconSrc = 'icons/captions/captions.png';
    if (project === Project.VIDEOTRON) {
        captionsIconSrc = getLabel(LabelKey.LABEL_DETAILS_CC)!;
    }

    const startedAtLabel = getLabel(LabelKey.LABEL_COMPONENT_STARTED_AT) as string;
    let progressStartText = (eventStartTime && `${startedAtLabel} ${formatTime(new Date(eventStartTime)).toLowerCase()}`) || '';
    if (
        railType === ComponentStyleType.RECENTLY_WATCHED ||
        railHandlingType === RailHandlingType.FULL_REPLAY_RAIL ||
        railHandlingType === RailHandlingType.HIGHLIGHTS_RAIL ||
        type === ContentType.MOVIE ||
        type === ContentType.PREVIEW
    ) {
        progressStartText = getLabel(LabelKey.LABEL_DETAILS_RESUME) as string;
    }

    if (

        (cardData as Content)?.seasonNumber &&
        cardData?.episodeNumber &&
        (type === ContentType.EPISODE || type === ContentType.SERIES)
    ) {
        const episodePrefix = getLabel(LabelKey.LABEL_DETAILS_EPISODE_PREFIX);
        const seasonPrefix = getLabel(LabelKey.LABEL_DETAILS_SEASON_PREFIX);
        progressStartText = `${seasonPrefix}${(cardData as Content)?.seasonNumber} ${episodePrefix}${cardData?.episodeNumber}`;
    }

    const endTextLabel = getLabel(LabelKey.LABEL_RECENTLY_WATCHED_LEFT) as string;
    let timeLeftInEpoch = eventEndTime && eventEndTime - Date.now();

    const progressFromData = progress ?? continueWatchingData?.progress;
    if (
        railType === ComponentStyleType.RECENTLY_WATCHED ||
        railHandlingType === RailHandlingType.FULL_REPLAY_RAIL ||
        railHandlingType === RailHandlingType.HIGHLIGHTS_RAIL ||
        type === ContentType.MOVIE ||
        type === ContentType.SERIES ||
        type === ContentType.PREVIEW
    ) {
        const durationFromData = duration || displayDuration;
        timeLeftInEpoch = progressFromData && durationFromData ? durationFromData - progressFromData : 0;
    }

    const remainingTime =
        timeLeftInEpoch &&
        convertEpochToDaysHrsMinsSecs(timeLeftInEpoch, {
            upto: EpochSpecificationUpto.MINS,
        }).trim();
    const progressEndText = remainingTime ? `${remainingTime} ${endTextLabel}` : '';

    let progressPercentage = progressPercent;

    if (!progressPercent || type === ContentType.MOVIE || type === ContentType.PREVIEW || type === ContentType.SERIES) {
        progressPercentage =
            railType === ComponentStyleType.RECENTLY_WATCHED ||
            railHandlingType === RailHandlingType.FULL_REPLAY_RAIL ||
            railHandlingType === RailHandlingType.HIGHLIGHTS_RAIL ||
            type === ContentType.MOVIE ||
            type === ContentType.PREVIEW ||
            type === ContentType.SERIES
                ? getProgressByProgress(progressFromData ?? null, duration || displayDuration)
                : getProgressByTime(eventStartTime, eventEndTime);
    }

    const primaryActionType = page === Routes.DETAILS && PreviewActionComponent.Button;
    const secondaryActionType = page === Routes.DETAILS && PreviewActionComponent.Icon;

    const showMoreInfo = !!featureCatalog.showMoreInfo;
    const tertiaryActionType = page === Routes.DETAILS && PreviewActionComponent.Icon;

    const showDescription = railType !== ComponentStyleType.LIVE_TV && railType !== ComponentStyleType.CATCH_UP;
    const descriptionText = description;

    // detailed Perantal rating is not there in VDT
    const showDetailedRating = showParentalRating;
    const ratingTag = parentalControl?.[0]?.ratingTag;
    let detailedRating = `${parentalControl?.[0]?.rating} `;
    ratingTag && (detailedRating = detailedRating + '| ' + getSeparatedString(ratingTag || [''], ', '));

    const originalLanguagesString = getSeparatedString(originalLanguages || [''], ', ');
    const audioLanguagesString = getSeparatedString(audioLanguages || [''], ', ');
    const subtitleLanguagesString = getSeparatedString(subtitleLanguages || [''], ', ');

    const isMovieOrPreview = (type === ContentType.MOVIE || type === ContentType.PREVIEW) && progress != null && progress > 0;
    const isSeriesOrEpisode = (type === ContentType.SERIES || type === ContentType.EPISODE) && progress != null && progress > 0;
    const isLiveTv = railType === ComponentStyleType.LIVE_TV && currentEventStatus === CurrentEventStatus.LIVE;
    const isRecentlyWatched = railType === ComponentStyleType.RECENTLY_WATCHED;
    const isReplayOrHighlights = railHandlingType === RailHandlingType.FULL_REPLAY_RAIL || railHandlingType === RailHandlingType.HIGHLIGHTS_RAIL;
    const isPreview = type === ContentType.PREVIEW;
    const showProgress = (isMovieOrPreview || isLiveTv || isRecentlyWatched || isReplayOrHighlights || isSeriesOrEpisode) && !isPreview;

    let showSeasonCount = false;
    let seasonCount = null;
    if (type === ContentType.SERIES) {
        seasonCount = cardData?.availableSeasons?.length ?? (cardData as any)?.seasonCount ?? null;
        if (typeof seasonCount === 'number' && seasonCount > 0) {
            showSeasonCount = true;
        }
    }

    const data = {
        showVideoPreview,
        showBadges,
        showBadgeText,
        badgeTextLabel,
        badgeTextColor,
        showTypeLogo,
        typeImageSrc,
        showContentSubscription,
        subscriptionBadge,
        flagSrc,
        showFlag,
        showStatus,
        statusLabelType,
        statusLabel,
        showTimer:false,
        timerString,
        showTitle,
        titleLabel,
        showContentInfo,
        showTime,
        timeLabelText,
        showAdditionalTimeInfo,
        additionalTimeInfoLabel,
        showDuration,
        durationLabel,
        showQuality,
        qualityRating,
        showProgress,
        progressStartText,
        progressEndText,
        progress: progressPercentage,
        primaryActionType,
        secondaryActionType,
        showMoreInfo,
        tertiaryActionType,
        showDescription,
        descriptionText,
        images,
        graphics,
        purchaseMode: purchaseMode as PurchaseMode,
        isSubscribed,
        currentEventStatus,
        streamUrl: streams,
        type,
        seriesUid,
        continueWatchingData,
        uid,
        eventStartTime,
        eventEndTime,
        railType,
        cardId: cardId || getCardIdFromData(cardData as RailContentModel),
        showYear,
        yearLabel,
        showParentalRating,
        parentalRating,
        showCaptions,
        captionsIconSrc,
        trailers,
        // TODO: change this
        showActors: true,
        actors: actor,
        // TODO: change this
        showDirector: true,
        director,
        // TODO: change this
        showGenre: true,
        genre,
        // TODO: change this
        showCountryOfOrigin: true,
        countryOfOrigin,
        showDetailedRating,
        detailedRating,
        // TODO: change this
        showOriginalLanguages: true,
        originalLanguages: originalLanguagesString,
        // TODO: change this
        showAudioLanguages: true,
        audioLanguages: audioLanguagesString,
        // TODO: change this
        showSubtitleLanguages: true,
        subtitleLanguages: subtitleLanguagesString,
        cardData: cardData as RailContentModel,
        showSeasonCount,
        seasonCount,
        fromRelatedrail,
        previewImageUrl,
    };

    return data;
};

/**
 * @name getDurationData
 * @type function/method
 * @description This function will get the values of showDuration and durationLabel.
 * @param { RailContentModel | Content} cardData
 * @param {Project} project
 * @param {boolean} showDurationFromConfig
 * @returns {Array<string | boolean>}
 *
 * @author alwin-baby
 */
const getDurationData = (cardData: RailContentModel | Content, project: Project, showDurationFromConfig: boolean): Array<string | boolean> => {
    let showDuration = showDurationFromConfig;
    let durationLabel = '';

    const { type, railType, availableOn, startDate, startTime, availableTill, endDate, endTime, displayDuration } = cardData as RailContentModel;
    const eventStartTime = availableOn || startDate || startTime;
    let eventEndTime = availableTill || endDate || endTime;
    // If eventEndTime is not there but display duration is there, use that to calculate eventEndTime
    !eventEndTime && availableOn && displayDuration && (eventEndTime = availableOn + displayDuration);

    if (project === Project.RALLY_TV) {
        showDuration = type !== ContentType.CALENDAR && railType !== ComponentStyleType.NEXT_RALLIES && type !== CuratedDataEntryType.PAGE;
        durationLabel = eventStartTime && eventEndTime ? getDifferenceInDaysHoursMinutes(new Date(eventStartTime), new Date(eventEndTime)) : '';
        return [showDuration, durationLabel];
    }

    if (displayDuration) durationLabel = convertEpochToDaysHrsMinsSecs(displayDuration, { upto: EpochSpecificationUpto.MINS });
    return [showDuration, durationLabel];
};

/**
 * @name getSeparatedString
 * @type function/method
 * @param {string[]} list
 * @param {string} separator
 * @description This function will generate a seperated string out of an array of strings.
 * @returns {string}
 *
 * @author alwin-baby
 */
const getSeparatedString = (list: string[], separator = ' ') => {
    let result = '';
    for (const item of list) {
        if (item && typeof item === 'string') {
            result += item + separator;
        }
    }

    // Remove trailing separator
    return result.trim().replace(new RegExp(`${separator}\\s*$`), '');
};

const pageEntryOutAnimation = (comp: any, res: (value: boolean) => void) => {
    comp.Info.patch({ alpha: 0 });
    res(true);
};

const pageExitOutAnimation = (comp: any, res: (value: boolean) => void) => {
    const duration = 0.5;
    comp.Info.animation({
        duration,
        repeat: 0,
        actions: [{ p: 'y', v: { 0: 0, 1: -200 } }],
    }).start();
    comp.Info.setSmooth('alpha', 0, { duration });
    res(false);
};

const defaultOutAnimation = (comp: any, res: (value: boolean) => void, coordinates: { x: number; y: number } = { x: 0, y: 0 }) => {
    const duration = 0.3;
    const repeat = 0;

    const isThumbnailAnimationOutCompleted = new Promise((resolve, reject) => {
        const thumbnailAnimationOut = comp.ThumbnailImage.animation({
            duration,
            repeat,
            actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
        });
        thumbnailAnimationOut.start();
        thumbnailAnimationOut.on('finish', () => resolve(true));
        thumbnailAnimationOut.on('stop', () => reject(false));
    });

    const isInfoAnimationOutCompleted = new Promise((resolve, reject) => {
        const infoAnimationOut = comp.Info.animation({
            duration,
            repeat,
            actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
        });
        infoAnimationOut.start();
        infoAnimationOut.on('finish', () => resolve(true));
        infoAnimationOut.on('stop', () => reject(false));
    });

    Promise.all([isThumbnailAnimationOutCompleted, isInfoAnimationOutCompleted])
        .then(() => {
            comp.Info.patch(coordinates);
            res(true);
        })
        .catch(() => res(false));
};

const detailsPageExitOutAnimation = (comp: any, res: (value: boolean) => void) => {
    const duration = 0.5;
    comp.Info.animation({
        duration,
        repeat: 0,
        actions: [{ p: 'y', v: { 0: comp.Info.y, 1: -100 } }],
    }).start();
    comp.Info.setSmooth('alpha', 0, { duration });
    res(false);
};

const detailsToPlayerPageOutAnimation = (comp: any, res: (value: boolean) => void) => {
    const duration = 0.7;
    comp.ThumbnailImage.setSmooth('alpha', 0, { duration });
    comp.Info.setSmooth('x', -100, { duration });
    comp.Info.setSmooth('alpha', 0, { duration });
    res(false);
};

const railTranslationOutAnimation = (
    comp: any,
    res: (value: boolean) => void,
    previewAnimation: PreviewAnimationTypes,
    previewId: string,
    sameItem: boolean,
) => {
    const timeout = setTimeout(async () => {
        /**
         * checking if the user is still scrolling by comparing the previewID in data and the stored
         * previewID (more details can be found at the setter of data inside the preview component).
         * If both the IDs are equal means that scrolling through the rails has stopped and then the data
         * for the preview component is changed, the isTranslating status is changed to false and
         * starts the out animations
         */
        if (comp._previewId === previewId && !sameItem) {
            try {
                const isThumbnailAnimationOutCompleted = await new Promise((resolve, reject) => {
                    const duration = 0.3;
                    const repeat = 0;
                    const uniqueID = uuidv4();
                    const thumbnailAnimationOut = comp.ThumbnailImage.animation({
                        duration,
                        repeat,
                        actions: [{ p: 'alpha', v: { 0: 1, 1: 0 } }],
                    });
                    thumbnailAnimationOut.start();

                    // Add and clear preview animation on start and finish respectivily
                    previousAnimations.push({ id: uniqueID, animation: thumbnailAnimationOut });

                    thumbnailAnimationOut.on('finish', () => {
                        previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
                        return resolve(true);
                    });
                    thumbnailAnimationOut.on('stop', () => {
                        previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
                        return reject(false);
                    });
                });

                const isInfoAnimationOutCompleted = await new Promise((resolve, reject) => {
                    const duration = 0.3;
                    const repeat = 0;
                    const uniqueID = uuidv4();
                    let actions = [{ p: 'alpha', v: { 0: 1, 1: 0 } }];
                    if (previewAnimation === PreviewAnimationTypes.HORIZONTAL_RAIL_TRANSLATION) {
                        actions = [...actions, { p: 'x', v: { 0: 0, 1: -100 } }];
                    }

                    const attributes = {
                        duration,
                        repeat,
                        actions,
                    };
                    const infoAnimationOut = comp.Info.animation(attributes);
                    infoAnimationOut.start();

                    // Add and clear previewanimation on start and finish respectivily
                    previousAnimations.push({ id: uniqueID, animation: infoAnimationOut });

                    infoAnimationOut.on('finish', () => {
                        previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
                        return resolve(true);
                    });
                    infoAnimationOut.on('stop', () => {
                        previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
                        return reject(false);
                    });
                });

                Promise.all([isThumbnailAnimationOutCompleted, isInfoAnimationOutCompleted])
                    .then(() => res(true))
                    .catch(() => res(false));
            } catch (error) {
                console.error(error);
                res(false);
            }
        } else {
            res(false);
        }
        clearTimeout(timeout);
    }, 200);
};

const previewOutAnimation = async (comp: any, previewAnimation: PreviewAnimationTypes, previewId: string, sameItem: boolean): Promise<boolean> => {
    return new Promise(res => {
        const allowAnimations = getAllowAnimations();
        if (!allowAnimations) {
            defaultInAnimation(comp, res);
            return;
        }
        switch (previewAnimation) {
            case PreviewAnimationTypes.GENERAL_PAGE_IN:
                pageEntryOutAnimation(comp, res);
                break;
            case PreviewAnimationTypes.GENERAL_PAGE_OUT:
                pageExitOutAnimation(comp, res);
                break;
            case PreviewAnimationTypes.DETAILS_PAGE_IN:
                pageEntryOutAnimation(comp, res);
                break;
            case PreviewAnimationTypes.DETAILS_PAGE_CONTENT:
                defaultOutAnimation(comp, res);
                break;
            case PreviewAnimationTypes.DETAILS_PAGE_OUT:
                detailsPageExitOutAnimation(comp, res);
                break;
            case PreviewAnimationTypes.DETAILS_TO_PLAYER_PAGE_OUT:
                detailsToPlayerPageOutAnimation(comp, res);
                break;
            case PreviewAnimationTypes.HORIZONTAL_RAIL_TRANSLATION:
                railTranslationOutAnimation(comp, res, previewAnimation, previewId, sameItem);
                break;
            case PreviewAnimationTypes.VERTICAL_RAIL_TRANSLATION:
                railTranslationOutAnimation(comp, res, previewAnimation, previewId, sameItem);
                break;
            case PreviewAnimationTypes.BACK_PRESS_RAIL_TRANSLATION:
                railTranslationOutAnimation(comp, res, previewAnimation, previewId, sameItem);
                break;
            case PreviewAnimationTypes.FROM_SIDEBAR:
                // no animations or data binding
                res(true);
                break;
            case PreviewAnimationTypes.NONE:
                // no animations or data binding
                res(true);
                break;
            default:
                defaultOutAnimation(comp, res);
        }
    });
};

const pageEntryInAnimation = (comp: any, res: (value: boolean) => void) => {
    const initialInfoAnimation = comp.Info.animation({
        duration: 0.4,
        repeat: 0,
        actions: [
            { p: 'alpha', v: { 0: 0, 1: 1 } },
            { p: 'y', v: { 0: 200, 1: 0 } },
            { p: 'x', v: { 0: 0 } },
        ],
    });
    initialInfoAnimation.start();
    initialInfoAnimation.on('finish', () => {
        res(true);
    });
};

const detailsPageEntryInAnimation = (comp: any, res: (value: boolean) => void) => {
    const duration = 0.7;
    const detailsInitialInfoAnimation = comp.Info.animation({
        duration,
        repeat: 0,
        actions: [
            { p: 'alpha', v: { 0: 0, 1: 1 } },
            { p: 'y', v: { 0: -150, 1: 0 } },
            { p: 'x', v: { 0: 0 } },
        ],
    });
    detailsInitialInfoAnimation.start();
    comp.ThumbnailImage.setSmooth('alpha', 1, { duration });
    detailsInitialInfoAnimation.on('finish', () => {
        res(true);
    });
};

const defaultInAnimation = (comp: any, res: (value: boolean) => void) => {
    const duration = 0.3;
    comp.Info.setSmooth('alpha', 1, { duration });
    comp.Info.setSmooth('x', 0, { duration });
    comp.Info.setSmooth('y', 0, { duration });
    comp.ThumbnailImage.setSmooth('alpha', 1, { duration });
    res(true);
};

const railTranslationInAnimation = (comp: any, res: (value: boolean) => void, previewAnimation: PreviewAnimationTypes) => {
    const isThumbnailAnimationInCompleted = new Promise((resolve, reject) => {
        const duration = 0.3;
        const delay = 0;
        const repeat = 0;
        const uniqueID = uuidv4();

        const thumbnailAnimationIn = comp.ThumbnailImage.animation({
            duration,
            delay,
            repeat,
            actions: [{ p: 'alpha', v: { 0: 0, 1: 1 } }],
        });
        thumbnailAnimationIn.start();

        // Add and clear previewanimation on start and finish respectivily
        previousAnimations.push({ id: uniqueID, animation: thumbnailAnimationIn });

        thumbnailAnimationIn.on('finish', () => {
            previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
            return resolve(true);
        });
        thumbnailAnimationIn.on('stop', () => {
            previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
            return reject(false);
        });
    });

    const isInfoAnimationInCompleted = new Promise((resolve, reject) => {
        comp.Info.patch({ x: 0 });
        const duration = 0.3;
        const repeat = 0;
        const delay = 0;
        const uniqueID = uuidv4();

        let actions = [{ p: 'alpha', v: { 0: 0, 1: 1 } }];
        if (previewAnimation === PreviewAnimationTypes.VERTICAL_RAIL_TRANSLATION) {
            actions = [...actions, { p: 'y', v: { 0: 100, 1: 0 } }];
        } else if (previewAnimation === PreviewAnimationTypes.BACK_PRESS_RAIL_TRANSLATION) {
            actions = [...actions, { p: 'y', v: { 0: -100, 1: 0 } }];
        }

        const attributes = {
            duration,
            delay,
            repeat,
            actions,
        };
        const infoAnimationIn = comp.Info.animation(attributes);
        infoAnimationIn.start();

        // Add and clear previewanimation on start and finish respectivily
        previousAnimations.push({ id: uniqueID, animation: infoAnimationIn });

        infoAnimationIn.on('finish', () => {
            previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
            return resolve(true);
        });
        infoAnimationIn.on('stop', () => {
            previousAnimations = previousAnimations.filter(animation => animation?.id !== uniqueID);
            return reject(false);
        });
    });

    Promise.all([isThumbnailAnimationInCompleted, isInfoAnimationInCompleted])
        .then(() => {
            res(true);
        })
        .catch(() => res(false));
};

// Array to store previewanimations that are currently in progress
let previousAnimations: any[] = [];
const previewInAnimation = async (comp: any, previewAnimation: PreviewAnimationTypes) => {
    return new Promise(res => {
        const allowAnimations = getAllowAnimations();
        if (!allowAnimations) {
            defaultInAnimation(comp, res);
            return;
        }
        switch (previewAnimation) {
            case PreviewAnimationTypes.GENERAL_PAGE_IN:
                pageEntryInAnimation(comp, res);
                break;
            case PreviewAnimationTypes.DETAILS_PAGE_IN:
                detailsPageEntryInAnimation(comp, res);
                break;
            case PreviewAnimationTypes.DETAILS_PAGE_CONTENT:
                defaultInAnimation(comp, res);
                break;
            case PreviewAnimationTypes.HORIZONTAL_RAIL_TRANSLATION:
                railTranslationInAnimation(comp, res, previewAnimation);
                break;
            case PreviewAnimationTypes.VERTICAL_RAIL_TRANSLATION:
                railTranslationInAnimation(comp, res, previewAnimation);
                break;
            case PreviewAnimationTypes.BACK_PRESS_RAIL_TRANSLATION:
                railTranslationInAnimation(comp, res, previewAnimation);
                break;
            case PreviewAnimationTypes.FROM_SIDEBAR:
                res(true);
                break;
            case PreviewAnimationTypes.NONE:
                // If no animations needs to be shown the clear any previous pending animations
                previousAnimations.forEach((animationData: any) => {
                    animationData?.animation?.stopNow();
                });
                previousAnimations = [];
                res(true);
                break;
            default:
                defaultInAnimation(comp, res);
        }
    });
};

export {
    getActionButtonProperties,
    getDetailsPreviewPrimaryActionLabel,
    getDetailsPreviewPrimaryActionIconSrc,
    createActionButton,
    createActionIcon,
    getDataForPreview,
    getStatusVisibility,
    getTimeLabel,
    previewOutAnimation,
    previewInAnimation,
    checkRecentlyWatched,
    getSeparatedString,
};
