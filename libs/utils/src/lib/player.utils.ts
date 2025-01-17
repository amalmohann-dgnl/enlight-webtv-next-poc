/* eslint-disable @typescript-eslint/ban-ts-comment */
import { v4 as uuidv4 } from 'uuid';
import { getState } from './storage.utils';
import {
    authUtilities,
    canvasUtilities,
    commonUtilities,
    configurationUtilities,
    mathUtilities,
    projectUtilities,
    timeUtilities,
} from '.';
import {
    AudioData,
    ConcurrencyData,
    ConcurrencyLockStatus,
    DPlayerDRMConfig,
    DPlayerEvents,
    DRMProvider,
    DRMServers,
    LabelKey,
    ParsedSMIL,
    PlaybackData,
    PlaybackType,
    ErrorConfigurationType,
    QualityData,
    QualityMapping,
    QualityMappingMode,
    Token,
    ConcurrencyLockParam,
    SeekRange,
    SeekMode,
    ShakaError,
    Players,
    PlayerMode,
    Project,
    TextStreamData,
    TextStreamInfo,
    StorageKeys,
    SeekDirection,
    PlayerCustomOptions,
    LicenseServerUrl,
} from '@enlight-webtv/models';

//fetch the utility functions
const { getUrlExtension, isValidValue } = commonUtilities;
const { getLabel, getPlayerConfig } = configurationUtilities;
const { encodeToBase64Token } = authUtilities;
const { generateRandomNumber } = mathUtilities;
const { getCurrentEpochTimeInSeconds } = timeUtilities;
const { setCanvasTransparent, getCanvasInstance, setCanvasBackgroundColor } = canvasUtilities;

     const WIDEVINE_BASE_URL = '';
     const PLAYREADY_BASE_URL = '';
     const MPX_ACCOUNT_ID = '';
     const PLAYBACK_AUTH_URL = '';
    //@ts-ignore

//set the height Mapping quality suffix
const heightMappingQualitySuffix = 'p';
//video player instance and tag
let VIDEO_PLAYER_INSTANCE: any = null;

//set the auto quality data
const autoQuality: QualityData = {
    key: 'auto',
    value: 'Auto',
    quality: { id: 'auto' },
};

/**
 * @name getPlayerInstance
 * @type function
 * @description This function will return the player instance if it there in variable cache / window object
 *
 * @author amalmohann
 */
const getPlayerInstance = () => {
    if (!VIDEO_PLAYER_INSTANCE) {
        //@ts-ignore
        VIDEO_PLAYER_INSTANCE = window.VIDEO_PLAYER_INSTANCE;
    }
    return VIDEO_PLAYER_INSTANCE;
};

/**
 * @name setPlayerInstance
 * @type function
 * @description This function will set the player instance as null in variable cache / window object
 *
 * @author amalmohann
 */
const setPlayerInstance = (instance = null) => {
    VIDEO_PLAYER_INSTANCE = instance;
    //@ts-ignore
    window.VIDEO_PLAYER_INSTANCE = instance;
};

/**
 * @name getHTMLPlayerTag
 * @type function
 * @description This function will return the Video Tag,
 *
 * @author amalmohann
 */
const getHTMLPlayerTag = () => {
    const player = getCreatedPlayer();
    switch (player) {
        case Players.DVP:
            return getPlayerHTMLTagElement('dplayer');
        case Players.ANDROID:
            return null;
        default:
            return null;
    }
};

/**
 * @name getHTMLPlayerContainer
 * @type function
 * @description This function will return the Video player container,
 *
 * @author amalmohann
 */
const getHTMLPlayerContainer = () => {
    const player = getCreatedPlayer();
    switch (player) {
        case Players.DVP:
            return document.getElementById('dplayer');
        case Players.ANDROID:
            return null;
        default:
            return null;
    }
};

/**
 * @name setCreatedPlayer
 * @type function
 * @param {Players} player - player used to create.
 * @description This function will set the created player in the window object.
 *
 * @author amalmohann
 */
const setCreatedPlayer = (player: Players) => {
    //@ts-ignore
    window.created_player = player;
};

/**
 * @name removeCreatedPlayer
 * @type function
 * @description This function will remove the created player in the window object.
 *
 * @author amalmohann
 */
const removeCreatedPlayer = () => {
    //@ts-ignore
    window.created_player = null;
};

/**
 * @name getCreatedPlayer
 * @type function
 * @description This function will return the created player in the window object.
 *
 * @author amalmohann
 */
const getCreatedPlayer = () => {
    //@ts-ignore
    return window.created_player;
};

/**
 * @name getPlayerHTMLTagElement
 * @type function
 * @description This function will return the video tag inside the parent div
 * @param {string} - parent Element Id
 * @returns {HTMLVideoElement} - video tag
 *
 * @author amalmohann
 */
const getPlayerHTMLTagElement = (parentElementId: string) => {
    return document.getElementById(parentElementId)?.getElementsByTagName('video')[0];
};

/**
 * @name preparePlaybackAuthenticationToken
 * @type function/method
 * @description This function will prepare the authentication token for playback
 * @return {Promise<authorization>} - playback authentication token
 *
 * @author amalmohann
 */
let PLAYBACK_AUTH_TOKEN: string | null = null;
const preparePlaybackAuthenticationToken = async (): Promise<string> => {
    if (PLAYBACK_AUTH_TOKEN) {
        return PLAYBACK_AUTH_TOKEN;
    }

    //create auth token
    const { getProjectName } = projectUtilities;
    const project = getProjectName();
    const account = (PLAYBACK_AUTH_URL ?? '') + (MPX_ACCOUNT_ID ?? '');
    const token = await (project === Project.VIDEOTRON ? getState(Token.USER_CONSUMER_TOKEN) : getState(Token.USER_PROFILE_TOKEN));

    switch (project) {
        case Project.ENLIGHT:
        case Project.RALLY_TV:
        case Project.VIDEOTRON:
            PLAYBACK_AUTH_TOKEN = encodeToBase64Token(account, token);
            break;
        case Project.CMGO:
            PLAYBACK_AUTH_TOKEN = `Bearer ${token}`;
            break;
    }

    return PLAYBACK_AUTH_TOKEN;
};

/**
 * @name preparePlayback
 * @type function/method
 * @description This function will parse the string to Playback Data
 * @param {string} formats - playback format
 * @param {string} xmlDocString - string that need to be parsed
 * @return {PlaybackData} -playback data
 *
 * @author amalmohann
 */
