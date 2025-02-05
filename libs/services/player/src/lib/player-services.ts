'use client'
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
    Players,
    SMILRequest,
    PlaybackVideoData,
    PlaybackType,
    SMILExceptionResponse,
    ConcurrencyLockStatus,
    DPlayerDRMConfig,
    Routes,
    UpdateConcurrencyRequest,
    PlayerStatusData,
    ContinueWatchingData,
    PlaybackInitiatedSourceType,
    PlayerMode,
    DRMProvider,
    ComponentStyle,
    Project,
    PlayerState,
    LabelKey,
    MUXVideoMetaData,
} from '@enlight-webtv/models';
import {
    DVPlayerServices,
    SMILServices,
    PlayerErrorServices,
    DRMServices,
    PlaybackDataServices,
    ConcurrencyServices,
    PlayerEBVSServices,
    PlayerControlsUIServices,
    PlayerAnalyticsService,
    PlayerContinueWatchingServices,
} from '.';
import { configurationUtilities, deviceUtilities, playerUtilities, projectUtilities } from '@enlight-webtv/utilities';
import { MuxServices, PlaybackServices } from '@enlight-webtv/network-services';

//services
const { prepareSMILUrl } = new SMILServices();
const { getSMILRecord } = new PlaybackServices();
const { updateAuthorization } = new DRMServices();
const { mapAndThrowSMILError } = new PlayerErrorServices();
const { toggleLoadingSpinner, toggleThumbnailAndTitle, toggleVideoEndScreen, getPlayerUIConfig } = new PlayerControlsUIServices();
const { dvplayerSetup, synchronizedDvpDestroy, getDVPDefaultConfig } = new DVPlayerServices();
const { setPlaybackTypeBasedContents, getPlayerStatusData, setPlayerStatusData, setPlaybackVideoData, getPlaybackVideoData } =
    new PlaybackDataServices();
const { updateConcurrencyLockStatus, updateConcurrencyRequestData, unlockConcurrencyLock } = new ConcurrencyServices();
const { sendPlayerUnloadEvent } = new PlayerAnalyticsService();
const { updateContinueWatching, setContinueWatchingProgressLocally } = new PlayerContinueWatchingServices();
const { setEBVSCheckStartTime, getEBVSCheckStartTime, checkUserInitiatedEBVS } = new PlayerEBVSServices();
//utilities
const { getPlayerConfig, getLabel } = configurationUtilities;
const { isAndroid, getAndroidObject } = deviceUtilities;
const {
    setCreatedPlayer,
    removeCreatedPlayer,
    preparePlayback,
    createDRMConfiguration,
    getPlayerInstance,
    getHTMLPlayerTag,
    resetCanvasAndPlayerStyle,
    updatePlayerSize,
} = playerUtilities;
const { getProjectName } = projectUtilities;
//const
const IS_ANDROID = false;
const ANDROID = {}

