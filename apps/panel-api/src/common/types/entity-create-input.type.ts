export type EntityCreateInput<T> = Omit<T, "id" | "createdAt" | "updatedAt">
