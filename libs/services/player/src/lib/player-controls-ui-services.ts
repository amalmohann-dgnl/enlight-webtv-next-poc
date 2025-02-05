import { ComponentStyleType, ContentType, PlaybackType, PlayerControlConfiguration, PlayerMode, StorageKeys } from '@enlight-webtv/models';
import { PlaybackDataServices } from '.';
import { commonUtilities, configurationUtilities, storageUtilities } from '@enlight-webtv/utilities';

//service
const { getPlayerStatusData, setPlayerStatusData, getPlaybackVideoData } = new PlaybackDataServices();
//utils
const { getState } = storageUtilities;
const { isValidValue } = commonUtilities;
const { getPlayerConfig } = configurationUtilities;

class PlayerControlsUIServices {
    disableCardPress = false;
    static instance: PlayerControlsUIServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerControlsUIServices.instance) {
            return PlayerControlsUIServices.instance;
        }
        PlayerControlsUIServices.instance = this;
    }

    destroy() {
        if (PlayerControlsUIServices.instance === this) {
            PlayerControlsUIServices.instance = null;
        }
    }

    /**
     * @name toggleLoadingSpinner
     * @type function
     * @description This function will loading spinner. This function show
     * and hide the loading spinner.
     * @param { boolean } toggleValue - turn off or on.
     *
     * @author amalmohann
     */
    toggleLoadingSpinner = (toggleValue: boolean) => {
        const { playerContext } = { ...getPlayerStatusData() };
        if (playerContext && playerContext._showSpinner !== toggleValue) {
            playerContext._showSpinner = toggleValue;
        }
    };

    /**
     * @name toggleThumbnailAndTitle
     * @type function
     * @description This function will handle the thumbnail and title. This
     * function show and hide the thumbnail and title.
     * @param { boolean } toggleValue - turn off or on.
     *
     * @author amalmohann
     */
    toggleThumbnailAndTitle = (toggleValue: boolean) => {
        const { playerContext, playerMode } = { ...getPlayerStatusData() };
        if (playerContext) {
            if (playerMode !== PlayerMode.MINIPLAYER && playerContext.tag('Thumbnail')) {
                playerContext.tag('Thumbnail').visible = toggleValue;
            }
            // playerContext.tag('ThumbnailOverlay').visible = toggleValue;
            playerContext.tag('ThumbnailBackdropShader') && (playerContext.tag('ThumbnailBackdropShader').visible = toggleValue);
            playerContext._hideThumbnail = !toggleValue;
            this.toggleLoadingSpinner(toggleValue);
        }
    };

    /**
     * @name toggleControlsUI
     * @type function
     * @description This function will handle the player UI. This
     * function show and hide the player control UI.
     * @param { boolean } toggleValue - turn off or on.
     *
     * @author amalmohann
     */
    toggleControlsUI = (toggleValue: boolean) => {
        const { playerContext } = { ...getPlayerStatusData() };
        if (playerContext) {
            playerContext._showControls = toggleValue;
        }
    };

    /**
     * @name togglePlayerStats
     * @type function
     * @description This function will handle the player stats. This
     * function will toggle player stats.
     * @param { boolean } toggleValue - turn off or on.
     *
     * @author amalmohann
     */
    togglePlayerStats = (toggleValue: boolean) => {
        const playerStatusData = { ...getPlayerStatusData() };
        playerStatusData.isPlayerStatsVisible = toggleValue;
        setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        const { playerContext } = { ...getPlayerStatusData() };
        if (playerContext) {
            playerContext.tag('PlayerStats').visible = toggleValue;
        }
    };

    /**
     * @name toggleDisableCardPress
     * @type function
     * @description This function will handle the card press disabling or
     * enabling function.
     * @param { boolean } toggleValue - turn off or on.
     *
     * @author amalmohann
     */
    toggleDisableCardPress = (toggleValue: boolean) => {
        this.disableCardPress = toggleValue;
    };

    /**
     * @name getDisableCardPress
     * @type function
     * @description This function will return the disabled card press status.
     *
     * @author amalmohann
     */
    getDisableCardPress = () => {
        return this.disableCardPress;
    };

    /**
     * @name showClassificationSlate
     * @type function
     * @description This function will show the classification slate.
     * @author amalmohann
     */
    showClassificationSlate = () => {
        const { playerContext } = { ...getPlayerStatusData() };
        const { contentData } = { ...getPlaybackVideoData() };
        playerContext._classificationSlateData = contentData?.classificationSlateData;
        playerContext._showClassificationSlate = true;
        const classificationSlateResetTimer = setTimeout(() => {
            playerContext._showClassificationSlate = false;
            clearTimeout(classificationSlateResetTimer);
        }, 10000);
    };

    /**
     * @name getSubtitleVerticalPosition
     * @type function
     * @description This function will get the vertical positioning of the subtitle
     * @param {boolean} controlsVisible - is the player controls visible
     * @returns {number} vertical position
     *
     * @author amalmohann
     */
    getSubtitleVerticalPosition = (controlsVisible = false) => {
        const { playerUIMode } = getPlayerStatusData();
        let y = 950;
        if (controlsVisible) {
            y = playerUIMode === PlaybackType.LIVE ? 550 : 650;
        }
        return y;
    };
    /**
     * @name toggleVideoEndScreen
     * @type function
     * @description This function will show or hide the binge watching / related screen.
     * @param {boolean} value - show or hide value.
     *
     * @author amalmohann
     */
    toggleVideoEndScreen = (value: boolean) => {
        const { playerContext, playerUIMode } = getPlayerStatusData();
        if (!playerContext) return;
        if (!value) {
            playerContext._showBingeWatching = false;
            return;
        }

        const { contentType, specialHandlingType, nextEpisodeData, relatedRailData, contentData } = getPlaybackVideoData();
        const isLiveOrCatchupItem: boolean = contentType === PlaybackType.LIVE || specialHandlingType === ComponentStyleType.CATCH_UP;
        const isNoData: boolean = !isValidValue(nextEpisodeData) && !isValidValue(relatedRailData);
        const isTrailer = contentData?.type === ContentType.TRAILER;

        //skip if same value is being set or playback is live or catch up items
        if (playerContext._showBingeWatching !== value && !isLiveOrCatchupItem && !isNoData && !isTrailer) {
            const shouldShowBingeWatching = getState(StorageKeys.AUTO_PLAY_VIDEO) ?? true;
            const isSeries = [PlaybackType.VOD_SERIES, PlaybackType.SERIES].includes(playerUIMode);
            playerContext._showBingeWatching = isSeries ? shouldShowBingeWatching && value : value;
        }
    };

    /**
     * @name getSeekPreviewByTime
     * @type function
     * @description This function will get the thumbnail corresponding to the time provided. The mapSeekPreviewThumbnails()
     * need to be used before calling this function to create the thumbnail map.
     * @param {string[]} thumbnails - thumbnails for the seek preview.
     * @param {Record<string, number>} thumbnailMap - thumbnails for the seek preview mapped to the video times
     * @param {number} focusedTime - the time to which the corresponding thumbnail is needed
     *
     * @return {Record<never, number> | undefined} the processed thumbnail map
     *
     * @author amalmohann
     */
    getSeekPreviewByTime = (thumbnails: string[], thumbnailMap: Record<string, number>, focusedTime: number) => {
        // Find the closest time in the map to the focused time
        const closestTime = Object.keys(thumbnailMap)
            .map(key => Number(key))
            .reduce((prev, curr) => {
                return Math.abs(Number(curr) - focusedTime) < Math.abs(Number(prev) - focusedTime) ? curr : prev;
            });

        // Get the thumbnail index corresponding to the closest time
        const thumbnailIndex = thumbnailMap[closestTime];

        // Return the corresponding thumbnail if index is there
        return thumbnailIndex ? thumbnails[thumbnailIndex] : '';
    };

    /**
     * @name getSeekPreviewFilmStripByTime
     * @type function
     * @description This function will get the thumbnail film strip corresponding to the time provided. The mapSeekPreviewThumbnails()
     * need to be used before calling this function to create the thumbnail map.
     * @param {string[]} thumbnails - thumbnails for the seek preview.
     * @param {Record<string, number>} thumbnailMap - thumbnails for the seek preview mapped to the video times
     * @param {number} focusedTime - the time to which the corresponding thumbnail is needed
     * @return {Record<never, number> | undefined} the processed thumbnail map
     *
     * @author amalmohann
     */
    getSeekPreviewFilmStripByTime = (thumbnails: string[], thumbnailMap: Record<string, number>, focusedTime: number) => {
        // Find the closest time in the map to the focused time
        const closestTime = Object.keys(thumbnailMap)
            .map(key => Number(key))
            .reduce((prev, curr) => {
                return Math.abs(curr - focusedTime) < Math.abs(prev - focusedTime) ? curr : prev;
            });

        const closestTimeArray = Object.values(thumbnailMap)?.sort((a, b) => a - b);
        // Get the thumbnail index corresponding to the closest time
        const thumbnailIndex = closestTimeArray.indexOf(thumbnailMap[closestTime] ?? -1);
        const thumbnailFilmStrip: string[] = [];

        if (thumbnailIndex !== -1) {
            // Add thumbnails before the closest one
            for (let i = 3; i > 0; i--) {
                const index = thumbnailIndex - i;
                if (index >= 0) {
                    thumbnailFilmStrip.push(thumbnails[index] ?? '');
                } else {
                    thumbnailFilmStrip.push(''); // Add empty string if there's no previous thumbnail
                }
            }

            // Add the closest thumbnail
            thumbnailFilmStrip.push(thumbnails[thumbnailIndex] ?? '');

            // Add thumbnails after the closest one
            for (let i = 1; i <= 3; i++) {
                const index = thumbnailIndex + i;
                if (index < thumbnails.length) {
                    thumbnailFilmStrip.push(thumbnails[index] ?? '');
                } else {
                    thumbnailFilmStrip.push(''); // Add empty string if there's no next thumbnail
                }
            }
        }

        // Return the corresponding thumbnail if index is there
        return thumbnailFilmStrip;
    };

    /**
     * @name getPlayerUIConfig
     * @type function
     * @description This function will get the ui configuration based on the playback Type.
     * @param { PlaybackType } - playback type
     * @return {PlayerControlConfiguration} the processed thumbnail map
     *
     * @author amalmohann
     */
    getPlayerUIConfig = (type: PlaybackType): PlayerControlConfiguration => {
        const playerConfig = getPlayerConfig();
        let playerUIConfig;
        switch (type) {
            case PlaybackType.LIVE:
                playerUIConfig = { ...playerConfig?.fullScreenConfig?.[0], ...playerConfig?.linearPlayerConfig?.[0] } as PlayerControlConfiguration;
                return playerUIConfig;
            case PlaybackType.VOD:
            case PlaybackType.VOD_SERIES:
            case PlaybackType.EPISODE:
            case PlaybackType.MOVIE:
            case PlaybackType.PREVIEW:
            case PlaybackType.SERIES:
            case PlaybackType.TRAILER:
                playerUIConfig = { ...playerConfig?.fullScreenConfig?.[0] } as PlayerControlConfiguration;
                return playerUIConfig;
        }
    };
}

export default PlayerControlsUIServices;
