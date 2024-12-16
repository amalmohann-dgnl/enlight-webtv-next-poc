import { RecentSearch, APIMapping, Content } from './../../index';
export interface RecentSearchResponse {
    middlewareRequestCid: string;
    searchList: RecentSearch[];
    content: Content[];
    apiMapping: APIMapping[];
}
