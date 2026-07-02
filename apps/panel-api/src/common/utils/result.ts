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

/**
 * Wraps a failed TResult so it can cross boundaries that only react to thrown
 * exceptions — e.g. @Transactional(), which commits on a normal return and
 * only rolls back when the decorated method throws.
 */
export class ResultFailure extends Error {
  constructor(readonly result: { isOk: false; code: string; message: string }) {
    super(result.message)
    this.name = "ResultFailure"
  }
}

/** Returns the value of `result`, or throws `ResultFailure` if it failed. */
export function unwrap<T>(result: TResult<T>): T {
  if (isFail(result)) throw new ResultFailure(result)
  return result.response
}
