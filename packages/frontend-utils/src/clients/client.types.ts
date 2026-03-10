export interface ErrorResponse {
    message: string;
}

export interface MessageResponse {
    message: string;
}

export type ApiResponse<T> =
    | { data: T; error?: never }
    | { data: null; error: { message: string } };
