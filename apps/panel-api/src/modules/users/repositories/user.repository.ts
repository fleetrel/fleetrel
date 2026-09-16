import { Injectable } from "@nestjs/common"
import { TransactionHost } from "@nestjs-cls/transactional"
import { TransactionalAdapterPrisma } from "@nestjs-cls/transactional-adapter-prisma"

import { PrismaClient, UserRole } from "../../../common/database"
import { ICrud } from "../../../common/types"
import { EntityCreateInput } from "../../../common/types"
import { UserEntity } from "../entities"
import { UserMapper } from "../mappers"

/** Application-wide advisory lock key guarding role mutations (arbitrary, must stay unique). */
const ROLE_MUTATION_LOCK_KEY = 7_301_001

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

  /** Returns all users, oldest first. */
  public async findAll(): Promise<UserEntity[]> {
    const list = await this.prisma.tx.user.findMany({ orderBy: { createdAt: "asc" } })
    return this.mapper.fromPrismaModelsToEntities(list)
  }

  public async countAll(): Promise<number> {
    return this.prisma.tx.user.count()
  }

  public async countByRole(role: UserRole): Promise<number> {
    return this.prisma.tx.user.count({ where: { role } })
  }

  public async updateRole(id: string, role: UserRole): Promise<UserEntity> {
    const model = await this.prisma.tx.user.update({ where: { id }, data: { role } })
    return this.mapper.fromPrismaModelToEntity(model)
  }

  /**
   * Takes a transaction-scoped advisory lock that serializes every mutation
   * depending on the set of roles (owner bootstrap on sign-up, role changes).
   * Row locks are not enough: the first-owner check reads an empty table, and
   * the last-owner check reads rows other than the one being updated.
   * Must be called inside a `@Transactional()` boundary; released on commit/rollback.
   */
  public async lockRoleMutations(): Promise<void> {
    // $executeRaw, not $queryRaw: pg_advisory_xact_lock returns `void`, which
    // Prisma cannot deserialize as a result column.
    await this.prisma.tx
      .$executeRaw`SELECT pg_advisory_xact_lock(${ROLE_MUTATION_LOCK_KEY}::bigint)`
  }
}
