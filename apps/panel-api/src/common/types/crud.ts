export interface ICrud<ENTITY> {
  create: (entity: ENTITY) => Promise<ENTITY>
  deleteById: (id: string) => Promise<boolean>
  findByCriteria: (entity: Partial<ENTITY>) => Promise<ENTITY[]>
  findById: (id: string) => Promise<ENTITY | null>
  update: (entity: ENTITY) => Promise<ENTITY | null>
}
