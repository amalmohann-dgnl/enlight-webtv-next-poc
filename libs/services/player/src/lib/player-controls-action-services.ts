import {
    PlayerRightSideMenuOptions,
    AudioData,
    QualityData,
    RightSideMenuItem,
    StorageKeys,
    EpisodeActions,
    Content,
    PlaybackType,
    AssetTypeIcon,
    Image,
    TextStreamData,
    PlayerMode,
    PlaybackInitiatedSourceType,
    PlayerCustomOptions,
    Project,
} from '@enlight-webtv/models';
import { commonUtilities, deviceUtilities, playerUtilities, projectUtilities, storageUtilities, timeUtilities } from '@enlight-webtv/utilities';
import {
    PlaybackDataServices,
    PlayerAnalyticsService,
    PlayerControlsUIServices,
    PlayerServices,
    PlayerEventsServices,
} from '.';

//service
const { getPlaybackVideoData, getPlayerStatusData } = new PlaybackDataServices();
const { toggleLoadingSpinner, toggleThumbnailAndTitle, toggleVideoEndScreen } = new PlayerControlsUIServices();

//utils
const { getPlayerInstance } = playerUtilities;
const { setState, getState } = storageUtilities;
const { getCurrentEpochTimeInSeconds } = timeUtilities;
const { isAndroid, getAndroidObject } = deviceUtilities;
const { isValidValue, getOptimizedImage, cloneObject } = commonUtilities;

//const
const IS_ANDROID = false;
const ANDROID = {}