const preparePlayback = async (formats: string, xmlDocString: string) => {
    //create auth token
    const authorization = (await preparePlaybackAuthenticationToken()) ?? '';
    const parsedSMIL: ParsedSMIL = parseSMIL(xmlDocString);

    const licenseServerUrl: LicenseServerUrl = { widevine: '', playReady: '' };
    const formatsArray = formats.split(',');
    const DRMProviders = formatsArray.map((format: string) => (format.split('+')?.[1] as DRMProvider) ?? DRMProvider.NONE);
    DRMProviders.forEach((provider: DRMProvider) => {
        if (provider !== DRMProvider.NONE) {
            licenseServerUrl[provider] = frameDRMLicenseURL(parsedSMIL.pid, provider) ?? '';
        }
    });

    const playbackData: PlaybackData = {
      smilData: parsedSMIL,
      licenseServerUrl: licenseServerUrl,
      authorization: authorization,
      mpxAccount: MPX_ACCOUNT_ID,
      drmProvider: DRMProviders,
      thumbnailUrl: '',
    } as unknown as PlaybackData;

    return playbackData;
};

/**
 * @name parseXML
 * @type function/method
 * @description This function will parse the string to XML
 * @param {string} xmlDocString - string that need to be parsed
 * @return {Document} - parsed XML document
 *
 * @author amalmohann
 */
const parseXML = (xmlDocString: string): Document | null => {
    let xmlDoc: Document | null;

    try {
        if (window.DOMParser) {
            const parser = new DOMParser();
            xmlDoc = parser.parseFromString(xmlDocString, 'text/xml');
        } else {
            // Internet Explorer
            //there is no type definition for following
            //@ts-ignore
            xmlDoc = new window.ActiveXObject('Microsoft.XMLDOM');
            //@ts-ignore
            xmlDoc.async = false;
            //@ts-ignore
            xmlDoc.loadXML(xmlDocString);
        }
    } catch (error) {
        xmlDoc = null;
    }

    return xmlDoc;
};

/**
 * @name parseSMIL
 * @type function/method
 * @description This function will parse the string to parsed SMIL
 * @param {string} xmlDocString - string that need to be parsed
 * @return {ParsedSMIL} - parsed SMIL object
 *
 * @author amalmohann
 */
const parseSMIL = (xmlDocString: string): ParsedSMIL => {
    const loadStatus = '';

    //parse the xml document string.
    const smilData: Document | null = parseXML(xmlDocString);
    //set the parsed smil data
    let parsedSmil: ParsedSMIL = {} as ParsedSMIL;
    /**
     * extract the essential properties from the smil file.
     */
    if (smilData) {
        const manifest: string = getManifestFromSMIL(smilData);
        const textStreamInfo: TextStreamInfo[] = getTextTrackInfoFromSMIL(smilData);
        const defaultAudioLang: string = getDefaultAudioLanguageFromSMIL(smilData);
        const thumbnailUrl: string = getThumbnailFromSMIL(smilData);
        const token: string = getTokenFromSMIL(smilData);
        const isException: boolean = checkIsExceptionFromSMIL(smilData);
        const exception: string = getExceptionDetailsFromSMIL(smilData);
        const responseCode: string = getResponseCodeFromSMIL(smilData);
        const updateLockInterval: string = getUpdateLockIntervalFromSMIL(smilData);
        const concurrencyData: ConcurrencyData = getConcurrencyDataFromSMIL(smilData);
        const trackingDataArray: string[] = getTrackingDataArrayFromSMIL(smilData);
        const pid: string = trackingDataArray.length > 0 ? getDataFromTrackingDataByKey('pid', trackingDataArray) : '';
        const title: string = getTitleFromSMIL(smilData);

        //set the lock interval inside the concurrency object;
        concurrencyData.updateLockInterval = updateLockInterval;
        //set the parsed smil data
        parsedSmil = {
            pid,
            responseCode,
            exception,
            isException,
            token,
            manifest,
            loadStatus,
            thumbnailUrl,
            initialConcurrencyDataFromSMIL: concurrencyData,
            title,
            textStreamInfo,
            defaultAudioLang,
        };
    }

    return parsedSmil;
};

/**
 * @name getConcurrencyDataFromSMIL
 * @type function/method
 * @description This function will get the concurrency data from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {ConcurrencyData} - concurrency data
 *
 * @author amalmohann
 */
const getConcurrencyDataFromSMIL = (smilData: Document): ConcurrencyData => {
    //get concurrency data from SMIL
    const lockId = getConcurrencyLockIdFromSMIL(smilData);
    const lockSequenceToken = getConcurrencyLockSequenceTokenFromSMIL(smilData);
    const lock = getConcurrencyLockFromSMIL(smilData);
    const concurrencyServiceUrl = getConcurrencyServiceUrlFromSMIL(smilData);

    //calculate the concurrency lock and unlock urls
    const concurrencyLockUrl = getConcurrencyLockUnlockUrl(concurrencyServiceUrl, ConcurrencyLockStatus.LOCK);
    const concurrencyUnlockUrl = getConcurrencyLockUnlockUrl(concurrencyServiceUrl, ConcurrencyLockStatus.UNLOCK);

    const concurrencyLockParam: ConcurrencyLockParam = {
        id: lockId,
        sequenceToken: lockSequenceToken,
        encryptedLock: lock,
    } as ConcurrencyLockParam;
    //set the concurrency data
    const concurrencyData: ConcurrencyData = {
        concurrencyLockUrl,
        concurrencyUnlockUrl,
        concurrencyLockParam,
        updateLockInterval: '',
    };

    return concurrencyData;
};

/**
 * @name getConcurrencyServiceUrlFromSMIL
 * @type function/method
 * @description This function will get the concurrency service url from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - concurrency service url
 *
 * @author amalmohann
 */
const getConcurrencyServiceUrlFromSMIL = (smilData: Document): string => {
    //get the concurrency server url
    const concurrencyServiceUrlTag: Element | null = smilData.querySelector("meta[name='concurrencyServiceUrl']");
    const concurrencyServiceUrl = concurrencyServiceUrlTag ? concurrencyServiceUrlTag.getAttribute('content') ?? '' : '';
    return concurrencyServiceUrl;
};

/**
 * @name getConcurrencyLockIdFromSMIL
 * @type function/method
 * @description This function will get the concurrency lock id from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - concurrency lock id
 *
 * @author amalmohann
 */
const getConcurrencyLockIdFromSMIL = (smilData: Document): string => {
    //get the lock id
    const lockIdTag: Element | null = smilData.querySelector("meta[name='lockId']");
    const lockId = lockIdTag ? lockIdTag.getAttribute('content') ?? '' : '';
    return lockId;
};

/**
 * @name getConcurrencyLockFromSMIL
 * @type function/method
 * @description This function will get the concurrency lock from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - concurrency lock
 *
 * @author amalmohann
 */
const getConcurrencyLockFromSMIL = (smilData: Document): string => {
    //get the lock
    const lockTag = smilData.querySelector("meta[name='lock']");
    const lock = lockTag ? lockTag.getAttribute('content') ?? '' : '';
    return lock;
};

/**
 * @name getConcurrencyLockSequenceTokenFromSMIL
 * @type function/method
 * @description This function will get the concurrency lock sequence token from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - concurrency lock sequence token
 *
 * @author amalmohann
 */
