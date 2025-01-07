/**
 * @name card-configurations
 * @description This Model will export the defaults related to cards as enums.
 * properties will exported are:
 * @enum TopLabelType - default preset for TopLabels.
 * @enum CardType - default preset for Card
 *
 * @author amalmohann
 */
/**
 * @name CardType
 * @type enum
 * @description This enum will have all the default preset values for the cards.
 * @author amalmohann
 */
enum CardType {
    Card = 'Card',
    ContentCard = 'ContentCard',
    AdvancedCard = 'AdvancedCard',
}

/**
 * @name TopLabelType
 * @type enum
 * @description This enum will have all the default preset values for the top labels.
 * @author amalmohann
 */
enum TopLabelType {
    important = 'important',
    normal = 'normal',
    custom = 'custom',
}

export { TopLabelType, CardType };
