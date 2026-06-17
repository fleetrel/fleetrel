import { ICrud } from "../../../common/types"
import { AuthSessionEntity } from "../entities"
import { PrismaClient } from "../../../common/database"
import { Injectable } from "@nestjs/common"
import { TransactionHost } from "@nestjs-cls/transactional"
import { TransactionalAdapterPrisma } from "@nestjs-cls/transactional-adapter-prisma"
import { AuthSessionMapper } from "../mappers"
import { EntityCreateInput } from "../../../common/types"
import { isPrismaError } from "../../../common/utils"

@Injectable()
export class AuthSessionRepository implements ICrud<AuthSessionEntity> {
  constructor(
    private readonly prisma: TransactionHost<TransactionalAdapterPrisma<PrismaClient>>,
    private readonly mapper: AuthSessionMapper,
  ) {}

  public async create(entity: EntityCreateInput<AuthSessionEntity>): Promise<AuthSessionEntity> {
    const result = await this.prisma.tx.authSession.create({ data: entity })
    return this.mapper.fromPrismaModelToEntity(result)
  }

  public async deleteById(id: string): Promise<boolean> {
    await this.prisma.tx.authSession.delete({ where: { id } })
    return true
  }

  public async findByCriteria(entity: Partial<AuthSessionEntity>): Promise<AuthSessionEntity[]> {
    const list = await this.prisma.tx.authSession.findMany({ where: entity })
    return this.mapper.fromPrismaModelsToEntities(list)
  }

  public async findById(id: string): Promise<AuthSessionEntity | null> {
    const model = await this.prisma.tx.authSession.findUnique({ where: { id } })
    if (!model) return null
    return this.mapper.fromPrismaModelToEntity(model)
  }

  public async update(entity: AuthSessionEntity): Promise<AuthSessionEntity | null> {
    const model = await this.prisma.tx.authSession.update({
      where: { id: entity.id },
      data: entity,
    })
    return this.mapper.fromPrismaModelToEntity(model)
  }

  /**
   * Atomically replaces `currentHash` with `newHash` for the given session.
   * Returns `true` on success, `false` if the session does not exist or
   * `currentHash` no longer matches (concurrent rotation already happened).
   * Throws on unexpected DB errors so callers can propagate them.
   */
  public async compareAndSwapTokenHash(
    id: string,
    currentHash: string,
    newHash: string,
  ): Promise<boolean> {
    try {
      await this.prisma.tx.authSession.update({
        where: { id, refreshTokenHash: currentHash },
        data: { refreshTokenHash: newHash, lastActiveAt: new Date() },
      })
      return true
    } catch (error) {
      if (isPrismaError(error) && error.code === "P2025") return false
      throw error
    }
  }
}
