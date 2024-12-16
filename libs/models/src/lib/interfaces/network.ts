/**
 * @name NetworkError
 * @description This interface will have the network error type.
 * @author amalmohann
 */
export interface NetworkError {
    statusCode: number;
    status: string;
    message: string;
    additionalData: object;
}
