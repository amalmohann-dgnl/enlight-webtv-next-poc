/**
 * @name getProgressByTime
 * @type function
 * @description This function will return the current progress of an event
 * @param {number | null} startTime - start time
 * @param {number | null} endTime - end time
 * @return {number} current progress
 *
 * @author alwin-baby
 */
const getProgressByTime = (startTime: number | null, endTime: number | null) => {
    let progress = 0;
    if (startTime && endTime) {
        const timeNow = Date.now();
        const duration = endTime - startTime;
        const elapsedTime = timeNow - startTime;
        progress = elapsedTime / duration;
    }
    return progress;
};

/**
 * @name getProgressByProgress
 * @type function
 * @description This function will return the current progress of an event
 * @param {number | null} progress - progress
 * @param {number | null} duration - duration
 * @return {number} current progress
 *
 * @author amalmohann
 */
const getProgressByProgress = (progress: number | null | undefined, duration: number | null) => {
    let progressValue = 0;
    if (progress && duration) {
        progressValue = progress / duration;
    }
    return progressValue;
};

export { getProgressByTime, getProgressByProgress };
