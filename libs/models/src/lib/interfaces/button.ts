import { Typography, GradientDirection, ColorGradient } from './../../index';

/**
 * @name button
 * This Model will export all the type related to the button.
 * properties will exported are :
 * @interface ButtonVariantConfig - type of the variant specific configurations for buttons
 *
 * @author alwin-baby
 */

/**
 * @name ButtonVariantConfig
 * @type interface
 * @description This interface defines the type of the variant specific configurations for buttons
 *
 * @author alwin-baby
 */
export interface ButtonVariantConfig {
    width: number;
    height: number;
    borderRadius: number;
    strokeColor: string;
    buttonColor: string;
    normalStroke: number;
    focusedStroke: number;
    selectedStroke: number;
    normalGlow: boolean;
    focusedGlow: boolean;
    selectedGlow: boolean;
    paddingLeft: number;
    paddingRight: number;
    labelAlign: string;
    labelMarginTop: number;
    labelMarginBottom: number;
    labelMarginRight: number;
    labelMarginLeft: number;
    labelColor: string;
    normalLabelColor: string;
    selectedLabelColor: string;
    focusedLabelColor: string;
    selectedFocussedLabelColor: string;
    labelTypography: Typography;
    startIconMarginRight: number;
    startIconMarginLeft: number;
    endIconMarginLeft: number;
    endIconMarginRight: number;
    normalStyle: ButtonStateProperty;
    focusedStyle: ButtonStateProperty;
    selectedStyle: ButtonStateProperty;
    selectedFocusedStyle: ButtonStateProperty;
    gradientConfiguration: ButtonGradientConfig;
    gradient: boolean;
}

export interface ButtonStateProperty {
    buttonColor: string;
    labelColor: string;
    stroke: number;
    glow: boolean;
    gradient?: boolean;
    gradientConfiguration: ButtonGradientConfig;
    startIconSrc?: string;
    strokeColor?: string;
}

export interface ButtonStateStyles {
    normalStyle: ButtonStateProperty;
    focusedStyle: ButtonStateProperty;
    selectedStyle: ButtonStateProperty;
    selectedFocusedStyle: ButtonStateProperty;
}

export interface ButtonGradientConfig {
    direction: GradientDirection;
    gradientColorConfig: ColorGradient;
}
