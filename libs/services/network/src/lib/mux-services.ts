/* eslint-disable @typescript-eslint/ban-ts-comment */
// Disable TypeScript checking for the following import
// @ts-ignore
import initShakaPlayerMux from '@mux/mux-data-shakaplayer';
import {
    ContentType,
    MUXEvents,
    MUXVideoMetaData,
    MuxData,
    Platform,
    PlaybackType,
    Project,
    StorageKeys,
    SubscriptionType,
} from '@enlight-webtv/models';
import { configurationUtilities, appUtilities, deviceUtilities, projectUtilities, authUtilities, storageUtilities } from '@enlight-webtv/utilities';

//utilities
const { getAppMetaData } = appUtilities;
const { getSubscriptionDetails } = authUtilities;
const { getProjectName } = projectUtilities;
const { getDeviceInfo, getPlatformAcronym } = deviceUtilities;
const { getMuxENVKey } = configurationUtilities;
const { getState } = storageUtilities;

let MUX_SERVICE_INSTANCE: any = null;

/**
 * @name MuxService
 * @type service class
 * @description This class will have all the services related to MUX (Initialization, Error handling).
 *
 * @author anandpatel
 */
class MuxService {
    // get the Mux environment key
    // @ts-ignore
    envMode = import.meta.env.MODE;
    muxData = {} as MuxData;

    // Check if the application is running on localhost
    isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '';

    /**
     * @name getMUXInstance
     * @type function
     * @description This function will return the player instance if it there in variable cache / window object
     *
     * @author amalmohann
     */
    getMUXInstance = () => {
        if (!MUX_SERVICE_INSTANCE) {
            //@ts-ignore
            MUX_SERVICE_INSTANCE = window.MUX_SERVICE_INSTANCE;
        }
        return MUX_SERVICE_INSTANCE;
    };

    /**
     * @name setMUXInstance
     * @type function
     * @description This function will set the player instance as null in variable cache / window object
     *
     * @author amalmohann
     */
    setMUXInstance = (instance = null) => {
        MUX_SERVICE_INSTANCE = instance;
        //@ts-ignore
        window.MUX_SERVICE_INSTANCE = instance;
    };

    /**
     * @name initializeMuxService
     * @type function
     * @description This function will initialize the player mux service and will return the object.
     * @param {any} player - contains the player instance
     *
     * @author amalmohann
     */
    initializeMuxService = async (player: any, videoMetaData: MUXVideoMetaData) => {
        // get user data and session ID from storage
        const userData = getState(StorageKeys.USER_DATA) || {};
        const sessionID = getState(StorageKeys.SESSIONID);
        const appMetaData = getAppMetaData();

        const envKey = getMuxENVKey() ?? '';

        //user subscription details
        const isSubscribed = getState(StorageKeys.IS_USER_SUBSCRIBED);

        // get device model
        const deviceInfo = getDeviceInfo();

        // Get the current timestamp
        const playerInitTime = initShakaPlayerMux.utils.now();

        const audio = getState(StorageKeys.SELECTED_AUDIO_MENU);
        const {
            title = '',
            seriesTitle = '',
            sourceUrl = '',
            duration,
            id,
            playbackAssetFormat,
            playbackType,
            smilPid,
            smilURL,
            selectedStream,
        } = videoMetaData;

        //get the player control config version
        const { PlayerControlsUIServices } = await import('@enlight-webtv/player-services');
        const { getPlayerUIConfig } = new PlayerControlsUIServices();
        const playerControlConfig = getPlayerUIConfig(playbackType as PlaybackType);

        // Prepare data for Mux integration
        this.muxData = {
            env_key: envKey,
            viewer_user_id: userData?.userId ?? '',
            viewer_device_model: deviceInfo.deviceModel,
            viewer_device_category: deviceInfo.deviceType,
            viewer_device_manufacturer: deviceInfo.brand,
            page_type: sessionID,
            version: appMetaData.appVersion,
            sub_property_id: this.envMode, //import.meta having type config issue.
            player_name: 'WBTV-shaka',
            // @ts-ignore
            player_version: window.shakaInstance?.Player?.version ?? '',
            player_init_time: playerInitTime,
            debug: false,
            disableCookies: false,
            respectDoNotTrack: false,
            custom_1: this.getCustomValue1(),
            custom_2: this.getCustomValue2(),
            custom_5: isSubscribed ? SubscriptionType.Subscribed : SubscriptionType.Registered,
            video_id: id,
            video_title: title,
            video_series: seriesTitle ?? ContentType.MOVIE,
            video_variant_name: '', // Subtitle - NA now.
            video_variant_id: smilPid,
            video_language_code: audio ? audio?.data?.key : '',
            video_content_type: this.getContentType(playbackType as PlaybackType),
            video_duration: duration,
            video_stream_type: selectedStream,
            video_encoding_variant: playbackAssetFormat ?? '',
            video_cdn: smilURL,
            video_source_url: sourceUrl,
            experiment_name: playerControlConfig?.configVersion ?? 'd1',
        };

        // Initialize Shaka Player with Mux integration
        const mux = initShakaPlayerMux(player?.activePlayer, {
            debug: false,
            errorTranslator: this.muxErrorTranslator,
            data: this.muxData,
        });
        //set the mux instance
        this.setMUXInstance(mux);

        return mux;
    };

