import { LogglyServices } from '@enlight-webtv/analytics-services';
import { LogLevel, LogType, ModuleType, PlaybackType } from '@enlight-webtv/models';
import { commonUtilities, deviceUtilities, playerUtilities } from '@enlight-webtv/utilities';
import { PlaybackDataServices } from '.';

//services
const logglyServices = new LogglyServices();
const { getPlaybackVideoData, getPlayerStatusData } = new PlaybackDataServices();

//Utilities
const { isValidValue } = commonUtilities;
const { getCurrentTimeFromPlayer, getPlayerInstance } = playerUtilities;
const { isAndroid } = deviceUtilities;

//global variables
let EBVS_CHECKER_START_TIME: number;

class PlayerEBVSServices {
    static instance: PlayerEBVSServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerEBVSServices.instance) {
            return PlayerEBVSServices.instance;
        }
        PlayerEBVSServices.instance = this;
    }

    destroy() {
        if (PlayerEBVSServices.instance === this) {
            PlayerEBVSServices.instance = null;
        }
    }

    /**
     * @name setEBVSCheckStartTime
     * @type function
     * @description this function will set the current time as EBVS start time.
     *
     * @author amalmohann
     */
    setEBVSCheckStartTime = () => {
        EBVS_CHECKER_START_TIME = new Date().getTime();
    };

    /**
     * @name getEBVSCheckStartTime
     * @type function
     * @description this function will return the marked EBVS start time.
     *
     * @author amalmohann
     */
    getEBVSCheckStartTime = () => {
        return EBVS_CHECKER_START_TIME;
    };

    /**
     * @name checkUserInitiatedEBVS
     * @type function
     * @description this function will check the player start time and exit time and
     * if it is less than 10 seconds, it will send EBVS loggly log.
     * @param {number} EBVSStartTime - time when user came to player page.
     * @param {string} playerState - Player status (Playing, buffering, paused ...)
     *
     * @author anandpatel
     */
    checkUserInitiatedEBVS = (EBVSStartTime: number, playerState: string) => {
        // Check EBVS
        const currentTime = new Date().getTime();
        const elapsedTime = currentTime - EBVSStartTime;
        // checking if elapsed time is less than or equal to 10 sec
        if (elapsedTime <= 10000) {
            this.sendUserInitiatedEBVSLog(elapsedTime, playerState);
        }
    };

    /**
     * @name sendUserInitiatedEBVSLog
     * @type function
     * @description this function will send the EBVS loggly log
     * @param {number} elapsedTime - time between player start and exit
     * @param {string} playerState - Player status (Playing, buffering, paused ...)
     *
     * @author anandpatel
     */
    sendUserInitiatedEBVSLog = (elapsedTime: number, playerState: string) => {
        const player = getPlayerInstance();
        const playerPlaybackVideoData = { ...getPlaybackVideoData() };
        const playerStatusData = { ...getPlayerStatusData() };
        let playerProgress = NaN;
        if (player) {
            playerProgress =
                playerPlaybackVideoData?.contentType === PlaybackType.LIVE
                    ? 0
                    : Math.floor(getCurrentTimeFromPlayer(player, playerStatusData?.playerCurrentTimeOffset, playerPlaybackVideoData?.contentType)) ||
                      0;
        }

        logglyServices.sendLog({
            module: ModuleType.Player,
            logType: LogType.INFO,
            errorPathObject: new Error(),
            logLevel: LogLevel.INFO,
            errorShown: false,
            data: {
                infoData: {
                    debug_message: 'EBVS_intiated',
                    ebvs_time: Math.floor(elapsedTime / 1000),
                    player_status: playerState,
                    ...(isValidValue(playerPlaybackVideoData) && {
                        playback: {
                            content_id: playerPlaybackVideoData?.contentId,
                            content_title: (playerPlaybackVideoData?.seriesName ?? '') + playerPlaybackVideoData?.title,
                            media_type: playerPlaybackVideoData?.contentType,
                            source_url: playerPlaybackVideoData?.smilURL,
                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                            // @ts-ignore
                            ...(!isAndroid() && { shaka_version: window.shakaInstance?.Player?.version ?? '' }),
                            quality: playerPlaybackVideoData?.selectedQuality || 'auto',
                            stream_id: playerPlaybackVideoData?.guid,
                            player_event: playerStatusData?.playerState,
                            ...(!isNaN(playerProgress) && isValidValue(playerProgress) && { progress: playerProgress }),
                        },
                    }),
                },
            },
        });
    };
}

export default PlayerEBVSServices;
