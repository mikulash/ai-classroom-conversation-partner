export interface ErrorResponse {
    message: string;
    statusCode?: number;
    [key: string]: any; // additional properties
}
