import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@/generated/prisma/client';
import { UserEntity } from '../../domain/entities/user.entity';
import { Role } from '../../domain/enums/role.enum';
import {
  IUserRepository,
  PaginationOptions,
  PaginatedResult,
  CreateUserDto,
  UpdateUserDto,
} from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { AppLoggerService } from '@/common/services/logger.service';
import { PrismaBaseRepository } from '@/common/repositories/prisma-base.repository';
import {
  UserAlreadyExistsError,
  UserNotFoundException,
} from '@/common/domain/errors/application.error';

@Injectable()
export class PrismaUserRepository
  extends PrismaBaseRepository<User>
  implements IUserRepository
{
  constructor(
    prisma: PrismaService,
    logger: AppLoggerService,
  ) {
    super(prisma, logger, 'User');
  }

  protected getModelDelegate() {
    return this.prisma.user as any;
  }

  private mapToDomain(user: User): UserEntity {
    const firstName = user.firstName ?? '';
    const lastName = user.lastName ?? '';

    return UserEntity.reconstitute({
      id: user.id,
      email: user.email,
      firstName,
      lastName,
      role: user.role as Role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      passwordHash: user.passwordHash,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return this.executeWithLogging(
      'findByEmail',
      async () => {
        const user = await this.prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
        return user ? this.mapToDomain(user) : null;
      },
      { email },
    );
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await super.findById(id);
    return user ? this.mapToDomain(user) : null;
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<UserEntity>> {
    const where = { deletedAt: null, isActive: true };
    const result = await this.findManyWithPagination(where, options);
    return {
      ...result,
      data: result.data.map((user) => this.mapToDomain(user)),
    };
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
    return this.executeWithLogging(
      'create',
      async () => {
        try {
          const created = await this.prisma.user.create({
            data: {
              email: data.email,
              firstName: data.firstName,
              lastName: data.lastName,
              role: data.role,
              passwordHash: data.passwordHash,
              isActive: true,
              isEmailVerified: false,
            },
          });
          return this.mapToDomain(created);
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2002'
          ) {
            throw new UserAlreadyExistsError(data.email);
          }
          throw error;
        }
      },
      { email: data.email },
    );
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity> {
    return this.executeWithLogging(
      'update',
      async () => {
        try {
          const updated = await this.prisma.user.update({
            where: { id },
            data: {
              ...(data.firstName != null && { firstName: data.firstName }),
              ...(data.lastName != null && { lastName: data.lastName }),
              ...(data.role != null && { role: data.role }),
              updatedAt: new Date(),
            },
          });
          return this.mapToDomain(updated);
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            throw new UserNotFoundException(id);
          }
          throw error;
        }
      },
      { id },
    );
  }

  async delete(id: string): Promise<void> {
    return this.executeWithLogging(
      'delete',
      async () => {
        try {
          await this.prisma.user.update({
            where: { id },
            data: { deletedAt: new Date(), isActive: false },
          });
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === 'P2025'
          ) {
            throw new UserNotFoundException(id);
          }
          throw error;
        }
      },
      { id },
    );
  }

  async existsByEmail(email: string): Promise<boolean> {
    return this.exists({ email: email.toLowerCase() });
  }
}