const getConcurrencyLockSequenceTokenFromSMIL = (smilData: Document): string => {
    //get the lock sequence token
    const lockSequenceTokenTag: Element | null = smilData.querySelector("meta[name='lockSequenceToken']");
    const lockSequenceToken = lockSequenceTokenTag ? lockSequenceTokenTag.getAttribute('content') ?? '' : '';
    return lockSequenceToken;
};

/**
 * @name getUpdateLockIntervalFromSMIL
 * @type function/method
 * @description This function will get the lock interval from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - lock interval
 *
 * @author amalmohann
 */
const getUpdateLockIntervalFromSMIL = (smilData: Document): string => {
    //get the lock interval
    const updateLockIntervalTag: Element | null = smilData.querySelector("meta[name='updateLockInterval']");
    const updateLockInterval = updateLockIntervalTag ? updateLockIntervalTag.getAttribute('content') ?? '' : '';
    return updateLockInterval;
};

/**
 * @name getTrackingDataArrayFromSMIL
 * @type function/method
 * @description This function will get the tracking data from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - tracking data
 *
 * @author amalmohann
 */
const getTrackingDataArrayFromSMIL = (smilData: Document): string[] => {
    ///get tracking data
    const trackingDataParam: Element | null = smilData.querySelector("param[name='trackingData']");
    const trackingDataValue: string = trackingDataParam ? trackingDataParam.getAttribute('value') ?? '' : '';
    const trackingDataValueArray: string[] = trackingDataValue ? trackingDataValue.split('|') ?? [] : [];
    return trackingDataValueArray;
};

/**
 * @name getTextTrackInfoFromSMIL
 * @type function/method
 * @description This function will get the text track (subtitle) Info from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {TextStreamInfo} - textStreamInfo
 *
 * @author amalmohann
 */
const getTextTrackInfoFromSMIL = (smilData: Document): TextStreamInfo[] => {
    const textStreams = smilData.querySelectorAll('textstream');
    const textStreamInfo: TextStreamInfo[] = [] as TextStreamInfo[];
    textStreams?.forEach(textStream => {
        const src = textStream.getAttribute('src');
        const lang = textStream.getAttribute('lang');
        const type = textStream.getAttribute('type');
        textStreamInfo.push({ src, lang, type } as TextStreamInfo);
    });
    return textStreamInfo;
};

/**
 * @name getDefaultAudioLanguageFromSMIL
 * @type function/method
 * @description This function will get the default audio language Info from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - default audio language
 *
 * @author amalmohann
 */
const getDefaultAudioLanguageFromSMIL = (smilData: Document): string => {
    const defaultLangElement = smilData.querySelector("audio[role='main']");
    const defaultLang: string | null = defaultLangElement && defaultLangElement.getAttribute('lang');
    return defaultLang ?? '';
};

/**
 * @name getResponseCodeFromSMIL
 * @type function/method
 * @description This function will get the response code from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - response code
 *
 * @author amalmohann
 */
const getResponseCodeFromSMIL = (smilData: Document): string => {
    //get response code
    const responseCodeParam: Element | null = smilData.querySelector("param[name='responseCode']");
    const responseCode: string = responseCodeParam ? responseCodeParam.getAttribute('value') ?? '' : '';
    return responseCode;
};

/**
 * @name getExceptionDetailsFromSMIL
 * @type function/method
 * @description This function will get the exception details from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - exception details
 *
 * @author amalmohann
 */
const getExceptionDetailsFromSMIL = (smilData: Document): string => {
    //get the exception details from smil
    const exceptionParam: Element | null = smilData.querySelector("param[name='exception']");
    const exception: string = exceptionParam ? exceptionParam.getAttribute('value') ?? '' : '';
    return exception;
};

/**
 * @name checkIsExceptionFromSMIL
 * @type function/method
 * @description This function will check  for the exception from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {boolean} - isException
 *
 * @author amalmohann
 */
const checkIsExceptionFromSMIL = (smilData: Document): boolean => {
    //check for exception in smil
    const isExceptionParam: Element | null = smilData.querySelector("param[name='isException']");
    const isException: string = isExceptionParam ? isExceptionParam.getAttribute('value') ?? '' : '';
    return Boolean(isException);
};

/**
 * @name getTokenFromSMIL
 * @type function/method
 * @description This function will get the token from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - token
 *
 * @author amalmohann
 */
const getTokenFromSMIL = (smilData: Document): string => {
    //get the token from the smil
    const param: Element | null = smilData.querySelector("param[name='token']");
    const token: string = param ? param.getAttribute('value') ?? '' : '';
    return token;
};

/**
 * @name getManifestFromSMIL
 * @type function/method
 * @description This function will get the manifest from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - manifest
 *
 * @author amalmohann
 */
const getManifestFromSMIL = (smilData: Document): string => {
    //get the video tag and the manifest url
    const video: HTMLVideoElement | undefined = smilData.getElementsByTagName('video')[0];
    const manifest: string = video ? video.getAttribute('src') ?? '' : '';
    return manifest;
};

/**
 * @name getThumbnailFromSMIL
 * @type function/method
 * @description This function will get the  thumbnail from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} -  thumbnail
 *
 * @author amalmohann
 */
const getThumbnailFromSMIL = (smilData: Document): string => {
    //get the thumbnail
    const thumbnailElement: Element | undefined = smilData.getElementsByTagName('imagestream')?.[0];
    const thumbnailUrl: string = thumbnailElement ? thumbnailElement.getAttribute('src') ?? '' : '';
    return thumbnailUrl;
};

/**
 * @name getTitleFromSMIL
 * @type function/method
 * @description This function will get the title from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string | undefined} -  title
 *
 * @author anandpatel
 */
const getTitleFromSMIL = (smilData: Document): string => {
    // get the title
    const refNode = smilData.getElementsByTagName('ref')?.[0];
    const titleAttribute = refNode?.getAttribute('title') || '';
    return titleAttribute;
};

/**
 * @name getDataFromTrackingDataByKey
 * @type function/method
 * @description This function will get the value corresponding to the key passed if any from the SMIL
 * @param {Document} smilData - parsed SMIL data
 * @return {string} - value
 *
 * @author amalmohann
 */
const getDataFromTrackingDataByKey = (key: string, trackingDataArray: string[]): string => {
    let value = '';
    //get loop through the tracking data
    for (const trackingData of trackingDataArray) {
        const dataPair = trackingData.split('=');
        if (dataPair && dataPair[0] === key && dataPair[1]) {
            value = dataPair[1];
            break;
        }
    }
    return value;
};

/**
 * @name getConcurrencyLockUnlockUrl
 * @type function/method
 * @description This function will get the concurrency lock url and unlock url
 * @param {string} serviceUrl - service url
 * @param {ConcurrencyLockStatus} status - status for which the url need to generated
 * @return {string} - concurrency lock url
 *
 * @author amalmohann
 */
