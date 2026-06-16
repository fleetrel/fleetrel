export interface IMapper<T, U> {
  fromEntitiesToPrismaModels(entities: T[]): U[]
  fromEntityToPrismaModel(entity: T): U

  fromPrismaModelsToEntities(prismaModels: U[]): T[]
  fromPrismaModelToEntity(prismaModel: U): T
}
