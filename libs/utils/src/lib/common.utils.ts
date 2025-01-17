import { toDataURL, QRCodeSegment, QRCodeToDataURLOptions } from 'qrcode';
import { areApproximatelyEqual, generateRandomNumber } from './math.utils';
import { AssetTypeIcon, AssetTypeIconType, Dimensions, Image, KeyCodeEnum, KeyboardEventType, StorageKeys } from '@enlight-webtv/models';
import { isValidDate } from './time.utils';
import jsSHA from 'jssha';
import { storageUtilities } from '.';

/**
 * @name isValidValue
 * @type function/method
 * @description This function will take object as input and return param
 * @param {Record<string, any>} params - object of parameters
 * @return {Record<string, any>} params - the text texture settings. (default is body preset)
 *
 * @author amalmohann
 */
const isValidValue = (value: any): boolean => {
    if (value === undefined) return false;
    if (value === null) return false;
    if (value === '') return false;
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            return value.length > 0;
        }
        if (value instanceof Date) {
            return isValidDate(value);
        }
        return Object.keys(value).length > 0;
    }
    return true;
};

/**
 * @name generateQR
 * @param text - The text for which the QR needs to be generated
 * @param options - The options to customize the QR code
 * @type function
 * @description This function will generate the corresponding QR code for the text and options provided.
 * @return {string} - the URL for the generated QR code
 *
 * @author alwin-baby
 */
const generateQR = async (text: string | QRCodeSegment[], options: QRCodeToDataURLOptions | undefined = {}) => {
    try {
        const qrCodeUrl = await toDataURL(text, options);
        return qrCodeUrl;
    } catch (err) {
        console.error(err);
        return;
    }
};

/**
 * @name formatTextForAdvancedColorRendering
 * @param text - The text that needs to be formatted
 * @param options - The color for the text
 * @type function
 * @description This function will return the formatted text for advanced color rendering
 * @return {string} formatted text for advanced color rendering
 *
 * @author alwin-baby
 */
const formatTextForAdvancedColorRendering = (text: string, color: string) => {
    return `<color=${color}>${text}</color>`;
};

/**
 * @name filterImageSet
 * @type function/method
 * @description This function will filter the image set based on the item Orientation.
 * @param {AssetTypeIcon[]} images - list of images
 * @param {number} itemOrientation - orientation of the images
 * @return {AssetTypeIcon[]} list of images based matching the item orientation.
 *
 * @author amalmohann
 */
const filterImageSet = (images: AssetTypeIcon[], itemOrientation: number): AssetTypeIcon[] => {
    const filteredImages: AssetTypeIcon[] = images.filter((image: AssetTypeIcon) => {
        const imageOrientation = image.width / image.height;
        return areApproximatelyEqual(imageOrientation, itemOrientation);
    });
    return filteredImages;
};

/**
 * @name getImageOrientation
 * @param {number} width - The width of image
 * @param {number} height - The height of image
 * @type function
 * @description This function will return the orientation for a given width and height
 * @return {AssetTypeIconType} Square, Landscape or Portrait
 *
 * @author alwin-baby
 */
const getImageOrientation = (width: number, height: number) => {
    let orientation = AssetTypeIconType.SQUARE;
    if (width > height) orientation = AssetTypeIconType.LANDSCAPE;
    if (width < height) orientation = AssetTypeIconType.PORTRAIT;
    return orientation;
};

/**
 * @name getOptimizedImage
 * @param {AssetTypeIcon[] | Image[]} images - The array of image objects
 * @param {Dimensions | Dimensions[]} requiredDimensions - The dimensions for which the optimized image needs to obtained
 * @type function
 * @description This function will return the image with the optimum size from the images array
 * @return {AssetTypeIcon | Image | (AssetTypeIcon | Image)[]} Image with the optimum dimensions
 *
 * @author alwin-baby
 */