const getConcurrencyLockUnlockUrl = (serviceUrl: string, status: ConcurrencyLockStatus): string => {
    const uuid = generateRandomNumber();
    //get the concurrency server url
    let concurrencyLockUnlockUrl = `${serviceUrl}/web/Concurrency/${status}?form=json&schema=1.0&`;
    if (uuid) concurrencyLockUnlockUrl += `_clientId=${window.encodeURIComponent(uuid)}`;
    return concurrencyLockUnlockUrl;
};

/**
 * @name frameDRMLicenseURL
 * @type function/method
 * @description This function will parse the string to XML
 * @param {string} pid - pid parsed from the SMIL
 * @return {string} - license URL
 *
 * @author amalmohann
 */
const frameDRMLicenseURL = (pid: string, drmProvider: DRMProvider = DRMProvider.NONE) => {
    const { getProjectName } = projectUtilities;
    const uuid = uuidv4();
    const project = getProjectName();
    let licenseUrl = '';

    if (drmProvider !== DRMProvider.NONE) {
        switch (project) {
            case Project.RALLY_TV:
            case Project.VIDEOTRON:
                if (drmProvider === DRMProvider.WIDEVINE) {
                    licenseUrl = WIDEVINE_BASE_URL + `${pid}&cid=${uuid}`;
                } else if (DRMProvider.PLAYREADY) {
                    licenseUrl = PLAYREADY_BASE_URL + `${pid}&cid=${uuid}`;
                }
                break;
            case Project.CMGO:
                if (drmProvider === DRMProvider.WIDEVINE) {
                    licenseUrl = WIDEVINE_BASE_URL + `?cid=${uuid}`;
                } else if (DRMProvider.PLAYREADY) {
                    licenseUrl = PLAYREADY_BASE_URL;
                }
                break;
        }
    }

    return licenseUrl;
};

/**
 * @name createDRMConfiguration
 * @type function
 * @description This function will create the DRM configuration needed for the video player
 * based on the some parameters. currently supports for wideVine and playReady.
 * @param { LicenseServerUrl } licenseServerUrl - constructed server urls
 * @return {DPlayerDRMConfig} - DRM protection configuration object for player
 *
 * @author amalmohann
 */
const createDRMConfiguration = (licenseServerUrl: LicenseServerUrl): DPlayerDRMConfig => {
    const drm: DPlayerDRMConfig = {} as DPlayerDRMConfig;
    const drmServer: DRMServers = {} as DRMServers;
    licenseServerUrl[DRMProvider.WIDEVINE] !== '' && (drmServer['com.widevine.alpha'] = licenseServerUrl[DRMProvider.WIDEVINE]);
    licenseServerUrl[DRMProvider.PLAYREADY] !== '' && (drmServer['com.microsoft.playready'] = licenseServerUrl[DRMProvider.PLAYREADY]);
    drm.servers = drmServer;
    return drm;
};

/**
 * @name updatePlayerSize
 * @type function
 * @description This function will update the player size.
 *
 * @author anandpatel
 */
const updatePlayerSize = (playerMode: PlayerMode) => {
    const videoPlayer = getHTMLPlayerTag();
    if (videoPlayer) {
        switch (playerMode) {
            case PlayerMode.FULLSCREEN:
                videoPlayer.style.width = '100vw';
                videoPlayer.style.height = '100vh';
                break;

            case PlayerMode.MINIPLAYER:
                videoPlayer.style.width = '53vw';
                videoPlayer.style.height = '30vw';
                break;
        }
    }
};

/**
 * @name setupPlayerStyle
 * @type function
 * @description This function will setup all the styles for the player.
 *
 * @author amalmohann
 */
const setupCanvasAndPlayerStyle = (playerMode: PlayerMode) => {
    const videoPlayer = getHTMLPlayerTag();
    const videoPlayerContainer = getHTMLPlayerContainer();
    const canvas = getCanvasInstance();

    if (videoPlayer && canvas) {
        // Update the canvas style if canvas is present
        switch (playerMode) {
            case PlayerMode.FULLSCREEN: {
                videoPlayerContainer && (videoPlayerContainer.style.height = '100vh');
                canvas.style.zIndex = '2';
                setCanvasTransparent(canvas);
                videoPlayer.style.position = 'absolute';
                videoPlayer.style.width = '100vw';
                videoPlayer.style.height = '100vh';
                videoPlayer.style.scale = '1';
                videoPlayer.style.zIndex = '-1';
                break;
            }
            case PlayerMode.MINIPLAYER: {
                if (videoPlayerContainer) {
                    videoPlayerContainer.style.overflow = 'hidden';
                    videoPlayerContainer.style.height = '55vh';
                }
                videoPlayer.style.position = 'absolute';
                videoPlayer.style.width = '53vw';
                videoPlayer.style.height = '30vw';
                videoPlayer.style.top !== '-50px' && (videoPlayer.style.top = '0');
                videoPlayer.style.right = '0';
                videoPlayer.style.zIndex = '-1';
                videoPlayer.style.overflow = 'hidden';
                videoPlayer.style.scale = '1.3';
                videoPlayer.style.transition = 'right 0.2s ease-out, top 0.1s ease-out';
                canvas.style.zIndex = '2';
                setCanvasTransparent(canvas);
                break;
            }
        }
    }
};

/**
 * @name resetCanvasAndPlayerStyle
 * @type function
 * @description This function will setup all the styles for the player.
 *
 * @author amalmohann
 */
const resetCanvasAndPlayerStyle = () => {
    const videoPlayer = getHTMLPlayerTag();
    const videoPlayerContainer = getHTMLPlayerContainer();
    const canvas = getCanvasInstance();
    const canvasColor = getState(StorageKeys.APP_BACKGROUND_COLOR);
    if (canvas && canvasColor) {
        setCanvasBackgroundColor(canvas, canvasColor);
    }
    if (videoPlayer && canvas) {
        videoPlayer.style.right = '0';
        if (videoPlayerContainer) {
            videoPlayerContainer.style.transform = 'none';
            videoPlayerContainer.style.top = '0px';
        }
    }
};

/**
 * @name addPlayerEventListener
 * @type function
 * @description This function will setup all the event listeners for the playback in the player.
 * @param { any } player - A Reference to the video tag.
 * @param { DPlayerEvents } event - event name
 * @param { (event: any) => any } callback - callback function
 *
 * @author amalmohann
 */
const addPlayerEventListener = (player: any, event: DPlayerEvents, callback: (event?: any) => any) => {
    player.on(event, callback);
};

/**
 * @name getPlayerErrorType
 * @type function
 * @description This function will get the error type of the video player
 * @param { any } errLog - error from the player
 * @return { ErrorConfigurationType } - player error type
 *
 * @author amalmohann
 */
