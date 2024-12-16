/**
 * @name button-configurations
 * @description This Model will export the defaults related to button as enums.
 * properties that will be exported are:
 * @enum ButtonVariants - default preset for button variants.
 *
 * @author alwin-baby
 */

/**
 * @name ButtonVariants
 * @type enum
 * @description This enum will have all the default preset values for the different button variants.
 *
 * @author alwin-baby
 */
export enum ButtonVariants {
    button = 'button',
    buttonWithIcon = 'buttonWithIcon',
    menuItem = 'menu-item',
    textButton = 'text-button',
    playerButton = 'player-button',
    errorButton = 'error-button',
    bingeCountDownButton = 'bingeCountDownButton',
    custom = 'custom',
}

/**
 * @name ButtonVariantType
 * @type enum
 * @description This enum will have all the default preset values for the different button variants.
 *
 * @author anandpatel
 */
export enum ButtonVariantType {
    button = 'button',
    buttonWithIcon = 'buttonWithIcon',
    menuItem = 'menuItem',
    playerButton = 'playerButton',
    errorButton = 'errorButton',
}

/**
 * @name ButtonStates
 * @type enum
 * @description This enum will have all the buttons states
 *
 * @author anandpatel
 */
export enum ButtonStates {
    normal = 'normal',
    selected = 'selected',
    focussed = 'focussed',
    selectedFocussed = 'selectedFocussed',
    disabled = 'disabled',
}

/**
 * @name GradientDirection
 * @type enum
 * @descripton This enum will have all the buttons states
 *
 * @author alwin-baby
 */
export enum GradientDirection {
    HORIZONTAL = 'horizontal',
    VERTICAL = 'vertical',
}
