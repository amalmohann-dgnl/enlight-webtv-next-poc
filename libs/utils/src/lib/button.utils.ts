import {
    ButtonVariantType,
    ButtonState,
    ButtonStates,
    ButtonStateStyles,
    ButtonStyle,
    ButtonVariantConfig,
    ButtonVariants,
    Color,
    ColorGradient,
    GradientDirection,
    Image,
    Typography,
} from '@enlight-webtv/models';
import { commonUtilities, configurationUtilities } from '@enlight-webtv/utilities';
import { theme } from '@enlight-webtv/themes';

const { isValidValue } = commonUtilities;

//button base config
export const buttonBaseConfig = {
    button: {
        width: 0,
        height: 85,
        borderRadius: 5,
        strokeColor: theme.colors.white,
        buttonColor: theme.colors.transparent,
        normalStroke: 4,
        focusedStroke: 0,
        selectedStroke: 0,
        normalGlow: false,
        focusedGlow: true,
        selectedGlow: false,
        paddingLeft: 45,
        paddingRight: 45,
        labelAlign: 'flex-start',
        labelMarginTop: 8,
        labelMarginBottom: 0,
        labelMarginRight: 0,
        labelMarginLeft: 0,
        labelColor: theme.colors.white,
        labelTypography: Typography.bodyBold,
        startIconMarginRight: 10,
        endIconMarginLeft: 10,
        gradient: false,
        normalStyle: {
            buttonColor: theme.colors.transparent,
            stroke: 4,
            glow: false,
        },
        focusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: true,
        },
        selectedStyle: {
            buttonColor: theme.colors.selected.default,
            stroke: 0,
            glow: false,
        },
        selectedFocusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: true,
        },
    } as any as ButtonVariantConfig,
    buttonWithIcon: {
        width: 0,
        height: 62,
        borderRadius: 62 / 2,
        strokeColor: theme.colors.primary[600],
        normalButtonColor: theme.colors.primary[600],
        normalStroke: 4,
        focusedStroke: 0,
        selectedStroke: 0,
        normalGlow: false,
        focusedGlow: false,
        selectedGlow: false,
        paddingLeft: 24,
        paddingRight: 24,
        labelAlign: 'flex-start',
        labelMarginTop: 12,
        labelMarginBottom: 12,
        labelMarginRight: 0,
        labelMarginLeft: 0,
        labelColor: theme.colors.white,
        labelTypography: Typography.bodyBold,
        startIconMarginRight: 14,
        startIconMarginLeft: 24,
        endIconMarginLeft: 0,
        endIconMarginRight: 0,
        gradient: false,
        normalStyle: {
            buttonColor: theme.colors.primary[600],
            stroke: 4,
            glow: false,
        },
        focusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: false,
        },
        selectedStyle: {
            buttonColor: theme.colors.selected.default,
            stroke: 0,
            glow: false,
        },
        selectedFocusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: false,
        },
    } as any as ButtonVariantConfig,
    menuItem: {
        width: 329,
        height: 85,
        borderRadius: 5,
        strokeColor: theme.colors.white,
        buttonColor: theme.colors.transparent,
        selectedFocussedButtonColor: theme.colors.accent.default,
        normalStroke: 0,
        focusedStroke: 0,
        selectedStroke: 0,
        normalGlow: false,
        focusedGlow: false,
        selectedGlow: false,
        paddingLeft: 24,
        paddingRight: 24,
        labelAlign: 'flex-start',
        labelMarginTop: 8,
        labelMarginBottom: 0,
        labelMarginRight: 0,
        labelMarginLeft: 0,
        labelColor: theme.colors.white,
        labelTypography: Typography.bodyBold,
        startIconMarginRight: 20,
        endIconMarginLeft: 0,
        gradient: false,
        normalStyle: {
            buttonColor: theme.colors.transparent,
            stroke: 0,
            glow: false,
        },
        focusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: false,
        },
        selectedStyle: {
            buttonColor: theme.colors.selected.default,
            stroke: 0,
            glow: false,
        },
        selectedFocusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: false,
        },
    } as any as ButtonVariantConfig,
    errorButton: {
        width: 608,
        height: 85,
        borderRadius: 5,
        strokeColor: theme.colors.white,
        buttonColor: theme.colors.transparent,
        normalStroke: 4,
        focusedStroke: 0,
        selectedStroke: 0,
        normalGlow: false,
        focusedGlow: false,
        selectedGlow: false,
        paddingLeft: 24,
        paddingRight: 24,
        labelAlign: 'flex-start',
        labelMarginTop: 8,
        labelMarginBottom: 0,
        labelMarginRight: 0,
        labelMarginLeft: 0,
        labelColor: theme.colors.white,
        labelTypography: Typography.bodyBold,
        startIconMarginRight: 20,
        endIconMarginLeft: 0,
        gradient: false,
        normalStyle: {
            buttonColor: theme.colors.transparent,
            stroke: 4,
            glow: false,
        },
        focusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: true,
        },
        selectedStyle: {
            buttonColor: theme.colors.selected.default,
            stroke: 0,
            glow: false,
        },
        selectedFocusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: true,
        },
    } as any as ButtonVariantConfig,
    playerButton: {
        width: 329,
        height: 85,
        borderRadius: 5,
        strokeColor: theme.colors.white,
        buttonColor: theme.colors.transparent,
        normalStroke: 4,
        focusedStroke: 0,
        selectedStroke: 0,
        normalGlow: false,
        focusedGlow: false,
        selectedGlow: false,
        paddingLeft: 24,
        paddingRight: 24,
        labelAlign: 'flex-start',
        labelMarginTop: 8,
        labelMarginBottom: 0,
        labelMarginRight: 0,
        labelMarginLeft: 0,
        labelColor: theme.colors.white,
        labelTypography: Typography.bodyBold,
        startIconMarginRight: 20,
        endIconMarginLeft: 0,
        gradient: false,
        normalStyle: {
            buttonColor: theme.colors.transparent,
            stroke: 4,
            glow: false,
        },
        focusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: false,
        },
        selectedStyle: {
            buttonColor: theme.colors.selected.default,
            stroke: 0,
            glow: false,
        },
        selectedFocusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: false,
        },
    } as any as ButtonVariantConfig,
    textButton: {
        width: 0,
        height: 70,
        borderRadius: 5,
        strokeColor: theme.colors.white,
        buttonColor: theme.colors.transparent,
        normalStroke: 0,
        focusedStroke: 0,
        selectedStroke: 0,
        normalGlow: false,
        focusedGlow: true,
        selectedGlow: false,
        paddingLeft: 20,
        paddingRight: 20,
        labelAlign: 'flex-start',
        labelMarginTop: 5,
        labelMarginBottom: 0,
        labelMarginRight: 0,
        labelMarginLeft: 0,
        labelColor: theme.colors.white,
        labelTypography: Typography.bodyBold,
        startIconMarginRight: 8,
        endIconMarginLeft: 0,
        gradient: false,
        normalStyle: {
            buttonColor: theme.colors.transparent,
            stroke: 0,
            glow: false,
        },
        focusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: true,
        },
        selectedStyle: {
            buttonColor: theme.colors.selected.default,
            stroke: 0,
            glow: false,
        },
        selectedFocusedStyle: {
            buttonColor: theme.colors.accent.default,
            stroke: 0,
            glow: true,
        },
    } as any as ButtonVariantConfig,
};