const getPlayerErrorType = (errLog: any): ErrorConfigurationType => {
    //get the url extension
    const url: string = errLog?.data?.[0];
    const urlExtension = url ? getUrlExtension(url) : null;

    let errorType: ErrorConfigurationType;

    //check for the error types
    if (urlExtension && errLog && ['m3u8', 'mpd'].indexOf(urlExtension) > -1) {
        errorType = ErrorConfigurationType.MANIFEST_FAILED;
    } else if (urlExtension && ['m4a', 'm4v', 'm4i'].indexOf(urlExtension) > -1) {
        errorType = ErrorConfigurationType.PLAYER_SEGMENT_FAILED;
    } else {
        const errorCode = errLog?.detail?.code;
        switch (errorCode) {
            case ShakaError.REQUESTED_KEY_SYSTEM_CONFIG_UNAVAILABLE:
            case ShakaError.FAILED_TO_CREATE_CDM:
            case ShakaError.FAILED_TO_ATTACH_TO_VIDEO:
            case ShakaError.INVALID_SERVER_CERTIFICATE:
            case ShakaError.FAILED_TO_CREATE_SESSION:
            case ShakaError.FAILED_TO_GENERATE_LICENSE_REQUEST:
            case ShakaError.LICENSE_REQUEST_FAILED:
            case ShakaError.LICENSE_RESPONSE_REJECTED:
            case ShakaError.ENCRYPTED_CONTENT_WITHOUT_DRM_INFO:
            case ShakaError.NO_LICENSE_SERVER_GIVEN:
            case ShakaError.OFFLINE_SESSION_REMOVED:
            case ShakaError.EXPIRED:
            case ShakaError.SERVER_CERTIFICATE_REQUIRED:
            case ShakaError.INIT_DATA_TRANSFORM_ERROR:
            case ShakaError.SERVER_CERTIFICATE_REQUEST_FAILED:
            case ShakaError.MIN_HDCP_VERSION_NOT_MATCH:
            case ShakaError.ERROR_CHECKING_HDCP_VERSION:
                errorType = ErrorConfigurationType.DRM_FAILED;
                break;
            default:
                errorType = ErrorConfigurationType.PLAYBACK_GENERIC;
                break;
        }
    }
    return errorType;
};

/**
 * @name generateFocusIndex
 * @type function
 * @description This function will get focusable indexes of the player UI
 * @param { PlaybackType } playbackType - type of the playback
 * @param { boolean } isBackToLive - is back to live enabled
 * @return { number[] } - focusable indexes
 *
 * @author amalmohann
 */
const generateFocusIndex = (playbackType: PlaybackType, isBackToLive?: boolean, disableLanguageSwitch?: boolean, showSettingsIcon?: boolean) => {
    let focusableIndexes = [0, 3, 4];
    switch (playbackType) {
        case PlaybackType.LIVE:
            if (isBackToLive && isBackToLive === true) {
                focusableIndexes = [0, 1, 3, 4];
                break;
            }
            focusableIndexes = [0, 3, 4];
            break;
        case PlaybackType.VOD_SERIES:
            focusableIndexes = [0, 2, 3, 4];
            break;
        case PlaybackType.VOD:
            focusableIndexes = [0, 3, 4];
            break;
    }

    //Remove item 3 (language switch option) from gaining focus, if its disabled
    if (disableLanguageSwitch) {
        const index = focusableIndexes.indexOf(3);
        if (index !== -1) focusableIndexes.splice(index, 1);
    }

    //Remove item 4 (settings option) from gaining focus, if its not shown
    if (!showSettingsIcon) {
        const index = focusableIndexes.indexOf(4);
        if (index !== -1) focusableIndexes.splice(index, 1);
    }

    return focusableIndexes;
};

/**
 * @name getPlaybackType
 * @type function
 * @description This function will get focusable indexes of the player UI
 * @param { string | undefined } seriesId - series Id
 * @param { boolean } isLive - is live or not
 * @return { number[] } - focusable indexes
 *
 * @author amalmohann
 */
const getPlaybackType = (isLive: boolean, seriesId: string | undefined, isSchedule: boolean): PlaybackType => {
    if (isLive) {
        return PlaybackType.LIVE;
    } else {
        if (seriesId && !isSchedule) {
            return PlaybackType.VOD_SERIES;
        }
        return PlaybackType.VOD;
    }
};

/**
 * @name getCurrentTimeOffset
 * @type function
 * @description This function will get the time difference between the player
 * time and the local current time. This is used when calculating the current time
 * thrown by the player and rectify the issues due to time difference while seeking.
 * @param { any } player - player
 * @param { PlaybackType } playbackType - playback content type
 * @return { number } - offset
 *
 * @author amalmohann
 */
const getCurrentTimeOffset = (player: any, playbackType: PlaybackType): number => {
    //No special handling is needed for Non Live type.
    if (playbackType !== PlaybackType.LIVE) {
        return 0;
    }

    //fetch the current time from player, local system time and calculate the time offset
    const currentTimeFromPlayer = player.getCurrentTime();
    const currentTimeInSeconds = getCurrentEpochTimeInSeconds();
    const currentTimeOffset = currentTimeFromPlayer - currentTimeInSeconds;

    return currentTimeOffset;
};

/**
 * @name getCurrentTimeFromPlayer
 * @type function
 * @description This function will get the current time from the player. This
 * function also handles some of the special cases.
 * @param { any } player - player
 * @param { number } timeOffset - time offset of current time and current player time
 * @param { PlaybackType } playbackType - playback content type
 * @return { number } - current time
 *
 * @author amalmohann
 */
const getCurrentTimeFromPlayer = (player: any, timeOffset: number, playbackType: PlaybackType): number => {
    /** Adding offset so that all logic related with seeking and time update can be done normally,
     * without considering the wrong value time given by the player. */
    const currentTimeFromPlayer = player?.getCurrentTime ? player.getCurrentTime() - timeOffset : 0;

    //No special handling is needed for Non Live type.
    if (playbackType !== PlaybackType.LIVE) {
        return currentTimeFromPlayer;
    }

    //check if the current actual time is less than the player time and returning the lowest time.
    const currentActualTime = getCurrentEpochTimeInSeconds();

    //setting the maximum time as the current time.
    const currentTime = currentTimeFromPlayer > currentActualTime ? currentActualTime : currentTimeFromPlayer;

    return currentTime;
};

/**
 * @name getDurationFromPlayer
 * @type function
 * @description This function will get the total duration time from the player.
 * @param { any } player - player
 * @return { number } - duration time
 *
 * @author amalmohann
 */
const getDurationFromPlayer = (player: any): number => {
    return player?.getDuration ? player.getDuration() : 0;
};

/**
 * @name getBufferedContentLength
 * @type function
 * @description This function will get the Buffered content length from the player.
 * @param { any } player - player
 * @return { number } - Buffered content length
 *
 * @author amalmohann
 */