const getOptimizedImage = (
    images: AssetTypeIcon[] | Image[],
    reqDimensions: Dimensions | Dimensions[],
): AssetTypeIcon | Image | (AssetTypeIcon | Image)[] => {
    if (!isValidValue(images) || !isValidValue(reqDimensions)) return {} as AssetTypeIcon | Image;
    const isArray = Array.isArray(reqDimensions);
    const requiredDimensions = isArray ? reqDimensions : [reqDimensions];
    const returnArray = [] as (AssetTypeIcon | Image)[];

    // Function to round a number to one decimal place
    const roundToOneDecimalPlace = (value: number) => Math.round(value * 10) / 10;

    for (const dimension of requiredDimensions) {
        let leastSizeImage = {} as AssetTypeIcon | Image;
        let closestWidth = null;
        let closestImage = {} as AssetTypeIcon | Image;
        const { width = 0, height = 0, itemOrientation = 0 } = dimension;

        // if no required width or height is received as argument, the image with the lowest size is returned
        if (!width || !height) {
            for (const image of images) {
                if (!isValidValue(leastSizeImage) || (leastSizeImage.width && image.width < leastSizeImage.width)) {
                    leastSizeImage = image;
                }
            }
            returnArray.push(leastSizeImage);
            continue;
        }

        const requiredOrientation = getImageOrientation(width, height);
        let smallestMatchingImageWidth: number | null = null;
        if (images) {
            for (const image of images) {
                const calculatedOrientation = getImageOrientation(image.width, image.height);

                const roundedItemOrientation = roundToOneDecimalPlace(itemOrientation);
                const roundedImageRatio = roundToOneDecimalPlace(image.width / image.height);

                // Check if the orientation matches
                if (roundedItemOrientation === roundedImageRatio) {
                    // Update the closestImage if this image has a smaller width
                    if (smallestMatchingImageWidth === null || Math.abs(image.width - width) < Math.abs(smallestMatchingImageWidth - width)) {
                        smallestMatchingImageWidth = image.width;
                        closestImage = image;
                        continue;
                    }
                }

                // Update the closestImage if this image has a smaller width
                if (
                    smallestMatchingImageWidth === null &&
                    (((image as AssetTypeIcon).type && (image as AssetTypeIcon).type === requiredOrientation) ||
                        calculatedOrientation === requiredOrientation)
                ) {
                    if (!isValidValue(closestWidth) || Math.abs(width - image.width) < closestWidth!) {
                        closestWidth = Math.abs(width - image.width);
                        closestImage = image;
                    }
                }
                if (
                    smallestMatchingImageWidth === null &&
                    (!isValidValue(leastSizeImage) || (leastSizeImage.width && image.width < leastSizeImage.width))
                ) {
                    leastSizeImage = image;
                }
            }
        }
        returnArray.push(isValidValue(closestImage) ? closestImage : leastSizeImage);
    }
    return isArray ? returnArray : returnArray[0] ?? ({} as Image);
};

/**
 * @name mapFromEntries
 * @description Converts an iterable of key-value pairs into an object.
 * @param iterable An iterable containing key-value pairs represented as [string, any][].
 * @returns An object with the key-value pairs from the iterable.
 *
 * @author amalmohann
 */
const mapFromEntries = (iterable: Iterable<[string, any]>): Record<string, any> => {
    // Initialize an empty object to store the result.
    const resultObject: Record<string, any> = {};

    // Iterate through the iterable, destructure each entry into a key and a value,
    // and add them to the result object.
    for (const [key, value] of iterable) {
        resultObject[key] = value;
    }

    // Return the object with the key-value mappings.
    return resultObject;
};

/**
 * @name getUrlExtension
 * @description this function will return the extension from the url
 * @param {string} url - the url that need to searched.
 * @returns An object with the key-value pairs from the iterable.
 *
 * @author amalmohann
 */
const getUrlExtension = (url: string) => {
    if (url && isValidUrl(url)) {
        return url?.split?.(/[#?]/)[0]?.split('.')?.pop()?.trim();
    } else {
        return null;
    }
};

/**
 * @name getUrlExtension
 * @description This function will check whether a url valid or not, if its valid it returns true
 * @param {string} url - the url that need to searched.
 * @returns {boolean} true if url is valid
 *
 * @author amalmohann
 */
const isValidUrl = (url: string) => {
    try {
        return Boolean(new URL(url));
    } catch (e) {
        return false;
    }
};

/**
 * @name generateSessionID
 * @type function/method
 * @description Generates a random session ID and stores it in the local storage.
 * @author anandpatel
 */
const generateSessionID = () => {
    // Generate a random number in the range 0-15 and convert it to a hexadecimal string
    const randomHex = () => Math.floor(Math.random() * 16).toString(16);
    const randomString = (length: number) => Array.from({ length }, randomHex).join('');

    const timestamp = new Date().toISOString().slice(5, 19).replace(/[-:]/g, '');

    // Concatenate the timestamp with randomly generated strings
    const sessionID = `${randomString(8)}-${randomString(4)}-${timestamp}-${randomString(4)}-${randomString(12)}`;

    //store the sessionID in local storage
    storageUtilities.setState(StorageKeys.SESSIONID, sessionID);

    // Store session start time in storage and as a window property
    const sessionStartTime = Date.now();
    storageUtilities.setState(StorageKeys.SESSION_START_TIME, sessionStartTime);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    window.sessionStartTime = sessionStartTime;
};

/**
 * @name pad
 * @type function/method
 * @description helper function to add leading zero when necessary
 * @param {number} num - number to which leading zero should be added
 * @return {string} zero padding added string.
 *
 * @author amalmohann
 */
const pad = (num: number) => ('0' + num).slice(-2);

/**
 * @name dispatchKeyboardEvent
 * @type function/method
 * @description helper function to dispatch a key event to the document body.
 * @param {KeyboardEventType} type - type of key event
 * @param {KeyCodeEnum} code - key code to be dispatched
 *
 * @author amalmohann
 */
const dispatchKeyboardEvent = (type: KeyboardEventType, code: KeyCodeEnum) => {
    const keyboardEvent = new KeyboardEvent(type, {
        bubbles: true,
        cancelable: true,
        keyCode: code,
    });
    //dispatch to the html body
    document.body.dispatchEvent(keyboardEvent);
};

/**
 * @name removeNullUndefinedProperties
 * @type function
 * @param {Record<string, any>} obj - The input object.
 * @description Removes properties with null or undefined values from an object.
 * @return {Record<string, any>} - Object with null and undefined properties removed.
 * @author anandpatel
 */
const removeNullUndefinedProperties = (obj: Record<string, any>): Record<string, any> => {
    for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
            delete obj[key];
        }
    }
    return obj;
};

