import { LogglyServices } from '@enlight-webtv/analytics-services';
import {
    ActionType,
    ErrorConfiguration,
    ErrorConfigurationType,
    ErrorPopupData,
    LogLevel,
    LogType,
    ModuleType,
    PlaybackType,
    PlayerMode,
    PlayerState,
    SMILExceptionResponse,
} from '@enlight-webtv/models';
import { NetworkConnectivityServices } from '@enlight-webtv/network-services';
import {
    PlaybackDataServices,
    PlayerControlsUIServices,
    PlayerServices,
    PlayerAnalyticsService,
    PlayerControlsActionServices,
} from '.';
import { configurationUtilities, errorUtilities, playerUtilities } from '@enlight-webtv/utilities';

//services
const logglyServices = new LogglyServices();
const { getPlaybackVideoData, getPlayerStatusData, setPlayerStatusData } = new PlaybackDataServices();
const { toggleLoadingSpinner } = new PlayerControlsUIServices();
const { checkInternetConnection } = new NetworkConnectivityServices();

//utilities
const { getErrorByCode } = configurationUtilities;
const { getActionType, getErrorPopActionHandling, getErrorPopupInstance } = errorUtilities;
const { getCurrentTimeFromPlayer, getPlayerInstance } = playerUtilities;

const IS_ANDROID = false;
const ANDROID = {}

