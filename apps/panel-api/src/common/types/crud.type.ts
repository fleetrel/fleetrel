import { EntityCreateInput } from "./entity-create-input.type"

export interface ICrud<ENTITY> {
  create: (entity: EntityCreateInput<ENTITY>) => Promise<ENTITY>
  deleteById: (id: string) => Promise<boolean>
  findByCriteria: (entity: Partial<ENTITY>) => Promise<ENTITY[]>
  findById: (id: string) => Promise<ENTITY | null>
  update: (entity: ENTITY) => Promise<ENTITY | null>
}
