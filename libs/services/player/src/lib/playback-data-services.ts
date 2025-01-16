/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    CacheValue,
    ComponentData,
    ComponentStyle,
    ComponentStyleType,
    EPGResponse,
    FeaturePlayer,
    Listing,
    NextEpisodeRequest,
    PageComponent,
    PlaybackData,
    PlaybackInitiatedSourceType,
    PlaybackType,
    PlaybackVideoData,
    RailContentModel,
    PlayerStatusData,
    ContentType,
    Project,
} from '@enlight-webtv/models';
import { ContentService, PlaybackServices } from '@enlight-webtv/network-services';
import { configurationUtilities, dateUtilities, detailsPageUtilities, commonUtilities, projectUtilities } from '@enlight-webtv/utilities';

//utilities
const { isDateBetween } = dateUtilities;
const { replaceRelatedParams } = detailsPageUtilities;
const { getPlayerConfig } = configurationUtilities;
const { isValidValue } = commonUtilities;
//services
const { getNextPreviousEpisodes } = new PlaybackServices();
const { getChannelData, getComponentData } = new ContentService();

class PlaybackDataServices {
    static instance: PlaybackDataServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlaybackDataServices.instance) {
            return PlaybackDataServices.instance;
        }
        PlaybackDataServices.instance = this;
    }

    destroy() {
        if (PlaybackDataServices.instance === this) {
            PlaybackDataServices.instance = null;
        }
    }

    /**
     * @name setPlayerContext
     * @type function
     * @description This function will set the player context.
     * @param {any} PlayerContext
     *
     * @author amalmohann
     */
    setPlayerContext = (context: any) => {
        const playerStatusData = { ...this.getPlayerStatusData() };
        playerStatusData.playerContext = context;
        this.setPlayerStatusData({ ...this.getPlayerStatusData(), ...playerStatusData });
    };

    /**
     * @name getPlaybackData
     * @type function
     * @description This function will return the playback data from the window object.
     * @returns {PlaybackData} playback data
     *
     * @author amalmohann
     */
    getPlaybackData = () => {
        //@ts-ignore
        return window.playbackData as PlaybackData;
    };

    /**
     * @name setPlaybackData
     * @type function
     * @description This function will set the playback data into the window object.
     * @param {PlaybackData} data - data to be saved as playback data.
     *
     * @author amalmohann
     */
    setPlaybackData = (data: PlaybackData = {} as PlaybackData) => {
        //@ts-ignore
        window.playbackData = data;
    };

    /**
     * @name getPlaybackVideoData
     * @type function
     * @description This function will return the playback data from the window object.
     * @returns {PlaybackVideoData} playback data
     *
     * @author amalmohann
     */
    getPlaybackVideoData = () => {
        //@ts-ignore
        return (window.playbackVideoData ?? {}) as PlaybackVideoData;
    };

    /**
     * @name setPlaybackVideoData
     * @type function
     * @description This function will set the playback data into the window object.
     * @param {PlaybackVideoData} data - data to be saved as playback data.
     *
     * @author amalmohann
     */
    setPlaybackVideoData = (data: PlaybackVideoData = {} as PlaybackVideoData) => {
        //@ts-ignore
        window.playbackVideoData = data;
        //@ts-ignore
        return window.playbackVideoData;
    };

    /**
     * @name getPlayerStatusData
     * @type function
     * @description This function will return the playback data from the window object.
     * @returns {PlayerStatusData} playback data
     *
     * @author amalmohann
     */
    getPlayerStatusData = () => {
        //@ts-ignore
        return (window.PlayerStatusData ?? {}) as PlayerStatusData;
    };

    /**
     * @name setPlayerStatusData
     * @type function
     * @description This function will set the playback data into the window object.
     * @param {PlayerStatusData} data - data to be saved as playback data.
     *
     * @author amalmohann
     */
    setPlayerStatusData = (data: PlayerStatusData = {} as PlayerStatusData) => {
        // console.trace('> trace setPlayerStatusData >', data);

        //@ts-ignore
        window.PlayerStatusData = data;
        //@ts-ignore
        return window.PlayerStatusData;
    };

    /**
     * @name getIsUserPreferredQualitySet
     * @type function
     * @description This function will return if the user quality has been set or not from the window object.
     * @returns {boolean} isUserPreferredQualitySet
     *
     * @author amalmohann
     */
    getIsUserPreferredQualitySet = () => {
        //@ts-ignore
        return (window.isUserPreferredQualitySet ?? {}) as boolean;
    };

    /**
     * @name setIsUserPreferredQualitySet
     * @type function
     * @description This function will set the playback data into the window object.
     * @param {boolean} value - value if the user preferred value is set or not.
     *
     * @author amalmohann
     */
    setIsUserPreferredQualitySet = (value: boolean) => {
        //@ts-ignore
        window.isUserPreferredQualitySet = value;
        //@ts-ignore
        return window.isUserPreferredQualitySet;
    };

    /**
     * @name setPlaybackVideoDataItem
     * @type function
     * @description This function will set the playback data item into the window object.
     * @param {string} key - key to set inside playback data.
     * @param {any} value - value to set inside playback data key.
     *
     * @author amalmohann
     */
    setPlaybackVideoDataItem = (key: string, value: any) => {
        //set the playbackVideoData if null/ undefined.
        // @ts-ignore
        if (!window.playbackVideoData) {
            // @ts-ignore
            window.playbackVideoData = {} as PlaybackVideoData;
        }
        // @ts-ignore
        if (key && Object.keys(window.playbackVideoData).includes(key)) {
            // @ts-ignore
            window.playbackVideoData[key] = value;
        }
        // @ts-ignore
        return window.playbackVideoData;
    };

    /**
     * @name setPlaybackTypeBasedContents
     * @type function
     * @description this function will get the necessary data needed for specific type of playback
     * @param {PlaybackType} - playback type
     *
     * @author amalmohann
     */
    setPlaybackTypeBasedContents = async (playbackType: PlaybackType) => {
        const playerStatusData = { ...this.getPlayerStatusData() };
        const playbackVideoData = { ...this.getPlaybackVideoData() };

        //if the  VOD Series is ended and no episode and for all the VOD.
        //check for trailer and catchup playback from catchup rail. which is considered as VOD, but doesn't need special handling.
        if (
            [PlaybackType.TRAILER, PlaybackType.PREVIEW].includes(playbackType) &&
            playerStatusData.playbackInitiatedSourceType === PlaybackInitiatedSourceType.CARD &&
            playbackVideoData.specialHandlingType === ComponentStyleType.CATCH_UP
        ) {
            return;
        }
        const playerConfiguration = getPlayerConfig() ?? ({} as FeaturePlayer);
        if ([PlaybackType.TRAILER, PlaybackType.PREVIEW].includes(playbackType)) {
            playerStatusData.playerUIMode = playbackType;
            playerStatusData.playerContext && (playerStatusData.playerContext._playbackType = PlaybackType.TRAILER);
        } else if (playbackType === PlaybackType.VOD || playbackType === PlaybackType.VOD_SERIES) {
            //handle for series
            if (playbackType === PlaybackType.VOD_SERIES) {
                //get Next Previous Episode details if playback type is vod
                const request: NextEpisodeRequest = {
                    episodeId: playbackVideoData.contentId,
                    //TODO: change on teh language switching of the application. use the getUserPreferredAppLanguage()
                    language: 'en',
                    seriesId: playbackVideoData.seriesId,
                } as NextEpisodeRequest;
                const nextPrevEpisode = await getNextPreviousEpisodes(request);
                const nextEpisode = nextPrevEpisode?.data?.nextEpisode;
                playbackVideoData.nextEpisodeData = nextEpisode;
                if (nextEpisode) {
                    playerStatusData.playerUIMode = PlaybackType.VOD_SERIES;
                    playerStatusData.playerContext && (playerStatusData.playerContext._playbackType = PlaybackType.VOD_SERIES);
                    this.setPlaybackVideoData({ ...this.getPlaybackVideoData(), ...playbackVideoData });
                    this.setPlayerStatusData({ ...this.getPlayerStatusData(), ...playerStatusData });
                    return;
                }
            }
            //update the playback type
            playerStatusData.playerUIMode = PlaybackType.VOD;
            playerStatusData.playerContext && (playerStatusData.playerContext._playbackType = PlaybackType.VOD);

            //get the related rail style and contents
            const component: PageComponent | undefined = playerConfiguration?.relatedComponent?.[0];
            playerStatusData.playerRailStyle = component?.componentStyle[0] ?? ({} as ComponentStyle);
            const componentData: ComponentData = Object.assign({}, component?.contents?.[0] ?? ({} as ComponentData));

            // Only parse params if it's not a recommendation rail
            // Recommendation rail params are parsed through recombee service during request
            if (componentData?.type !== 'recommendation') {
                const replacedParams = replaceRelatedParams(componentData?.params, playbackVideoData.contentData);
                componentData.params = replacedParams;
            }

            // Get the id and type of content playing to fetch its related contents
            let initiatedItemID: string = playbackVideoData?.contentData?.recombeeItemID ?? playbackVideoData?.contentData?.uid;
            let initiatedItemType: ContentType = playbackVideoData?.contentData?.type;

            // If item is a episode, then set the type as series and utilize the sereisId rather than the episode uid.
            // This helps prevent same series episodes being recommended again
            if (playbackVideoData?.contentData?.type === ContentType.EPISODE || playbackVideoData?.contentData?.type === ContentType.SERIES) {
                initiatedItemID = playbackVideoData?.contentData?.seriesUid || playbackVideoData?.seriesId || playbackVideoData?.contentData?.uid;
                initiatedItemType = ContentType.SERIES;
            }
            const relatedRail = (await getComponentData(
                componentData ?? ({} as ComponentData),
                component?.cache ?? CacheValue.NEVER,
                initiatedItemID,
                initiatedItemType,
            )) as any;

            if (Array.isArray(relatedRail?.content)) {
                const filteredRelatedRailContent = relatedRail.content.filter((item: RailContentModel) => item?.uid !== playbackVideoData.contentId);
                relatedRail.content = filteredRelatedRailContent;
            }
            if (isValidValue(relatedRail?.content)) playbackVideoData.relatedRailData = relatedRail;
        } else if (playbackType === PlaybackType.LIVE) {
            //get the related rail style and contents
            const component = playerConfiguration.programComponent?.[0];
            playerStatusData.playerRailStyle = component?.componentStyle[0] ?? ({} as ComponentStyle);
            playerStatusData.playerUIMode = PlaybackType.LIVE;
            playerStatusData.playerContext && (playerStatusData.playerContext._playbackType = PlaybackType.LIVE);
            const { getProjectName } = projectUtilities;
            if (getProjectName() === Project.RALLY_TV) {
                //set the data for the related Rail inside the player.
                const now = new Date().getTime();
                const twelve_hours_from_now = now + 12 * 3600 * 1000;
                const epgData = (await getChannelData(
                    { byListingTime: `${now}~${twelve_hours_from_now}`, range: -1 },
                    CacheValue.NEVER,
                )) as EPGResponse;
                if (epgData) {
                    const listings = epgData.entries[0]?.listings ?? ([] as Listing[]);
                    let liveIndex: number = 0;
                    //get the currently live item to set the episode title
                    for (const index in listings) {
                        const { startTime, endTime } = listings[index]!;
                        const isLive = isDateBetween(new Date(), new Date(startTime || 0), new Date(endTime || 0));
                        if (isLive) {
                            playbackVideoData.title = listings[index]!.id;
                            liveIndex = Number(index);
                            break;
                        }
                    }
                    const updatedLiveRail = epgData.entries[0]?.listings.splice(liveIndex);
                    epgData.entries[0] && (epgData.entries[0].listings = updatedLiveRail!);
                    playbackVideoData.relatedRailData = { ...epgData, railType: ComponentStyleType.LIVE_TV };
                }
            }
        }
        this.setPlaybackVideoData({ ...this.getPlaybackVideoData(), ...playbackVideoData });
        this.setPlayerStatusData({ ...this.getPlayerStatusData(), ...playerStatusData });
    };
}

export default PlaybackDataServices;
