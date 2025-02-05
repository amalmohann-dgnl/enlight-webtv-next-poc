'use client'
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    AudioData,
    DeviceType,
    EpisodeActions,
    ErrorConfigurationType,
    FeaturePlayer,
    LogLevel,
    PlaybackType,
    PlaybackVideoData,
    PlayerMode,
    PlayerRightSideMenuOptions,
    PlayerState,
    PlayerStatusData,
    QualityData,
    SeekPreviewFormat,
    ShakaError,
    StorageKeys,
    TextStreamData,
} from '@enlight-webtv/models';
import { MuxServices, NetworkConnectivityServices, PlaybackServices } from '@enlight-webtv/network-services';
import { configurationUtilities, deviceUtilities, playerUtilities, commonUtilities, storageUtilities } from '@enlight-webtv/utilities';
import {
    ConcurrencyServices,
    PlayerAnalyticsService,
    PlayerControlsActionServices,
    PlayerControlsUIServices,
    PlayerErrorServices,
    PlayerServices,
    PlayerContinueWatchingServices,
    PlaybackDataServices,
} from '.';

//services
const { firePlayerException } = new PlayerErrorServices();
const { getSeekPreviewThumbnails } = new PlaybackServices();
const { checkInternetConnection } = new NetworkConnectivityServices();
const { updateConcurrencyLock, unlockConcurrencyLock } = new ConcurrencyServices();
const { setPlaybackAudioPlaybackQuality, setUserPreferredQuality, handleNextPreviousEpisode, playerPause } = new PlayerControlsActionServices();
const { sendPlayerPlayingEvent, sendResumeEvent, sendPlayingEndEvent, sendPausedEvent, sendTimeUpdateEvent, sendBufferEvent } =
new PlayerAnalyticsService();
const { updateContinueWatching, setProgress, setContinueWatchingProgress } = new PlayerContinueWatchingServices();
const {
  getPlayerStatusData,
  setPlayerStatusData,
  getPlaybackVideoData,
  setPlaybackVideoData,
  getIsUserPreferredQualitySet,
  setIsUserPreferredQualitySet,
} = new PlaybackDataServices();
const {
  toggleLoadingSpinner,
  toggleThumbnailAndTitle,
  getDisableCardPress,
  toggleDisableCardPress,
  toggleControlsUI,
  showClassificationSlate,
  toggleVideoEndScreen,
  getPlayerUIConfig,
} = new PlayerControlsUIServices();
//utilities
const { getState } = storageUtilities;
const { isValidValue, throttle } = commonUtilities;
const { getPlayerConfig } = configurationUtilities;
const { getDeviceType } = deviceUtilities;
const {
    getPlayerInstance,
    getDurationFromPlayer,
    processAudioFromPlayer,
    processSubtitleFromPlayer,
    mapSeekPreviewThumbnails,
    processQualitiesFromPlayer,
    getCurrentTimeOffset,
    getPlayerErrorType,
    getCurrentTimeFromPlayer,
    getBufferedContentLength,
    setupCanvasAndPlayerStyle,
    getHTMLPlayerTag,
} = playerUtilities;
const { setAnimationFrameTimeout, clearAnimationFrameTimeout } = commonUtilities;
//const
const IS_ANDROID = false;
const sendThrottledbufferEvent = throttle(sendBufferEvent, 2000);

