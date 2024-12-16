import { APIMapping } from './../../index';

export interface ArchiveListResponse {
    middlewareRequestCid: string;
    content: ArchiveList[];
    apiMapping: APIMapping[];
}

export interface ArchiveList {
    title: string;
    uid: string;
}
