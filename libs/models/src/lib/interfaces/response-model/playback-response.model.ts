import { APIMapping, Content, ConcurrencyLockParam } from './../../index';

export interface NextPreviousEpisodeResponse {
    middlewareRequestCid: string;
    status: string;
    apiMapping: APIMapping[];
    nextEpisode: Content;
    previousEpisode: Content;
}

export interface UpdateConcurrencyResponse {
    updateResponse: ConcurrencyLockParam;
}

export interface SeekPreviewThumbnailResponse {
    height: number;
    width: number;
    startTime: number;
    endTime: number;
    imageCount: number;
    thumbnails: string[];
}

export interface PlaybackProgressResponse {
    middlewareRequestCid: string;
    status: string;
    content: PlaybackProgressContents[];
}

export interface PlaybackProgressContents {
    uid: string;
    playbackProgress: PlaybackProgress;
}
export interface PlaybackProgress {
    progress: number;
    duration: number;
    seriesUid: string;
    seasonUid: null | string;
    programId: null;
    percentComplete: number;
    subjectId: string;
}

export interface SetPlaybackProgressResponse {
    middlewareRequestCid: string;
    status: string;
    message: string;
}
