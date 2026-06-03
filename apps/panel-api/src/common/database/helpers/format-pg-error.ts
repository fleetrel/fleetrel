interface NodeError extends Error {
  code?: string
}

export const formatPgError = (error: unknown) => {
  if (error instanceof AggregateError) {
    return error.errors
      .map((e) => {
        const code = e.code ? `[${e.code}] ` : ""
        return `${code}${e.message}`
      })
      .join(", ")
  }

  if (error instanceof Error) {
    const nodeError = error as NodeError
    const code = nodeError.code ? `[${nodeError.code}] ` : ""
    return `${code}${nodeError.message || String(error)}`
  }

  return String(error)
}
