import { Injectable, Logger } from "@nestjs/common"
import { UserRepository } from "./repositories"
import { UserResponseModel } from "./models"
import { CreateUserDto } from "./dtos"
import { fail, ok, TResult } from "../../common/utils"
import { Prisma } from "../../common/database"
import { ERRORS } from "@fleetrel/contract"
import { hash, verify } from "argon2"
import { UserEntity } from "./entities"

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(private readonly userRepository: UserRepository) {}

  async createUser(dto: CreateUserDto): Promise<TResult<UserResponseModel>> {
    try {
      const hashedPassword = await this.passwordHash(dto.password)

      const result = await this.userRepository.create({
        email: dto.email,
        password: hashedPassword,
      })
      return ok(new UserResponseModel(result))
    } catch (error) {
      this.logger.error(error)
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
        return fail(ERRORS.USER_ALREADY_EXISTS)
      }

      return fail(ERRORS.CREATE_USER_ERROR)
    }
  }

  async changePassword(userId: string, newPassword: string): Promise<TResult<boolean>> {
    const user = await this.userRepository.findById(userId)
    if (!user) return fail(ERRORS.USER_NOT_FOUND)

    const hashedPassword = await this.passwordHash(newPassword)

    const updateUser = await this.userRepository.update({ ...user, password: hashedPassword })
    if (!updateUser) return fail(ERRORS.USER_NOT_FOUND)

    return ok(true)
  }

  async findUser(email: string, password: string): Promise<TResult<UserEntity>> {
    const user = await this.userRepository.findByEmail(email)

    if (!user) return fail(ERRORS.USER_NOT_FOUND)

    const equalPassword = await verify(user.password, password)
    if (!equalPassword) return fail({ message: "Пороль не верный", code: "pass" })

    return ok(user)
  }

  passwordHash(password: string) {
    return hash(password)
  }
}
