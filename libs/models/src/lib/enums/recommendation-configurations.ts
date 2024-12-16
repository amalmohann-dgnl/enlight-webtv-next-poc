enum RecombeeRecommendItemsType {
    RECOMMEND_ITEMS_TO_USER = 'ItemsToUser',
    RECOMMEND_ITEMS_TO_ITEM = 'ItemsToItem',
    RECOMMEND_NEXT_ITEMS = 'NextItems',
}

enum RecombeeSearchItemsType {
    SEARCH_ITEMS = 'SearchItem',
}

enum RecombeeSearchType {
    RECOMBEE_SEARCH_ITEMS,
    RECOMBEE_SEARCH_ITEM_SEGMENTS,
}

enum RecombeeServerRegion {
    AP_SE = 'ap-se',
    CA_EAST = 'ca-east',
    EU_WEST = 'eu-west',
    US_WEST = 'us-west',
}

enum RecommendationTransformDataType {
    ENLIGHT_ASSET_TYPE,
}

enum RecommendationServiceType {
    RECOMBEE = 'recombee',
}

export {
    RecombeeRecommendItemsType,
    RecombeeSearchType,
    RecombeeServerRegion,
    RecommendationTransformDataType,
    RecommendationServiceType,
    RecombeeSearchItemsType,
};