/**
 * @name convertNullUndefinedPropertiesToEmptyString
 * @type function
 * @param {Record<string, any>} obj - The input object.
 * @description Converts properties with null or undefined values to empty string.
 * @return {Record<string, any>} - Object with null and undefined properties strigified.
 * @author tonyaugustine
 */
const convertNullUndefinedPropertiesToEmptyString = (obj: Record<string, any>): Record<string, any> => {
    const modifiedObj: Record<string, any> = {};
    for (const key in obj) {
        if (obj[key] === null || obj[key] === undefined) {
            modifiedObj[key] = '';
            continue;
        }
        modifiedObj[key] = obj[key];
    }
    return modifiedObj;
};

/**
 * @name generatePathFromErrorObject
 * @type function
 * @param {Error} errorObj - generated Error object
 * @description construct the path from generated error object
 * @return {string} - error path
 * @author tonyaugustine
 */
const generatePathFromErrorObject = (errorObj: Error) => {
    const errorPath = errorObj.stack
        ?.toString()
        .split(/\r\n|\n/)[1]
        ?.trim();
    return errorPath;
};

/**
 * @name extractCommaSeparatedParams
 * @type function/method
 * @description This function will take string params and converts into records
 * @param {string} params - object of parameters
 * @return {Record<string, any>} params
 *
 * @author alwin-baby
 */
const extractCommaSeparatedParams = (paramString: string) => {
    const extractedParams: Record<string, any> = {};
    const params: string[] = paramString?.split(',');
    if (isValidValue(params)) {
        params.forEach((param: string) => {
            const paramMap = param.split('=');
            if (paramMap.length === 2) {
                const key: string = paramMap[0]!;
                const value: string = paramMap[1]!;
                extractedParams[key] = value;
            }
        });
    }
    return extractedParams;
};

/**
 * @name extractValueFromParentheses
 * @type function/method
 * @description This function will take string params and extracts the value inside parentheses
 * @param {string} value - String to extract that value
 * @return {string} value
 *
 * @author anandpatel
 */
const extractValueFromParentheses = (value: string) => {
    return value?.match(/\((\d+)\)/);
};

/**
 * @name promiseAllSettled
 * @type function/method
 * @description This function will take string params and converts into records
 * @param {Promise<any>} promise - object of parameters
 * @return {Promise<PromiseSettledResult<any>[]>} params
 *
 * @author amalmohann
 */
const promiseAllSettled = (promiseArray: any[]) => {
    if (!Promise.allSettled) {
        Promise.allSettled = (promises: any[]) =>
            Promise.all(
                promises.map((promise: any) =>
                    promise
                        .then((value: any) => ({
                            status: 'fulfilled',
                            value,
                        }))
                        .catch((reason: any) => ({
                            status: 'rejected',
                            reason,
                        })),
                ),
            );
    }

    return Promise.allSettled(promiseArray);
};

/**
 * @name getRouteFromHash
 * @type function/method
 * @description This function will get the route from a hash
 * @param {string} hash
 * @return {string | undefined}
 *
 * @author alwin-baby
 */
const getRouteFromHash = (hash?: string) => hash?.split('/')?.[0];

/**
 * @name generate_HMAC_Signature
 * @type function
 * @description This function will generate the HMAC hash signature for a give data
 * @param {string} data - Data to be hashed
 * @returns {}
 */
const generate_HMAC_Signature = (data: string, key: string) => {
    const shaObj = new jsSHA('SHA-1', 'TEXT');
    shaObj.setHMACKey(key, 'TEXT');
    shaObj.update(data);
    return shaObj.getHMAC('HEX');
};

