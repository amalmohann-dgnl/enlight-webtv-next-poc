/**
 * @name ContentAccess
 * @type enum
 * @description This enum will have all the default values of the content access.
 * @author amalmohann
 */
enum ContentAccess {
    lock = 'lock',
    free = 'free',
    unrestricted = 'unrestricted',
}

/**
 * @name IconLabelMode
 * @type enum
 * @description This enum will have all the default values of the Icon Label component display type
 * @author amalmohann
 */
enum IconLabelMode {
    ALWAYS_SHOW = 'always_show',
    ALWAYS_HIDE = 'always_hide',
    ON_FOCUS = 'on_focus',
}

/**
 * @name PreviewAnimationTypes
 * @type enum
 * @description This enum will have all the different preview-component animation types
 * @author alwin-baby
 */
enum PreviewAnimationTypes {
    GENERAL_PAGE_IN = 'general_page_in',
    GENERAL_PAGE_OUT = 'general_page_out',
    DETAILS_PAGE_IN = 'details_page_in',
    DETAILS_PAGE_OUT = 'details_page_out',
    DETAILS_PAGE_CONTENT = 'details_page_content',
    HORIZONTAL_RAIL_TRANSLATION = 'horizontal_rail_translation',
    VERTICAL_RAIL_TRANSLATION = 'vertical_rail_translation',
    BACK_PRESS_RAIL_TRANSLATION = 'back_press_rail_translation',
    FROM_SIDEBAR = 'from_sidebar',
    DETAILS_TO_PLAYER_PAGE_OUT = 'details_to_player_page_out',
    NONE = 'none',
}

/**
 * @name EpochSpecificationUpto
 * @type enum
 * @description This enum is used to define the specifications during epoch conversions and is not meant to be used as label.
 *
 * @author alwin-baby
 */
enum EpochSpecificationUpto {
    MINS = 'mins',
    SECS = 'secs',
}

enum PreviewActionComponent {
    Button = 'button',
    Icon = 'icon',
}

enum PreviewActionType {
    Primary = 'primary',
    Secondary = 'secondary',
    Tertiary = 'tertiary',
    Quaternary = 'quaternary',
    Quinary = 'quinary',
}

enum PreviewThumbnailType {
    LARGE = 'large',
    MEDIUM = 'medium',
}

enum GridNavigationDirection {
    UP = 'up',
    DOWN = 'down',
}

enum CreditType {
    ACTOR = 'Actor',
    CAST = 'Cast',
    DIRECTOR = 'Director',
}

enum MoreInfoListItemType {
    BUTTON = 'Button',
    TEXT = 'Text',
}

enum IconLabelType {
    TEXT = 'text',
    TOOLTIP = 'tooltip',
}

enum DetailsNavigation {
    IN = 'in',
    OUT = 'out',
}

export {
    ContentAccess,
    IconLabelMode,
    PreviewAnimationTypes,
    EpochSpecificationUpto,
    PreviewActionComponent,
    PreviewActionType,
    PreviewThumbnailType,
    GridNavigationDirection,
    CreditType,
    MoreInfoListItemType,
    IconLabelType,
    DetailsNavigation,
};
