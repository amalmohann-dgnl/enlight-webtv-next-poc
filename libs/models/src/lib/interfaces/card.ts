import { TopLabelType, ContinueWatchingData, ThemeSection } from './../../index';

/**
 * @name card
 * This Model will export all the type related to the card.
 * properties will exported are :
 * @interface Dimensions - custom type for dimensions
 * @interface CardDimensions - custom type for card dimensions
 *
 * @author amalmohann
 */

/**
 * @name Dimensions
 * @type interface
 * @description This interface defines the type of dimensions.
 * @author amalmohann
 */
export interface Dimensions {
    width: number;
    height: number;
    borderRadius?: number;
    itemOrientation?: number;
}

/**
 * @name CardDimensions
 * @type interface
 * @description This interface defines the type of dimensions for card components.
 * This interface extends the Dimensions interface.
 * @author amalmohann
 */
export interface CardDimensions extends Dimensions {
    thumbnail: Dimensions;
    title: Dimensions;
    marginRight: number;
    marginBottom: number;
    railHeight: number;
    minimumItemsInViewport: number;
}

/**
 * @name TimeDependantProperties
 * @type interface
 * @description This interface defines the type of properties for card components that can change according to time.
 * This interface extends the Dimensions interface.
 * @author alwin-baby
 */
export interface TimeDependantProperties {
    showCenterIcon: boolean;
    topLabelType: TopLabelType;
    topLabel: string;
    showItemTopLabel: boolean;
    onPress: () => any;
    eventStartTime: number;
    eventEndTime: number;
    isLive: boolean;
    isOnNext: boolean;
    topLabelStyle: ThemeSection;
    showSlantingEdgeTopLabel: boolean;
    isOver: boolean;
    centerIconUrl: string;
    showProgressBar: boolean;
    progressPercent: number;
    continueWatchingData: ContinueWatchingData;
    checkForLive: boolean;
    showCenterIconOnlyFocus?: boolean;
}
