type SystemFields = "id" | "createdAt" | "updatedAt"

export type EntityCreateInput<T> = Omit<T, Extract<keyof T, SystemFields>> &
  Partial<Pick<T, Extract<keyof T, SystemFields>>>
