import { stylesUtilities } from '.';

const { convertColorToHexString } = stylesUtilities;

let CANVAS_INSTANCE: HTMLCanvasElement | null = null;

/**
 * @name deleteCanvasSection
 * @type function/method
 * @description This function will delete the section of the canvas.
 * @param {HTMLCanvasElement} canvas - the canvas that need to be trimmed.
 * @param {number} x - starting x point
 * @param {number} y - starting y point
 * @param {number} width - width of the section
 * @param {number} height - height of the section
 *
 * @author amalmohann
 */
function deleteCanvasSection(canvas: HTMLCanvasElement, x: number, y: number, width: number, height: number) {
    const ctx = canvas.getContext('2d');
    ctx?.clearRect(x, y, width - x, height - y);
}

/**
 * @name setCanvasBackgroundColor
 * @type function/method
 * @description This function will add a background color to the canvas.
 * @param {HTMLCanvasElement} canvas - the canvas reference.
 * @param {string} color - color to set as background color
 *
 * @author tonyaugustine
 */

function setCanvasBackgroundColor(canvas: HTMLCanvasElement, color: string) {
    canvas.style.backgroundColor = convertColorToHexString(color);
}

/**
 * @name setCanvasTransparent
 * @type function/method
 * @description This function will make the canvas transparent.
 * @param {HTMLCanvasElement} canvas - the canvas reference.
 *
 * @author tonyaugustine
 */
function setCanvasTransparent(canvas: HTMLCanvasElement) {
    canvas.style.backgroundColor = 'transparent';
}

/**
 * @name getCanvasInstance
 * @type function
 * @description This function will return the canvas instance if it there in variable cache / window object
 * @return { HTMLCanvasElement| null } - html canvas instance
 * @author amalmohann
 */
const getCanvasInstance = () => {
    if (!CANVAS_INSTANCE) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        CANVAS_INSTANCE = window.CANVAS_INSTANCE;
    }
    return CANVAS_INSTANCE;
};

/**
 * @name setCanvasInstance
 * @type function
 * @description This function will set the canvas instance as null in variable cache / window object
 * @param { HTMLCanvasElement | null} instance.
 *
 * @author amalmohann
 */
const setCanvasInstance = (instance: HTMLCanvasElement | null = null) => {
    CANVAS_INSTANCE = instance;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    //@ts-ignore
    window.CANVAS_INSTANCE = instance;
};

export { deleteCanvasSection, setCanvasBackgroundColor, setCanvasTransparent, getCanvasInstance, setCanvasInstance };
