export type ApiResponse<T> =
    | { data: T; error?: never }
    | { data: null; error: { message: string } };
