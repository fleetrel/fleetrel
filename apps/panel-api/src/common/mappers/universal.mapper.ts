import { IMapper } from "../types"

export class UniversalMapper<T, U> implements IMapper<T, U> {
  constructor(
    private readonly entityFactory: (model: U) => T,
    private readonly modelFactory: (entity: T) => U,
  ) {}

  fromPrismaModelToEntity(prismaModel: U): T {
    return this.entityFactory(prismaModel)
  }

  fromPrismaModelToEntityOrNull(prismaModel: null | U): null | T {
    return prismaModel != null ? this.fromPrismaModelToEntity(prismaModel) : null
  }

  fromPrismaModelsToEntities(prismaModels: U[]): T[] {
    return prismaModels.map((model) => this.fromPrismaModelToEntity(model))
  }

  fromEntityToPrismaModel(entity: T): U {
    return this.modelFactory(entity)
  }

  fromEntitiesToPrismaModels(entities: T[]): U[] {
    return entities.map((entity) => this.fromEntityToPrismaModel(entity))
  }
}
