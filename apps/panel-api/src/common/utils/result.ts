export type TResult<T> =
  | { isOk: true; response: T }
  | { isOk: false; code: string; message: string }

export function fail(error: { code: string; message: string }): TResult<never> {
  return {
    isOk: false,
    ...error,
  }
}

export function ok<T>(response: T): TResult<T> {
  return { isOk: true as const, response }
}

export function isFail<T>(
  result: TResult<T>,
): result is { isOk: false; code: string; message: string } {
  return !result.isOk
}
