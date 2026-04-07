import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { UserEntity } from '../../domain/entities/user.entity';
import {
  IUserRepository,
  PaginationOptions,
  PaginatedResult,
  CreateUserDto,
  UpdateUserDto,
} from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '@/modules/prisma/prisma.service';
import {
  UserAlreadyExistsError,
  UserNotFoundException,
} from '@/common/domain/errors/application.error';
import { DatabaseError } from '@/common/domain/errors/infrastructure.error';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  private mapToDomain(user: any): UserEntity {
    return UserEntity.reconstitute({
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      passwordHash: user.passwordHash,
    });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });
      return user ? this.mapToDomain(user) : null;
    } catch (error) {
      throw new DatabaseError('findByEmail', error);
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
      });
      return user ? this.mapToDomain(user) : null;
    } catch (error) {
      throw new DatabaseError('findById', error);
    }
  }

  async findAll(
    options: PaginationOptions,
  ): Promise<PaginatedResult<UserEntity>> {
    try {
      const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
      const skip = (page - 1) * limit;

      const [users, total] = await Promise.all([
        this.prisma.user.findMany({
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
          where: {
            deletedAt: null, // Filter out soft-deleted users
            isActive: true,   // Only active users
          },
        }),
        this.prisma.user.count({
          where: {
            deletedAt: null, // Filter out soft-deleted users
            isActive: true,   // Only active users
          },
        }),
      ]);

      return {
        data: users.map((user) => this.mapToDomain(user)),
        total,
        page,
        limit,
      };
    } catch (error) {
      throw new DatabaseError('findAll', error);
    }
  }

  async create(data: CreateUserDto): Promise<UserEntity> {
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
      throw new DatabaseError('create', error);
    }
  }

  async update(id: string, data: UpdateUserDto): Promise<UserEntity> {
    try {
      const updated = await this.prisma.user.update({
        where: { id },
        data: {
          ...(data.firstName && { firstName: data.firstName }),
          ...(data.lastName && { lastName: data.lastName }),
          ...(data.role && { role: data.role }),
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
      throw new DatabaseError('update', error);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new UserNotFoundException(id);
      }
      throw new DatabaseError('delete', error);
    }
  }

  async existsByEmail(email: string): Promise<boolean> {
    try {
      const count = await this.prisma.user.count({
        where: { email: email.toLowerCase() },
      });
      return count > 0;
    } catch (error) {
      throw new DatabaseError('existsByEmail', error);
    }
  }

  // Backward compatibility
  async save(user: UserEntity): Promise<UserEntity> {
    const exists = await this.findById(user.id);
    if (exists) {
      const snapshot = user.toSnapshot();
      return this.update(user.id, {
        firstName: snapshot.firstName,
        lastName: snapshot.lastName,
        role: snapshot.role,
      });
    }
    const snapshot = user.toSnapshot();
    return this.create({
      email: snapshot.email,
      firstName: snapshot.firstName,
      lastName: snapshot.lastName,
      passwordHash: snapshot.passwordHash || '',
      role: snapshot.role,
    });
  }
}
