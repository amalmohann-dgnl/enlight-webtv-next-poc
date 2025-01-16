/* eslint-disable no-case-declarations */
import axios, { AxiosResponse } from 'axios';
import {
    NextEpisodeRequest,
    NextPreviousEpisodeResponse,
    SMILRequest,
    SeekPreviewThumbnailResponse,
    UpdateConcurrencyRequest,
    UpdateConcurrencyResponse,
    PlaybackProgressRequest,
    PlaybackProgressResponse,
    SetPlaybackProgressResponse,
    SetPlaybackProgressRequest,
    Content,
    StorageKeys,
    Project,
    CountryInfo,
    Platform,
    SeekPreviewFormat,
} from '@enlight-webtv/models';
import { NetworkRequestor } from '@enlight-webtv/network-requestor';
import { commonUtilities, networkUtilities, playerUtilities, projectUtilities, storageUtilities } from '@enlight-webtv/utilities';

//utilities
const { isValidValue } = commonUtilities;
const { splitThumbnailSpriteImage } = playerUtilities;
const { prepareParams, fetchImage } = networkUtilities;
const { getProjectName } = projectUtilities;
const { getState } = storageUtilities;

/**
 * @name PlaybackServices
 * @type service class
 * @description This class will have all the network services that need to be used for getting the playback related data
 *
 * @author amalmohann
 */
class PlaybackServices {
    static instance: PlaybackServices | null;
    private networkRequestor;

    constructor(create = false) {
        if (create) this.destroy();
        if (PlaybackServices.instance) {
            return PlaybackServices.instance;
        }
        this.networkRequestor = NetworkRequestor.getInstance().getAxiosInstance();
        PlaybackServices.instance = this;
    }

    destroy() {
        if (PlaybackServices.instance === this) {
            PlaybackServices.instance = null;
        }
    }

    /**
     * @name getSMILRecord
     * @type function
     * @description This function will return the SMIL record from the smil url.
     * @param {SMILRequest} smilRequest - contains the smil url and authentication
     * @returns {Promise<AxiosResponse<string, any> | null>}
     *
     * @author amalmohann
     */
    getSMILRecord = async (smilRequest: SMILRequest): Promise<AxiosResponse<string, any> | null> => {
        let response: AxiosResponse<any, any> | null = null;
        try {
            const { smilUrl, authorization } = smilRequest;
            response = await axios.get(
                smilUrl,
                isValidValue(authorization)
                    ? {
                          headers: { Authorization: authorization },
                      }
                    : {},
            );
            return response;
        } catch (error: any) {
            return error.response;
        }
    };

    /**
     * @name updateConcurrencyLock
     * @type function
     * @description This function will call the currency lock api
     * @param {string} concurrencyActionURL - url to which the concurrency action has to be done.
     * @param {UpdateConcurrencyRequest} updateRequest - concurrency Data
     * @return {Promise<AxiosResponse<UpdateConcurrencyResponse, any> | null>}
     *
     * @author amalmohann
     */
    updateConcurrencyLockUnLock = async (
        concurrencyActionURL: string,
        updateRequest: UpdateConcurrencyRequest,
    ): Promise<AxiosResponse<UpdateConcurrencyResponse, any> | null> => {
        const project = getProjectName();
        let params = prepareParams(updateRequest);
        if (project === Project.CMGO) params = { ...params, platform: Platform.WebTv };
        try {
            const response: AxiosResponse<UpdateConcurrencyResponse, any> = await axios.get(concurrencyActionURL, { params });
            return response;
        } catch (error) {
            return null;
        }
    };

    /**
     * @name getSeekPreviewThumbnails
     * @type function
     * @description This function will call url provided and return the thumbnails.
     * @param {SeekPreviewFormat} previewFormat - decides how to handle the data.
     * @param {string} previewThumbnailUrl - url to which the preview thumbnails array will be available
     * @return {Promise<AxiosResponse<SeekPreviewThumbnailResponse, any> | null>} - return the response with thumbnail array.
     *
     * @author amalmohann
     */
    getSeekPreviewThumbnails = async (previewFormat: SeekPreviewFormat, previewThumbnailUrl: string): Promise<string[]> => {
        try {
            switch (previewFormat) {
                case SeekPreviewFormat.SPRITE_SHEET:
                    const seekThumbnailResponse = await fetchImage(previewThumbnailUrl);
                    return splitThumbnailSpriteImage(seekThumbnailResponse) ?? [];
                case SeekPreviewFormat.IMAGE_DATA_ARRAY:
                default:
                    const response: AxiosResponse<SeekPreviewThumbnailResponse, any> = await axios.get(previewThumbnailUrl);
                    return response.data.thumbnails ?? [];
            }
        } catch (error: any) {
            return [];
        }
    };

