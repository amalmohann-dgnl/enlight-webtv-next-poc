'use client'
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { PlaybackServices, ProfileServices } from '@enlight-webtv/network-services';
import { PlaybackDataServices } from '.';
import { Platform, SetPlaybackProgressRequest, RailContentModel, StorageKeys, ContentResponse, Routes, ContentType } from '@enlight-webtv/models';
import { commonUtilities, configurationUtilities, playerUtilities, storageUtilities } from '@enlight-webtv/utilities';
import { AxiosResponse } from 'axios';

//services
const { setPlaybackProgress } = new PlaybackServices();
const { getRecentlyWatching } = new ProfileServices();
const { getPlaybackVideoData, getPlayerStatusData } = new PlaybackDataServices();

//utilities
const { isValidValue } = commonUtilities;
const { getHTMLPlayerTag } = playerUtilities;
const { getState, setState } = storageUtilities;
const { getPlayerConfig } = configurationUtilities;

let CONTINUE_WATCHING_CACHE: any = null;

class PlayerContinueWatchingServices {
    static instance: PlayerContinueWatchingServices | null;

    constructor(create = false) {
        if (create) this.destroy();

        if (PlayerContinueWatchingServices.instance) {
            return PlayerContinueWatchingServices.instance;
        }
        PlayerContinueWatchingServices.instance = this;
    }

    destroy() {
        if (PlayerContinueWatchingServices.instance === this) {
            PlayerContinueWatchingServices.instance = null;
        }
    }

    /**
     * @name getContinueWatchingRequest
     * @type function
     * @description This function will return the continue watching request.
     *
     * @author amalmohann
     */
    getContinueWatchingRequest = () => {
        const playbackVideoData = { ...getPlaybackVideoData() };
        return {
            platform: Platform.WebTv,
            progress: this.getProgress() * 1000,
            duration: playbackVideoData.durationInMS,
            uid: playbackVideoData.contentId,
            seriesUid: playbackVideoData.seriesId ?? '',
            seasonUid: playbackVideoData.seasonId ?? '',
        } as SetPlaybackProgressRequest;
    };

    /**
     * @name updateContinueWatching
     * @type function
     * @description This function will update the continue watching.
     *
     * @author amalmohann
     */
    updateContinueWatching = () => {
        const playerStatusData = { ...getPlayerStatusData() };
        const playerConfig = getPlayerConfig();

        if (playerStatusData.allowContinueWatching) {
            const continueWatchingRequest = this.getContinueWatchingRequest();
            if (continueWatchingRequest.progress) {
                setPlaybackProgress(continueWatchingRequest, playerConfig?.maxResumePercent ?? 95);
                this.setContinueWatchingProgressLocally();
            }
        }
    };

