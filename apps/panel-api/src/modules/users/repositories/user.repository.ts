import { Injectable } from "@nestjs/common"
import { TransactionHost } from "@nestjs-cls/transactional"
import { TransactionalAdapterPrisma } from "@nestjs-cls/transactional-adapter-prisma"

import { PrismaClient } from "../../../common/database"
import { ICrud } from "../../../common/types"
import { EntityCreateInput } from "../../../common/types"
import { UserEntity } from "../entities"
import { UserMapper } from "../mappers"

@Injectable()
export class UserRepository implements ICrud<UserEntity> {
  constructor(
    private readonly prisma: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
    private readonly mapper: UserMapper,
  ) {}

  public async create(entity: EntityCreateInput<UserEntity>): Promise<UserEntity> {
    const result = await this.prisma.tx.user.create({ data: entity })
    return this.mapper.fromPrismaModelToEntity(result)
  }

  public async deleteById(id: string): Promise<boolean> {
    await this.prisma.tx.user.delete({ where: { id } })
    return true
  }

  public async findByCriteria(entity: Partial<UserEntity>): Promise<UserEntity[]> {
    const list = await this.prisma.tx.user.findMany({ where: entity })
    return this.mapper.fromPrismaModelsToEntities(list)
  }

  public async findById(id: string): Promise<UserEntity | null> {
    const model = await this.prisma.tx.user.findUnique({ where: { id } })
    if (!model) return null
    return this.mapper.fromPrismaModelToEntity(model)
  }

  public async update(entity: UserEntity): Promise<UserEntity | null> {
    const model = await this.prisma.tx.user.update({
      where: { id: entity.id },
      data: entity,
    })
    return this.mapper.fromPrismaModelToEntity(model)
  }

  public async findByEmail(email: string): Promise<UserEntity | null> {
    const model = await this.prisma.tx.user.findUnique({ where: { email } })
    if (!model) return null

    return this.mapper.fromPrismaModelToEntity(model)
  }
}
