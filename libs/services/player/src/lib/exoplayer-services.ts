/* eslint-disable @typescript-eslint/ban-ts-comment */
import { deviceUtilities } from '@enlight-webtv/utilities';
import { PlayerControlsUIServices, PlayerStateServices } from '.';
import { PlayerState } from '@enlight-webtv/models';

//services
const { toggleThumbnailAndTitle, toggleControlsUI } = new PlayerControlsUIServices();
const { setPlayerState } = new PlayerStateServices();
//utils
//variables
const ANDROID = {}
const IS_ANDROID = {};

class ExoPlayerServices {
    static instance: ExoPlayerServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (ExoPlayerServices.instance) {
            return ExoPlayerServices.instance;
        }
        ExoPlayerServices.instance = this;
    }

    destroy() {
        if (ExoPlayerServices.instance === this) {
            ExoPlayerServices.instance = null;
        }
    }

    //constructor
    ExoPlayerServices() {
        //TODO: remove when exo player testing is done
        console.log('====================================');
        console.log('expo player');
        console.log('====================================');
        if (IS_ANDROID) {
            //push the android functions to window object to be accessible by Android
            //@ts-ignore
            window._androidExoPlayerReady = this._androidExoPlayerReady;
            //@ts-ignore
            window._androidExoPlayerBuffering = this._androidExoPlayerBuffering;
            //@ts-ignore
            window._androidExoPlayerIdle = this._androidExoPlayerIdle;
            //@ts-ignore
            window._androidExoPlayerEnded = this._androidExoPlayerEnded;
            //@ts-ignore
            window._androidExoPlayerPlay = this._androidExoPlayerPlay;
            //@ts-ignore
            window._androidExoPlayerPause = this._androidExoPlayerPause;
            //@ts-ignore
            window._androidBackPressEnable = this._androidBackPressEnable;
            //@ts-ignore
            window._androidExoPlayerTimeUpdate = this._androidExoPlayerTimeUpdate;
            //@ts-ignore
            window._androidExoPlayerPlaybackError = this._firePlaybackError;
        }
    }

    /**
     * @name androidExoPlayerReady
     * @type function
     * @description This function will handle the player ready state event from the exo player
s     *
     * @author amalmohann
     */
    androidExoPlayerReady = () => {
        // this._handleLoadedMetaDataEvent(null);
        ANDROID.handlePlayPause?.();
        toggleThumbnailAndTitle(true);
        toggleControlsUI(true);
        // this._handleLoadedDataEvent(null);
    };

    /**
     * @name androidExoPlayerBuffering
     * @type function
     * @description This function will handle the player buffering state event from the exo player
s     *
     * @author amalmohann
     */
    androidExoPlayerBuffering = (isBuffering: boolean) => {
        if (isBuffering) {
            setPlayerState(PlayerState.BUFFERING);
        }
        // this._isBuffering = isBuffering;
        // this._isPaused = true;
    };

    /**
     * @name androidExoPlayerIdle
     * @type function
     * @description This function will handle the player idle state event from the exo player
s     *
     * @author amalmohann
     */
    androidExoPlayerIdle = () => {
        setPlayerState(PlayerState.IDLE);
        // this._isPaused = true;
    };

    /**
     * @name androidExoPlayerTimeUpdate
     * @type function
     * @description This function will handle the player time update event from the exo player
s     *
     * @author amalmohann
     */
    androidExoPlayerTimeUpdate = (currentTime: string, bufferTime: string) => {
        console.log('====================================');
        console.log(currentTime, bufferTime);
        console.log('====================================');
        // this._handleTimeUpdateEvent({ currentTime, bufferTime });
    };
    /**
     * @name androidExoPlayerEnded
     * @type function
     * @description This function will handle the player ended state event from the exo player
s     *
     * @author amalmohann
     */
    androidExoPlayerEnded = () => {
        setPlayerState(PlayerState.ENDED);
        // // if next episode data is not available and rail type is catchup or live navigate user to previous page
        // if ((!this._nextEpisodeData && !isValidValue(this._relatedRail)) || this._isLive) {
        //     this._showBingeWatching = false;
        //     this._destroyThePlaybackAndGoBack();
        //     return;
        // }
        // this._showBingeWatching = this._playbackType !== PlaybackType.LIVE;
        // ANDROID.releaseExoPlayer();
    };

    /**
     * @name androidExoPlayerPlay
     * @type function
     * @description This function will handle the player play state event from the exo player
s     *
     * @author amalmohann
     */
    androidExoPlayerPlay = () => {
        // this._isPaused = false;
        setPlayerState(PlayerState.PLAYING);
    };

    /**
     * @name androidExoPlayerPause
     * @type function
     * @description This function will handle the player pause state event from the exo player
s     *
     * @author amalmohann
     */
    androidExoPlayerPause = () => {
        // this._isPaused = true;
        setPlayerState(PlayerState.PAUSED);
    };

    /**
     * @name androidBackPressEnable
     * @type function
     * @description This function will handle the enable the back in android
s     *
     * @author amalmohann
     */
    androidBackPressEnable = () => {
        // this._disableAndroidBack = false;
    };
}

export default ExoPlayerServices;
