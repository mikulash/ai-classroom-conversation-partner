import { ApiResponse } from '@repo/frontend-utils/src/clients/client.types';

/**
 * Most of our generated clients return an `ApiResponse<T>` discriminated union
 * (success: `{ data: T }`, failure: `{ data: null, error: { message } }`)
 * instead of throwing. TanStack Query expects `queryFn` / `mutationFn` to
 * throw on failure so it can populate `error` and skip caching. This helper
 * bridges the gap and narrows the data type to `T`.
 */
export const unwrap = <T>(result: ApiResponse<T>): T => {
  if (result.error) {
    throw new Error(result.error.message);
  }
  return result.data;
};
