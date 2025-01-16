import { CurrentEventStatus, EpochSpecificationUpto, EpochToDaysHrsMinsSecsSpecifications, LabelKey, Project } from '@enlight-webtv/models';
import { pad } from './common.utils';
import { getLabel } from './configuration.utils';

/**
 * @name currentTime
 * @type function/method
 * @description This function will return the current time.
 * @return {string} - the current time as string.
 *
 * @author amalmohann
 */
const currentTime = (): string => {
    //get current date
    const date: Date = new Date();
    const time = formatTime(date);
    return time;
};

/**
 * @name formatTime
 * @type function/method
 * @description This function will return the current time.
 * @param {Date} date - the date
 * @return {string} - the time as formatted string.
 *
 * @author amalmohann
 */
const formatTime = (date: Date) => {
    // Extract the hours and minutes
    let hours: number = date.getHours();
    const minutes: number = date.getMinutes();
    let session = 'AM';

    // Midnight hour (00) should be replaced with 12
    if (hours == 0) {
        hours = 12;
    } else if (hours >= 12) {
        // Converting to 12-hour format
        if (hours > 12) {
            hours -= 12;
        }
        session = 'PM';
    }

    // Format the hours and minutes, ensuring minutes are two digits
    const hh: string = hours.toString().padStart(2, '0');
    const mm: string = minutes.toString().padStart(2, '0');

    // Concatenate and return the time
    const time = `${hh}:${mm} ${session}`;
    return time;
};

/**
 * @name getCurrentStatus
 * @type function/method
 * @description This function will return the current status of the event.
 * @param {number} startTime - the start time of the event
 * @param {number} endTime - the end time of the event
 * @return {CurrentEventStatus | null} - the current status of the event as completed, live or upcoming.
 *
 * @author alwin-baby
 */
const getCurrentStatus = (startTime: number | null, endTime: number | null): CurrentEventStatus | null => {
    let status = CurrentEventStatus.LIVE;
    const timeNow = new Date().getTime();
    if (!startTime || !endTime) return null;
    if (startTime < timeNow && endTime < timeNow) status = CurrentEventStatus.COMPLETED;
    if (startTime > timeNow && endTime > timeNow) status = CurrentEventStatus.UPCOMING;
    return status;
};

/**
 * @name convertEpochToDaysHrsMinsSecs
 * @type function/method
 * @description This function will convert a given epoch value in ms to the corresponding value in days-hrs-mis-secs format.
 * @param {number} epoch - the time value in epoch
 * @return {string} - the converted time value as a string.
 *
 * @author alwin-baby
 */
const convertEpochToDaysHrsMinsSecs = (epoch: number, specifications: EpochToDaysHrsMinsSecsSpecifications = { upto: '' }) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const project: Project = Project.VIDEOTRON;
    const { upto } = specifications;
    let timeString = '';
    const seconds = Math.floor(epoch / 1000);

    // if negative value is recieved as argument, returns empty string
    if (seconds < 0) {
        return timeString;
    }

    const days = Math.floor(seconds / (24 * 60 * 60));
    const hoursLeftInSeconds = Math.floor(seconds - days * 24 * 60 * 60);
    const hours = Math.floor(hoursLeftInSeconds / (60 * 60));
    const minutesLeftInSeconds = Math.floor(hoursLeftInSeconds - hours * (60 * 60));
    const minutes = Math.floor(minutesLeftInSeconds / 60);
    const remainingSeconds = seconds % 60;

    const daysLabel = getLabel(LabelKey.LABEL_SPORTS_HEADER_DURATION_DAYS) as string;
    let hoursLabel = (getLabel(LabelKey.LABEL_RECENTLY_WATCHED_HR) as string) || 'hr';
    let minutesLabel = (getLabel(LabelKey.LABEL_RECENTLY_WATCHED_MIN) as string) || 'min';
    let secondsLabel = 'sec';

    if (project === Project.RALLY_TV) {
        hoursLabel = getLabel(LabelKey.LABEL_SPORTS_HEADER_DURATION_HRS) as string;
        minutesLabel = getLabel(LabelKey.LABEL_SPORTS_HEADER_DURATION_MINS) as string;
        secondsLabel = getLabel(LabelKey.LABEL_SPORTS_HEADER_DURATION_SEC) as string;
    }

    let secondsString = '';
    const daysString = `${days.toString().padStart(1, '0')} ${daysLabel}`;
    const hoursString = `${hours.toString().padStart(1, '0')} ${hoursLabel}`;
    const minutesString = `${minutes.toString().padStart(1, '0')} ${minutesLabel}`;

    if (!upto || upto === EpochSpecificationUpto.SECS) {
        secondsString = `${remainingSeconds.toString().padStart(1, '0')} ${secondsLabel}`;
    }

    if (days) {
        timeString = `${daysString} ${hoursString} ${minutesString} ${secondsString}`;
    } else if (hours) {
        timeString = `${hoursString} ${minutesString} ${secondsString}`;
    } else if (minutes || upto === EpochSpecificationUpto.MINS) {
        timeString = `${minutesString} ${secondsString}`;
    } else if (remainingSeconds >= 0) {
        timeString = secondsString;
    }

    return timeString;
};

