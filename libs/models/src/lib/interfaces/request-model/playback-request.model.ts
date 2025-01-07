export interface NextEpisodeRequest {
    episodeId: string;
    seriesId: string;
    language: string;
}

export interface UpdateConcurrencyRequest {
    form: string;
    schema: string;
    _clientId: string;
    _id: string;
    _sequenceToken: string;
    _encryptedLock: string;
}

export interface PlaybackProgressRequest {
    seriesUid?: string;
    uid?: string;
}

export interface SetPlaybackProgressRequest {
    platform: string;
    progress: number;
    duration: number;
    uid: string;
    language: string;
    region: string | null;
    seriesUid: string;
    seasonUid: string;
}
