/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-ignore
import { DPlayer, Shaka } from 'diagnal-web-player';
import { DiagnalPlayerConfig, DPlayerDRMConfig, DPlayerEvents } from '@enlight-webtv/models';
import { dvplayerUtilities, playerUtilities } from '@enlight-webtv/utilities';
import { PlayerEventsServices } from '.';

//services
const {
    handleLoadingEvent,
    handleLoadedMetaDataEvent,
    handleLoadedDataEvent,
    handleErrorEvent,
    handleMediaFailedEvent,
    handlePlayingEvent,
    handlePauseEvent,
    handleReadyEvent,
    handleWaitingEvent,
    handleCanPlayEvent,
    handleManifestParsedEvent,
    handleBufferingEvent,
    handleRateChangeEvent,
    handleSeekedEvent,
    handleSeekingEvent,
    handleTimeUpdateEvent,
} = new PlayerEventsServices();

//utilities
const { removeDVPlayerTag } = dvplayerUtilities;
const { getPlayerInstance, setPlayerInstance, addPlayerEventListener, getPlayerHTMLTagElement } = playerUtilities;

//player configuration
const D_PLAYER_CONFIG: DiagnalPlayerConfig = {
    shakaConfig: {
        sdkUrl: 'https://cdn.jsdelivr.net/npm/shaka-player@4.7.11/dist/shaka-player.compiled.min.js',
        manifestUri: '',
        playerConfig: {
            streaming: {
                bufferingGoal: 400,
                ignoreTextStreamFailures: true,
                rebufferingGoal: 10,
                bufferBehind: 30,
                stallEnabled: false,
                stallThreshold: 1,
                retryParameters: {
                    backoffFactor: 2,
                    baseDelay: 800,
                    fuzzFactor: 0.5,
                    maxAttempts: 2,
                    timeout: 30000,
                },
            },
            manifest: {
                dash: { ignoreMinBufferTime: true },
                retryParameters: {
                    backoffFactor: 2,
                    baseDelay: 800,
                    fuzzFactor: 0.5,
                    maxAttempts: 2,
                    timeout: 30000,
                },
            },
            drm: {} as DPlayerDRMConfig,
        },
        autoplay: true,
    },
};