const getBufferedContentLength = (player: any): number => {
    return player?.getBufferedInfo ? player.getBufferedInfo() : 0;
};

/**
 * @name getSeekingOffset
 * @type function
 * @description This function will get duration to seek on each button press
 * @param { SeekMode }  mode
 * @param { SeekDirection }  direction - Direction of seeking
 * @param { Record<string, number> }  thumbnailMap
 * @param {number} currentSeekPositionTime - Current seek postion
 *
 * @author amalmohann
 */
let PLAYER_CONFIG: any = null;
const getSeekingOffset = (mode: SeekMode, direction: SeekDirection, thumbnailMap: Record<string, number>, currentSeekPositionTime: number) => {
    if (PLAYER_CONFIG) {
        PLAYER_CONFIG = getPlayerConfig();
    }
    let seekingOffset = 0;
    const closestTimeArray = Object.keys(thumbnailMap).map(key => Number(key));
    closestTimeArray.sort((a, b) => a - b);
    switch (mode) {
        /* In the case of a filmstrip, each seekposition will correspond to the time defined for an image in the filmstrip.
        This is will be the closest image relative to the current seek postion and seek direction.
        If the closest strip Image is closer than the threshhold value compared to the current seek position, then that image in the strip
        is skipped for the next closest image in the strip.*/
        case SeekMode.FILMSTRIP: {
            if (!isValidValue(closestTimeArray) || !isValidValue(currentSeekPositionTime) || !direction) {
                return 0;
            }

            let closestImageWithThreshold: number | null = null;
            let closestImageWithoutThreshold: number | null = null;
            const minimumSeekThreshhold = 10;

            if (direction === SeekDirection.BACKWARD) {
                for (const time of closestTimeArray) {
                    const timeGap = time - currentSeekPositionTime;

                    // Check for numbers meeting the threshold condition
                    if (timeGap + minimumSeekThreshhold < 0) {
                        if (closestImageWithThreshold === null || time > closestImageWithThreshold) {
                            closestImageWithThreshold = time;
                        }
                    }

                    if (timeGap < 0) {
                        if (closestImageWithoutThreshold === null || time > closestImageWithoutThreshold) {
                            closestImageWithoutThreshold = time;
                        }
                    }
                }
            } else {
                for (const time of closestTimeArray) {
                    const timeGap = time - currentSeekPositionTime;

                    // Check for numbers meeting the threshold condition
                    if (timeGap >= minimumSeekThreshhold) {
                        if (closestImageWithThreshold === null || time < closestImageWithThreshold) {
                            closestImageWithThreshold = time;
                        }
                    }

                    if (timeGap > 0) {
                        if (closestImageWithoutThreshold === null || time < closestImageWithoutThreshold!) {
                            closestImageWithoutThreshold = time;
                        }
                    }
                }
            }

            // If no position matching the threshhold is found then use the result without the threshold check
            seekingOffset =
                (closestImageWithThreshold ?? closestImageWithoutThreshold ?? (direction === SeekDirection.FORWARD ? Infinity : -Infinity)) -
                currentSeekPositionTime;

            return seekingOffset;
        }
        case SeekMode.FRAME:
        default:
            seekingOffset =
                (direction === SeekDirection.FORWARD
                    ? PLAYER_CONFIG?.fullScreenConfig[0]?.fwdDuration
                    : PLAYER_CONFIG?.fullScreenConfig[0]?.rewDuration) ?? 10;
            break;
    }

    return direction === SeekDirection.FORWARD ? seekingOffset : -seekingOffset;
};

/**
 * @name qualityHeightMapping
 * @type function
 * @description This function will map all quality based on the height from the player.
 * @param { any } qualities - qualities got from player.
 * @param { QualityMapping[] } qualityMapping - quality mapping from configuration.
 * @return { QualityData[] } - return the mapped quality
 *
 * @author amalmohann
 */

const qualityHeightMapping = (qualities: any): QualityData[] => {
    // STEP 1: Sort all available qualities based on the video band width
    const sortedQualities = qualities.sort((a: any, b: any) => b.videoBandwidth - a.videoBandwidth); // Descending sort
    // STEP 2: One-to-One mapping of all qualities to quality label
    let mappedQualities: QualityData[] = sortedQualities.map((quality: any) => {
        return {
            key: quality.height,
            value: quality.height + heightMappingQualitySuffix,
            quality: quality,
        };
    });
    //Filter the qualities to avoid duplications and items with no mapping
    mappedQualities = mappedQualities.filter((qual: any, index: number) => mappedQualities.findIndex(q => q.value === qual.value) === index);

    return [autoQuality, ...mappedQualities];
};

/**
 * @name qualityHeightMapMapping
 * @type function
 * @description This function will map all quality from the player based on height map
 * @param { any } qualities - qualities got from player.
 * @param { QualityMapping[] } qualityMapping - quality mapping from configuration.
 * @return { QualityData[] } - return the mapped quality
 *
 * @author amalmohann
 */
const qualityHeightMapMapping = (qualities: any, qualityMapping: QualityMapping[]): QualityData[] => {
    // STEP 1: Sort all available qualities based on the video band width
    // const sortedQualities = qualities.sort((a: any, b: any) => a.videoBandwidth - b.videoBandwidth); // Accenting sort
    // STEP 2: One-to-One mapping of all qualities to quality label
    let mappedQualities: QualityData[] = qualities.map((quality: any) => {
        //filter the label mapping from the configuration and assign the label to the quality
        const filteredQuality: QualityMapping[] = qualityMapping.filter((qualityMap: QualityMapping) => qualityMap.key === quality.height.toString());
        const qualityLabel = filteredQuality && filteredQuality.length > 0 ? filteredQuality[0]?.value : '';

        return {
            key: quality.height,
            value: qualityLabel,
            quality: quality,
        };
    });

    //Filter the qualities to avoid duplications and items with no mapping
    mappedQualities = mappedQualities.filter(
        (qual: any, index: number) => mappedQualities.findIndex((q: any) => q.value === qual.value) === index && qual.value && qual.value !== '',
    );

    return [...mappedQualities, autoQuality];
};

/**
 * @name qualityHeightBitrateIndexMapping
 * @type function
 * @description This function will map all quality from the player.
 * @param { any } qualities - qualities got from player.
 * @param { QualityMapping[] } qualityMapping - quality mapping from configuration.
 * @return { QualityData[] } - return the mapped quality
 *
 * @author amalmohann
 */