    /**
     * @name setProgress
     * @type function
     * @description This function will store the current progress in the window object.
     * @param {number} progress = progress value to set.
     *
     * @author amalmohann
     */
    setProgress = (value: number) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        window.currentVideoPlaybackProgress = value;
    };

    /**
     * @name getProgress
     * @type function
     * @description This function will get the stored progress in the window object.
     * @return {number} progress = progress value
     *
     * @author amalmohann
     */
    getProgress = (): number => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return window.currentVideoPlaybackProgress as number;
    };

    /**
     * @name setContinueWatchingProgress
     * @type function
     * @description This function will update the progress for continue watching.
     * @return {number} progress = progress value
     *
     * @author amalmohann
     */
    setContinueWatchingProgress = () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (!(window.progressTimerID || getHTMLPlayerTag()?.paused)) {
            const playerConfiguration = getPlayerConfig();
            const progressSaveInterval = playerConfiguration?.progressSaveInterval || 30;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            window.progressTimerID = setTimeout(() => {
                this.updateContinueWatching();
                this.setContinueWatchingProgressLocally();
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                clearTimeout(window.progressTimerID);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                window.progressTimerID = null;
            }, progressSaveInterval * 1000);
        }
    };

    /**
     * @name setContinueWatchingProgressLocally
     * @type function/method
     * @description This function will handle the local setting of continue watching data
     *
     * @author alwin-baby
     */
    setContinueWatchingProgressLocally = () => {
        const playbackVideoData = { ...getPlaybackVideoData() };
        const contentData = playbackVideoData.seriesData ?? playbackVideoData.contentData;
        const playbackProgressRequest = this.getContinueWatchingRequest();
        const playerConfig = getPlayerConfig();

        if (isValidValue(contentData) && playbackProgressRequest?.progress) {
            const isMaxResumePercentReached =
                (playbackProgressRequest?.progress / playbackProgressRequest?.duration) * 100 > playerConfig!.maxResumePercent;

            if (isMaxResumePercentReached) {
                this.handleMaxResumePercentReachedForLocal();
                return;
            }

            const seriesUid = playbackVideoData.seriesId;
            const episodeId = playbackVideoData.episodeId;
            const progress = playbackProgressRequest?.progress;
            const duration = playbackProgressRequest?.duration;
            const type = contentData?.type === ContentType.SERIES ? ContentType.EPISODE : contentData?.type;
            const continueWatchingLocalData = {
                ...contentData,
                seriesUid,
                episodeId,
                progress,
                duration,
                displayDuration: duration,
                type,
            };
            this.checkAndAddContinueWatchingItemLocally(continueWatchingLocalData);
        }
    };

    /**
     * @name handleMaxResumePercentReachedForLocal
     * @type function/method
     * @description This function will handle the local update of continue watching data when the max resume percent
     * has reached
     *
     * @author alwin-baby
     */
    handleMaxResumePercentReachedForLocal = () => {
        const playbackVideoData = { ...getPlaybackVideoData() };
        const contentData = playbackVideoData.seriesData ?? playbackVideoData.contentData;
        const nextEpisodeData = playbackVideoData.nextEpisodeData;

        /**
         * If there is a valid next episode as in the case of a series, the progress details of that episode will be updated
         * in the local continue watching
         */
        if (isValidValue(nextEpisodeData)) {
            const seriesUid = nextEpisodeData?.seriesUid || playbackVideoData.seriesId;
            const episodeId = nextEpisodeData?.uid;
            const progress = nextEpisodeData?.progress || 0;
            const duration = nextEpisodeData?.duration || nextEpisodeData?.displayDuration;
            const continueWatchingLocalData = {
                ...contentData,
                seriesUid,
                episodeId,
                progress,
                duration,
                displayDuration: duration,
            };
            this.checkAndAddContinueWatchingItemLocally(continueWatchingLocalData);
            return;
        }

        /**
         * This handling was done to reset the progress while navigating back to the details page, after reaching the
         * max resume percentage
         */
        const history: any[] = [];
        const previousHistoryObject = history?.[history?.length - 1];
        const previousHistoryHash = previousHistoryObject?.hash;
        const previousHistoryState: any = previousHistoryObject?.state;
        const wasRoutedFromDetailsPage = previousHistoryHash?.split('/')?.[0] === Routes.DETAILS;
        if (wasRoutedFromDetailsPage && contentData?.uid === previousHistoryState?.data?.uid) {
            previousHistoryState.data = { ...previousHistoryState.data, progress: 0 };
        }

        this.removeContinueWatchingItemFromLocal(contentData?.uid);
    };

    /**
     * @name checkAndAddContinueWatchingItemLocally
     * @type function
     * @description This function will add the an item to the local continue watching.
     * @param {any} data - data to be stored
     *
     * @author alwin-baby
     */
    checkAndAddContinueWatchingItemLocally = (data: any) => {
        const recentlyWatched = getState(StorageKeys.RECENTLY_WATCHED);
        if (recentlyWatched?.content) {
            // removing the item if it is already present in local continue watching and adding the new data
            const filteredContents = recentlyWatched.content.filter((item: RailContentModel) => {
                return data.type === ContentType.EPISODE || data.type === ContentType.SERIES
                    ? (item?.seriesId ?? item?.seriesUid) !== (data?.seriesId ?? data?.seriesUid)
                    : item?.uid !== data?.uid;
            });
            filteredContents?.unshift(data);
            recentlyWatched.content = filteredContents;
            this.setRecentlyWatched(recentlyWatched);
        }
    };

    /**
     * @name removeContinueWatchingItemFromLocal
     * @type function
     * @description This function will remove an item from the local continue watching.
     * @param {string} uid - uid of the item to be removed
     *
     * @author alwin-baby
     */
    removeContinueWatchingItemFromLocal = (uid: string) => {
        const recentlyWatched = getState(StorageKeys.RECENTLY_WATCHED);
        if (recentlyWatched?.content) {
            const filteredContents = recentlyWatched.content.filter((item: RailContentModel) => item?.uid !== uid);
            recentlyWatched.content = filteredContents;
            this.setRecentlyWatched(recentlyWatched);
        }
    };

    /**
     * @name setRecentlyWatchingContents
     * @type function
     * @description This function will fetch the continue watching items and save it in the local storage.
     *
     * @author amalmohann
     */
    setRecentlyWatchingContents = async () => {
        const continueWatching: AxiosResponse<ContentResponse, any> | null = await getRecentlyWatching();
        const contents = continueWatching?.data;
        CONTINUE_WATCHING_CACHE = contents ?? [];
        // @ts-ignore
        window.UPDATE_CONTINUE_WATCHING = true;
        setState(StorageKeys.RECENTLY_WATCHED, contents ?? []);
    };

    /**
     * @name getRecentlyWatched
     * @type function
     * @description This function will get the continue watching from the local storage.
     * @return {Promise}
     *
     * @author amalmohann
     */
    getRecentlyWatched = async () => {
        // @ts-ignore
        window.UPDATE_CONTINUE_WATCHING = false;
        if (CONTINUE_WATCHING_CACHE) {
            return CONTINUE_WATCHING_CACHE;
        }
        const recentlyWatched = await getState(StorageKeys.RECENTLY_WATCHED);
        CONTINUE_WATCHING_CACHE = recentlyWatched;
        return recentlyWatched;
    };

    /**
     * @name setRecentlyWatched
     * @type function
     * @description This function will set the continue watching in the local storage.
     * @return {Promise}
     *
     * @author amalmohann
     */
    setRecentlyWatched = (data: any) => {
        // @ts-ignore
        window.UPDATE_CONTINUE_WATCHING = true;
        CONTINUE_WATCHING_CACHE = data;
        setState(StorageKeys.RECENTLY_WATCHED, data ?? []);
    };

    /**
     * @name shouldUpdateRecentlyWatched
     * @type function
     * @description This function will check if continue watching need to be updated
     * @return {boolean}
     *
     * @author amalmohann
     */
    shouldUpdateRecentlyWatched = () => {
        // @ts-ignore
        return window.UPDATE_CONTINUE_WATCHING;
    };
}

export default PlayerContinueWatchingServices;
