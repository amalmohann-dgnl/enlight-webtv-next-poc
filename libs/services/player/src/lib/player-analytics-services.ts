import { AnalyticsServices } from '@enlight-webtv/analytics-services';
import {
    PlaybackType,
    VideoDimensions,
    VideoMetrics,
    EventType,
    PlayerMode,
    RightSideMenuItem,
    TextStreamData,
    PlayerCustomOptions,
    Project,
    ErrorConfiguration,
    ContentType,
} from '@enlight-webtv/models';
import { PlaybackDataServices } from '.';
import { playerUtilities, commonUtilities } from '@enlight-webtv/utilities';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const projectName: Project = import.meta.env.VITE_PROJECT_NAME;

//services
const { getPlaybackVideoData, getPlayerStatusData, setPlayerStatusData } = new PlaybackDataServices();
const analyticsService = new AnalyticsServices();
//utilities
const { getCurrentTimeFromPlayer, getPlayerInstance } = playerUtilities;
const { isValidValue } = commonUtilities;

class PlayerAnalyticsService {
    static instance: PlayerAnalyticsService | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerAnalyticsService.instance) {
            return PlayerAnalyticsService.instance;
        }
        PlayerAnalyticsService.instance = this;
    }

    destroy() {
        if (PlayerAnalyticsService.instance === this) {
            PlayerAnalyticsService.instance = null;
        }
    }

    /**
     * ===================================================>
     * ===================================================>
     * Google Analytics
     * ===================================================>
     * ===================================================>
     */
    /**
     * ===================================================>
     * get event attributes functions
     * ===================================================>
     */
    /**
     * @name getGoogleAnalyticsInitialPlaybackEventAttribute
     * @type function
     * @description This function will prepare the initial playing event for google analytics
     * @returns {Partial<VideoDimensions>} - partial video content data.
     *
     * @author amalmohann
     */
    getGoogleAnalyticsInitialPlaybackEventAttribute = (): Partial<VideoDimensions> => {
        const player = getPlayerInstance();
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };

        const contentType = playbackVideoData?.contentType;
        const currentTimeInSeconds = Math.floor(
            getCurrentTimeFromPlayer(player, playerStatusData?.playerCurrentTimeOffset, playbackVideoData?.contentType),
        );
        const currentTime = playbackVideoData?.contentType === PlaybackType.LIVE ? '00000' : currentTimeInSeconds.toString().padStart(5, '0');

        console.log('====================================');
        console.log('check for the playback data value, remove after comparison', playbackVideoData);
        console.log('====================================');
        return {
            cd35: playbackVideoData?.smilData?.title,
            cd36: playbackVideoData?.title || playbackVideoData?.seriesName,
            cd37: currentTime,
            cd41: playbackVideoData?.programId,
            cd44: playbackVideoData?.title || undefined,
            cd45: playbackVideoData?.title || playbackVideoData?.seriesName,
            cd47: playbackVideoData?.seasonNumber?.toString() || undefined,
            cd49: playbackVideoData?.streamURL,
            cd50: (playbackVideoData?.contentType === PlaybackType.LIVE).toString(),
            cd59: playbackVideoData?.assetId || playbackVideoData?.contentId || playbackVideoData?.programId,
            cd61: playbackVideoData?.selectedAudio,
            cd62: undefined, // pass the selected subtitle
            cd128: contentType === PlaybackType.LIVE ? PlaybackType.LIVE : PlaybackType.VOD, // Liner is not implemented yet
            cd129: playbackVideoData?.programId,
            cd131: '1',
            cd136: playerStatusData?.playerMode,
        } as Partial<VideoDimensions>;
    };

    /**
     * @name getGoogleAnalyticsPlayAndEndEventAttribute
     * @type function
     * @description This function will prepare the playing event and playback end attributes
     * @returns {Partial<VideoDimensions>} - partial video content data.
     *
     * @author amalmohann
     */
    getGoogleAnalyticsPlayAndEndEventAttribute = (): Partial<VideoDimensions> => {
        const player = getPlayerInstance();
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };
        const currentTimeInSeconds = Math.floor(
            getCurrentTimeFromPlayer(player, playerStatusData?.playerCurrentTimeOffset, playbackVideoData?.contentType),
        );
        const currentTime =
            playbackVideoData?.contentType === PlaybackType.LIVE ? currentTimeInSeconds.toString() : currentTimeInSeconds.toString().padStart(5, '0');
        // Calculate total video duration and current playback percentage
        const totalVideoDuration = playbackVideoData?.durationInMS;
        // Construct video dimension values for the video start event
        const selectedAudioTrack = player?.activePlayer?.getVariantTracks().find(({ active }: any) => active);
        const currentPercentage = (currentTimeInSeconds / totalVideoDuration) * 100;

        return {
            cd61: selectedAudioTrack?.language,
            cd37: currentTime,
            cd131: Math.floor(currentPercentage / 10 + 1).toString(),
        };
    };

    /**
     * ===================================================>
     * ===================================================>
     * send event functions
     * ===================================================>
     * ===================================================>
     */
    /**
     * @name sendPlayerPlayingEvent
     * @type function
     * @description This function will send the playing event to all the necessary analytics provider
     * based on the configuration.
     *
     * @author amalmohann
     */
    sendPlayerPlayingEvent = () => {
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };

        if (playerStatusData?.initialPlayback) {
            // Google analytics video dimensions
            const videoDimensionValues: Partial<VideoDimensions> = this.getGoogleAnalyticsInitialPlaybackEventAttribute();
            // Construct video metric values for the video start event
            const videoMetricValues: Partial<VideoMetrics> = {
                cm4: playbackVideoData?.contentType === PlaybackType.LIVE ? 0 : playbackVideoData?.durationInMS,
                cm54: 1,
            };

            // Send video start event with the constructed dimension and metric values
            analyticsService.sendVideoStartEvent(videoDimensionValues, videoMetricValues);
            playerStatusData.initialPlayback = false;
            this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, { event_action: 'start' });
            setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        } else {
            // Send play event
            const videoDimensions: Partial<VideoDimensions> = this.getGoogleAnalyticsPlayAndEndEventAttribute();
            analyticsService.sendPlayVideoEvent(videoDimensions);
        }
    };

    /**
     * @name sendPlayerAnalyticsEvent
     * @type function
     * @description This function will send the player related analytics by gathering required info
     *
     * @author tonyaugustine
     */
    sendPlayerAnalyticsEvent = (eventType: EventType, eventData: any): void => {
        const player = getPlayerInstance();
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };
        const { playerContext } = playerStatusData;

        // A string representing the genres of this item
        let genreListString = '';
        const genre = playbackVideoData?.contentData?.genre;
        if (genre) {
            if (typeof genre === 'string') genreListString = genre;
            else if (Array.isArray(genre) && genre?.length > 0) genreListString = genre.join(', ');
        }

        // Get viewed poriton
        const currentTimeInSeconds = Math.floor(
            getCurrentTimeFromPlayer(player, playerStatusData?.playerCurrentTimeOffset, playbackVideoData?.contentType),
        );
        const portionPlayed =
            (currentTimeInSeconds * 1000) / playbackVideoData?.durationInMS ? (currentTimeInSeconds * 1000) / playbackVideoData?.durationInMS : 0;
        const portion = parseFloat(((portionPlayed > 1 ? 1 : portionPlayed) || 0).toPrecision(3));

        const content_id = playbackVideoData?.contentData?.contentGuid ?? playbackVideoData?.contentData?.uid;

        if (
            playerStatusData?.playerMode === PlayerMode.FULLSCREEN &&
            playbackVideoData?.contentData?.type !== ContentType.TRAILER &&
            playbackVideoData?.contentData?.type !== ContentType.PREVIEW &&
            content_id
        ) {
            // Send playback analytics event
            analyticsService.sendMixPanelEvent(eventType, {
                content_title: playbackVideoData?.title,
                content_genre: genreListString,
                playback_mode: PlayerMode.FULLSCREEN,
                content_id,
                language_code: playerContext?._selectedTextStream,
                asset_id: playbackVideoData?.contentData?.uid,
                item_id: playbackVideoData?.contentData?.contentGuid ?? playbackVideoData?.contentData?.uid,
                content_type: playbackVideoData?.contentData?.type,
                content_classification: playbackVideoData?.contentData?.parentalControl?.[0]?.rating,
                entry_point: playbackVideoData?.contentData?.prevIdentifier ?? 'Details page',
                recommendation_id: playbackVideoData?.contentData?.recommendationID ?? null,
                content_stream_id: playbackVideoData?.smilData?.pid,
                start_time: playerStatusData?.playbackStartTime,
                content_duration: Math.round(playbackVideoData?.durationInMS) || 0,
                progress:
                    playbackVideoData?.contentType === PlaybackType.LIVE
                        ? 0
                        : Math.floor(getCurrentTimeFromPlayer(player, playerStatusData?.playerCurrentTimeOffset, playbackVideoData?.contentType)) ||
                          0,
                portion: projectName === Project.CMGO ? `${portion}` : portion,
                ...(isValidValue(eventData) && eventData),
            });
        }
    };

    /**
     * @name sendPausedEvent
     * @type function
     * @description This function will send the pause event to all the necessary analytics provider
     * based on the configuration.
     *
     * @author amalmohann
     */
    sendPausedEvent = () => {
        const videoDimensions: Partial<VideoDimensions> = this.getGoogleAnalyticsPlayAndEndEventAttribute();
        analyticsService.sendPauseVideoEvent(videoDimensions);
        this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, { event_action: 'pause' });
    };

    /**
     * @name sendResumeEvent
     * @type function
     * @description This function will send the resume event to all the necessary analytics provider
     * based on the configuration.
     *
     * @author tonyaugustine
     */
    sendResumeEvent = (): void => {
        this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, { event_action: 'resume' });
    };

    /**
     * @name sendPlayingEndEvent
     * @type function
     * @description This function will send the playing end event to all the necessary analytics provider
     * based on the configuration.
     *
     * @author amalmohann
     */
    sendPlayingEndEvent = () => {
        // Send google analytics event
        const videoDimensions: Partial<VideoDimensions> = this.getGoogleAnalyticsPlayAndEndEventAttribute();
        analyticsService.sendEndOfVideoEvent(videoDimensions);

        this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, { event_action: 'complete' });
    };

    /**
     * @name sendBufferEvent
     * @type function
     * @description This function will send the buffer event
     *
     * @author tonyaugustine
     */
    sendBufferEvent = () => {
        this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, { event_action: 'buffer' });
    };

    /**
     * @name sendPlayerUnloadEvent
     * @type function
     * @description This function will send the playing unload event to all the necessary analytics provider
     * based on the configuration.
     *
     * @author tonyaugustine
     */
    sendPlayerUnloadEvent = () => {
        this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, { event_action: 'stop' });
    };

    /**
     * @name sendSeekEvent
     * @type function
     * @description This function will send the playing end event to all the necessary analytics provider
     * based on the configuration.
     *
     * @author amalmohann
     */
    sendSeekEvent = () => {
        const videoDimensions: Partial<VideoDimensions> = this.getGoogleAnalyticsPlayAndEndEventAttribute();
        analyticsService.sendSeekVideoEvent(videoDimensions);
        this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, { event_action: 'seek' });
    };

    /**
     * @name sendSubtitleChangeEvent
     * @type function
     * @description This function will send the subtile change eventto analytic provider
     *
     * @author tonyaugustine
     */
    sendSubtitleChangeEvent = (subtitleMenuItem: RightSideMenuItem): void => {
        const playerStatusData = { ...getPlayerStatusData() };
        const { playerContext } = playerStatusData;
        let eventAction = null;

        // Only send event if subtitle has actually changed
        if (playerContext?._selectedTextStream !== (subtitleMenuItem?.data as TextStreamData)?.textStream?.lang) {
            // Set event action based on if subtitles are enabled or disabled
            if ((subtitleMenuItem?.data as TextStreamData)?.textStream?.lang === PlayerCustomOptions.SUBTITLE_DISABLE) {
                eventAction = 'off';
            } else if (isValidValue((subtitleMenuItem?.data as TextStreamData)?.textStream?.lang)) {
                eventAction = 'on';
            }
        }

        if (eventAction) {
            this.sendPlayerAnalyticsEvent(EventType.CONTENT_SUBTITLES, {
                event_action: eventAction,
                language_code: (subtitleMenuItem?.data as TextStreamData)?.textStream?.lang,
            });
        }
    };

    /**
     * @name sendTimeUpdateEvent
     * @type function
     * @description This function will send the time update event to all the necessary analytics provider
     * based on the configuration.
     *
     * @author amalmohann
     */
    sendTimeUpdateEvent = () => {
        const videoDimensions: Partial<VideoDimensions> = this.getGoogleAnalyticsPlayAndEndEventAttribute();
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };
        const isLive = playbackVideoData?.contentType === PlaybackType.LIVE;
        const currentTime = playerStatusData?.currentTime;
        const currentTimeRoundOff = Math.floor(currentTime);

        if (currentTimeRoundOff > 0) {
            // Calculate total video duration and current playback percentage
            const totalVideoDuration = playbackVideoData?.durationInMS;
            const currentPercentage = (currentTime / totalVideoDuration) * 100;
            const currentPercentageRoundOff = Math.floor(currentPercentage);

            // Calculate playlist position based on the current percentage
            const playlistPosition = Math.floor(currentPercentage / 10) + 1;
            videoDimensions.cd131 = playlistPosition.toString();

            // Check if it's a live video and a minute has passed
            if (isLive && currentTimeRoundOff % 60 === 0) {
                analyticsService.sendPOSVideoEvent(videoDimensions);
            } else {
                // Check if a multiple of 10 seconds has passed
                if (currentTimeRoundOff % 10 === 0) {
                    // Send POS absolute event for VOD every 10 seconds
                    analyticsService.sendPOSVideoEvent(videoDimensions);
                }

                // Check if a multiple of 10% of video duration has been reached
                if (currentPercentageRoundOff > 0 && currentPercentageRoundOff % 10 === 0) {
                    // Send POS relative event for every 10% of video duration
                    analyticsService.sendPOSRelativeVideoEvent(videoDimensions);
                }
            }
        }
    };

    /**
     * @name sendPlayerErrorEvent
     * @type function
     * @description This function will send player error analytics event
     *
     * @author tonyaugustine
     */
    sendPlayerErrorEvent = (errorData: ErrorConfiguration): void => {
        this.sendPlayerAnalyticsEvent(EventType.CONTENT_PLAYBACK, {
            event_action: 'error',
            error_code: errorData?.code || '',
            error_message: errorData?.description || '',
        });
    };
}

export default PlayerAnalyticsService;
