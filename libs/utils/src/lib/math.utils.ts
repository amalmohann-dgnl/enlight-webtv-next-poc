/**
 * @name areApproximatelyEqual
 * @description Check if two numbers are approximately equal within a specified tolerance.
 * @param {number} num1: The first number to compare.
 * @param {number} num2: The second number to compare.
 * @param {number} tolerance: The maximum allowable difference between num1 and num2 (default is 1e-3).
 * @return {boolean} True if the absolute difference between num1 and num2 is less than or equal to tolerance, False otherwise.
 *
 * @author amalmohann
 */
const areApproximatelyEqual = (num1: number, num2: number, tolerance: number = 1e-3): boolean => {
    return Math.abs(num1 - num2) <= tolerance;
};

/**
 * @name generateRandomNumber
 * @description This function generates a random number
 * @return {number} returns a random number
 *
 * @author amalmohann
 */
const generateRandomNumber = () => {
    let randomNumber = '';
    const digits = '0123456789';
    for (let i = 0; i < 10; i++) {
        randomNumber += digits[Math.floor(Math.random() * 10)];
    }
    return randomNumber;
};

/**
 * @name uniqueIdGenerator
 * @description This function generates a unique identifier
 * @return {string} returns a unique identifier
 *
 * @author amalmohann
 */
const uniqueIdGenerator = () => {
    return Date.now().toString(36) + Math.random().toString(36).slice(2);
};

export { areApproximatelyEqual, generateRandomNumber, uniqueIdGenerator };
