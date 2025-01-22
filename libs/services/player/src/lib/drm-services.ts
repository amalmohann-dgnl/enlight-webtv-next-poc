import { LogglyServices } from '@enlight-webtv/analytics-services';
import {
    BuildType,
    LicenseServerUrl,
    LogLevel,
    LogType,
    ModuleType,
    PlaybackData,
    PlaybackType,
    Project,
    ShakaNetworkRequest,
} from '@enlight-webtv/models';
import { projectUtilities, playerUtilities, commonUtilities, deviceUtilities } from '@enlight-webtv/utilities';
import  PlaybackDataServices  from './playback-data-services';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const BUILD_TYPE = BuildType.Dev;

// Services
const logglyServices = new LogglyServices();
const { getPlaybackVideoData, getPlayerStatusData } = new PlaybackDataServices();

// Utilities
const { getCurrentTimeFromPlayer, getPlayerInstance } = playerUtilities;
const { isValidValue } = commonUtilities;

class DRMServices {
    static instance: DRMServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (DRMServices.instance) {
            return DRMServices.instance;
        }
        DRMServices.instance = this;
    }

    destroy() {
        if (DRMServices.instance === this) {
            DRMServices.instance = null;
        }
    }

    /**
     * @name updateAuthorization
     * @type function
     * @description This function will add the interceptor to intercept when the request type is
     * shaka's license request and will add the authorization header.
     * @param { any } playerRef - the player reference to be passed.
     * @param { string } authToken - the authorization token to be passed as header.
     *
     * @author amalmohann
     */
    updateAuthorization = (playerRef: any, authToken: string, playbackData: PlaybackData) => {
        // Object to store request information
        const requestMap: any = {};
        const { getProjectName } = projectUtilities;

        if (playerRef?.getNetworkingEngine()?.registerRequestFilter) {
            //intercepting the every request from player and filtering.
            playerRef.getNetworkingEngine().registerRequestFilter(function (type: any, request: any, context: any) {
                requestMap[request.uris.join(',')] = { request, context };
                // check for the license request and replace the request header
                if (type === ShakaNetworkRequest.LICENSE) {
                    //update the authorization header with authToken
                    switch (getProjectName()) {
                        case Project.RALLY_TV:
                        case Project.VIDEOTRON:
                            request.headers['Authorization'] = authToken;
                            break;
                        case Project.CMGO:
                            request.headers['x-axdrm-message'] = authToken;
                            break;
                        default:
                            break;
                    }
                }
            });
        }

        //remove sensitive data if prod
        // Register a listener for network responses
        if (playerRef?.getNetworkingEngine?.()?.registerResponseFilter) {
            playerRef.getNetworkingEngine().registerResponseFilter((_type: any, response: any) => {
                // Get request corresponding to the response
                const requestInfo = requestMap[response.uri];

                if (response && requestInfo) {
                    if (response.status > 299) {
                        const player = getPlayerInstance();
                        const playerPlaybackVideoData = { ...getPlaybackVideoData() };
                        const playerStatusData = { ...getPlayerStatusData() };
                        let playerProgress = NaN;

                        if (player) {
                            playerProgress =
                                playerPlaybackVideoData?.contentType === PlaybackType.LIVE
                                    ? 0
                                    : Math.floor(
                                          getCurrentTimeFromPlayer(
                                              player,
                                              playerStatusData?.playerCurrentTimeOffset,
                                              playerPlaybackVideoData?.contentType,
                                          ),
                                      ) || 0;
                        }

                        // send log on player request related errors
                        logglyServices.sendLog({
                            module: ModuleType.Player,
                            logType: LogType.DEBUG,
                            errorPathObject: new Error(),
                            logLevel: LogLevel.ERROR,
                            errorShown: true,
                            data: {
                                infoData: {
                                    debug_message: 'player_error',
                                    ...(isValidValue(playerPlaybackVideoData) && {
                                        playback: {
                                            content_id: playerPlaybackVideoData?.contentId,
                                            content_title: (playerPlaybackVideoData?.seriesName ?? '') + playerPlaybackVideoData?.title,
                                            media_type: playerPlaybackVideoData?.contentType,
                                            source_url: playerPlaybackVideoData?.smilURL,
                                            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                                            // @ts-ignore
                                            ...({ shaka_version: window.shakaInstance?.Player?.version ?? '' }),
                                            quality: playerPlaybackVideoData?.selectedQuality || 'auto',
                                            stream_id: playerPlaybackVideoData?.guid,
                                            player_event: playerStatusData?.playerState,
                                            ...(!isNaN(playerProgress) && isValidValue(playerProgress) && { progress: playerProgress }),
                                        },
                                    }),
                                    error_info: {
                                        smil: playbackData.smil,
                                        smilData: playbackData?.smilData,
                                        authorization: playbackData.authorization,
                                        licenseServerUrl: playbackData.licenseServerUrl,
                                        drmProvider: playbackData.drmProvider,
                                        request_url: response.uri,
                                        response_code: response.status,
                                        request: requestInfo.request,
                                        response: response,
                                    },
                                },
                            },
                        });
                    }

                    // Optionally, you can remove the request information once processed
                    requestInfo[response.uri] && delete requestInfo[response.uri];
                }
            });
        }
    };
}

export default DRMServices;