const qualityHeightBitrateIndexMapping = (qualities: any, qualityMapping: QualityMapping[]): QualityData[] => {
    // STEP 1: Sort all available qualities based on the video band width
    const sortedQualities = qualities.sort((a: any, b: any) => b.videoBandwidth - a.videoBandwidth); // Descending sort

    // STEP 2: Find the height corresponding to highest bitrate
    const maxHeight = sortedQualities?.[0]?.height;

    // STEP 3: Filtering all mapping for the max height
    const maxheightRegex = new RegExp(`^${maxHeight}`);
    const mappings = qualityMapping?.filter((q: any) => maxheightRegex?.test(q.key));

    // STEP 4: Converting config mappings to corresponding quality.
    const mappedQualities: QualityData[] = mappings?.map((q: any) => {
        const index = (q.key.match(/\[(\d+)\]/) || [])[1];
        return {
            ...q,
            quality: qualities[index],
        };
    });

    return [...mappedQualities, autoQuality];
};

/**
 * @name processQualitiesFromPlayer
 * @type function
 * @description This function will process all quality from the player.
 * @param { QualityMappingMode } qualityMappingMode - quality mapping mode
 * @param { QualityMapping[] } qualityMapping - quality mapping
 * @param { any } qualities - qualities
 * @return { QualityData[] | undefined } processed Quality Data
 *
 * @author amalmohann
 */
const processQualitiesFromPlayer = (
    qualityMappingMode: QualityMappingMode,
    qualityMapping: QualityMapping[],
    qualities: any,
): QualityData[] | undefined => {
    //return if no quality mapping or qualities are there.
    if (!qualityMappingMode || !qualities) return;

    let processedQuality: QualityData[] = [] as QualityData[];
    //process the quality mapping based on the quality mapping mode.
    switch (qualityMappingMode) {
        case QualityMappingMode.HEIGHT:
            processedQuality = qualityHeightMapping(qualities);
            break;
        case QualityMappingMode.HEIGHT_MAP:
            processedQuality = qualityHeightMapMapping(qualities, qualityMapping);
            break;
        case QualityMappingMode.HEIGHT_RANGE:
            // Handle the quality mapping based on HEIGHT_RANGE
            break;
        case QualityMappingMode.BITRATE_MAP:
            // Handle the quality mapping based on BITRATE_MAP
            break;
        case QualityMappingMode.BITRATE_RANGE:
            // Handle the quality mapping based on BITRATE_RANGE
            break;
        case QualityMappingMode.HEIGHT_BITRATE_INDEX:
            processedQuality = qualityHeightBitrateIndexMapping(qualities, qualityMapping);
            break;
        default:
            //set height mode as default
            processedQuality = qualityHeightMapping(qualities);
            break;
    }

    return processedQuality;
};

/**
 * @name processAudioFromPlayer
 * @type function
 * @description This function will process all audio from the player.
 * @param { any[] } audio - audios
 * @return {AudioData[] | undefined} processed audio data
 *
 * @author amalmohann
 */
const processAudioFromPlayer = (audios: any[]): AudioData[] | undefined => {
    //return if no audio mapping are there.
    if (!audios || audios.length <= 0) return;

    //process the audio and map the label corresponding to audio from configuration
    const processedAudio: AudioData[] = audios.flatMap((audio: any, index: number) => {
        const audioValue = getLabel(LabelKey.LABEL_PLAYER_AUDIO + `${audio.label}`);

        // Only map the audio if its available
        if (typeof audioValue === 'string')
            return [
                {
                    key: audio.lang,
                    value: audioValue,
                    audio: audio,
                    index,
                } as AudioData,
            ];
        else return [];
    });

    return processedAudio;
};

/**
 * @name processSubtitleFromPlayer
 * @type function
 * @description This function will process all text streams from the player.
 * @param { any[] } textStream - audios
 * @return {TextStreamData[] | undefined} processed audio data
 *
 * @author amalmohann
 */
const processSubtitleFromPlayer = (textStreams: any[]): TextStreamData[] | undefined => {
    //return if no subtitle mapping are there.
    if (!textStreams || textStreams.length <= 0) return;
    const noSubtitle: TextStreamData = {
        key: 'off',
        value: getLabel(LabelKey.LABEL_PLAYER_NO_SUBTITLE) as string,
        textStream: { id: PlayerCustomOptions.SUBTITLE_DISABLE, active: true, lang: PlayerCustomOptions.SUBTITLE_DISABLE, label: 'none' },
    };

    //process the subtitle and map the label corresponding to subtitle from configuration
    const processedTextStream: TextStreamData[] = textStreams.flatMap((stream: any) => {
        const subtitleValue = getLabel(LabelKey.LABEL_PLAYER_SUBTITLE + `${stream.label}`);
        // Only map the subtitle if its available
        if (typeof subtitleValue === 'string')
            return [
                {
                    key: stream.lang,
                    value: subtitleValue,
                    textStream: stream,
                } as TextStreamData,
            ];
        else return [];
    });

    //remove the duplicate elements
    const uniqueTextStreamData = processedTextStream.filter((item, index, self) => index === self.findIndex(t => t.value === item.value));

    if (uniqueTextStreamData.length > 0) {
        uniqueTextStreamData.unshift(noSubtitle);
    }
    return uniqueTextStreamData;
};

/**
 * @name getMediaIsLive
 * @type function
 * @description This function will return true if the media is a live media
 * @param {any} player - the player instance
 * @return {boolean} - isLive
 *
 * @author amalmohann
 */
const getMediaIsLive = (player: any) => {
    //fetch manifest from the player
    const presentation = player.getManifest();
    //check for is live and checking if the duration is coming as infinity
    const isLive = presentation?.presentationTimeline?.isLive() || (player?.getDuration && player.getDuration() === Infinity);
    return isLive;
};

/**
 * @name processThumbnailsForSeekbarPreview
 * @type function
 * @description This function will process the thumbnails and map it with the playback time.
 * @param {string[]} thumbnails - thumbnail images
 * @param {number} duration - duration of the video
 * @param {number} duration - duration of the video
 *
 * @author amalmohann
 */
export const processThumbnailsForSeekbarPreview = (thumbnails: string[], duration: number) => {
    // Initialize an empty object to store the mapping
    const thumbnailMap: any = {};
    const thumbnailCount = thumbnails.length;
    const thumbnailMaxIndex = thumbnails.length - 1;

    // Loop through the thumbnails and calculate the time and corresponding index
    for (let i = 0; i < thumbnailCount; i++) {
        // Calculate the progress percentage based on the current thumbnail index
        const progressPercentage: number = i / thumbnailMaxIndex;
        // Calculate the time corresponding to the progress percentage
        const time: number = progressPercentage * duration;
        // Store the time-index mapping in the object
        thumbnailMap[time] = i;
    }

    // Return the created thumbnail map object
    return thumbnailMap as Record<string, number>;
};

/**
 * @name mapSeekPreviewThumbnails
 * @type function
 * @description This function will process the seek preview thumbnails and will process it
 * to a map with the time as key and the index of the image as the value.
 * @param {string[]} thumbnails - thumbnails for the seek preview.
 * @param {number} duration - total duration of the video
 *
 * @return {Record<never, number> | undefined} the processed thumbnail map
 *
 * @author amalmohann
 */