/**
 * @name getButtonProperties
 * @type function/method
 * @description This function will take the variant of the button as argument and return the corresponding
 * button properties
 * @param {ButtonVariants} variant - the button variant that is used.
 * @return {ButtonVariantConfig} variantProperties - the different properties corresponding to the variant
 *
 * @author alwin-baby
 */

export const getButtonProperties = (variant: ButtonVariants): ButtonVariantConfig => {
    let variantProperties = buttonBaseConfig.button;
    switch (variant) {
        case ButtonVariants.button:
            variantProperties = {
                ...buttonBaseConfig.button,
                ...setButtonConfiguration(variant, buttonBaseConfig.button),
            };
            break;
        case ButtonVariants.buttonWithIcon:
            variantProperties = buttonBaseConfig.buttonWithIcon;
            break;
        case ButtonVariants.menuItem:
            variantProperties = {
                ...buttonBaseConfig.menuItem,
                ...setButtonConfiguration(variant, buttonBaseConfig.menuItem),
            };
            break;
        case ButtonVariants.errorButton:
            variantProperties = {
                ...buttonBaseConfig.errorButton,
                ...setButtonConfiguration(variant, buttonBaseConfig.errorButton),
            };
            break;
        case ButtonVariants.playerButton:
            variantProperties = {
                ...buttonBaseConfig.playerButton,
                ...setButtonConfiguration(variant, buttonBaseConfig.playerButton),
            };
            break;
        case ButtonVariants.textButton:
            variantProperties = {
                ...buttonBaseConfig.textButton,
                ...setButtonConfiguration(variant, buttonBaseConfig.textButton),
            };
            break;
        case ButtonVariants.bingeCountDownButton:
            variantProperties = {
                ...buttonBaseConfig.button,
                ...setButtonConfiguration(ButtonVariants.button, buttonBaseConfig.button),
                width: 360,
            };
            break;
    }
    return variantProperties;
};