class PlayerEventsServices {
    /**
     * ===================================================>
     * ===================================================>
     * Loading events
     * ===================================================>
     * ===================================================>
     */
    static instance: PlayerEventsServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerEventsServices.instance) {
            return PlayerEventsServices.instance;
        }
        PlayerEventsServices.instance = this;
    }

    destroy() {
        if (PlayerEventsServices.instance === this) {
            PlayerEventsServices.instance = null;
        }
    }

    /**
     * @name handleLoadingEvent
     * @type function
     * @description This function will handle the loading event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleLoadingEvent = async (event: any) => {
        console.info('> handleLoadingEvent > ', event);
        const playerStatusData: PlayerStatusData = { ...getPlayerStatusData() };
        playerStatusData.playerState = PlayerState.LOADING;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
    };

    /**
     * @name handleLoadedMetaDataEvent
     * @type function
     * @description This function will handle the LoadedMetaData event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleLoadedMetaDataEvent = async (event: any) => {
        console.info('> handleLoadedMetaDataEvent > ', event);
        const playerConfig: FeaturePlayer = getPlayerConfig() ?? ({} as FeaturePlayer);
        const playerInstance = getPlayerInstance();
        const playerStatusData: PlayerStatusData = { ...getPlayerStatusData() };

        //check for the player instance
        if (playerInstance && playerStatusData.playerMode === PlayerMode.FULLSCREEN) {
            //get the audio and quality data from player
            const qualityFromPlayer = playerInstance?.getAvailableVideoQualities();
            const audioFromPlayer = playerInstance?.getAvailableAudio();
            const subtitleFromPlayer = playerInstance?.getAvailableSubtitles();

            //get playback video data
            const playbackVideoData: PlaybackVideoData = { ...getPlaybackVideoData() };
            playbackVideoData.contentType = playerInstance.activePlayer.isLive() ? PlaybackType.LIVE : playbackVideoData.contentType;
            playerStatusData.playerUIMode = playerInstance.activePlayer.isLive() ? PlaybackType.LIVE : playerStatusData.playerUIMode;

            const playerUIConfig = getPlayerUIConfig(playerStatusData.playerUIMode);
            //calculate the duration and fetch the seek preview thumbnails for the VODs
            if (playbackVideoData.contentType !== PlaybackType.LIVE) {
                //set the duration from the player
                playbackVideoData.durationInSec = getDurationFromPlayer(playerInstance);
                playbackVideoData.durationInMS = playbackVideoData.durationInSec * 1000;
                playerStatusData.playerContext._duration = playbackVideoData.durationInSec;
                //set the time to trigger the related items in the end screen
                playerStatusData.endScreenDisplayTime = Math.round(playbackVideoData.durationInSec - (playerUIConfig?.bingeCountdownDuration ?? 0));
                const previewFormat = playerUIConfig?.seekPreviewFormat ?? SeekPreviewFormat.IMAGE_DATA_ARRAY;
                // fetch api to get the seekbar preview thumbnails
                const seekPreviewThumbnailImages = await getSeekPreviewThumbnails(previewFormat, playbackVideoData?.smilData?.thumbnailUrl);
                // get the processed thumbnails for the seeking preview
                playbackVideoData.seekPreviewThumbnailImages = seekPreviewThumbnailImages;
                playbackVideoData.seekThumbnailMap = mapSeekPreviewThumbnails(seekPreviewThumbnailImages, playbackVideoData.durationInSec) ?? {};
            }

            //process the audio and quality
            const processedAudio = playerUIConfig?.audioSelector ? processAudioFromPlayer(audioFromPlayer) : ([] as AudioData[]);
            const processedSubtitles = playerUIConfig?.subtitleSelector ? processSubtitleFromPlayer(subtitleFromPlayer) : ([] as TextStreamData[]);
            const processedQualities = playerUIConfig?.qualitySelector
                ? processQualitiesFromPlayer(playerConfig.qualityMappingMode, playerConfig.qualityMapping, qualityFromPlayer)
                : ([] as QualityData[]);

            // Disable language audio switch option if no audio options or subtitles are available
            playerStatusData.playerContext._disableLanguageSwitch =
                !(processedAudio && processedAudio?.length > 0) && !(processedSubtitles && processedSubtitles?.length > 0);

            //assign to bind the props to player controls
            playbackVideoData.audioData = processedAudio ?? ([] as AudioData[]);
            playbackVideoData.textStreamData = processedSubtitles ?? ([] as TextStreamData[]);
            playbackVideoData.qualityData = processedQualities ?? ([] as QualityData[]);
            playerStatusData.playerContext._audioData = playbackVideoData.audioData;
            playerStatusData.playerContext._textStreams = playbackVideoData.textStreamData;
            playerStatusData.playerContext._qualityData = playbackVideoData.qualityData;
            //set the audio if locally saved preferences are found else use the default settings
            const preferredAudio = getState(StorageKeys.SELECTED_AUDIO_MENU);
            //set audio based on the preferred audio
            playbackVideoData.selectedAudio = setPlaybackAudioPlaybackQuality(
                playerInstance,
                PlayerRightSideMenuOptions.AUDIO,
                playbackVideoData.audioData,
                preferredAudio,
            );

            //set the subtitle if locally saved preferences are found else use the default settings
            const preferredSubtitle = getState(StorageKeys.SELECTED_SUBTITLE_MENU);
            //set subtitle based on the preferred subtitle
            playbackVideoData.selectedTextStream = setPlaybackAudioPlaybackQuality(
                playerInstance,
                PlayerRightSideMenuOptions.SUBTITLE,
                playbackVideoData.textStreamData,
                preferredSubtitle,
            );

            //set the Quality if locally saved preferences are found else use the default settings
            const preferredQuality = getState(StorageKeys.SELECTED_QUALITY_MENU);
            //set Quality based on the preferred Quality
            playbackVideoData.selectedQuality = setPlaybackAudioPlaybackQuality(
                playerInstance,
                PlayerRightSideMenuOptions.QUALITY,
                playbackVideoData.qualityData,
                preferredQuality,
            );
            //set preferred Quality for android
            if (IS_ANDROID) {
                //set quality based on the preferred quality if available
                const preferredQuality = getState(StorageKeys.SELECTED_QUALITY_MENU);
                playbackVideoData.selectedQuality = setPlaybackAudioPlaybackQuality(
                    playerInstance,
                    PlayerRightSideMenuOptions.QUALITY,
                    playbackVideoData.qualityData,
                    preferredQuality,
                );
                playerStatusData.isUserPreferredQualityUpdated = true;
            }

            setPlaybackVideoData({ ...getPlaybackVideoData(), ...playbackVideoData });
            setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });

            playerStatusData.playerContext.setPlaybackVideoDataInPlayer();
        }
    };

    /**
     * @name handleLoadedDataEvent
     * @type function
     * @description This function will handle the LoadedData event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleLoadedDataEvent = async (event: any) => {
        console.info('> handleLoadedDataEvent > ', event);
        const playerInstance = getPlayerInstance();
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };
        //exit if the player was loading while loading
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.playerWaitingForExit) {
            const { exitPlayer, unloadPlayerVideo } = new PlayerServices();
            playerStatusData.playerMode === PlayerMode.MINIPLAYER ? await unloadPlayerVideo() : await exitPlayer();
            return;
        }

        /**
         * get the time and duration from the player.
         */
        //calculate the player current time offset
        playerStatusData.playerCurrentTimeOffset = getCurrentTimeOffset(playerInstance, playbackVideoData.contentType);

        // if (playerInstance?.play) {
        //     playerInstance?.play();
        //     playerStatusData.retryStreamingCount = 2;
        // }

        const context = playerStatusData?.playerContext;
        if (playerStatusData.playerMode === PlayerMode.MINIPLAYER && context) {
            !context._isPreviewVideoPlaying && context.stopThumbnailPlayback();
        }

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (getDeviceType() === DeviceType.WebOS && playerStatusData.playerMode === PlayerMode.MINIPLAYER) window.trailerTimeTracker = Date.now();

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (playerStatusData.playerMode === PlayerMode.FULLSCREEN) {
            // playerInstance.setSubtitle(subtitleFromPlayer?.[0]);
            toggleThumbnailAndTitle(false);
        }

        /**
         * concurrency lock
         */
        updateConcurrencyLock(playbackVideoData?.smilData?.initialConcurrencyDataFromSMIL);
        if (getDisableCardPress()) toggleDisableCardPress(false);
        playerStatusData.playerState = PlayerState.LOADED;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        // @ts-ignore
        window.isNavigatingToPlayer = false;
    };

    /**
     * ===================================================>
     * ===================================================>
     * Other Events
     * ===================================================>
     * ===================================================>
     */
    /**
     * @name handlePlayingEvent
     * @type function
     * @description This function will handle the playing event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handlePlayingEvent = async (event: any) => {
        console.info('> handlePlayingEvent > ', event);
        // toggleVideoEndScreen(true);
        const playerStatusData = { ...getPlayerStatusData() };
        const { playerContext, playerMode, initialPlayback } = playerStatusData;

        //exit if the player was loading while loading
        const { exitPlayer, unloadPlayerVideo } = new PlayerServices();
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.playerWaitingForExit) {
            playerStatusData.playerMode === PlayerMode.MINIPLAYER ? await unloadPlayerVideo() : await exitPlayer();
            return;
        }

        if (playerMode === PlayerMode.MINIPLAYER && playerContext) {
            // prevent playback if there is no id
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            if (!window._trailerId) {
                const videoPlayerTag = getHTMLPlayerTag();
                videoPlayerTag?.pause();
                await unloadPlayerVideo();
                return;
            }

            setupCanvasAndPlayerStyle(PlayerMode.MINIPLAYER);
            playerContext.fireAncestors('$showHolePunch' as any, true);
            playerContext._isPreviewVideoPlaying = true;
            const player = getPlayerInstance();
            // check if trailer id has changed. If changed, not proceeding with trailer playback
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const shouldPauseVideoThumbnail = !window._trailerId || player.activePlayer.customData.trailerId !== window._trailerId;
            if (playerContext?._shouldPauseVideoThumbnail || shouldPauseVideoThumbnail) {
                const videoPlayerTag = getHTMLPlayerTag();
                videoPlayerTag?.pause();
            } else {
                playerContext.ThumbnailImage.setSmooth('alpha', 0);
            }
        } else {
            // update the retries if player retried and successfull
            if (playerContext._isPlayerRetrying) {
                playerContext._isPlayerRetrying = false;
                playerContext._playerRetries = 1;
            }

            setupCanvasAndPlayerStyle(PlayerMode.FULLSCREEN);
            if (!getIsUserPreferredQualitySet()) {
                setUserPreferredQuality();
                setIsUserPreferredQualitySet(true);
            }
            if (!initialPlayback && playerContext) {
                playerContext._isPaused = false;
            }
            initialPlayback && showClassificationSlate();
        }

        if (initialPlayback) {
            const { updateMuxDataOnPlayback } = new MuxServices();
            const playerInstance = getPlayerInstance();
            updateMuxDataOnPlayback(playerInstance);
        }

        playerStatusData.playerState = PlayerState.PLAYING;
        playerStatusData.initialPlayback = false;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        sendPlayerPlayingEvent();
    };

    /**
     * @name handleResumeEvent
     * @type function
     * @description This function will handle the resume event
     *
     * @author tonyaugustine
     */
    handleResumeEvent() {
        // Send resume event
        sendResumeEvent();
    }

    /**
     * @name handlePauseEvent
     * @type function
     * @description This function will handle the playing event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handlePauseEvent(event: any) {
        console.info('> handlePauseEvent > ', event);
        const playerStatusData = { ...getPlayerStatusData() };
        playerStatusData.playerState = PlayerState.PAUSED;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        // Send pause event
        sendPausedEvent();
    }

    /**
     * @name handleWaitingEvent
     * @type function
     * @description This function will handle the Waiting event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleWaitingEvent(event: any) {
        console.info('> handleWaitingEvent > ', event);
        const playerStatusData = { ...getPlayerStatusData() };
        playerStatusData.playerState = PlayerState.WAITING;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
    }

    /**
     * @name handleReadyEvent
     * @type function
     * @description This function will handle the playing event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleReadyEvent(event: any) {
        console.info('> handleReadyEvent > ', event);
        const playerStatusData = { ...getPlayerStatusData() };
        playerStatusData.playerState = PlayerState.READY;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
    }

    /**
     * @name handleCanPlayEvent
     * @type function
     * @description This function will handle the CanPlay event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleCanPlayEvent(event: any) {
        console.info('> handleCanPlayEvent > ', event);
        const playerStatusData = { ...getPlayerStatusData() };
        playerStatusData.playerState = PlayerState.READY;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
    }

    /**
     * @name handlePlayingEndedEvent
     * @type function
     * @description This function will handle the playing end event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handlePlayingEndedEvent(event: any) {
        console.info('> handlePlayingEndedEvent > ', event);

        const playerStatusData = { ...getPlayerStatusData() };
        const { exitPlayer, unloadPlayerVideo } = new PlayerServices();
        //set player state and playing status
        playerStatusData.playerState = PlayerState.ENDED;
        playerStatusData.playerContext._isPaused = false;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        //analytics
        sendPlayingEndEvent();
        // if next episode data is not available and rail type is catchup or live navigate user to previous page
        //reset the ui when playback is completed.
        if (playerStatusData.playerMode === PlayerMode.MINIPLAYER) {
            playerStatusData.playerContext?.ThumbnailImage?.setSmooth('alpha', 1);
            (async () => await unloadPlayerVideo())();
            return;
        }
        //set the progress on end
        updateContinueWatching();

        const { nextEpisodeData } = getPlaybackVideoData();
        const shouldShowBingeWatching = getState(StorageKeys.AUTO_PLAY_VIDEO) ?? true;
        if (isValidValue(nextEpisodeData) && shouldShowBingeWatching) {
            toggleLoadingSpinner(true);
            toggleControlsUI(false);
            handleNextPreviousEpisode(EpisodeActions.NEXT);
        } else if (!playerStatusData.playerContext._showBingeWatching && (!shouldShowBingeWatching || !isValidValue(nextEpisodeData))) {
            setPlayerStatusData({ ...playerStatusData, exitTriggered: true });
            exitPlayer();
        }
    }

    /**
     * @name handleManifestParsedEvent
     * @type function
     * @description This function will handle the manifest parsed event from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleManifestParsedEvent = (event: any) => {
        console.info('> handleManifestParsedEvent > ', event);

        const player = getPlayerInstance();
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };
        const progress = playbackVideoData.contentData.continueWatchingData.progress;
        const activePlayer = player?.activePlayer;
        let playbackStartTime = undefined;
        if (playerStatusData.allowContinueWatching && progress) playbackStartTime = progress / 1000;

        // starting 10 seconds behind the live play head. This seems to improve player startup speed
        if (playbackVideoData.contentType === PlaybackType.LIVE) {
            playbackStartTime = activePlayer?.seekRange?.()?.end - 10;
        } else if (playbackStartTime) {
            playbackStartTime && activePlayer?.updateStartTime?.(playbackStartTime);
        }
    };

    /**
     * @name handleRateChangeEvent
     * @type function
     * @description This function will handle the buffer events from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleRateChangeEvent = (event: any) => {
        console.info('> handleRateChangeEvent > ', event);
    };

    /**
     * @name handleBufferingEvent
     * @type function
     * @description This function will handle the buffer events from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleBufferingEvent = (event: any) => {
        console.info('> handleBufferingEvent > ', event);

        const playerStatusData = { ...getPlayerStatusData() };
        if (playerStatusData.isBuffering !== event.buffering) {
            playerStatusData.isBuffering = event.buffering;
            if (playerStatusData.playerMode === PlayerMode.FULLSCREEN && event.buffering) {
                playerStatusData.playerState = PlayerState.BUFFERING;
                toggleLoadingSpinner(true);
                if (!playerStatusData.initialPlayback) {
                    sendThrottledbufferEvent();
                }
            }
            setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        }
    };

    /**
     * @name handleSeekingEvent
     * @type function
     * @description This function will handle the buffer events from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleSeekingEvent = (event: any) => {
        console.info('> handleSeekingEvent > ', event);

        const playerStatusData = { ...getPlayerStatusData() };
        playerStatusData.playerState = PlayerState.SEEKING;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
    };

    /**
     * @name handleSeekedEvent
     * @type function
     * @description This function will handle the buffer events from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleSeekedEvent = (event: any) => {
        console.info('> handleSeekedEvent > ', event);

        const playerStatusData = { ...getPlayerStatusData() };
        const player = getPlayerInstance();

        //resume playback when seeked, if the playback is paused by the seek logic
        if (playerStatusData.shouldPlayOnSeek) {
            player?.play?.();
            playerStatusData.shouldPlayOnSeek = false;
        }

        /**
         * this gets updated if the player is playing as the play event is triggered
         * after the seeked event. But pause event won't be triggered again even if
         * the player is paused before the seeking.
         */
        playerStatusData.playerState = PlayerState.PAUSED;

        updateContinueWatching();
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
    };

    /**
     * @name handleTimeUpdateEvent
     * @type function
     * @description This function will handle the buffer events from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    handleTimeUpdateEvent = (event: any) => {
        console.info('> handleTimeUpdateEvent > ', event);
        const playerStatusData = { ...getPlayerStatusData() };
        const playbackVideoData = { ...getPlaybackVideoData() };
        const player = getPlayerInstance();
        let duration = playbackVideoData.durationInSec;

        const currentTime = IS_ANDROID
            ? event.currentTime
            : getCurrentTimeFromPlayer(player, playerStatusData.playerCurrentTimeOffset, playbackVideoData.contentType);

        if (getDeviceType() === DeviceType.WebOS && playerStatusData.playerMode === PlayerMode.MINIPLAYER) {
            /**
             * Special handling for stopping trailer playback after 100 seconds of user inactivity, in order to prevent mini player from
             * overlapping with screen saver
             */
            // @ts-ignore
            if (window.trailerTimeTracker && Date.now() - window.trailerTimeTracker >= 100000) {
                // @ts-ignore
                window.trailerTimeTracker = null;
                playerStatusData?.playerContext?.pauseThumbnailPlayback?.();
            }
        }

        //clear the timeout.
        //@ts-ignore
        if (window.timeUpdateTimer) {
            //@ts-ignore
            clearAnimationFrameTimeout(window.timeUpdateTimer);
            //@ts-ignore
            window.timeUpdateTimer = null;
        }
        if (playerStatusData.playerState === PlayerState.PLAYING) {
            toggleLoadingSpinner(false);
        }

        if (playerStatusData.playerMode === PlayerMode.FULLSCREEN) {
            const bufferedTime = IS_ANDROID ? event.bufferTime : getBufferedContentLength(player);

            //show end screen with related Item or binge watching
            playerStatusData.currentTime = currentTime;
            playerStatusData.playerContext._currentTime = currentTime;
            playerStatusData.bufferedTime = currentTime + bufferedTime;
            playerStatusData.playerContext._bufferedTime = currentTime + bufferedTime;
            playerStatusData.playerState = PlayerState.PLAYING;

            // Update the player stat values
            if (playerStatusData.isPlayerStatsVisible && player.player) {
                playerStatusData.playerStatsData = player.activePlayer.getStats();
            }

            setProgress(currentTime);
            setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
            //show end screen with related Item or binge watching
            if (currentTime === playerStatusData.endScreenDisplayTime) {
                toggleVideoEndScreen(true);
            }
            //set continue watching progress
            if (playerStatusData.allowContinueWatching) {
                setContinueWatchingProgress();
            }

            //start a timeout to check for the playback pause or event of buffer.
            //@ts-ignore
            window.timeUpdateTimer = setAnimationFrameTimeout(() => {
                const playerStatusData = { ...getPlayerStatusData() };
                let updatedPlayerState = null;
                //turn off the loader on playback
                if (playerStatusData.isBuffering || playerStatusData.playerState === PlayerState.BUFFERING) {
                    updatedPlayerState = PlayerState.BUFFERING;
                    toggleLoadingSpinner(true);
                } else if (playerStatusData.playerState === PlayerState.WAITING) {
                    toggleLoadingSpinner(true);
                } else {
                    updatedPlayerState = PlayerState.PAUSED;
                    if (playerStatusData?.playerContext) {
                        playerStatusData.playerContext.isPaused = true;
                    }
                }

                if (isValidValue(getPlayerStatusData()))
                    if (updatedPlayerState) {
                        setPlayerStatusData({ ...getPlayerStatusData(), playerState: updatedPlayerState });
                    }
                //@ts-ignore
                window.timeUpdateTimer = null;
            }, 1000);
        }

        if (playerStatusData.playerMode === PlayerMode.MINIPLAYER) duration = getDurationFromPlayer(player);
        if (currentTime >= Math.floor(duration) - 0.75) {
            if (playerStatusData.exitTriggered) return;
            playerPause();
            this.handlePlayingEndedEvent({ customExit: true });
        }
        // send POS events
        sendTimeUpdateEvent();
    };

    /**
     * ===================================================>
     * ===================================================>
     * Error events
     * ===================================================>
     * ===================================================>
     */
    /**
     * @name handleErrorEvent
     * @type function
     * @description This function will handle the errors from the player
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    async handleErrorEvent(event: any) {
        console.info('> handleErrorEvent > ', event);

        // check if it is No Network error
        const isOnline = await checkInternetConnection();
        if (isOnline) {
            const player = getPlayerInstance();
            const playbackVideoData = { ...getPlaybackVideoData() };
            const playerStatusData = { ...getPlayerStatusData() };
            if (event.code !== ShakaError.LOAD_INTERRUPTED) {
                //concurrency unlock
                playbackVideoData?.smilData && unlockConcurrencyLock(playbackVideoData.smilData.initialConcurrencyDataFromSMIL);
                player?.pause?.();
                toggleThumbnailAndTitle(false);
                playerStatusData.playerState = PlayerState.ERROR;
                setPlaybackVideoData({ ...getPlaybackVideoData(), ...playbackVideoData });
                // @ts-ignore
                window.isNavigatingToPlayer = false;
            }

            // return if the interrupt load error is coming
            if (event.code === ShakaError.LOAD_INTERRUPTED) return;

            const errorInfo = {
                request_url: playbackVideoData.smilURL,
                response_code: playbackVideoData?.smilData?.responseCode,
                response_message: playbackVideoData?.smilData?.exception ?? null,
                error_location: window?.location?.href,
                smilData: JSON.stringify(playbackVideoData?.smilData ?? {}),
                playerErrorData: { ...event.detail, code: event?.code },
            };
            const key: ErrorConfigurationType = getPlayerErrorType(event);
            firePlayerException(key, LogLevel.ERROR, errorInfo);
        }
    }

    /**
     * @name handleMediaFailedEvent
     * @type function
     * @description This function will handle the media failed event
     * @param { any } event - event from the player.
     *
     * @author amalmohann
     */
    async handleMediaFailedEvent(event: any) {
        console.info('> handleMediaFailedEvent > ', event);
        const { handleErrorEvent } = new PlayerEventsServices();
        handleErrorEvent(event);
    }
}

export default PlayerEventsServices;
