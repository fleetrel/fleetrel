import { randomUUID } from "node:crypto"

export abstract class BaseEntity {
  readonly id: string
  readonly createdAt?: Date
  readonly updatedAt?: Date

  protected constructor(props: { id?: string; createdAt?: Date; updatedAt?: Date }) {
    this.id = props.id ?? randomUUID()
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  isPersisted(): boolean {
    return !!this.createdAt && !!this.updatedAt
  }
}