let timeoutIdCounter = 1; // Global counter to generate unique IDs
const timeouts = new Map(); // Map to store active timeouts by their ID
/**
 * @name setAnimationFrameTimeout
 * @type function/method
 * @description This function will set an animation frame timeout.
 * This function was created to handle the odd behaviour of
 * timeouts in astro
 * @param {() => any} callback
 * @param {number} delay - delay in ms
 * @return {number} id
 *
 * @author alwin-baby
 */
const setAnimationFrameTimeout = (callback: () => any, delay: number) => {
    const startTime = Date.now();
    // Generate a unique ID
    timeoutIdCounter = timeoutIdCounter + 1;
    const id = timeoutIdCounter;

    // request animation frame handler function
    const requestAnimationFrameHandler = () => {
        if (!timeouts.has(id)) {
            // Exit if the timeout was cleared
            return;
        }

        if (Date.now() - startTime <= delay) {
            requestAnimationFrame(requestAnimationFrameHandler);
        } else {
            callback();
            // Remove the timeout from the map after execution
            if (timeouts.has(id)) timeouts.delete(id);
        }
    };
    requestAnimationFrame(requestAnimationFrameHandler);

    // Store the timeout in the map
    timeouts.set(id, requestAnimationFrameHandler);
    return id;
};

/**
 * @name clearAnimationFrameTimeout
 * @type function/method
 * @description This function will clear an animation frame timeout
 * @param {number} id
 *
 * @author alwin-baby
 */
const clearAnimationFrameTimeout = (id?: number | null) => {
    // Remove the timeout from the map to cancel it
    if (id && timeouts.has(id)) timeouts.delete(id);
};

/**
 * @name cloneObject
 * @type function
 * @description This function clones an object
 * @param {value} - object to clone
 *
 * @author tonyaugustine
 */
const cloneObject = (value: any) => {
    return JSON.parse(JSON.stringify(value));
};

/**
 * @name generateEngageClientID
 * @type function
 * @description This will generate a unique client ID similarto Engage SDK implementation
 * @returns {string} ClientID
 * @author tonyaugustine
 */
const generateEngageClientID = (): string => {
    function s4() {
        return Math.floor(65536 * (1 + parseInt(generateRandomNumber(), 10) / Math.pow(10, 10)))
            .toString(16)
            .substring(1);
    }

    const clientID = s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    //store the sessionID in local storage
    storageUtilities.setState(StorageKeys.ENGAGE_CLIENT_ID, clientID);

    return clientID;
};

/**
 * @name throttle
 * @type function
 * @description This will throttle the execution of a function
 * @param {Function} fn - Function to throttle
 * @param {number} wait - Throttle time
 * @returns {Function} ClientID
 * @author tonyaugustine
 */
const throttle = (fn: (...args: any[]) => void, wait: number = 300) => {
    let inThrottle: boolean = false;
    let lastFn: ReturnType<typeof setTimeout>;
    let lastTime: number;

    return function (...args: any[]) {
        if (!inThrottle) {
            fn(...args);
            lastTime = Date.now();
            inThrottle = true;
        } else {
            clearTimeout(lastFn);
            lastFn = setTimeout(() => {
                if (Date.now() - lastTime >= wait) {
                    fn(...args);
                    lastTime = Date.now();
                }
            }, Math.max(wait - (Date.now() - lastTime), 0));
        }
    };
};

/**
 * @name removeSpecialCharacters
 * @type function
 * @description Removes special characters from a string, keeping only alphanumeric characters and spaces.
 * @param {string} input - The input string to remove special characters.
 * @returns {string} - The updated string.
 * @author anandpatel
 */
const removeSpecialCharacters = (input?: string) => {
    // Return the input if not a string
    if (typeof input !== 'string') return input;
    return input.replace(/[^a-zA-Z0-9 ]/g, '');
};

export {
    filterImageSet,
    isValidValue,
    generateQR,
    formatTextForAdvancedColorRendering,
    getImageOrientation,
    getOptimizedImage,
    mapFromEntries,
    isValidUrl,
    cloneObject,
    getUrlExtension,
    generateSessionID,
    pad,
    convertNullUndefinedPropertiesToEmptyString,
    dispatchKeyboardEvent,
    removeNullUndefinedProperties,
    generatePathFromErrorObject,
    extractCommaSeparatedParams,
    promiseAllSettled,
    extractValueFromParentheses,
    getRouteFromHash,
    generate_HMAC_Signature,
    setAnimationFrameTimeout,
    clearAnimationFrameTimeout,
    generateEngageClientID,
    throttle,
    removeSpecialCharacters,
};