    /**
     * @name updateMUXOnVideoOrProgramChange
     * @type function
     * @description This function will update the mux video change or programme change
     * @param {any} player - contains the player instance
     * @param {any} playbackData - contains the playback data like title, duration, stream url.
     *
     * @author amalmohann
     */
    updateMUXOnVideoOrProgramChange = async (player: any, event: MUXEvents, videoMetaData: MUXVideoMetaData) => {
        const audio = getState(StorageKeys.SELECTED_AUDIO_MENU);
        const {
            title = '',
            seriesTitle = '',
            sourceUrl = '',
            duration,
            id,
            playbackAssetFormat,
            playbackType,
            smilPid,
            smilURL,
            selectedStream,
        } = videoMetaData;

        //get the player control config version
        const { PlayerControlsUIServices } = await import('@enlight-webtv/player-services');
        const { getPlayerUIConfig } = new PlayerControlsUIServices();
        const playerControlConfig = getPlayerUIConfig(playbackType as PlaybackType);

        //update the mux on video change
        player.activePlayer.mux.emit(event, {
            video_id: id,
            video_title: title,
            video_series: seriesTitle ?? ContentType.MOVIE,
            video_variant_name: '', // Subtitle - NA now.
            video_variant_id: smilPid,
            video_language_code: audio ? audio?.data?.key : '',
            video_content_type: this.getContentType(playbackType as PlaybackType),
            video_duration: duration,
            video_stream_type: selectedStream,
            video_encoding_variant: playbackAssetFormat ?? '',
            video_cdn: smilURL,
            video_source_url: sourceUrl,
            experiment_name: playerControlConfig?.configVersion ?? 'd1',
        });
    };

    /**
     * @name muxErrorTranslator
     * @type function
     * @description Special handling for translating player errors to a more meaningful error
     * @param {error} error - contains the player error code and player error message
     * @returns returns the parsed error as object
     *
     * @author anandpatel
     */
    muxErrorTranslator = (error: { player_error_code: number; player_error_message: any }) => {
        if (error.player_error_code === 6006) {
            return false;
        }
        return {
            player_error_code: error.player_error_code,
            player_error_message: error.player_error_message,
        };
    };

    /**
     * @name updateMuxDataOnPlayback
     * @type function
     * @description There are some cases where you may not have the full set of metadata until after the video playback has started.
     * This function will update those values. The values that needs to be updated should be omitted in the first setting.
     * @param {any} player - contains the player instance
     *
     * @author amalmohann
     */
    updateMuxDataOnPlayback = (player: any) => {
        // get player stats and selected tracks
        const playerStats = player.activePlayer?.getStats();
        const { width = 0, height = 0, streamBandwidth: bandwidth = 0 } = playerStats;
        player.activePlayer.mux.updateData?.({
            video_producer: `${width || 0}x${height || 0}, ${bandwidth || 0} @ ${0}`,
        });
    };

    /**
     * @name getCustomValue1
     * @type function
     * @description Custom values for each projects are different. This function will get the
     * custom value 1 based on the project
     * @author amalmohann
     */
    getCustomValue1 = () => {
        const project = getProjectName();
        switch (project) {
            case Project.VIDEOTRON:
                return getSubscriptionDetails().customerType;
            case Project.RALLY_TV:
            default:
                return Platform.WebTv;
        }
    };

    /**
     * @name getCustomValue2
     * @type function
     * @description Custom values for each projects are different. This function will get the
     * custom value 2 based on the project
     * @author amalmohann
     */
    getCustomValue2 = () => {
        const project = getProjectName();
        const appMetaData = getAppMetaData();
        switch (project) {
            case Project.VIDEOTRON:
                return getSubscriptionDetails().subscriptionType;
            case Project.RALLY_TV:
            default:
                return getPlatformAcronym() + '.' + appMetaData.appVersion; // App version;
        }
    };

    /**
     * @name getContentType
     * @type function
     * @description get the content type based on the playback type and the project
     * @author amalmohann
     */
    getContentType = (playbackType: PlaybackType) => {
        const project = getProjectName();
        switch (project) {
            case Project.VIDEOTRON:
            case Project.CMGO:
                if ([PlaybackType.VOD_SERIES, PlaybackType.SERIES, PlaybackType.EPISODE].includes(playbackType)) return PlaybackType.EPISODE;
                else if ([PlaybackType.VOD, PlaybackType.MOVIE].includes(playbackType)) return PlaybackType.MOVIE;
                else return playbackType;
            case Project.RALLY_TV:
            default:
                return playbackType;
        }
    };
}

export default MuxService;