class PlayerControlsActionServices {
    static instance: PlayerControlsActionServices | null;
    selectedTrack: any;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerControlsActionServices.instance) {
            return PlayerControlsActionServices.instance;
        }
        PlayerControlsActionServices.instance = this;
    }

    destroy() {
        if (PlayerControlsActionServices.instance === this) {
            PlayerControlsActionServices.instance = null;
        }
    }

    /**
     * @name goBackToLive
     * @type function
     * @description This function will handle the video seeking to the current live time
     * @author amalmohann
     */
    goBackToLive = () => {
        const currentTime = getCurrentEpochTimeInSeconds();
        this.seekPlayer(currentTime);
    };

    /**
     * @name playPlayer
     * @type function
     * @param retry retry the playback
     * @description This function will play the player
     *
     * @author amalmohann
     */
    playerPlay = (retry = false) => {
        console.info('> playerPlay >');
        const playerStatusData = getPlayerStatusData();
        const { playerContext } = playerStatusData;
        const { getProjectName } = projectUtilities;

        const player = getPlayerInstance();
        if (getProjectName() === Project.VIDEOTRON && playerContext._playbackType === PlaybackType.LIVE) {
            this.goBackToLive();
        }
        player?.play?.();

        // Handle player resume event
        if (!playerStatusData?.initialPlayback) {
            const { handleResumeEvent } = new PlayerEventsServices();
            handleResumeEvent();
        }

        // storing the selected video quality track
        const selectedTrack = player?.activePlayer?.getVariantTracks().find((track: { active: boolean }) => track.active);
        selectedTrack && (this.selectedTrack = selectedTrack);
        if (retry) {
            // update the selected video quality track to clear the buffer so video and re buffer and continue the playback
            this.selectedTrack && player?.activePlayer?.selectVariantTrack(this.selectedTrack, true);
        }
        playerContext && (playerContext._isPaused = false);
    };

    /**
     * @name playerPause
     * @type function
     * @description This function will play or pause the player
     *
     * @author amalmohann
     */
    playerPause = () => {
        console.info('> playerPause >');
        const { contentType } = getPlaybackVideoData();
        const { playerContext } = getPlayerStatusData();
        const player = getPlayerInstance();

        // storing the selected video quality track
        const selectedTrack = player?.activePlayer?.getVariantTracks().find((track: { active: boolean }) => track.active);
        selectedTrack && (this.selectedTrack = selectedTrack);

        playerContext?._updateSeekBarTimer && clearInterval(playerContext._updateSeekBarTimer);
        player?.pause?.();
        playerContext && (playerContext._isPaused = true);
        //update the seekbar when paused for live items
        if (playerContext && playerContext._isPaused && contentType === PlaybackType.LIVE) {
            playerContext._updateSeekBarTimer = setInterval(() => {
                playerContext._updateSeekBarStamp = Date.now();
            }, 10000);
        }
    };

    /**
     * @name playPausePlayer
     * @type function
     * @description This function will play or pause the player
     *
     * @author amalmohann
     */
    playPausePlayer = () => {
        console.info('> playPausePlayer >');
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.isNavigatingToPlayer) return;

        const player = getPlayerInstance();
        //play or pause according to the player state
        if (IS_ANDROID) {
            ANDROID.handlePlayPause();
        } else {
            player?.isPlaying?.() ? this.playerPause() : this.playerPlay();
        }
    };

    /**
     * @name seekPlayer
     * @type function
     * @description This function will seek the player
     * @param {number} position - position to seek
     *
     * @author amalmohann
     */
    seekPlayer = (position: number) => {
        const { sendSeekEvent } = new PlayerAnalyticsService();
        const { contentType } = { ...getPlaybackVideoData() };
        const { playerCurrentTimeOffset } = { ...getPlayerStatusData() };
        const player = getPlayerInstance();
        // seek the player
        const seekPosition = contentType === PlaybackType.LIVE ? position + playerCurrentTimeOffset : position;
        IS_ANDROID ? ANDROID.seekTo(seekPosition) : player?.seek(seekPosition);
        //send Analytics event
        sendSeekEvent();
    };

    /**
     * @name handleNextPreviousEpisode
     * @type function
     * @description This function will set the player state
     * @param { PlaybackData } playbackData - play back data
     * @param { EpisodeActions } action - episode action, next or prev
     *
     * @author amalmohann
     */
    handleNextPreviousEpisode = async (action: EpisodeActions) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (window.isNavigatingToPlayer) return;
        const { unloadPlayerVideo, setPlayerAndPlaybackData } = new PlayerServices();
        toggleVideoEndScreen(false);
        toggleLoadingSpinner(true);
        const { nextEpisodeData, contentType, contentData } = cloneObject(getPlaybackVideoData());
        // update the continue watching data for next episode
        contentData.continueWatchingData = {
            allowContinueWatching: true,
            progress: nextEpisodeData?.progress && nextEpisodeData.progress,
            contentType: nextEpisodeData?.type,
            episodeId: nextEpisodeData?.uid,
            seriesId: contentData?.continueWatchingData?.seriesId,
        };
        const { playerContext } = { ...getPlayerStatusData() };
        const nextEpisodePlaybackData = { ...getPlaybackVideoData() };
        playerContext?.PlayerControls?.resetPlayerControls?.();

        IS_ANDROID ? await ANDROID.releaseExoPlayer() : await unloadPlayerVideo();
        //check if next or previous episode
        const newEpisode = action === EpisodeActions.NEXT ? nextEpisodeData : ({} as Content);

        //ensure the VOD playback
        if ((contentType === PlaybackType.VOD_SERIES || contentType === PlaybackType.SERIES) && newEpisode) {
            const thumbnail = getOptimizedImage(newEpisode.images, { height: 720, width: 1280, borderRadius: 0 });
            const thumbnailUrl = (thumbnail as AssetTypeIcon).url ?? (thumbnail as Image).imageUrl;
            playerContext._thumbnailUrl = thumbnailUrl;
            toggleThumbnailAndTitle(true);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            window.isNavigatingToPlayer = true;
            setPlayerAndPlaybackData(
                { ...contentData, ...newEpisode, ...(thumbnailUrl && { thumbnailUrl: thumbnailUrl }) },
                PlayerMode.FULLSCREEN,
                nextEpisodePlaybackData.contentType,
                PlaybackInitiatedSourceType.PLAYER,
                playerContext,
            );
        }
    };

    /**
     * @name handlePlayerAudioSubtitleQuality
     * @type function
     * @description This function will set the player quality subtitle and audio
     * @param { PlayerRightSideMenuOptions } mode - player
     * @param { RightSideMenuItem } menuItem - selected item.
     *
     * @author amalmohann
     */
    handlePlayerAudioSubtitleQuality = (menuItem: RightSideMenuItem, mode: PlayerRightSideMenuOptions) => {
        const player = getPlayerInstance();
        const { sendSubtitleChangeEvent } = new PlayerAnalyticsService();
        const { audioData, qualityData, textStreamData } = { ...getPlaybackVideoData() };
        let availableData = null;

        switch (mode) {
            case PlayerRightSideMenuOptions.AUDIO:
                availableData = audioData;
                break;
            case PlayerRightSideMenuOptions.QUALITY:
                availableData = qualityData;
                break;
            case PlayerRightSideMenuOptions.SUBTITLE: {
                availableData = textStreamData;
                // Send subtile change event if valid data
                if (isValidValue(textStreamData)) {
                    sendSubtitleChangeEvent(menuItem);
                }

                break;
            }

            default:
                break;
        }
        //set if available data is not null or undefined
        availableData && this.setPlaybackAudioPlaybackQuality(player, mode, availableData, menuItem);
    };

    /**
     * @name setPlaybackAudioPlaybackQuality
     * @type function
     * @description This function will set the player audio or
     * @param { any } player - player
     * @param { PlayerRightSideMenuOptions } mode - setting mode
     * @param { RightSideMenuItem } menuItem - menu Item to set.
     * @return { string | null } selected id / null
     *
     * @author amalmohann
     */
    setPlaybackAudioPlaybackQuality = (
        player: any,
        mode: PlayerRightSideMenuOptions,
        availableData: AudioData[] | QualityData[] | TextStreamData[],
        menuItem: RightSideMenuItem,
    ) => {
        let selectedAudio;
        let selectedQuality;
        let selectedTextStream;
        const { playerContext } = getPlayerStatusData();

        //check for preferred / selected quality/audio
        if (menuItem && isValidValue(menuItem)) {
            //get data from the menu items;
            const { data } = menuItem;
            let id = '';
            let key = '';
            let isAvailable = false;

            switch (mode) {
                case PlayerRightSideMenuOptions.AUDIO:
                    id = (data as AudioData).audio.id;
                    isAvailable = (availableData as AudioData[]).findIndex(audio => audio.audio.id === id) !== -1;
                    selectedAudio = this.setPlaybackAudio(player, isAvailable ? id : undefined);
                    setState(StorageKeys.SELECTED_AUDIO_MENU, menuItem);
                    playerContext && playerContext._selectedAudio && (playerContext._selectedAudio = selectedAudio);
                    return selectedAudio;
                case PlayerRightSideMenuOptions.QUALITY:
                    key = (data as QualityData).key;
                    id = (data as QualityData).quality.id;
                    isAvailable = (availableData as QualityData[]).findIndex(qual => qual.key === key) !== -1;
                    selectedQuality = this.setPlaybackQuality(player, isAvailable ? id : undefined, isAvailable ? key : undefined);
                    setState(StorageKeys.SELECTED_QUALITY_MENU, menuItem);
                    playerContext && playerContext._selectedQuality && (playerContext._selectedQuality = selectedQuality);
                    return selectedQuality;
                case PlayerRightSideMenuOptions.SUBTITLE:
                    key = (data as TextStreamData).textStream.lang;
                    id = (data as TextStreamData).textStream.id;
                    isAvailable = (availableData as TextStreamData[]).findIndex(stream => stream.key === key) !== -1;
                    selectedTextStream = this.setPlaybackTextStream(player, isAvailable ? key : PlayerCustomOptions.SUBTITLE_DISABLE);
                    setState(StorageKeys.SELECTED_SUBTITLE_MENU, menuItem);
                    playerContext && playerContext._selectedTextStream && (playerContext._selectedTextStream = selectedTextStream);
                    return selectedTextStream;
                default:
                    console.warn('setPlaybackAudioPlaybackQuality: Unknown Mode for player audio video set function');
            }
        } else {
            switch (mode) {
                case PlayerRightSideMenuOptions.AUDIO:
                    return this.setPlaybackAudio(player);
                case PlayerRightSideMenuOptions.QUALITY:
                    return this.setPlaybackQuality(player);
                case PlayerRightSideMenuOptions.SUBTITLE:
                    return this.setPlaybackTextStream(player);
                default:
                    console.warn('setPlaybackAudioPlaybackQuality: Unknown Mode for player audio video set function');
            }
        }
    };

    /**
     * @name setPlaybackQuality
     * @type function
     * @description This function will set the player quality
     * @param { any } player - player
     * @param { string } id - [optional] - quality id
     * @param { string } key - [optional] - quality key
     * @return { string | null } - selected quality key
     *
     * @author amalmohann
     */
    setPlaybackQuality = (player: any, id?: string, key?: string) => {
        //return if no player is initialized
        if (!player && !IS_ANDROID) return null;

        //check for valid id or set default
        const validID = !!(id && id !== 'auto' && key);
        const selectedQualityValue = validID ? id : 'auto';
        const selectedQualityKey = validID ? key : 'auto';

        //check if android or web player
        if (IS_ANDROID) {
            ANDROID.setVideoQuality(selectedQualityValue);
        } else {
            validID ? player.setVideoQuality(selectedQualityValue, false) : player.setVideoQualityAuto();
        }
        //return the selected audio
        return selectedQualityKey;
    };

    /**
     * @name setPlaybackQuality
     * @type function
     * @description This function will set the player quality
     * @param { any } player - player
     * @param { string } id - [optional] - quality id
     * @param { string } key - [optional] - quality key
     * @return { string | null } - selected quality key
     *
     * @author amalmohann
     */
    setPlaybackTextStream = (player: any, key?: string) => {
        //return if no player is initialized
        if (!player && !IS_ANDROID) return null;

        //check for valid id or set default
        const setSelectedTextStream = !!key && key !== PlayerCustomOptions.SUBTITLE_DISABLE;
        //check if android or web player
        if (IS_ANDROID) {
            // ANDROID.setVideoQuality(selectedQualityValue);
        } else if (setSelectedTextStream) {
            player.setSubtitle(key);
        } else {
            player.disableSubtitle();
            return PlayerCustomOptions.SUBTITLE_DISABLE;
        }
        //return the selected audio
        return key;
    };

    /**
     * @name setPlaybackAudio
     * @type function
     * @description This function will set the player Audio
     * @param { any } player - player
     * @param { string } id - [optional] - quality id
     * @return { string | null } id - quality id
     *
     * @author amalmohann
     */
    setPlaybackAudio = (player: any, id?: string) => {
        //return if no player is initialized
        if (!player && !IS_ANDROID) return null;

        //check for valid id or set default
        const validID = id!;
        const selectedAudio = (() => {
            if (validID) {
                return id;
            }
            return IS_ANDROID ? JSON.parse(ANDROID.getCurrentAudioTrack()).id : player.getAudio().id;
        })();

        //check if android or web player
        if (IS_ANDROID) {
            //set the player Audio with video Audio with id if passed for android
            validID ? ANDROID.setAudio(selectedAudio) : null;
        } else {
            //set the player Audio with video Audio with id if passed for web player
            validID ? player.setAudio(id) : null;
        }

        //return the selected audio
        return selectedAudio;
    };

    /**
     * @name setUserPreferredQuality
     * @type function
     * @description this function will set the preferred video quality
     *
     * @author alwin-baby
     */
    setUserPreferredQuality = () => {
        //set quality based on the preferred quality if available
        const preferredQuality = getState(StorageKeys.SELECTED_QUALITY_MENU);
        const player = getPlayerInstance();
        const playbackVideoData = { ...getPlaybackVideoData() };

        if (preferredQuality && isValidValue(preferredQuality)) {
            this.setPlaybackAudioPlaybackQuality(player, PlayerRightSideMenuOptions.QUALITY, playbackVideoData.qualityData, preferredQuality);
        }
    };
}

export default PlayerControlsActionServices;