export const setButtonConfiguration = (variant: ButtonVariants, defaultConfiguration: ButtonVariantConfig) => {
    const defaultCompositeStyle = configurationUtilities.getDefaultCompositeStyle();
    const primaryButtonConfig = defaultCompositeStyle?.primaryButton;
    const secondaryButtonConfig = defaultCompositeStyle?.secondaryButton;
    if (
        variant === ButtonVariants.button ||
        variant === ButtonVariants.menuItem ||
        variant === ButtonVariants.playerButton ||
        variant === ButtonVariants.errorButton
    ) {
        if (primaryButtonConfig && Object.keys(primaryButtonConfig).length > 0) {
            const normalGradientConfig = primaryButtonConfig?.normal?.background as ColorGradient;
            const focusedGradientConfig = primaryButtonConfig?.focussed?.background as ColorGradient;
            const selectedGradientConfig = primaryButtonConfig?.selected?.background as ColorGradient;
            const selectedFocusedGradientConfig = primaryButtonConfig?.selectedFocussed?.background as ColorGradient;

            return {
                borderRadius: primaryButtonConfig.edgeRadius * 10,
                // strokeColor: primaryButtonConfig.normal.stroke.code,
                normalStyle: {
                    ...defaultConfiguration.normalStyle,
                    labelColor: primaryButtonConfig.normal?.text?.code,
                    strokeColor: primaryButtonConfig.normal?.stroke?.code,
                    buttonColor: (primaryButtonConfig?.normal?.background as Color)?.code,
                    gradient: isValidValue(normalGradientConfig?.startColor) && isValidValue(normalGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: normalGradientConfig,
                    },
                },
                focusedStyle: {
                    ...defaultConfiguration.focusedStyle,
                    labelColor: primaryButtonConfig.focussed?.text?.code,
                    strokeColor: primaryButtonConfig.focussed?.stroke?.code,
                    buttonColor: (primaryButtonConfig?.focussed?.background as Color)?.code,
                    gradient: isValidValue(focusedGradientConfig?.startColor) && isValidValue(focusedGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: focusedGradientConfig,
                    },
                },
                selectedStyle: {
                    ...defaultConfiguration.selectedStyle,
                    labelColor: primaryButtonConfig.selected?.text?.code,
                    strokeColor: primaryButtonConfig.selected?.stroke?.code,
                    buttonColor: (primaryButtonConfig?.selected?.background as Color)?.code,
                    gradient: isValidValue(selectedGradientConfig?.startColor) && isValidValue(selectedGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: selectedGradientConfig,
                    },
                },
                selectedFocusedStyle: {
                    ...defaultConfiguration.selectedFocusedStyle,
                    labelColor: primaryButtonConfig.selectedFocussed?.text?.code,
                    strokeColor: primaryButtonConfig.selectedFocussed?.stroke?.code,
                    buttonColor: (primaryButtonConfig?.selectedFocussed?.background as Color)?.code,
                    gradient: isValidValue(selectedFocusedGradientConfig?.startColor) && isValidValue(selectedFocusedGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: selectedFocusedGradientConfig,
                    },
                },
            };
        }
    }
    if (variant === ButtonVariants.textButton) {
        if (secondaryButtonConfig && Object.keys(secondaryButtonConfig).length > 0) {
            const normalGradientConfig = secondaryButtonConfig?.normal?.background as ColorGradient;
            const focusedGradientConfig = secondaryButtonConfig?.focussed?.background as ColorGradient;
            const selectedGradientConfig = secondaryButtonConfig?.selected?.background as ColorGradient;
            const selectedFocusedGradientConfig = secondaryButtonConfig?.selectedFocussed?.background as ColorGradient;

            return {
                borderRadius: secondaryButtonConfig.edgeRadius * 10,
                normalStyle: {
                    ...defaultConfiguration.normalStyle,
                    labelColor: secondaryButtonConfig.normal?.text?.code,
                    strokeColor: secondaryButtonConfig.normal?.stroke?.code,
                    buttonColor: (secondaryButtonConfig?.normal?.background as Color)?.code,
                    gradient: isValidValue(normalGradientConfig?.startColor) && isValidValue(normalGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: normalGradientConfig,
                    },
                },
                focusedStyle: {
                    ...defaultConfiguration.focusedStyle,
                    labelColor: secondaryButtonConfig.focussed?.text?.code,
                    strokeColor: secondaryButtonConfig.focussed?.stroke?.code,
                    buttonColor: (secondaryButtonConfig?.focussed?.background as Color)?.code,
                    gradient: isValidValue(focusedGradientConfig?.startColor) && isValidValue(focusedGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: focusedGradientConfig,
                    },
                },
                selectedStyle: {
                    ...defaultConfiguration.selectedStyle,
                    labelColor: secondaryButtonConfig.selected?.text?.code,
                    strokeColor: secondaryButtonConfig.selected?.stroke?.code,
                    buttonColor: (secondaryButtonConfig?.selected?.background as Color)?.code,
                    gradient: isValidValue(selectedGradientConfig?.startColor) && isValidValue(selectedGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: selectedGradientConfig,
                    },
                },
                selectedFocusedStyle: {
                    ...defaultConfiguration.selectedFocusedStyle,
                    labelColor: secondaryButtonConfig.selectedFocussed?.text?.code,
                    strokeColor: secondaryButtonConfig.selectedFocussed?.stroke?.code,
                    buttonColor: (secondaryButtonConfig?.selectedFocussed?.background as Color)?.code,
                    gradient: isValidValue(selectedFocusedGradientConfig?.startColor) && isValidValue(selectedFocusedGradientConfig?.endColor),
                    gradientConfiguration: {
                        direction: GradientDirection.HORIZONTAL,
                        gradientColorConfig: selectedFocusedGradientConfig,
                    },
                },
            };
        }
        return {};
    }
    return {};
};