class PlayerServices {
    load: Promise<any> | null = null;
    static instance: PlayerServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerServices.instance) {
            return PlayerServices.instance;
        }
        PlayerServices.instance = this;
    }

    destroy() {
        if (PlayerServices.instance === this) {
            PlayerServices.instance = null;
        }
    }

    /**
     * @name customPlayerSetup
     * @type function
     * @description This function will setup external players like D Player instead of the native Video Tag,
     * Which will give us more control over our playbacks and player. This function will basically setup all
     * all of the configuration of the player.
     * @param { any } player - the created player
     *
     * @author amalmohann
     */
    customPlayerSetup = async (player: Players) => {
        console.info('> customPlayerSetup > ');

        let playerInstance: any;
        setCreatedPlayer(player);
        switch (player) {
            case Players.DVP:
                playerInstance = await dvplayerSetup();
                break;
            case Players.ANDROID:
                break;
            default:
                break;
        }
        return Promise.resolve(playerInstance);
    };

    /**
     * @name customPlayerDestroy
     * @type function
     * @description This function will Destroy external players like D Player instead of the native Video Tag,
     *
     * @author amalmohann
     */
    customPlayerDestroy = async (player: Players) => {
        console.info('> customPlayerDestroy > ');

        removeCreatedPlayer();
        switch (player) {
            case Players.DVP:
                await synchronizedDvpDestroy();
                break;
            case Players.ANDROID:
                break;
            default:
                break;
        }
        return Promise.resolve(true);
    };
    /**
     * @name setPlayerAndPlaybackData
     * @type function
     * @description This function will set the video playback data and player status data.
     * @param { any } contentData
     * @param { PlayerMode } playerMode
     * @param { PlaybackType } playbackType
     * @param { PlaybackInitiatedSourceType } initiatedSource
     * @param { any } context
     * @author amalmohann
     */
    setPlayerAndPlaybackData = async (
        contentData: any,
        playerMode: PlayerMode,
        playbackType: PlaybackType,
        initiatedSource: PlaybackInitiatedSourceType,
        context?: any,
    ) => {
        console.info('> setPlayerAndPlaybackData > ');

        let streamUrl = '';
        let recentlyWatched = contentData.continueWatchingData as ContinueWatchingData;

        //handle the stream url
        if (playbackType === PlaybackType.TRAILER) {
            streamUrl = contentData.trailers?.[0].streams;
        } else {
            if (getProjectName() === Project.RALLY_TV) {
                if (contentData.isLive) streamUrl = contentData.liveUrl;
                if (contentData.isOver) streamUrl = contentData.streams || contentData.catchUpUrl || contentData.mediaUrl;
            } else {
                streamUrl = contentData.streams;
            }
        }

        //handle the continue watching data
        if (playbackType === PlaybackType.TRAILER || playbackType === PlaybackType.PREVIEW) {
            recentlyWatched = {} as ContinueWatchingData;
        }

        if (!streamUrl) {
            return;
        }

        //handle the live and catchup logic
        const title = contentData.title;
        const titleArray = title?.split('\n');
        const episodeTitle = titleArray?.length > 1 ? titleArray[1] : title;

        let relatedRailConfig = null;

        if (playerMode === PlayerMode.FULLSCREEN) {
            const project = getProjectName();
            const playerConfig = getPlayerConfig();
            relatedRailConfig = playerConfig?.relatedComponent?.[0]?.componentStyle?.[0] ?? ({} as ComponentStyle);
            context._relatedRailTitle = playerConfig?.relatedComponent?.[0]?.title as string;
            context._thumbnailUrl = contentData.thumbnailUrl;
            const seasonLabel = getLabel(LabelKey.LABEL_DETAILS_SEASON);
            const episodeLabel = getLabel(LabelKey.LABEL_DETAILS_EPISODE);
            const seriesTitle = `${contentData.seriesTitle} • ${seasonLabel} ${contentData.seasonNumber} • ${episodeLabel} ${contentData.episodeNumber}`;
            context._seriesTitle = contentData.seriesTitle && project === Project.VIDEOTRON ? seriesTitle : contentData.seriesTitle;
            context._title = episodeTitle;
        }

        const playbackVideoData: PlaybackVideoData = {
            assetId: contentData?.asset?.id,
            contentData: contentData,
            contentId: contentData?.uid ?? contentData?.id ?? '',
            contentType: playbackType ?? contentData.playbackType,
            episodeId: contentData.episodeId ?? contentData.uid,
            guid: contentData.guid ?? contentData.program?.guid ?? contentData.contentGuid,
            isSchedule: contentData.isSchedule,
            programId: contentData.program?.guid,
            seasonId: contentData.seasonUid,
            seasonNumber: contentData.tvSeasonNumber,
            seriesId: contentData.seriesUid ?? contentData.seriesId,
            seriesName: contentData.seriesTitle,
            specialHandlingType: contentData.railType,
            streamURL: streamUrl,
            title: episodeTitle,
            thumbnailURL: contentData?.thumbnailUrl,
            prevIdentifier: contentData?.prevIdentifier,
            ...(contentData?.recommendationID && { recommendationID: contentData?.recommendationID }),
        } as PlaybackVideoData;

        const playerStatusData = {
            allowContinueWatching: recentlyWatched?.allowContinueWatching,
            initialPlayback: true,
            isPlayerStatsVisible: false,
            playbackInitiatedSourceType: initiatedSource,
            isUserPreferredQualityUpdated: false,
            retryStreamingCount: 2,
            playerContext: context,
            relatedRailConfig,
            playerMode,
            playerState: PlayerState.LOADING,
            playbackStartTime: Math.floor(Date.now() / 1000),
        } as PlayerStatusData;

        // @ts-ignore
        window.playerWaitingForExit = false;

        await setPlaybackVideoData({ ...getPlaybackVideoData(), ...playbackVideoData });
        await setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });
        this.loadPlaybackVideo(streamUrl, playbackType);
    };

    /**
     * @name loadPlaybackVideo
     * @type function
     * @description This function will load the content to the player.
     * @param {string} streamUrl - streaming url
     * @param {PlaybackVideoData} - playback data
     *
     * @author amalmohann
     */
    loadPlaybackVideo = async (streamUrl: string, playbackType: PlaybackType) => {
        console.info('> loadPlaybackVideo >');

        if (!(streamUrl && playbackType)) return;

        //creating the DVP
        await this.customPlayerSetup(Players.DVP);

        const playerStatusData = getPlayerStatusData();

        if (playerStatusData.playerMode === PlayerMode.FULLSCREEN) {
            toggleVideoEndScreen(false);
            toggleThumbnailAndTitle(true);
        }

        const playerUIConfig = getPlayerUIConfig(playbackType);
        const formats: string =
            playbackType === PlaybackType.TRAILER || playbackType === PlaybackType.PREVIEW
                ? playerUIConfig.previewAssetFormat
                : playerUIConfig.playbackAssetFormat;

        //set the smil url and get the smil data
        const smilRequest: SMILRequest = await prepareSMILUrl(streamUrl, formats);
        const smilURL = smilRequest.smilUrl;
        const smilResponse = await getSMILRecord(smilRequest);
        const smilXMLDocString = smilResponse?.data;

        if (smilXMLDocString) {
            // const formats
            //declaring variables if SMIL Exists
            const preparedPlaybackData = await preparePlayback(formats, smilXMLDocString);
            const playbackDRMProvider = preparedPlaybackData.drmProvider;
            const licenseServerUrl = preparedPlaybackData.licenseServerUrl;
            const authorization = preparedPlaybackData.authorization;
            const smilData = preparedPlaybackData?.smilData;
            const playerAdditionalConfig = JSON.parse(playerUIConfig?.additionalConfiguration || '');

            //throw error on SMIL exception
            if (smilData.isException) {
                const exception = smilData.exception as SMILExceptionResponse;
                mapAndThrowSMILError(exception);
                return;
            }
            // following code will run if smil is success
            //set the playback related data based on the playback type.
            await setPlaybackTypeBasedContents(playbackType);

            //get player instance and player tag
            const player = getPlayerInstance();
            const HTMLPlayer = getHTMLPlayerTag();
            //get Player config
            const updatedPlaybackData = { ...getPlaybackVideoData() };

            //update the playbackData
            updatedPlaybackData.smilURL = smilURL;
            updatedPlaybackData.smilData = { ...smilData };
            setPlaybackVideoData({ ...getPlaybackVideoData(), ...updatedPlaybackData });

            /**
             * updating the concurrency status as locked as the first lock was made when we
             * have done the SMIL Request.
             */
            if (![PlaybackType.TRAILER, PlaybackType.PREVIEW].includes(playbackType)) {
                const { initialConcurrencyDataFromSMIL } = updatedPlaybackData.smilData;
                const { concurrencyLockParam } = initialConcurrencyDataFromSMIL;
                updateConcurrencyLockStatus(ConcurrencyLockStatus.LOCK);
                const concurrencyRequestData: UpdateConcurrencyRequest = {
                    _id: concurrencyLockParam.id,
                    _encryptedLock: concurrencyLockParam.encryptedLock,
                    _sequenceToken: concurrencyLockParam.sequenceToken,
                } as UpdateConcurrencyRequest;
                updateConcurrencyRequestData(concurrencyRequestData);
            }

            playerStatusData.playerControlConfig = playerUIConfig;
            setPlayerStatusData({ ...getPlayerStatusData(), ...playerStatusData });

            //set player configuration

                if (player) {
                    const defaultPlayerConfig = getDVPDefaultConfig();
                    //setting the drm protection + configuration update
                    const drmConfig: DPlayerDRMConfig = createDRMConfiguration(licenseServerUrl);
                    const token = smilData.token;
                    const DRMAuth = getProjectName() === Project.CMGO ? token : authorization;
                    const isDRMProtected = playbackDRMProvider.length > 0 && !playbackDRMProvider.includes(DRMProvider.NONE);
                    //attach the shaka interceptor for DRM license call in d player
                    isDRMProtected && updateAuthorization(player?.activePlayer, DRMAuth, preparedPlaybackData);
                    player?.activePlayer?.configure({
                        ...defaultPlayerConfig.shakaConfig.playerConfig,
                        ...playerAdditionalConfig.shaka,
                        drm: isDRMProtected ? drmConfig : {},
                    });

                    //update the manifest
                    if (playerStatusData.playerMode === PlayerMode.MINIPLAYER) {
                        // @ts-ignore
                        const trailerId = window._trailerId;
                        // add custom data to player instance
                        player.activePlayer.customData = {
                            trailerId,
                        };
                    } else player.activePlayer.customData = undefined;

                    // update the player size
                    updatePlayerSize(playerStatusData.playerMode);

                    // @ts-ignore
                    if (window.isPlayerLoading && this.load) {
                        await this.load;
                        // @ts-ignore
                        window.isPlayerLoading = false;
                        if (playerStatusData.playerMode === PlayerMode.FULLSCREEN) toggleThumbnailAndTitle(true);
                    }
                    this.load = player.load(smilData.manifest);

                    // @ts-ignore
                    window.isPlayerLoading = true;
                    const muxData = {
                        id: updatedPlaybackData.contentId,
                        title: updatedPlaybackData.title,
                        seriesTitle: updatedPlaybackData.seriesName,
                        duration: updatedPlaybackData.durationInMS,
                        smilURL: updatedPlaybackData.smilURL,
                        playbackAssetFormat: formats,
                        sourceUrl: updatedPlaybackData?.smilData?.manifest,
                        playbackType: updatedPlaybackData.contentType,
                        smilPid: updatedPlaybackData?.smilData?.pid,
                        selectedStream: updatedPlaybackData.selectedQuality,
                    } as MUXVideoMetaData;
                    const { initializeMuxService } = new MuxServices();
                    initializeMuxService(player, muxData);
                    await this.load;

                    // @ts-ignore
                    window.isPlayerLoading = false;

                    //set available text streams if the player is full screen and there is enough text Stream data.
                    playerStatusData.playerMode === PlayerMode.FULLSCREEN &&
                        smilData.textStreamInfo &&
                        player.setAvailableSubtitles(smilData.textStreamInfo);
                    HTMLPlayer && (HTMLPlayer.autoplay = true);
                    HTMLPlayer && (HTMLPlayer.muted = false);
                    HTMLPlayer && (HTMLPlayer.loop = false);
                    //ebvs check, playback data and mux update.
                    setEBVSCheckStartTime();
                }
        } else {
            mapAndThrowSMILError(SMILExceptionResponse.DEFAULT);
        }
    };

    /**
     * @name unloadPlayer
     * @type function
     * @param {boolean} checkForEBVS - should check for EBVS or not
     * @description this function will unload the playback.
     *
     * @author amalmohann
     */
    unloadPlayerVideo = async (checkForEBVS = false) => {
        console.info('> unloadPlayerVideo > ');

        //get player instance and Tag
        const HTMLPlayer = getHTMLPlayerTag();
        const playerStatusData = { ...getPlayerStatusData() };
        const { smilData, contentType } = { ...getPlaybackVideoData() };
        const { playerState, playerMode } = playerStatusData;

        if (contentType !== PlaybackType.TRAILER && smilData) {
            //concurrency unlock
            unlockConcurrencyLock(smilData.initialConcurrencyDataFromSMIL);
        }

        // check EBVS
        if (checkForEBVS) {
            const ebvsPlayerState = playerState;
            const ebvsStartTime = getEBVSCheckStartTime();
            checkUserInitiatedEBVS(ebvsStartTime, ebvsPlayerState);
        }

        //mute and pause the video
        if (HTMLPlayer) {
            HTMLPlayer.muted = true;
            HTMLPlayer.pause?.();
        }
        // send player unload event
        sendPlayerUnloadEvent();
        if (playerMode === PlayerMode.FULLSCREEN) {
            toggleLoadingSpinner(true);
        }

        setPlaybackVideoData({} as PlaybackVideoData);
        setPlayerStatusData({} as PlayerStatusData);
        // @ts-ignore
        window.playerWaitingForExit = false;
        this.customPlayerDestroy(Players.DVP);
    };

    /**
     * @name synchronizedUnload
     * @type function
     * @param {any} load
     * @param {any} player
     * @description this function will synchronously unload the player.
     *
     * @author alwin-baby
     */
    synchronizedUnload = (load: any, player: any) => {
        return new Promise<void>((resolve, reject) => {
            load.then(() => {
                player
                    ?.unload()
                    .then(() => {
                        setPlaybackVideoData({} as PlaybackVideoData);
                        setPlayerStatusData({} as PlayerStatusData);
                        // @ts-ignore
                        window.playerWaitingForExit = false;
                        resolve();
                    })
                    .catch((error: any) => {
                        console.warn('> unload error >', error);
                        reject();
                    });
                toggleLoadingSpinner(false);
                resetCanvasAndPlayerStyle();
            });
        });
    };

    /**
     * @name exitPlayer
     * @type function
     * @param {boolean} checkForEBVS - should check for EBVS or not
     * @description this function will unload the playback and will go back to the previous route.
     *
     * @author amalmohann
     */
    exitPlayer = async (checkForEBVS = false) => {
        console.info('> exitPlayer > ');
        if (this.load) {
            this.load.then(async () => {
                const { contentType } = getPlaybackVideoData();
                if (![PlaybackType.TRAILER, PlaybackType.PREVIEW].includes(contentType)) {
                    // Update the continue watching before exit
                    updateContinueWatching();
                    setContinueWatchingProgressLocally();
                    // @ts-ignore
                    clearTimeout(window.progressTimerID);
                    // @ts-ignore
                    window.progressTimerID = null;
                    await this.unloadPlayerVideo(checkForEBVS);
                } else {
                    await this.unloadPlayerVideo(false);
                }

                //route to back
                //ensure the route is in player to avoid multiple back press from back function and inactive
                // if (!Router.isNavigating() && Router.getActiveRoute() === Routes.PLAYER && !(Router.getActiveWidget() as any)) {
                //     Router.back();
                // }
            });
            return;
        }
    };
}

export default PlayerServices;
