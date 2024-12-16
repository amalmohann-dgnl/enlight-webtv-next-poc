/**
 * @name MuxData
 * @type interface
 * @description This interface will have MUX data and custom data configurations.
 * @author anandpatel
 */
export interface MuxData {
    env_key?: string;
    viewer_user_id?: string;
    page_type?: string;
    version?: string;
    experiment_name?: string;
    sub_property_id?: string;
    player_name?: string;
    player_version?: string;
    player_init_time?: number;
    debug?: boolean;
    video_id?: string;
    video_title?: string;
    video_series?: string;
    video_variant_name?: string;
    video_variant_id?: string;
    video_language_code?: string;
    video_content_type?: string;
    video_duration?: number;
    video_stream_type?: string;
    video_producer?: string;
    video_encoding_variant?: string;
    video_cdn?: string;
    video_source_url?: string;
    viewer_device_model?: string;
    viewer_device_manufacturer: string;
    viewer_device_category: string;
    disableCookies?: boolean;
    respectDoNotTrack?: boolean;
    custom_1?: string;
    custom_2?: string;
    custom_5?: string;
}

export interface MUXVideoMetaData {
    id: string;
    title: string;
    seriesTitle: string;
    duration: number;
    sourceUrl: string;
    playbackType: string;
    playbackAssetFormat: string;
    smilPid: string;
    smilURL: string;
    selectedStream: string;
}