class DVPlayerServices {
    static instance: DVPlayerServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (DVPlayerServices.instance) {
            return DVPlayerServices.instance;
        }
        DVPlayerServices.instance = this;
    }

    destroy() {
        if (DVPlayerServices.instance === this) {
            DVPlayerServices.instance = null;
        }
    }

    /**
     * @name dvplayerSetup
     * @type function
     * @description This function will setup external players like D Player instead of the native Video Tag,
     * Which will give us more control over our playbacks and player. This function will basically setup all
     * all of the configuration of the player.
     * @param { PlaybackData } playbackData - playbackData
     *
     * @author amalmohann
     */
    dvplayerSetup = async () => {
        //remove player if already existing
        if (getPlayerInstance()) {
            // @ts-ignore
            window.isDestroyingDvp = false;
            await this.synchronizedDvpDestroy();
        }

        // @ts-ignore
        await window.dvpDestroyPromise;
        return new Promise(resolve => {
            (DPlayer as any).createPlayer(Shaka, D_PLAYER_CONFIG, (player: any) => this.handleDPlayerCreatedCallback(player, resolve));
        });
    };

    /**
     * @name dvplayerDestroy
     * @type function
     * @description This function will Destroy external players like D Player instead of the native Video Tag,
     *
     * @author amalmohann
     */
    dvplayerDestroy = async () => {
        // @ts-ignore
        window.isDestroyingDvp = true;
        await getPlayerInstance()?.unload?.();
        await getPlayerInstance()?.destroy?.();
        await getPlayerInstance()?.activePlayer?.destroy?.();
        await getPlayerInstance()?.activePlayer?.mux?.destroy?.();
        // removeEventListeners(document, DPlayerEvents.DPLAYER_LOADED);
        //remove refs to the instance
        setPlayerInstance(null);
        //remove tag from DOM
        removeDVPlayerTag();
        // @ts-ignore
        window.isDestroyingDvp = false;
        return Promise.resolve();
    };

    /**
     * @name synchronizedDvpDestroy
     * @type function
     * @description This function will synchronously Destroy external players like D Player
     *
     * @author alwin-baby
     */
    synchronizedDvpDestroy = async () => {
        // @ts-ignore
        if (window.isDestroyingDvp) {
            // @ts-ignore
            await window.dvpDestroyPromise;
        } else {
            // @ts-ignore
            window.dvpDestroyPromise = this.dvplayerDestroy();
            // @ts-ignore
            await window.dvpDestroyPromise;
        }
        return Promise.resolve();
    };

    /**
     * @name handleDPlayerCreatedCallback
     * @type function
     * @description This function will handle the DplayerCreated event from the player
     * @param { any } player - player returned by the D player
     * @param { any } resolve - promise to resolve after D-player created
     *
     * @author amalmohann
     */
    handleDPlayerCreatedCallback(player: any, resolve: any) {
        //attaching the listeners after the player is loaded.
        setPlayerInstance(player);
        document.addEventListener(DPlayerEvents.DPLAYER_LOADED, (event: any) => this.handleDPlayerLoadedEvent(event, player));
        resolve();
    }

    /**
     * @name handleDPlayerLoadedEvent
     * @type function
     * @description This function will handle the player loaded event from the player
     * @param { any } event - event from the player.
     * @param { any } player - player
     * @param { PlaybackData } playbackData - playback data
     *
     * @author amalmohann
     */
    handleDPlayerLoadedEvent = async (event: any, player: any) => {
        console.info('> handleDPlayerLoadedEvent > ', event);
        //Add the event listeners
        this.setupDVPlayerEventListeners(player);
    };

    /**
     * @name getDVPDefaultConfig
     * @type function
     * @description This function will return the default configuration
     * @return { DiagnalPlayerConfig } player configuration
     *
     * @author amalmohann
     */
    getDVPDefaultConfig = () => D_PLAYER_CONFIG;

    /**
     * @name _setupDVPlayerEventListeners
     * @type function
     * @description This function will setup all the event listeners for the playback in the player.
     * @param { any } player - A Reference to the video tag.
     *
     * @author amalmohann
     */
    setupDVPlayerEventListeners = (player: any) => {
        const videoPlayerTag = getPlayerHTMLTagElement('dplayer');
        /**
         * setup all the event listeners
         */
        /**
         * loading events
         */
        //setup the loading listener for the player
        player?.activePlayer?.addEventListener(DPlayerEvents.LOADING, (e: any) => handleLoadingEvent(e));
        //setup the loaded meta data listener for the player
        addPlayerEventListener(player, DPlayerEvents.LOADED_META_DATA, (e: any) => handleLoadedMetaDataEvent(e));
        //setup the loaded data listener for the player
        /**
         * Attaching the loaded data eventlistener directly to the video element ensures reliability.
         * The callback function was not always getting triggered when the eventListener was
         * attached to the player
         */
        videoPlayerTag?.addEventListener(DPlayerEvents.LOADED_DATA, (e: any) => handleLoadedDataEvent(e));
        /**
         * error events
         */
        // setup the error listener for the player
        addPlayerEventListener(player, DPlayerEvents.ERROR, (e: any) => handleErrorEvent(e));
        // setup the media failed listener for the player
        addPlayerEventListener(player, DPlayerEvents.MEDIA_FAILED, (e: any) => handleMediaFailedEvent(e));
        /**
         * other events
         */
        //setup the playing listener for the player
        addPlayerEventListener(player, DPlayerEvents.PLAYING, (e: any) => handlePlayingEvent(e));
        //setup the play listener for the player
        addPlayerEventListener(player, DPlayerEvents.PLAY, (e: any) => handlePlayingEvent(e));
        //setup the pause listener for the player
        addPlayerEventListener(player, DPlayerEvents.PAUSE, (e: any) => handlePauseEvent(e));
        //setup the ready listener for the player
        addPlayerEventListener(player, DPlayerEvents.READY, (e: any) => handleReadyEvent(e));
        //setup the seeking listener for the player
        addPlayerEventListener(player, DPlayerEvents.SEEKING, (e: any) => handleSeekingEvent(e));
        //setup the seeked listener for the player
        addPlayerEventListener(player, DPlayerEvents.SEEKED, (e: any) => handleSeekedEvent(e));
        //setup the waiting listener for the player
        addPlayerEventListener(player, DPlayerEvents.WAITING, (e: any) => handleWaitingEvent(e));
        //setup the can play listener for the player
        addPlayerEventListener(player, DPlayerEvents.CAN_PLAY, (e: any) => handleCanPlayEvent(e));
        //setup the buffering listener for the player
        addPlayerEventListener(player, DPlayerEvents.BUFFERING, (e: any) => handleBufferingEvent(e));
        //setup the time update listener for the player
        addPlayerEventListener(player, DPlayerEvents.TIME_UPDATE, (e: any) => handleTimeUpdateEvent(e));
        //setup the rate change listener for the player
        addPlayerEventListener(player, DPlayerEvents.RATE_CHANGE, (e: any) => handleRateChangeEvent(e));
        // setup the manifest parsed listener for the player
        player?.activePlayer?.addEventListener(DPlayerEvents.MANIFEST_PARSED, (e: any) => handleManifestParsedEvent(e));
    };
}

export default DVPlayerServices;
