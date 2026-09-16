import { Injectable, Logger } from "@nestjs/common"
import { Transactional } from "@nestjs-cls/transactional"

import { canAssignRole, ERRORS, hasPermissions, PERMISSIONS, Role } from "@fleetrel/contract"

import { fail, isPrismaError, ok, ResultFailure, TResult, unwrap } from "../../common/utils"

import { CreateUserDto } from "./dtos"
import { UserEntity } from "./entities"
import { UserRepository } from "./repositories"

/** Throws a `ResultFailure` so the enclosing `@Transactional()` boundary rolls back. */
function abortWith(error: { code: string; message: string }): never {
  throw new ResultFailure({ isOk: false, code: error.code, message: error.message })
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private readonly userRepository: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<TResult<UserEntity>> {
    try {
      this.logger.debug("createUser: creating user record")
      const result = await this.userRepository.create({
        email: dto.email,
        password: dto.password,
        role: dto.role,
      })

      this.logger.log(`createUser: user created userId=${result.id} role=${result.role}`)
      return ok(result)
    } catch (error) {
      if (isPrismaError(error)) {
        if (error.code === "P2002") {
          this.logger.warn(`createUser: duplicate email conflict`)
          return fail(ERRORS.USER_ALREADY_EXISTS)
        }
        this.logger.error(
          `createUser: Prisma error code=${error.code}`,
          error instanceof Error ? error.stack : String(error),
        )
      } else {
        this.logger.error("createUser failed", error instanceof Error ? error.stack : String(error))
      }
      return fail(ERRORS.CREATE_USER_ERROR)
    }
  }

  async findUserById(userId: string): Promise<TResult<UserEntity>> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      this.logger.warn(`findUserById: user not found userId=${userId}`)
      return fail(ERRORS.USER_NOT_FOUND)
    }
    return ok(user)
  }

  async findUserEntityByEmail(email: string): Promise<TResult<UserEntity>> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) return fail(ERRORS.USER_NOT_FOUND)
    return ok(user)
  }

  /**
   * Serializes role-dependent mutations for the rest of the current transaction.
   * Callers must already be inside a `@Transactional()` boundary.
   */
  async lockRoleMutations(): Promise<void> {
    await this.userRepository.lockRoleMutations()
  }

  /** Whether at least one user exists; used to close sign-up after owner bootstrap. */
  async hasAnyUser(): Promise<boolean> {
    return (await this.userRepository.countAll()) > 0
  }

  async listUsers(): Promise<TResult<UserEntity[]>> {
    return ok(await this.userRepository.findAll())
  }

  /**
   * Changes `targetId`'s role on behalf of `actorId`. Enforces rank rules
   * (`canAssignRole`) and keeps at least one owner in the panel.
   */
  async changeRole(actorId: string, targetId: string, role: Role): Promise<TResult<UserEntity>> {
    try {
      const user = await this.changeRoleTransactional(actorId, targetId, role)
      return ok(user)
    } catch (error) {
      if (error instanceof ResultFailure) return error.result

      this.logger.error("changeRole failed", error instanceof Error ? error.stack : String(error))
      return fail(ERRORS.USER_ROLE_CHANGE_ERROR)
    }
  }

  /**
   * Checks and update run under the role-mutation lock, so two owners cannot
   * demote each other concurrently and leave the panel without an owner. The
   * actor is re-read under the lock: its role may have changed after the
   * permission guard evaluated the request.
   */
  @Transactional()
  private async changeRoleTransactional(
    actorId: string,
    targetId: string,
    role: Role,
  ): Promise<UserEntity> {
    await this.userRepository.lockRoleMutations()

    const actor = await this.userRepository.findById(actorId)
    if (!actor || !hasPermissions(actor.role, [PERMISSIONS.USERS_MANAGE])) {
      abortWith(ERRORS.PERMISSION_DENIED)
    }

    const target = unwrap(await this.findUserById(targetId))
    if (target.role === role) return target

    if (!canAssignRole(actor.role, target.role, role)) {
      this.logger.warn(
        `changeRole: forbidden actorId=${actorId} targetId=${targetId} ${target.role}->${role}`,
      )
      abortWith(ERRORS.USER_ROLE_CHANGE_FORBIDDEN)
    }

    if (target.role === "owner" && (await this.userRepository.countByRole("owner")) <= 1) {
      abortWith(ERRORS.USER_LAST_OWNER)
    }

    const updated = await this.userRepository.updateRole(targetId, role)
    this.logger.log(
      `changeRole: role changed actorId=${actorId} targetId=${targetId} ${target.role}->${role}`,
    )
    return updated
  }
}
