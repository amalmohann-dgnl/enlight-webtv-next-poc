import {
    RailContentModel,
    CardDimensions,
    ItemSize,
    RailHandlingType,
    LabelKey,
    Content,
    TimeDependantProperties,
    TopLabelType,
    ComponentStyleType,
    TagData,
    ThemeSection,
    ContentType,
    ContinueWatchingData,
    AssetTypeIcon,
    Image,
    PlaybackProgressContents,
    Dimensions,
    Color,
    Project,
} from '@enlight-webtv/models';
import { commonUtilities, configurationUtilities, dateUtilities, progressUtilities, projectUtilities } from '@enlight-webtv/utilities';

// utilities
const { isDateBetween } = dateUtilities;
const { getLabel, getDefaultPageHeaderTheme } = configurationUtilities;
const { isValidValue, getOptimizedImage } = commonUtilities;
const { getProgressByTime, getProgressByProgress } = progressUtilities;

/**
 * @name getCardIdFromData
 * @type function
 * @description This function will generate the card ID when the data of the card is passed into it.
 * @param {RailContentModel} data - card data
 * @return {string} cardId
 *
 * @author alwin-baby
 */
const getCardIdFromData = (data: RailContentModel): string => {
    const uidPart = data?.uid || data?.id?.split('/')?.pop() || data.id;
    const eventStartTime = data?.availableOn || data?.startDate || data?.startTime || 0;
    const cardId = `${uidPart}-${data.title}-${eventStartTime.toString()}`;
    return cardId;
};

const parseCardTitle = (data: Content, railHandlingType: RailHandlingType | null): string => {
    if (railHandlingType === RailHandlingType.EPISODES_RAIL) {
        const seasonPrefix = getLabel(LabelKey.LABEL_DETAILS_SEASON_PREFIX);
        const episodePrefix = getLabel(LabelKey.LABEL_DETAILS_EPISODE_PREFIX);
        const title = `${seasonPrefix}${data.seasonNumber} ${episodePrefix}${data.episodeNumber} ${data.title}`;
        return title;
    }
    return data.title;
};

/**
 * @name getSkeltonCards
 * @type function/method
 * @description This function will create the card skelton and returns
 * @param {CardDimensions} dimensions - Dimensions of item
 * @param {ItemSize} itemSize - Size of item
 * @param {any} skeltonElement - Type of skeleton container
 * @param {number} itemOrientation - Oreitation of item
 * @param {number | undefined} count - Number of skeleton elemnets to be generated
 * @param {boolean} setPositioning - If skelton elements geenrated needs to have postion values
 * @param {boolean} showTitleSkeleteon - Weather to show or hide the title skeleton
 *
 * @author amalmohann
 */
let SKELTON_CARD_CACHE: any[] | null = null;
const getSkeltonCards = (
    itemSize: ItemSize,
    dimensions: CardDimensions = {} as CardDimensions,
    skeltonElement: any,
    itemOrientation: number = 1.67,
    setPositioning: boolean = true,
    useCache: boolean = true,
    count?: number,
    showTitleSkeleteon = false,
) => {
    if (useCache && SKELTON_CARD_CACHE && SKELTON_CARD_CACHE.length === dimensions.minimumItemsInViewport) {
        return SKELTON_CARD_CACHE;
    }
    const skeleton = [];
    for (let index = 0; index < (count || dimensions.minimumItemsInViewport || 0); index++) {
        const placeholder = {
            width: dimensions.width,
            itemOrientation: itemOrientation,
            isSkeleton: true,
            height: dimensions.height,
            itemSize: itemSize,
            ...(!setPositioning && { w: dimensions.width, h: dimensions.height }),
            ...(setPositioning && { x: index * (dimensions.width + dimensions.marginRight) }),
            type: skeltonElement,
            showTitleSkeleteon: showTitleSkeleteon,
        };
        skeleton.push(placeholder);
    }
    SKELTON_CARD_CACHE = skeleton;
    return skeleton;
};