class PlayerErrorServices {
    static instance: PlayerErrorServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerErrorServices.instance) {
            return PlayerErrorServices.instance;
        }
        PlayerErrorServices.instance = this;
    }

    destroy() {
        if (PlayerErrorServices.instance === this) {
            PlayerErrorServices.instance = null;
        }
    }

    /**
     * @name mapAndThrowSMILError
     * @type function
     * @description this function will through the SMIL related errors
     *
     * @author amalmohann
     */
    mapAndThrowSMILError = async (exception: SMILExceptionResponse) => {
        // check if it is No Network error
        const { exitPlayer } = new PlayerServices();
        const isOnline = await checkInternetConnection();
        if (isOnline) {
            const playbackVideoData = { ...getPlaybackVideoData() };
            const playerStatusData = { ...getPlayerStatusData() };
            playerStatusData.playerState = PlayerState.ERROR.toUpperCase() as PlayerState;
            setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
            const errorInfo = {
                request_url: playbackVideoData.smilURL,
                response_code: playbackVideoData?.smilData?.responseCode,
                response_message: playbackVideoData?.smilData?.exception ?? null,
                error_location: window?.location?.href,
                smilData: JSON.stringify(playbackVideoData?.smilData ?? {}),
            };
            //throw the error
            switch (exception) {
                case SMILExceptionResponse.NO_ASSET_TYPE_FORMAT_MATCHES:
                    await this.firePlayerException(ErrorConfigurationType.PLAYBACK_FORMAT, LogLevel.WARNING, errorInfo);
                    break;
                case SMILExceptionResponse.CONCURRENCY_LIMIT_VOILATION:
                    if (IS_ANDROID) {
                        ANDROID.releaseExoPlayer();
                    }
                    await this.firePlayerException(ErrorConfigurationType.PLAYBACK_CONCURRENCY, LogLevel.WARNING, errorInfo);
                    break;
                case SMILExceptionResponse.LICENSE_NOT_GRANTED:
                    await this.firePlayerException(ErrorConfigurationType.PURCHASE_REQUIRED, LogLevel.WARNING, errorInfo);
                    break;
                case SMILExceptionResponse.GEO_LOCATION_BLOCKED:
                    await this.firePlayerException(ErrorConfigurationType.PLAYBACK_GEO_RESTRICTED, LogLevel.WARNING, errorInfo);
                    break;
                case SMILExceptionResponse.ENTITLEMENT_VALIDATION_ERROR:
                case SMILExceptionResponse.PLAYBACK_ENTITLEMENT:
                    await this.firePlayerException(ErrorConfigurationType.PLAYBACK_ENTITLEMENT, LogLevel.WARNING, errorInfo);
                    break;
                default:
                    await this.firePlayerException(ErrorConfigurationType.UNKNOWN_SMIL_ERROR, LogLevel.WARNING, errorInfo);
                    break;
            }

            const { playerContext } = { ...getPlayerStatusData() };
            !playerContext._isPlayerRetrying && exitPlayer(true);
        }
    };

    /**
     * @name firePlayerException
     * @type function
     * @description this function will fetch the SMIL exception configuration and raise the error popup
     * @param {ErrorConfigurationType} key - key to fetch the config
     * @param {LogLevel} level - log level for loggly
     * @param {any} errorInfo - additional info on error
     *
     * @author amalmohann
     */
    firePlayerException = async (key: ErrorConfigurationType, level: LogLevel, errorInfo: any) => {
        const player = getPlayerInstance();
        const playbackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };
        let error: ErrorConfiguration | undefined = getErrorByCode(key);
        const playerProgress =
            playbackVideoData?.contentType === PlaybackType.LIVE
                ? 0
                : Math.floor(getCurrentTimeFromPlayer(player, playerStatusData.playerCurrentTimeOffset, playbackVideoData.contentType)) || 0;

        toggleLoadingSpinner(false);
        //set smil error data for loggly
        const errorData = {
            infoData: {
                playback: {
                    content_id: playbackVideoData?.contentId,
                    content_title: (playbackVideoData?.seriesName ?? '') + playbackVideoData?.title,
                    media_type: playbackVideoData?.contentType,
                    source_url: playbackVideoData?.smilURL,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    ...({ shaka_version: window.shakaInstance?.Player?.version ?? '' }),
                    quality: playbackVideoData?.selectedQuality || 'auto',
                    stream_id: playbackVideoData?.guid,
                    player_event: playerStatusData?.playerState,
                    progress: playerProgress,
                },
                error_info: { ...errorInfo },
            },
        };
        this.sendPlayerErrorLog(level, errorData, playerStatusData.playerState, key);

        // retry the streaming only if generic error or error not found
        const { playerContext } = { ...getPlayerStatusData() };
        let retrySuccess = false;
        if (key === ErrorConfigurationType?.PLAYBACK_GENERIC || !error) {
            retrySuccess = await player?.activePlayer.retryStreaming();
            if (retrySuccess) {
                playerContext._isPlayerRetrying = true;
                const { playerPlay } = new PlayerControlsActionServices();
                playerPlay();
                return Promise.resolve(true);
            }
        }

        // If error is generic error and not recoverable, reload the player silently
        if (playerContext._playerRetries > 0 && !retrySuccess && (key === ErrorConfigurationType?.PLAYBACK_GENERIC || !error)) {
            playerContext._playerRetries--;
            playerContext._isPlayerRetrying = true;

            // Show loading spinner
            toggleLoadingSpinner(true);

            const { setPlayerAndPlaybackData } = new PlayerServices();
            // update the progress to the current video time
            const contentData = { ...playbackVideoData.contentData };
            contentData.continueWatchingData.progress && (contentData.continueWatchingData.progress = playerProgress * 1000);

            // clear the thumbnil url
            contentData.previewImageUrl = '';
            contentData.thumbnailUrl = '';
            // Reload the player
            await setPlayerAndPlaybackData(
                contentData,
                playerStatusData.playerMode,
                playbackVideoData.contentType,
                playerStatusData.playbackInitiatedSourceType,
                playerStatusData.playerContext,
            );

            return Promise.resolve(true);
        }

        //show the popup
        const actions = getActionType(key);
        // Show generic player error if config for the required error is not found.
        // This code is not intended to run and is just a fallback
        if (!error) {
            console.warn('Error configuration not found for player error: ', key);
            error = getErrorByCode(ErrorConfigurationType?.PLAYBACK_GENERIC);
        }

        if (error && playerStatusData.playerMode && playerStatusData.playerMode !== PlayerMode.MINIPLAYER) {
            this.setErrorPopUp(error, actions, key);
        }

        // Send player error analytics event
        if (playbackVideoData?.contentId) {
            const { sendPlayerErrorEvent } = new PlayerAnalyticsService();
            sendPlayerErrorEvent(error as ErrorConfiguration);
        }

        return Promise.resolve(true);
    };

    /**
     * @name sendPlayerErrorLog
     * @type function
     * @description this function will send the player error log to loggly
     * @param {LogLevel} level - log level to send to loggly
     * @param {any} errorData - data to be send to loggly
     * @param {PlayerState} playerState - current state of player
     * @param {ErrorConfigurationType} key - key to fetch the config
     *
     * @author amalmohann
     */
    sendPlayerErrorLog = (level: LogLevel, errorData: any, playerState: PlayerState = PlayerState.IDLE, key: ErrorConfigurationType | any) => {
        logglyServices.sendLog({
            module: ModuleType.Player,
            logType: LogType.ERROR,
            errorPathObject: new Error(),
            logLevel: level,
            action: playerState,
            errorShown: true,
            errorCode: key,
            data: errorData,
        });
    };

    /**
     * @name setErrorPopUp
     * @type function
     * @description this function will set and show the error popup from the player
     * @param {ErrorConfiguration} error - error configuration
     * @param {undefined | {  primaryActionType?: ActionType; secondaryActionType?: ActionType;}} actions - actions for the buttons
     * @param {ErrorConfigurationType} key - key to fetch the config
     *
     * @author amalmohann
     */
    setErrorPopUp = (
        error: ErrorConfiguration,
        actions:
            | {
                  primaryActionType?: ActionType;
                  secondaryActionType?: ActionType;
              }
            | undefined,
        key: ErrorConfigurationType,
    ) => {
        console.log('====================================');
        console.log('error configuration for the popup', error);
        console.log('====================================');
        const data = {
            logoSrc: 'icons/error/info.png',
            title: error.title,
            description: error.description,
            showErrorCode: true,
            errorCode: error.code,
            buttons: [
                {
                    label: error.primaryActionLabel,
                    handleEnterPress:
                        getErrorPopActionHandling(actions?.primaryActionType ?? error.primaryActionType, key) ??
                        getErrorPopActionHandling(ActionType.BACK),
                    handleBackPress: () => null,
                },
                {
                    label: error.secondaryActionLabel,
                    handleEnterPress: getErrorPopActionHandling(actions?.secondaryActionType ?? error?.secondaryActionType, key),
                    handleBackPress: () => null,
                },
            ],
        } as ErrorPopupData;
        getErrorPopupInstance().createErrorPage(data);
    };
}

export default PlayerErrorServices;
