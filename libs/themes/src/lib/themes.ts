import { Project } from '@enlight-webtv/models';

/**
 * @name theme
 * @type config file
 * @description This is the theme config for the application. This config will have all the styling properties
 * and other style configurations that is applicable to the whole application. This config will have colors
 * font settings and other style configurations as well.
 *
 * @author amalmohann
 */
const theme = {
    colors: {
        //canvas color and background should be same color but in different format
        canvasColor: '#282828',
        background: '0xff282828',
        primary: {
            900: '0xff1e1e1e',
            800: '0xff282828',
            700: '0xff474747',
            600: '0xff666666',
            500: '0xff9d9d9d',
            400: '0xff949494',
            300: '0xffc0c0c0',
            200: '0xffb8b8b8',
            100: '0xffe9e9e9',
        },
        disabled: '0xff535353',
        accent: {
            default: '0xffffe400',
        },
        highlight: {
            default: '0xffffe400',
            focus: '0xffffe400',
        },
        selected: {
            default: '0xff666666',
            icon: '0xff484848',
        },
        red: '0xfffe0000',
        white: '0xffffffff',
        black: '0xff000000',
        error: '0xffe10600',
        lightBlack: '0xff1b1b1b',
        lightGrey: '0xff787878',
        success: '0xff34ac20',
        transparent: '0x00000000',
        transparentDark: '0x99000000',
        linksColor: '0xfffc4c02',
        inputBoxColor: '0xff323232',
    },
    typography: {
        [Project.CMGO]: {
            fonts: ['Font-Primary-SemiBold', 'Font-Primary-Regular'],
            presets: {
                headerXL: {
                    fontSize: 76,
                    lineHeight: 96,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerL: {
                    fontSize: 57,
                    lineHeight: 66,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                header: {
                    fontSize: 48,
                    lineHeight: 56,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerS: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerSM: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyXL: {
                    fontSize: 36,
                    lineHeight: 44,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyL: {
                    fontSize: 32,
                    lineHeight: 42,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyBold: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                body: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyS: {
                    fontSize: 25,
                    lineHeight: 34,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyXS: {
                    fontSize: 24,
                    lineHeight: 32,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyBoldXXS: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyBoldXXXS: {
                    fontSize: 20,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                badge: {
                    fontSize: 20,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                badgeS: {
                    fontSize: 12,
                    lineHeight: 17,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                infoBox: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '400',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
            },
        },
        [Project.RALLY_TV]: {
            fonts: ['Font-Primary-SemiBold', 'Font-Primary-Regular'],
            presets: {
                headerXL: {
                    fontSize: 76,
                    lineHeight: 96,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerL: {
                    fontSize: 57,
                    lineHeight: 66,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                header: {
                    fontSize: 48,
                    lineHeight: 56,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerS: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerSM: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyXL: {
                    fontSize: 36,
                    lineHeight: 44,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyL: {
                    fontSize: 32,
                    lineHeight: 42,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyBold: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                body: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyS: {
                    fontSize: 25,
                    lineHeight: 34,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyXS: {
                    fontSize: 24,
                    lineHeight: 32,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyBoldXXS: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyBoldXXXS: {
                    fontSize: 20,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                badge: {
                    fontSize: 20,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                badgeS: {
                    fontSize: 12,
                    lineHeight: 17,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                infoBox: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '400',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
            },
        },
        [Project.ENLIGHT]: {
            fonts: ['Font-Primary-SemiBold', 'Font-Primary-Regular'],
            presets: {
                headerXL: {
                    fontSize: 76,
                    lineHeight: 96,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerL: {
                    fontSize: 57,
                    lineHeight: 66,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                header: {
                    fontSize: 48,
                    lineHeight: 56,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerS: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                headerSM: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyXL: {
                    fontSize: 36,
                    lineHeight: 44,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyL: {
                    fontSize: 32,
                    lineHeight: 42,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyBold: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                body: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyS: {
                    fontSize: 25,
                    lineHeight: 34,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyXS: {
                    fontSize: 24,
                    lineHeight: 32,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                bodyBoldXXS: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyBoldXXXS: {
                    fontSize: 20,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                badge: {
                    fontSize: 20,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                badgeS: {
                    fontSize: 12,
                    lineHeight: 17,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                infoBox: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '400',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
            },
        },
        [Project.VIDEOTRON]: {
            fonts: ['Blender-Pro-Bold', 'Blender-Pro-Medium', 'Open-Sans-Bold', 'Open-Sans-SemiBold', 'Noto-Sans-Regular'],
            presets: {
                headerXL: {
                    fontSize: 76,
                    lineHeight: 96,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Blender Pro Medium',
                },
                headerL: {
                    fontSize: 57,
                    lineHeight: 66,
                    fontStyle: '700',
                    verticalAlign: 'middle',
                    fontFace: 'Blender Pro Bold',
                },
                header: {
                    fontSize: 48,
                    lineHeight: 56,
                    fontStyle: '700',
                    verticalAlign: 'middle',
                    fontFace: 'Blender Pro Bold',
                },
                headerS: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '700',
                    verticalAlign: 'middle',
                    fontFace: 'Blender Pro Bold',
                },
                headerSM: {
                    fontSize: 38,
                    lineHeight: 46,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Blender Pro Medium',
                },
                bodyXL: {
                    fontSize: 36,
                    lineHeight: 44,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Open Sans SemiBold',
                },
                bodyL: {
                    fontSize: 32,
                    lineHeight: 42,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                bodyBold: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Open Sans SemiBold',
                },
                body: {
                    fontSize: 29,
                    lineHeight: 38,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Open Sans SemiBold',
                },
                bodyS: {
                    fontSize: 25,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Open Sans SemiBold',
                },
                bodyXS: {
                    fontSize: 24,
                    lineHeight: 32,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Open Sans SemiBold',
                },
                bodyBoldXXS: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '700',
                    verticalAlign: 'middle',
                    fontFace: 'Open Sans Bold',
                },
                bodyBoldXXXS: {
                    fontSize: 20,
                    lineHeight: 34,
                    fontStyle: '600',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary SemiBold',
                },
                badge: {
                    fontSize: 15,
                    lineHeight: 24,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Noto Sans Regular',
                },
                badgeS: {
                    fontSize: 12,
                    lineHeight: 17,
                    fontStyle: '500',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
                infoBox: {
                    fontSize: 22,
                    lineHeight: 32,
                    fontStyle: '400',
                    verticalAlign: 'middle',
                    fontFace: 'Font Primary Regular',
                },
            },
        },
    },
};

export default theme;