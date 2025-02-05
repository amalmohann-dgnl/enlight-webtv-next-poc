import { isValidValue } from './common.utils';

/**
 * @name formatDate
 * @description Formats a date object to a string using the given format string.
 * @param {Date} date The date object to format.
 * @param {string} format The format string to use. The format string can contain any of the following placeholders:
 *   * `yyyy`: The four-digit year.
 *   * `MM`: The two-digit month (padded with a leading zero if necessary).
 *   * `MMM`: The short month name (e.g. `Sep`).
 *   * `MMMM`: The long month name (e.g. `September`).
 *   * `dd`: The two-digit day of the month (padded with a leading zero if necessary).
 *   * `HH`: The two-digit hour (padded with a leading zero if necessary).
 *   * `mm`: The two-digit minute (padded with a leading zero if necessary).
 *   * `ss`: The two-digit second (padded with a leading zero if necessary).
 *   * `EEE`: The short weekday name (e.g. `Mon`).
 *   * `EEEE`: The long weekday name (e.g. `Monday`).
 * @param {string} separator - the separator used in the format.
 * @returns {string} A string containing the formatted date.
 *
 * @author amalmohann
 */
function formatDate(date: Date, format: string, separator: string): string {
    // Create a new string to store the formatted date string.
    let formattedDate = '';
    if (!isValidValue(date)) {
        return formattedDate;
    }

    const tokens = format.split(' ');

    // Iterate over the characters of the format string and replace them with the corresponding date values.
    for (const token of tokens) {
        switch (token) {
            case 'yyyy':
                formattedDate += date.getFullYear() + separator;
                break;
            case 'MM':
                formattedDate += (date.getMonth() + 1).toString().padStart(2, '0') + separator;
                break;
            case 'MMM':
                formattedDate += date.toLocaleString('en-US', { month: 'short' }) + separator;
                break;
            case 'MMMM':
                formattedDate += date.toLocaleString('en-US', { month: 'long' }) + separator;
                break;
            case 'dd':
                formattedDate += date.getDate().toString().padStart(2, '0') + separator;
                break;
            case 'HH':
                formattedDate += date.getHours().toString().padStart(2, '0') + separator;
                break;
            case 'mm':
                formattedDate += date.getMinutes().toString().padStart(2, '0') + separator;
                break;
            case 'ss':
                formattedDate += date.getSeconds().toString().padStart(2, '0') + separator;
                break;
            case 'EEE':
                formattedDate += date.toLocaleDateString('en-US', { weekday: 'short' }) + separator;
                break;
            case 'EEEE':
                formattedDate += date.toLocaleDateString('en-US', { weekday: 'long' }) + separator;
                break;
            default:
                // If the token is not a recognized date placeholder, simply append it to the formatted date string.
                formattedDate += token;
                break;
        }
    }

    // Return the formatted date string.
    return formattedDate;
}

/**
 * @name getDifferenceInDaysHoursMinutes
 * @description Returns a string representing the difference between two dates in days, hours, and minutes.
 * @param {Date} startDate The start date.
 * @param {Date} endDate The end date.
 *
 * @returns {string} A string representing the difference between the two dates in days, hours, and minutes.
 */
function getDifferenceInDaysHoursMinutes(startDate: Date, endDate: Date): string {
    // Calculate the difference in milliseconds between the two dates.
    const diffInMs = endDate.getTime() - startDate.getTime();

    // Calculate the difference in days, hours, and minutes.
    const diffInDays = Math.floor(diffInMs / (1000 * 24 * 60 * 60));
    const diffInHours = Math.floor((diffInMs - diffInDays * 1000 * 24 * 60 * 60) / (1000 * 60 * 60));
    const diffInMinutes = Math.floor((diffInMs - diffInDays * 1000 * 24 * 60 * 60 - diffInHours * 1000 * 60 * 60) / (1000 * 60));

    //creating the result string
    let difference = '';
    if (diffInDays > 0) {
        difference += ` ${diffInDays.toString().padStart(2, '0')} days`;
    }
    if (diffInHours > 0 || (diffInDays > 0 && diffInMinutes > 0)) {
        difference += ` ${diffInHours.toString().padStart(2, '0')} hr`;
    }
    if (diffInMinutes > 0) {
        difference += ` ${diffInMinutes.toString().padStart(2, '0')} min`;
    }

    // Return a string representing the difference in days, hours, and minutes.
    return difference;
}

/**
 * @name isDateAfter
 * @description Checks if a date is after another date. (date_first is after date_second)
 * @param {Date} date_first The date to check.
 * @param {Date} date_second The date to compare against.
 * @returns {boolean} `true` if the date is after the other date, `false` otherwise.
 *
 * @author amalmohann
 */
function isDateAfter(date_first: Date, date_second: Date): boolean {
    // Convert the dates to milliseconds.
    const dateFirstInMs = date_first.getTime();
    const dateSecondInMs = date_second.getTime();

    // Return `true` if the date is after the other date, `false` otherwise.
    return dateFirstInMs > dateSecondInMs;
}

/**
 * @name isDateBefore
 * @description Checks if a date is before another date. (date_first is before date_second)
 * @param {Date} date_first The date to check.
 * @param {Date} date_second The date to compare against.
 * @returns {boolean} `true` if the date is before the other date, `false` otherwise.
 *
 * @author amalmohann
 */
function isDateBefore(date_first: Date, date_second: Date): boolean {
    // Convert the dates to milliseconds.
    const dateFirstInMs = date_first.getTime();
    const dateSecondInMs = date_second.getTime();

    // Return `true` if the date is before the other date, `false` otherwise.
    return dateFirstInMs < dateSecondInMs;
}

/**
 * @name isDateBetween
 * @description Checks if a the first date is between the other dates. (date_first is between date_second date_third)
 * @param {Date} date_first The date to check.
 * @param {Date} date_second The date to compare against.
 * @param {Date} date_third The date to compare against.
 * @returns {boolean} `true` if the date is after the other date, `false` otherwise.
 *
 * @author amalmohann
 */
function isDateBetween(date_first: Date, date_second: Date, date_third: Date): boolean {
    // Convert the dates to milliseconds.
    const dateFirstInMs = date_first.getTime();
    const dateSecondInMs = date_second.getTime();
    const dateThirdInMs = date_third.getTime();

    // Return `true` if the date is date_first is between date_second date_third, `false` otherwise.
    return dateSecondInMs < dateFirstInMs && dateFirstInMs < dateThirdInMs;
}

export { formatDate, getDifferenceInDaysHoursMinutes, isDateAfter, isDateBefore, isDateBetween };
