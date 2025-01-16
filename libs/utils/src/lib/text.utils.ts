import { Project, Typography } from '@enlight-webtv/models';
import { theme } from '@enlight-webtv/themes';

/**
 * @name getTypographySettings
 * @type function/method
 * @description This function will check for text presets from the theme and will return it.
 * @param {Typography | undefined} typography - the typography preset name to check with the theme presets.
 * @return {Lightning.textures.TextTexture.Settings} - the text texture settings. (default is body preset)
 *
 * @author amalmohann
 */
const getTypographySettings = (typography: Typography | undefined) => {
    //import.meta having type config issue.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    const project = Project.VIDEOTRON;
    let config: any = {};
    switch (typography) {
        case Typography.headerXL:
            config = theme.typography[project].presets[Typography.headerXL];
            break;
        case Typography.headerL:
            config = theme.typography[project].presets[Typography.headerL];
            break;
        case Typography.headerS:
            config = theme.typography[project].presets[Typography.headerS];
            break;
        case Typography.headerSM:
            config = theme.typography[project].presets[Typography.headerSM];
            break;
        case Typography.header:
            config = theme.typography[project].presets[Typography.header];
            break;
        case Typography.bodyXL:
            config = theme.typography[project].presets[Typography.bodyXL];
            break;
        case Typography.bodyL:
            config = theme.typography[project].presets[Typography.bodyL];
            break;
        case Typography.bodyBold:
            config = theme.typography[project].presets[Typography.bodyBold];
            break;
        case Typography.body:
            config = theme.typography[project].presets[Typography.body];
            break;
        case Typography.bodyS:
            config = theme.typography[project].presets[Typography.bodyS];
            break;
        case Typography.bodyXS:
            config = theme.typography[project].presets[Typography.bodyXS];
            break;
        case Typography.bodyBoldXXS:
            config = theme.typography[project].presets[Typography.bodyBoldXXS];
            break;
        case Typography.bodyBoldXXXS:
            config = theme.typography[project].presets[Typography.bodyBoldXXXS];
            break;
        case Typography.badge:
            config = theme.typography[project].presets[Typography.badge];
            break;
        case Typography.badgeS:
            config = theme.typography[project].presets[Typography.badgeS];
            break;
        case Typography.infoBox:
            config = theme.typography[project].presets[Typography.infoBox];
            break;
        default:
            config = theme.typography[project].presets[Typography.bodyS];
            break;
    }
    //export the settings as the lighting text settings.
  return config;
};

// "left" are ignored as we don't want to break on them
const fullWidthPunctuation = [
    '\u3002', // period
    '\uff0c', // comma
    '\u3001', // enumeration comma
    '\uff01', // exclamation
    '\uff1f', // question
    '\uff0e', // middle dot
    // '\u300c', // left quotation
    '\u300d', // right quotation
    // '\u3008', // left angle bracket
    '\u3009', // right angle bracket
    // '\u300a', // left double angle bracket
    '\u300b', // right double angle bracket
];
/**
 * @name addZeroWidthSpaces
 * @type function/method
 * @description This function will add zero width spaces to text
 * @param {string} - text
 * @return {string} - the text with zero width spaces added
 *
 * @author tonyaugustine
 */
const addZeroWidthSpaces = (text: string): string => {
    const addSpacesRegexp = new RegExp(fullWidthPunctuation.join('|'), 'g');
    const modifiedText = text.replace(addSpacesRegexp, '$& ');
    return modifiedText;
};

/**
 * @name isLatinText
 * @type function/method
 * @description This function will check if string is latin or not
 * @param {string} - text
 * @return {boolean} - returns true if text is latin
 *
 * @author tonyaugustine
 */
const isLatinText = (text: string): boolean => {
    const rforeignRegEx = /[A-z0-9\s\u00C0-\u00ff]+/g;
    return rforeignRegEx.test(text);
};

export { getTypographySettings, addZeroWidthSpaces, isLatinText };
