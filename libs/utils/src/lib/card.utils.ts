import { ItemSize, CardDimensions, Project, LabelTag, TagData, RailContentModel } from '@enlight-webtv/models';
import { theme } from '@enlight-webtv/themes';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-ignore
const projectName: Project = import.meta.env.VITE_PROJECT_NAME as Project;

const cardBaseConfig = {
    edgeRadius: 7,
    orientation: 1,
    size: ItemSize.medium,
    fallbackColor: theme.colors.primary[900],
    cardColor: theme.colors.transparent,
    showProgress: false,
    showCenterIcon: false,
    showCenterIconOnlyFocus: false,
    centerIconUrl: 'icons/play-64.png',
    clockIconUrl: 'icons/timer/clock.png',
    centerIconWidth: 60,
    centerIconHeight: 60,
    shadow: {
        //TODO: Card Shadow
    },
    sizes: {
        default: {
            landscape: {
                small: {
                    width: 328,
                    height: 232,
                    railHeight: 374,
                    thumbnail: {
                        width: 328,
                        height: 195,
                        borderRadius: 7,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 20,
                    marginBottom: 35,
                    minimumItemsInViewport: 4,
                } as CardDimensions,
                medium: {
                    width: 357,
                    height: 291,
                    railHeight: 374,
                    thumbnail: {
                        width: 357,
                        height: 211,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 4,
                } as CardDimensions,
                large: {
                    width: 483,
                    height: 211,
                    railHeight: 374,
                    thumbnail: {
                        width: 483,
                        height: 211,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 3,
                } as CardDimensions,
                fillWidth: {
                    width: 746.09,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 746.09,
                        height: 274,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 2,
                } as CardDimensions,
                extraLarge: {
                    width: 746.09,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 746.09,
                        height: 274,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 2,
                } as CardDimensions,
            },
            portrait: {
                small: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 210,
                        height: 288,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 20,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
                medium: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 186,
                        height: 288,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
                large: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 186,
                        height: 288,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
            },
            square: {
                medium: {
                    width: 210,
                    height: 210,
                    railHeight: 374,
                    thumbnail: {
                        width: 210,
                        height: 210,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
            },
        },
        [Project.ENLIGHT]: {
            landscape: {
                small: {
                    width: 328,
                    height: 232,
                    railHeight: 374,
                    thumbnail: {
                        width: 328,
                        height: 195,
                        borderRadius: 7,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 20,
                    marginBottom: 35,
                    minimumItemsInViewport: 4,
                } as CardDimensions,
                medium: {
                    width: 357,
                    height: 291,
                    railHeight: 374,
                    thumbnail: {
                        width: 357,
                        height: 211,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 4,
                } as CardDimensions,
                large: {
                    width: 483,
                    height: 211,
                    railHeight: 374,
                    thumbnail: {
                        width: 483,
                        height: 211,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 3,
                } as CardDimensions,
                fillWidth: {
                    width: 746.09,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 746.09,
                        height: 274,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 2,
                } as CardDimensions,
                extraLarge: {
                    width: 746.09,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 746.09,
                        height: 274,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 2,
                } as CardDimensions,
            },
            portrait: {
                small: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 210,
                        height: 288,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 20,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
                medium: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 186,
                        height: 288,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
                large: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 186,
                        height: 288,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
            },
            square: {
                medium: {
                    width: 210,
                    height: 210,
                    railHeight: 374,
                    thumbnail: {
                        width: 210,
                        height: 210,
                        borderRadius: 10,
                    },
                    title: {
                        width: 357,
                        height: 68,
                    },
                    marginRight: 25,
                    marginBottom: 35,
                    minimumItemsInViewport: 7,
                } as CardDimensions,
            },
        },
        [Project.RALLY_TV]: {
            landscape: {
                small: {},
                medium: {},
                large: {},
                fillWidth: {},
                extraLarge: {},
            },
            portrait: {
                small: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 210,
                        height: 340,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
                medium: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 210,
                        height: 340,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
                large: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    thumbnail: {
                        width: 210,
                        height: 340,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
            },
            square: {
                medium: {
                    width: 210,
                    height: 210,
                    railHeight: 374,
                    thumbnail: {
                        width: 210,
                        height: 210,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
            },
        },
        [Project.VIDEOTRON]: {
            landscape: {
                small: {},
                medium: {
                    width: 357,
                    height: 255,
                    railHeight: 374,
                    thumbnail: {
                        width: 357,
                        height: 211,
                        borderRadius: 7,
                    },
                    marginRight: 20,
                } as CardDimensions,
                large: {
                    width: 514,
                    height: 257,
                    railHeight: 374,
                    thumbnail: {
                        width: 514,
                        height: 257,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                    minimumItemsInViewport: 3,
                } as CardDimensions,
                fillWidth: {
                    width: 746.09,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 746.09,
                        height: 274,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 2,
                } as CardDimensions,
                extraLarge: {
                    width: 746.09,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 746.09,
                        height: 274,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 2,
                } as CardDimensions,
            },
            portrait: {
                small: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    title: {
                        width: 357,
                        height: 68,
                    },
                    thumbnail: {
                        width: 186,
                        height: 288,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
                medium: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    title: {
                        width: 357,
                        height: 68,
                    },
                    thumbnail: {
                        width: 186,
                        height: 288,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
                large: {
                    width: 186,
                    height: 288,
                    railHeight: 382,
                    title: {
                        width: 357,
                        height: 68,
                    },
                    thumbnail: {
                        width: 186,
                        height: 288,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
            },
            square: {
                medium: {
                    width: 210,
                    height: 210,
                    railHeight: 374,
                    thumbnail: {
                        width: 210,
                        height: 210,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
            },
        },
        [Project.CMGO]: {
            landscape: {
                small: {
                    width: 328,
                    height: 232,
                    railHeight: 374,
                    thumbnail: {
                        width: 328,
                        height: 195,
                        borderRadius: 7,
                    },
                    marginRight: 20,
                } as CardDimensions,
                medium: {
                    width: 357,
                    height: 258,
                    railHeight: 374,
                    thumbnail: {
                        width: 357,
                        height: 212,
                        borderRadius: 7,
                    },
                    marginRight: 20,
                } as CardDimensions,
                large: {
                    width: 483,
                    height: 224,
                    railHeight: 374,
                    thumbnail: {
                        width: 483,
                        height: 224,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
                fillWidth: {
                    width: 847.83,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 847.83,
                        height: 312,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 1,
                } as CardDimensions,
                extraLarge: {
                    width: 746.09,
                    height: 387,
                    railHeight: 420,
                    thumbnail: {
                        width: 746.09,
                        height: 274,
                        borderRadius: 10,
                    },
                    title: {
                        width: 0,
                        height: 0,
                    },
                    marginRight: 25,
                    marginBottom: 0,
                    minimumItemsInViewport: 1,
                } as CardDimensions,
            },
            portrait: {
                small: {
                    width: 210,
                    height: 340,
                    railHeight: 514,
                    title: {
                        width: 357,
                        height: 68,
                    },
                    thumbnail: {
                        width: 210,
                        height: 340,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
                medium: {
                    width: 210,
                    height: 340,
                    railHeight: 514,
                    title: {
                        width: 357,
                        height: 68,
                    },
                    thumbnail: {
                        width: 210,
                        height: 340,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
                large: {
                    width: 210,
                    height: 340,
                    railHeight: 514,
                    title: {
                        width: 357,
                        height: 68,
                    },
                    thumbnail: {
                        width: 210,
                        height: 340,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
            },
            square: {
                medium: {
                    width: 210,
                    height: 210,
                    railHeight: 374,
                    thumbnail: {
                        width: 210,
                        height: 210,
                        borderRadius: 10,
                    },
                    marginRight: 20,
                } as CardDimensions,
            },
        },
    },
};

/**
 * @name getCardDimension
 * @type function/method
 * @description This function will check for card dimension presets from the theme and will return it.
 * @param {ItemSize | undefined} typography - the typography preset name to check with the theme presets.
 * @return {CardDimensions} dimensions - the text texture settings. (default is body preset)
 *
 * @author amalmohann
 */
const getCardDimension = (size: ItemSize, orientation: number): CardDimensions => {
    if (orientation > 2.6) {
        switch (size) {
            case ItemSize.small:
                //Add card size for small cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.small, ...cardBaseConfig.sizes[projectName].landscape?.small };
            case ItemSize.medium:
                return { ...cardBaseConfig.sizes.default.landscape.medium, ...cardBaseConfig.sizes[projectName].landscape.medium };
            case ItemSize.large:
                return { ...cardBaseConfig.sizes.default.landscape.extraLarge, ...cardBaseConfig.sizes[projectName].landscape.extraLarge };
            case ItemSize.fill_width:
                //Add card size for fill_width cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.fillWidth, ...cardBaseConfig.sizes[projectName].landscape.fillWidth };
            case ItemSize.fullscreen:
                //Add card size for fullscreen cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.large, ...cardBaseConfig.sizes[projectName].landscape.large };
            default:
                return { ...cardBaseConfig.sizes.default.landscape.medium, ...cardBaseConfig.sizes[projectName].landscape.medium };
        }
    } else if (orientation > 2.2) {
        switch (size) {
            case ItemSize.small:
                //Add card size for small cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.small, ...cardBaseConfig.sizes[projectName].landscape?.small };
            case ItemSize.medium:
                return { ...cardBaseConfig.sizes.default.landscape.medium, ...cardBaseConfig.sizes[projectName].landscape.medium };
            case ItemSize.large:
                return { ...cardBaseConfig.sizes.default.landscape.large, ...cardBaseConfig.sizes[projectName].landscape.large };
            case ItemSize.fill_width:
                //Add card size for fill_width cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.fillWidth, ...cardBaseConfig.sizes[projectName].landscape.fillWidth };
            case ItemSize.fullscreen:
                //Add card size for fullscreen cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.large, ...cardBaseConfig.sizes[projectName].landscape.large };
            default:
                return { ...cardBaseConfig.sizes.default.landscape.medium, ...cardBaseConfig.sizes[projectName].landscape.medium };
        }
    }
    if (orientation > 1) {
        switch (size) {
            case ItemSize.small:
                //Add card size for small cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.small, ...cardBaseConfig.sizes[projectName].landscape?.small };
            case ItemSize.medium:
                return { ...cardBaseConfig.sizes.default.landscape.medium, ...cardBaseConfig.sizes[projectName].landscape.medium };
            case ItemSize.large:
                return { ...cardBaseConfig.sizes.default.landscape.large, ...cardBaseConfig.sizes[projectName].landscape.large };
            case ItemSize.fill_width:
                //Add card size for fill_width cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.fillWidth, ...cardBaseConfig.sizes[projectName].landscape.fillWidth };
            case ItemSize.fullscreen:
                //Add card size for fullscreen cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.landscape.large, ...cardBaseConfig.sizes[projectName].landscape.large };
            default:
                return { ...cardBaseConfig.sizes.default.landscape.medium, ...cardBaseConfig.sizes[projectName].landscape.medium };
        }
    } else if (orientation < 1) {
        switch (size) {
            case ItemSize.small:
                //Add card size for small cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.portrait.small, ...cardBaseConfig.sizes[projectName].portrait.small };
            case ItemSize.medium:
                return { ...cardBaseConfig.sizes.default.portrait.medium, ...cardBaseConfig.sizes[projectName].portrait.medium };
            case ItemSize.large:
                return { ...cardBaseConfig.sizes.default.portrait.large, ...cardBaseConfig.sizes[projectName].portrait.large };
            case ItemSize.fill_width:
                //Add card size for fill_width cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.portrait.large, ...cardBaseConfig.sizes[projectName].portrait.large };
            case ItemSize.fullscreen:
                //Add card size for fullscreen cards to export the correct dimensions.
                return { ...cardBaseConfig.sizes.default.portrait.large, ...cardBaseConfig.sizes[projectName].portrait.large };
            default:
                return { ...cardBaseConfig.sizes.default.portrait.medium, ...cardBaseConfig.sizes[projectName].portrait.medium };
        }
    } else {
        return { ...cardBaseConfig.sizes.default.square.medium, ...cardBaseConfig.sizes[projectName].square.medium };
    }
};
/**
 * @name getCardProperties
 * @type function/method
 * @description This function will check for card type and attach all the card properties that are shared in the data.
 * @param {CardType} cardType - the type of card to be displayed.
 * @param {ItemSize} cardSize - size of the card to be displayed. Default is Medium.
 * @param {any} data - data associated to the card to be displayed.
 * @return {object} properties -the card properties that need to be shared to card components
 *
 * @author amalmohann
 */

const getCardProperties = (cardType: any, data: any, cardSize: ItemSize = ItemSize.medium): any => {
    const properties = {
        title: data.title as string,
        showTitle: data.showTitle as boolean,
        maxTitleLines: data.maxTitleLines as number,
        thumbnailSrc: data.thumbnailSrc as string,
        fallbackImageSrc: data.fallbackImageSrc as string,
        edgeRadius: data.edgeRadius as number,
        size: cardSize,
        focusStyle: data.focusStyle,
        onPress: data.onPress,
        type: cardType,
        topLabel: data.topLabel as string,
        showTopLabel: data.showTopLabel as boolean,
        maxTopLabelLines: data.maxTopLabelLines as number,
        showTypeLogo: data.showTypeLogo as boolean,
        typeLogoSrc: data.typeLogoSrc as string,
        showCenterIcon: data.showIcon as boolean,
        showCenterIconOnlyFocus: data.showCenterIconOnlyFocus as boolean,
        centerIconUrl: data.iconUrl as string,
        showProgressBar: data.showProgressBar as boolean,
        progress: data.progress as number,
    };

    return properties;
};

/**
 * @name findTagItem
 * @type function/method
 * @description This function will find the required tag configuration.
 * @param {LabelTag} tag
 * @param {TagData[]} tagConfiguration
 * @return {TagData | undefined}
 *
 * @author alwin-baby
 */
const findTagItem = (tag: LabelTag, tagConfiguration: TagData[]) => tagConfiguration.find((tagItem: TagData) => tagItem?.tagId === tag);

/**
 * @name findTagItem
 * @type function/method
 * @description This function will get the required tag configuration for CMGO.
 * @param {RailContentModel} data
 * @param {TagData[]} tagConfiguration
 * @return {TagData | undefined}
 *
 * @author alwin-baby
 */
const getAppropriateTagConfigurationForCmgo = (data: RailContentModel, tagConfiguration: TagData[]) => {
    const tag = data.displayTag;
    if (tag === LabelTag.HOT) {
        const tagData = findTagItem(LabelTag.HOT, tagConfiguration);
        return tagData;
    }

    // using our own logic to determine new item, irrespective of tag
    if (data.isNewItem) {
        const tagData = findTagItem(LabelTag.NEW, tagConfiguration);
        return tagData;
    }

    // using our own logic to determine coming soon item, irrespective of tag
    if (data.isComingSoonItem) {
        const tagData = findTagItem(LabelTag.COMING_SOON, tagConfiguration);
        return tagData;
    }

    // if tag is something other than hot, new or coming soon, returning its configuration
    if (tag !== LabelTag.NEW && tag !== LabelTag.COMING_SOON) {
        const tagData = findTagItem(tag, tagConfiguration);
        return tagData;
    }
    return;
};

export { getCardDimension, getCardProperties, getAppropriateTagConfigurationForCmgo, findTagItem };