const mapSeekPreviewThumbnails = (thumbnails: string[] | undefined, duration: number): Record<string, number> | undefined => {
    //return if no thumbnail url was found or duration is not found or playback type is LIVE
    if (!thumbnails || thumbnails.length <= 0 || !duration) return;

    //process the thumbnail
    const processedThumbnails = processThumbnailsForSeekbarPreview(thumbnails, duration);

    return processedThumbnails;
};

/**
 * @name splitThumbnailSpriteImage
 * @type function
 * @description This function will process the seek preview sprite image into small thumbnails.
 * @param {any} spriteImage - thumbnails for the seek preview.
 * @param {number} stripWidth - width to which the image needs to be stripped.
 * @param {number} stripHeight - height to which the image needs to be stripped.
 * @return {string[]} the processed thumbnails
 *
 * @author amalmohann
 */
const splitThumbnailSpriteImage = (spriteImage: any, stripWidth = 320, stripHeight = 180): string[] => {
    const numHorizontalStrips = Math.ceil(spriteImage.width / stripWidth); // Number of horizontal small strips
    const numVerticalStrips = Math.ceil(spriteImage.height / stripHeight); // Number of vertical small strips
    const thumbnails = [];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = stripWidth;
    canvas.height = stripHeight;

    for (let y = 0; y < numVerticalStrips; y++) {
        for (let x = 0; x < numHorizontalStrips; x++) {
            ctx?.clearRect(0, 0, stripWidth, stripHeight);
            ctx?.drawImage(spriteImage, x * stripWidth, y * stripHeight, stripWidth, stripHeight, 0, 0, stripWidth, stripHeight);
            const smallStrip = new Image();
            smallStrip.src = canvas.toDataURL();
            thumbnails.push(smallStrip.src);
        }
    }
    return thumbnails;
};

/**
 * @name calculateLiveSeekBarPosition
 * @type function
 * @description This function will Calculate the seek bar position based on the playing time within a specified time range.
 * @param {number} playingTimeInSec - The time at which the media is currently playing in epoch time (seconds).
 * @param {number} currentTimeInSec -  The current time in epoch time (seconds).
 * @param {number} startTimeDifference - The configurable number of hours for the start time
 * @returns The seek bar position as a percentage between 0 and 1.
 *
 * @author amalmohann
 */
function calculateLiveSeekBarPosition(playingTimeInSec: number, currentTimeInSec: number, startTimeDifference: number): number {
    // Convert epoch times to milliseconds then to Date object
    const currentTime = new Date(currentTimeInSec * 1000);
    let playingTime = new Date(playingTimeInSec * 1000);

    // Ensure playingTime is not later than the current time
    playingTime = playingTime > currentTime ? currentTime : playingTime;

    // Calculate the start time (x hours before current time)
    const startTime = new Date(currentTime.getTime() - startTimeDifference * 60 * 60 * 1000);

    // Calculate the total time range
    const totalTimeRange = currentTime.getTime() - startTime.getTime();

    // Calculate the percentage of playing time within the total time range
    const percentPosition = (playingTime.getTime() - startTime.getTime()) / totalTimeRange;

    return percentPosition;
}

/**
 * @name calculateLiveSeekBarPosition
 * @type function
 * @description This function will Calculate the seconds by which current Playing Time is behind current Live Time.
 * @param {number} currentPlayingTime - The current playing time in epoch time (seconds).
 * @param {number} currentLiveTime - The current live time in epoch time (seconds).
 * @returns The number of seconds by which currentPlayingTime is behind currentLiveTime.
 *
 * @author amalmohann
 */
function calculateSecondsBehindLiveTime(currentPlayingTime: number, currentLiveTime: number): number {
    // Ensure currentPlayingTime is not later than currentLiveTime
    const currentPlaybackTime = currentPlayingTime > currentLiveTime ? currentLiveTime : currentPlayingTime;

    // Calculate the difference in seconds
    const differenceInSeconds = currentLiveTime - currentPlaybackTime;
    const secondsBehind = differenceInSeconds >= 0 ? differenceInSeconds : 0;

    return secondsBehind;
}

/**
 * @name getSeekPosition
 * @type function
 * @description This function will return the calculated seek position
 * @param {number} seekStartTime - seek start time
 * @param {number} seekOffset - seek offset
 * @param {SeekRange} seekRange - seek range
 *
 * @author amalmohann
 */
const getSeekPosition = (seekStartTime: number, seekOffset: number, seekRange: SeekRange) => {
    let seekPosition = seekRange.minimum;
    const calculatedNewPosition = seekStartTime + seekOffset;
    if (calculatedNewPosition > seekRange.minimum) seekPosition = calculatedNewPosition;
    if (calculatedNewPosition >= seekRange.maximum) seekPosition = seekRange.maximum - 1;
    return seekPosition;
};

export {
    getPlayerInstance,
    setPlayerInstance,
    getHTMLPlayerTag,
    getHTMLPlayerContainer,
    getCreatedPlayer,
    setCreatedPlayer,
    removeCreatedPlayer,
    getPlayerHTMLTagElement,
    parseXML,
    parseSMIL,
    frameDRMLicenseURL,
    preparePlayback,
    preparePlaybackAuthenticationToken,
    getConcurrencyDataFromSMIL,
    getManifestFromSMIL,
    getConcurrencyServiceUrlFromSMIL,
    getConcurrencyLockUnlockUrl,
    getDataFromTrackingDataByKey,
    getThumbnailFromSMIL,
    getTokenFromSMIL,
    checkIsExceptionFromSMIL,
    getExceptionDetailsFromSMIL,
    getResponseCodeFromSMIL,
    getTrackingDataArrayFromSMIL,
    getUpdateLockIntervalFromSMIL,
    getConcurrencyLockSequenceTokenFromSMIL,
    getConcurrencyLockFromSMIL,
    getConcurrencyLockIdFromSMIL,
    setupCanvasAndPlayerStyle,
    resetCanvasAndPlayerStyle,
    createDRMConfiguration,
    addPlayerEventListener,
    getPlayerErrorType,
    generateFocusIndex,
    getPlaybackType,
    getCurrentTimeOffset,
    getCurrentTimeFromPlayer,
    getDurationFromPlayer,
    getBufferedContentLength,
    processQualitiesFromPlayer,
    qualityHeightBitrateIndexMapping,
    qualityHeightMapping,
    processAudioFromPlayer,
    getMediaIsLive,
    calculateLiveSeekBarPosition,
    calculateSecondsBehindLiveTime,
    getSeekPosition,
    getSeekingOffset,
    getTitleFromSMIL,
    getDefaultAudioLanguageFromSMIL,
    getTextTrackInfoFromSMIL,
    mapSeekPreviewThumbnails,
    splitThumbnailSpriteImage,
    processSubtitleFromPlayer,
    updatePlayerSize,
};