/**
 * @name isValidDate
 * @type function
 * @description This function will check if a particular value of date is valid or not
 * @param {Date} date - The date that needs to be validated
 * @return {boolean} weather the date is valid or not
 *
 * @author alwin-baby
 */
const isValidDate = (date: Date) => {
    if (date instanceof Date && isFinite(date.getTime())) {
        return true;
    }
    return false;
};

/**
 * @name convertLocalRallyTimeToHHMM
 * @type function
 * @description This function will return the local rally time in 12 hour format
 * @param {string} dateString - date string
 * @return {string} local rally time
 *
 * @author alwin-baby
 */
const convertLocalRallyTimeToHHMM = (dateString: string) => {
    try {
        const time = dateString?.split('T')?.[1]?.split('+')?.[0];
        const splittedTime = time?.split(':');

        let hour = splittedTime?.[0] || '';
        let period = 'am';
        const minute = splittedTime?.[1] || '';

        if (parseInt(hour) === 0) {
            hour = '12';
        }

        if (parseInt(hour) >= 12) {
            hour = (parseInt(hour) % 12).toString().padStart(2, '0');
            period = 'pm';
        }

        const formattedTime = `${hour}:${minute}${period}`;
        return formattedTime;
    } catch (e) {
        return '';
    }
};

/**
 * @name has24HoursPassed
 * @type function
 * @description This function will check if 24 hours has passed from a given timestamp
 * @param {number | null} time - time for checking
 * @return {boolean} If 24 hours has passed
 *
 * @author alwin-baby
 */
const has24HoursPassed = (time: number | null = null): boolean => {
    const timeNow = Date.now();
    const twentyFourHoursInMilliseconds = 24 * 60 * 60 * 1000;
    let has24HoursPassed = false;
    if (time && timeNow - time > twentyFourHoursInMilliseconds) has24HoursPassed = true;
    return has24HoursPassed;
};

/**
 * @name getCurrentEpochTimeInSeconds
 * @type function
 * @description This function will get the current epoch time in seconds
 * @return {number} current time in seconds
 *
 * @author amalmohann
 */
const getCurrentEpochTimeInSeconds = (): number => {
    return Date.now() / 1000;
};

/**
 * @name getDateFromEpochSeconds
 * @type function
 * @description This function will get the current epoch time in seconds
 * @param {number} - seconds to be passed
 * @return {Date} date from epoch seconds
 * @author amalmohann
 */
const getDateFromEpochSeconds = (epochSeconds: number) => {
    const date = new Date(0);
    date.setUTCSeconds(epochSeconds);
    return date;
};

/**
 * @name getFormattedTimeFromEpochSeconds
 * @type function
 * @description This function will get the current epoch time in seconds
 * @param {number} - seconds to be passed
 * @return {sting} date from epoch seconds
 * @author amalmohann
 */
const getFormattedTimeFromEpochSeconds = (epochSeconds: number) => {
    const epochDate = getDateFromEpochSeconds(epochSeconds);
    return formatTime(epochDate);
};

/**
 * @name convertSecondsToHMS
 * @type function
 * @description This function will convert the time in seconds to
 * hours minutes and seconds.
 * @param {string} seconds - time in seconds
 * @return {number} time in seconds
 *
 * @author amalmohann
 */
const convertSecondsToHMS = (seconds: number) => {
    const hours = Math.floor(seconds / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    let hms = '';
    if (hours > 0) {
        hms += `${hours}:${pad(minutes)}:${pad(remainingSeconds)}`;
    } else if (minutes > 0) {
        hms += `${minutes}:${pad(remainingSeconds)}`;
    } else {
        hms += `0:${pad(remainingSeconds)}`;
    }
    return hms;
};

export {
    currentTime,
    getCurrentStatus,
    convertEpochToDaysHrsMinsSecs,
    formatTime,
    isValidDate,
    convertLocalRallyTimeToHHMM,
    has24HoursPassed,
    getCurrentEpochTimeInSeconds,
    convertSecondsToHMS,
    getDateFromEpochSeconds,
    getFormattedTimeFromEpochSeconds,
};
