export interface EntriesRequestModel {
    deviceCategory?: string;
    platform?: string;
    deviceModel?: string;
    deviceMake?: string;
    buildNumber?: number;
    minimumBuildNumber?: number;
    filtering?: boolean;
    locale?: string;
    buildType?: string;
    userId?: string;
}

export interface ContentChangeRequestModel {
    clientId: string;
    platform: string;
    contentful: {
        checksum: string;
        queryStringParams: EntriesRequestModel;
    };
}
