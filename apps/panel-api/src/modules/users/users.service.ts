import { Injectable, Logger } from "@nestjs/common"
import { UserRepository } from "./repositories"
import { UserResponseModel } from "./models"
import { CreateUserDto } from "./dtos"
import { fail, isPrismaError, ok, TResult } from "../../common/utils"
import { ERRORS } from "@fleetrel/contract"
import { UserEntity } from "./entities"

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private readonly userRepository: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<TResult<UserResponseModel>> {
    try {
      this.logger.debug("createUser: creating user record")
      const result = await this.userRepository.create({
        email: dto.email,
        password: dto.password,
      })

      this.logger.log(`createUser: user created userId=${result.id}`)
      return ok(new UserResponseModel(result))
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

  async findUserById(userId: string): Promise<TResult<UserResponseModel>> {
    const user = await this.userRepository.findById(userId)
    if (!user) {
      this.logger.warn(`findUserById: user not found userId=${userId}`)
      return fail(ERRORS.USER_NOT_FOUND)
    }
    return ok(new UserResponseModel(user))
  }

  async findUserEntityByEmail(email: string): Promise<TResult<UserEntity>> {
    const user = await this.userRepository.findByEmail(email)
    if (!user) return fail(ERRORS.USER_NOT_FOUND)
    return ok(user)
  }
}
