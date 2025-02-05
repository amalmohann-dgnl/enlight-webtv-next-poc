import { LoaderId } from '@enlight-webtv/models';

/**
 * @name updatePageLoader
 * @type function/method
 * @description This function will update the loader image element.
 * @param {string} url - The image Url.
 *
 * @author alwin-baby
 */
const updatePageLoader = (loadingElement: HTMLImageElement, url: string, opacity: string = '0') => {
    if (!loadingElement) {
        return;
    }
    loadingElement.src = url || '';
    loadingElement.style.opacity = opacity;
    loadingElement.style.zIndex = '9999';
    loadingElement.style.maxHeight = '17vh';
    loadingElement.style.maxWidth = '17vw';
    const _loadingElement = loadingElement;
    // Load the image to get its natural dimensions
    loadingElement.onload = () => {
        // Calculate dimensions to maintain the aspect ratio based on the image's natural dimensions
        const aspectRatioWidth = _loadingElement.naturalWidth;
        const aspectRatioHeight = _loadingElement.naturalHeight;

        // Calculate dimensions while maintaining the aspect ratio
        let width, height;
        if (aspectRatioWidth > aspectRatioHeight) {
            width = 240;
            height = (width * aspectRatioHeight) / aspectRatioWidth;
        } else {
            height = 240;
            width = (height * aspectRatioWidth) / aspectRatioHeight;
        }

        // Set the width and height attributes of the <img> tag
        loadingElement.width = width;
        loadingElement.height = height;
        loadingElement.style.marginLeft = '0';
        loadingElement.style.marginTop = '0';

        // Center the image within the viewport
        loadingElement.style.position = 'absolute';
        loadingElement.style.top = '50%';
        loadingElement.style.left = '50%';
        loadingElement.style.transform = 'translate(-50%, -50%)';
    };
};

/**
 * @name removeSplash
 * @type function
 * @description This function will remove splash image and video tags.
 * @returns {void}
 * @author tonyaugustine
 */
const removeSplash = () => {
    const splashVideo = document.getElementById(LoaderId.VIDEOSPLASH);
    const splashImageDiv = document.getElementById(LoaderId.SPLASH);
    if (splashVideo) splashVideo.remove();
    if (splashImageDiv) splashImageDiv.remove();
};

/**
 * @name removeDomElementById
 * @type function/method
 * @description This function will remove the DOM element with the corresponding id.
 * @param {string} id - The id of the DOM element.
 *
 * @author alwin-baby
 */
const removeDomElementById = (id: string) => {
    const imageTag: HTMLElement | null = document.getElementById(id);
    imageTag && document.body.removeChild(imageTag);
};

/**
 * @name checkIsVideoSplash
 * @type function/method
 * @description This function will check is video splash is there or not.
 * @author anandpatel
 */
const checkIsVideoSplash = () => {
    const videoTag = document.getElementById(LoaderId.VIDEOSPLASH) as HTMLVideoElement;
    return videoTag?.src !== '';
};

export { updatePageLoader, removeDomElementById, checkIsVideoSplash, removeSplash };