/**
 * @name getTimeDependantProperties
 * @type function/method
 * @param {RailContentModel} data
 * @description This function will get the properties of rail items that are time dependant.
 * @returns {TimeDependantProperties}
 *
 * @author amalmohann
 */
const getTimeDependantProperties = (data: RailContentModel, dimensions: Dimensions, context: any): TimeDependantProperties => {
    const { availableOn = null, availableTill = null, startDate = null, endDate = null, startTime = null, endTime = null, uid, type } = data;
    const eventStartTime = availableOn ?? startDate ?? startTime ?? 0;
    const eventEndTime = availableTill ?? endDate ?? endTime ?? 0;
    let checkForLive = false;
    if (type && ![ContentType.EPISODE, ContentType.SERIES, ContentType.MOVIE].includes(type as any)) {
        checkForLive = true;
    }

    const durationFromData = data.duration | data.displayDuration;
    let progressFromData = data.progress;
    const { getProjectName } = projectUtilities;
    //check the status of the event
    const isLive =
        getProjectName() === Project.RALLY_TV
            ? checkForLive && isDateBetween(new Date(), new Date(eventStartTime), new Date(eventEndTime))
            : type === ContentType.LIVE;
    const isOnNext = !!data?.onNextItem;
    const isOver = !!data?.isOver;

    let topLabelType = TopLabelType.normal;
    let topLabel: string = '';
    let showItemTopLabel = false;
    let topLabelStyle: ThemeSection = {} as ThemeSection;
    let showSlantingEdgeTopLabel: boolean = false;

    //update top label if live or onNext
    if (isLive) {
        const liveLabel = getLabel(LabelKey.LABEL_COMPONENT_LIVE);
        topLabelType = TopLabelType.important;
        typeof liveLabel === 'string' && (topLabel = liveLabel);
    }
    if (isOnNext) {
        const onNextLabel = getLabel(LabelKey.LABEL_COMPONENT_ON_NEXT);
        topLabelType = TopLabelType.normal;
        typeof onNextLabel === 'string' && (topLabel = onNextLabel);
    }
    if ((context._isLiveTV || context._isCalenderItem || context._railHandlingType === RailHandlingType.SCHEDULES_RAIL) && (isLive || isOnNext)) {
        showItemTopLabel = true;
        if (data?.railType === ComponentStyleType.NEXT_RALLIES) showItemTopLabel = false;
    }

    //add card tags as labels if any
    if (isValidValue(context._tagConfiguration)) {
        const tagData: TagData = context._getAppropriateTagConfiguration(data);
        const { getTopLabelProjectConfig } = projectUtilities;

        if (tagData) {
            showItemTopLabel = context._showItemTopLabel;
            topLabelType = TopLabelType.custom;
            topLabel = tagData?.label;
            topLabelStyle = tagData?.tagStyle;
            showSlantingEdgeTopLabel = getTopLabelProjectConfig()?.showTopLabelSlantingEdge ?? false;
        }
    }

    const showCenterIcon =
        context._isLiveTV ||
        context._railHandlingType === RailHandlingType.SCHEDULES_RAIL ||
        (context._isCatchupTV && isOver) ||
        context._railHandlingType === RailHandlingType.FULL_REPLAY_RAIL ||
        context._railHandlingType === RailHandlingType.HIGHLIGHTS_RAIL ||
        context._railHandlingType === RailHandlingType.TRAILERS_RAIL;

    const showCenterIconOnlyFocus = context._railHandlingType === RailHandlingType.TRAILERS_RAIL;

    let centerIconUrl = 'icons/play-64.png';
    if ((context._isLiveTV || context._railHandlingType === RailHandlingType.SCHEDULES_RAIL) && !isLive && !isOver)
        centerIconUrl = 'icons/timer/clock.png';

    //set the playback thumbnail
    let playbackThumbnailUrl = data.previewImageUrl;
    if (!playbackThumbnailUrl) {
        const graphicsImage = data.graphics && data.graphics.length > 0 ? data.graphics[0]!.images : ([] as Image[]);
        const playbackThumbnail = getOptimizedImage(data.images ?? graphicsImage, dimensions ?? { width: 1280, height: 720 });
        playbackThumbnailUrl = (playbackThumbnail as AssetTypeIcon).url ?? (playbackThumbnail as Image).imageUrl;
    }

    let progressAvailableFromApi = {} as PlaybackProgressContents;
    if (isValidValue(context._progressData)) {
        const progressDetails = context._progressData.find((item: any) => item?.uid === uid);
        progressDetails && (progressAvailableFromApi = progressDetails);
    }

    let allowContinueWatching = true;
    if (
        context._isLiveTV ||
        context._isCatchupTV ||
        context._railHandlingType === RailHandlingType.SCHEDULES_RAIL ||
        isLive ||
        data.type === ContentType.LIVE ||
        data.type === ContentType.TRAILER ||
        data.type === ContentType.PREVIEW
    )
        allowContinueWatching = false;

    let episodeId = '';
    if (isValidValue(progressAvailableFromApi)) {
        episodeId = progressAvailableFromApi.uid || '';
        progressFromData = progressAvailableFromApi.playbackProgress?.progress;
    }

    if (
        context._railHandlingType === RailHandlingType.FULL_REPLAY_RAIL ||
        context._railHandlingType === RailHandlingType.HIGHLIGHTS_RAIL ||
        context._railHandlingType === RailHandlingType.EPISODES_RAIL
    ) {
        const maxResumePercent = context._playerConfig?.maxResumePercent;
        const calculatedProgressPercent = (progressFromData / durationFromData) * 100 || progressAvailableFromApi?.playbackProgress?.percentComplete;

        if (calculatedProgressPercent > maxResumePercent) {
            progressFromData = 0;
        }
    }

    const continueWatchingData: ContinueWatchingData = {
        allowContinueWatching: allowContinueWatching,
        seriesId: context._seriesUid,
        episodeId: episodeId,
        progress: progressFromData,
        contentType: data.type as ContentType,
    };

    const progressPercent =
        context._isRecentlyWatched ||
        context._railHandlingType === RailHandlingType.FULL_REPLAY_RAIL ||
        context._railHandlingType === RailHandlingType.HIGHLIGHTS_RAIL ||
        context._railHandlingType === RailHandlingType.EPISODES_RAIL
            ? getProgressByProgress(progressFromData, durationFromData)
            : getProgressByTime(eventStartTime, eventEndTime);
    const showProgressBar =
        progressPercent != 0 &&
        (((context._isLiveTV || context._railHandlingType === RailHandlingType.SCHEDULES_RAIL) && isLive) ||
            context._isRecentlyWatched ||
            context._railHandlingType === RailHandlingType.EPISODES_RAIL);

    const onPress = context._handleEnterPressOnCards
        ? () => context._handleEnterPressOnCards(data)
        : () => context._onCardEnterPress({ ...data, continueWatchingData }, isLive, isOver, playbackThumbnailUrl);

    return {
        showCenterIcon,
        topLabelType,
        topLabel,
        topLabelStyle,
        showItemTopLabel,
        showSlantingEdgeTopLabel,
        onPress,
        eventStartTime,
        eventEndTime,
        isLive,
        isOnNext,
        centerIconUrl,
        showProgressBar,
        progressPercent,
        continueWatchingData,
        isOver,
        checkForLive,
        showCenterIconOnlyFocus,
    };
};

/**
 * @name setRailTheme
 * @type function/method
 * @param {any} context
 * @description This function will set the rail theme.
 *
 * @author alwin-baby
 */
const setRailTheme = (context: any) => {
    const defaultPageHeaderTheme = getDefaultPageHeaderTheme();
    const headerPrimaryTextColor = (context._theme?.header?.text?.primary as Color)?.code ?? (defaultPageHeaderTheme?.text?.primary as Color)?.code;
    context._titleColor = headerPrimaryTextColor ?? context._titleColor;
};

export { getSkeltonCards, getCardIdFromData, parseCardTitle, getTimeDependantProperties, setRailTheme };