    /**
     * Network calls with Network Requestor
     */

    /**
     * @name getPlaybackProgress
     * @type function
     * @description This function will return the progress of the VODs related to the series is provided
     * @param { PlaybackProgressRequest } watchingProgress - data for progress, like series id
     * @return {Promise<AxiosResponse<PlaybackProgressResponse, any> | null>}
     *
     * @author amalmohann
     */
    getPlaybackProgress = async (watchingProgress: PlaybackProgressRequest) => {
        //set the params
        const params = prepareParams(watchingProgress);
        //fetch the api
        try {
            const response: AxiosResponse<PlaybackProgressResponse, any> = await this.networkRequestor!.get('/player/progress', { params });
            return response;
        } catch (error) {
            return null;
        }
    };

    /**
     * @name setPlaybackProgress
     * @type function
     * @description This function will set the progress of the VODs related to the series is provided
     * @param { SetPlaybackProgressRequest } watchingProgress - data for progress, like series id
     * @param { number } maxResumePercent - maximum resume percentage
     * @return {Promise<AxiosResponse<SetPlaybackProgressResponse, any> | null>}
     *
     * @author amalmohann
     */
    setPlaybackProgress = async (playbackProgress: SetPlaybackProgressRequest, maxResumePercent: number) => {
        const { getProjectName } = projectUtilities;

        // Get the project name and other required state values
        const project = getProjectName();
        const locale = getState(StorageKeys.LOCALE);
        const region = (getState(StorageKeys.COUNTRY_INFO) as CountryInfo)?.countryCode;

        // Merge the locale and region into the playbackProgress object
        playbackProgress = { ...playbackProgress, language: locale, region: region };

        // Prepare parameters for the API request
        const param = prepareParams(playbackProgress);

        // Determine the correct API path based on the project type
        const apiPath = project === Project.CMGO ? '/player/progress' : `/player/progress?maxResumePercent=${maxResumePercent}`;

        try {
            // Make the API request and return the response
            const response: AxiosResponse<SetPlaybackProgressResponse, any> = await this.networkRequestor!.put(apiPath, param);
            return response;
        } catch (error) {
            // Return null in case of an error
            return null;
        }
    };

    /**
     * @name getNextEpisode
     * @type function
     * @description This function will return the next episode for the content which is VOD and is episode.
     * @param { NextEpisodeRequest } nextEpisodeParams - data for next episode like episodeId, seriesId, language
     * @return {Promise<AxiosResponse<NextPreviousEpisodeResponse, any> | null>}
     *
     * @author amalmohann
     */
    getNextPreviousEpisodes = async (nextEpisodeParams: NextEpisodeRequest): Promise<AxiosResponse<NextPreviousEpisodeResponse, any> | null> => {
        //set the params
        const params = prepareParams(nextEpisodeParams);

        //fetch the api
        try {
            const response: AxiosResponse<NextPreviousEpisodeResponse, any> = await this.networkRequestor!.get('/content/nextPreviousEpisodes', {
                params,
            });
            return response;
        } catch (error) {
            return null;
        }
    };

    /**
     * @name getSeriesEpisodes
     * @type function
     * @description This function will return the details of playback episode
     * @param {string} uid - uid of episode
     * @param {number}  maxResumePercent - maximum resume percent from config
     * @return {Promise<AxiosResponse<Content, any> | null>}
     *
     * @author amalmohann
     */
    getSeriesEpisodes = async (uid: string, maxResumePercent: number) => {
        const locale = getState(StorageKeys.LOCALE);
        //set the params
        const params = {
            maxResumePercent,
            language: locale,
        };
        //fetch the api
        try {
            const response: AxiosResponse<Content, any> = await this.networkRequestor!.get(`player/playbackEpisode/${uid}`, { params });
            return response;
        } catch (error) {
            return null;
        }
    };
}

export default PlaybackServices;