/**
 * @name getButtonColorConfig
 * @type function/method
 * @description This function updates the menu items in the sidebar.
 * @param {MenuItem} item
 * @param {ButtonStyle} property
 * @returns {ButtonState}
 *
 * @author tonyaugustine
 */
export const getButtonColorConfig = (item: ButtonStyle, property: keyof ButtonStyle) => {
    const buttonStyle = item;
    return (buttonStyle[property] as ButtonState) ?? {};
};

/**
 * @name getIconImageUrl
 * @type method
 * @description This function retrieves the sidemenu icon url
 * @param {MenuItem} item
 * @param {ButtonStyle} property
 * @returns {string}
 *
 * @author tonyaugustine
 */
export const getIconImageUrl = (item: ButtonStyle, property: keyof ButtonStyle) => {
    const buttonStyle = item;
    return configurationUtilities.getImageUrl(((buttonStyle[property] as ButtonState)?.graphics?.images[0] ?? {}) as Image);
};

/**
 * @name formatButtonStyles
 * @type method
 * @description This function formats the button style to the state style
 * @param {ButtonStyle} item
 * @param {boolean} addIcons
 * @returns {string}
 *
 * @author tonyaugustine
 */
export const formatButtonStyles = (item: ButtonStyle, varient = ButtonVariantType.menuItem, addIcons = true): ButtonStateStyles => {
    let iconNormal = undefined;
    let iconSelected = undefined;
    let iconSelectedFocussed = undefined;
    let iconFocussed = undefined;

    addIcons && (iconNormal = getIconImageUrl(item, ButtonStates.normal));
    addIcons && (iconSelected = getIconImageUrl(item, ButtonStates.selected));
    addIcons && (iconSelectedFocussed = getIconImageUrl(item, ButtonStates.selectedFocussed));
    addIcons && (iconFocussed = getIconImageUrl(item, ButtonStates.focussed));

    const normalButtonConfig = getButtonColorConfig(item, ButtonStates?.normal);
    const selectedButtonConfig = getButtonColorConfig(item, ButtonStates?.selected);
    const selectedFocussedButtonConfig = getButtonColorConfig(item, ButtonStates?.selectedFocussed);
    const focusedButtonConfig = getButtonColorConfig(item, ButtonStates?.focussed);

    return {
        normalStyle: {
            ...buttonBaseConfig[varient].normalStyle,
            strokeColor: normalButtonConfig?.stroke?.code ?? buttonBaseConfig[varient].normalStyle.strokeColor,
            buttonColor: (normalButtonConfig?.background as Color)?.code ?? '',
            startIconSrc: iconNormal,
            labelColor: normalButtonConfig?.text?.code,
            gradient:
                isValidValue((normalButtonConfig?.background as ColorGradient)?.startColor) &&
                isValidValue((normalButtonConfig?.background as ColorGradient)?.endColor),
            gradientConfiguration: {
                direction: GradientDirection.HORIZONTAL,
                gradientColorConfig: (normalButtonConfig?.background as ColorGradient) ?? {},
            },
        },
        focusedStyle: {
            ...buttonBaseConfig[varient].focusedStyle,
            buttonColor: (focusedButtonConfig?.background as Color)?.code ?? '',
            startIconSrc: iconFocussed,
            labelColor: focusedButtonConfig?.text?.code,
            gradient:
                isValidValue((focusedButtonConfig?.background as ColorGradient)?.startColor) &&
                isValidValue((focusedButtonConfig?.background as ColorGradient)?.endColor),
            gradientConfiguration: {
                direction: GradientDirection.HORIZONTAL,
                gradientColorConfig: (focusedButtonConfig?.background as ColorGradient) ?? {},
            },
        },
        selectedStyle: {
            ...buttonBaseConfig[varient].selectedStyle,
            buttonColor: (selectedButtonConfig?.background as Color)?.code ?? '',
            startIconSrc: iconSelected,
            labelColor: selectedButtonConfig?.text?.code,
            gradient:
                isValidValue((selectedButtonConfig?.background as ColorGradient)?.startColor) &&
                isValidValue((selectedButtonConfig?.background as ColorGradient)?.endColor),
            gradientConfiguration: {
                direction: GradientDirection.HORIZONTAL,
                gradientColorConfig: (selectedButtonConfig?.background as ColorGradient) ?? {},
            },
        },
        selectedFocusedStyle: {
            ...buttonBaseConfig[varient].selectedFocusedStyle,
            buttonColor: (selectedFocussedButtonConfig?.background as Color)?.code ?? '',
            startIconSrc: iconSelectedFocussed,
            labelColor: selectedFocussedButtonConfig?.text?.code,
            gradient:
                isValidValue((selectedFocussedButtonConfig?.background as ColorGradient)?.startColor) &&
                isValidValue((selectedFocussedButtonConfig?.background as ColorGradient)?.endColor),
            gradientConfiguration: {
                direction: GradientDirection.HORIZONTAL,
                gradientColorConfig: (selectedFocussedButtonConfig?.background as ColorGradient) ?? {},
            },
        },
    };
};
