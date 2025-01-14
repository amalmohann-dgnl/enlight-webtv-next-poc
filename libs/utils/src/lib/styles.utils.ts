import { Font } from '@enlight-webtv/models';
import { theme } from '@enlight-webtv/themes';

/**
 * @name getFonts
 * @type function/method
 * @description This function will go through the font list and will return all the fonts in the list.
 * @param {string[]} fontList - array of font names.
 * @return {Fonts[]} - list of the font's family and url.
 *
 * @author amalmohann
 */
const getFonts = (fontList: string[]): Font[] => {
    const fonts: Font[] = [] as Font[];
    fontList?.forEach((font: string) => {
        // replace all the separator with white spaces.
        const family = font.replace(/-/g, ' ');
        const url = `fonts/${font}.ttf`;
        fonts.push({
            family: family,
            url,
        } as Font);
    });
    return fonts;
};

/**
 * @name convertColorToHex
 * @type function/method
 * @description This function will convert the # string color to 0x format.
 * @param {string} color - color in string
 * @return {string} color - color in 0x format
 *
 * @author amalmohann
 */
const convertColorToHex = (color: string): string => {
    const colorCode = color.replace('#', '');
    const hexColor = standardizeColor(colorCode);
    return hexColor;
};

/**
 * @name convertColorToHexString
 * @type function/method
 * @description This function will convert the 0x string color to # format.
 * @param {string} color - color in 0x
 * @return {string} color - color in # string format
 *
 * @author amalmohann
 */
const convertColorToHexString = (color: string): string => {
    const colorCode = color.replace('0xff', '#');
    return colorCode;
};

/**
 * @name standardizeColor
 * @type function/method
 * @description This function will convert the normal color string to 8 digit.
 * @param {string} color - color in string
 * @return {string} color - color 8 digit format
 *
 * @author amalmohann
 */
const standardizeColor = (color: string) => {
    if (color.length === 3) {
        return (
            '0xff' +
            color
                .split('')
                .map(char => char + char)
                .join('')
        );
    }
    if (color.length === 6) {
        return '0xff' + color;
    }
    return '0x' + color;
};

/**
 * @name colorizeLinks
 * @type method
 * @description Colorizes URLs in the input string.
 * @param {string} inputString - The input string containing URLs.
 * @param {string} color - The color to apply to the URLs.
 * @returns {string} - The input string with colorized URLs.
 * @author anandpatel
 */
const colorizeLinks = (inputString: string, color: string = theme.colors.linksColor): string => {
    // Regular expression to match URLs in the string
    const urlPattern = /(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*|www\.[^\s/$.?#].[^\s]*/gi;

    // Replace URLs in the string with colored versions
    const coloredString = inputString?.replace(urlPattern, match => {
        // Wrap the matched URL in a <color> tag with the specified color
        return `<color=${color}>${match}</color>`;
    });
    return coloredString;
};

export { getFonts, convertColorToHex, convertColorToHexString, colorizeLinks };
