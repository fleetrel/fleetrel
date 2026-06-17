import { Prisma } from "../database"

export const isPrismaError = (error: unknown) =>
  error instanceof Prisma.PrismaClientKnownRequestError
