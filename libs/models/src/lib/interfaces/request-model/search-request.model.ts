export interface SearchSuggestionRequestModel {
    query?: string;
    maxResultCount?: number;
    ratio?: string;
    platform?: string;
    championship?: string;
    fetchDetails?: boolean;
    schema?: string;
}
export interface SearchRequestModel {
    query: string;
    maxResultCount?: number;
    ratio?: string;
    searchMode?: string;
    platform?: string;
    championship?: string;
    source?: string;
    fetchDetails?: boolean;
}
export interface ContentRequestModel {
    platform?: string;
    uid?: Required<string>;
    type?: string;
}

export interface RecentSearchRequestModel {
    searchKey: string;
    searchMode?: string;
    uid?: string;
    type?: string;
    platform?: string;
    region?: string;
}
