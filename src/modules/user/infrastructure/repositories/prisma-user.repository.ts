import { Injectable } from '@nestjs/common';
import { UserEntity, UserProps } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class PrismaUserRepository implements IUserRepository {
  // Constructor will inject PrismaService
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) return null;

    return UserEntity.reconstitute({
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role as any,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      passwordHash: user.passwordHash,
    });
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return UserEntity.reconstitute({
      id: user.id,
      email: user.email,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      role: user.role as any,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
      passwordHash: user.passwordHash,
    });
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const snapshot = user.toSnapshot();
    
    const updatedUser = await this.prisma.user.update({
      where: { id: snapshot.id },
      data: {
        email: snapshot.email,
        firstName: snapshot.firstName,
        lastName: snapshot.lastName,
        role: snapshot.role,
        isActive: snapshot.isActive,
        isEmailVerified: snapshot.isEmailVerified,
        updatedAt: snapshot.updatedAt,
        deletedAt: snapshot.deletedAt,
        passwordHash: snapshot.passwordHash || '',
      },
    });

    return UserEntity.reconstitute({
      id: updatedUser.id,
      email: updatedUser.email,
      firstName: updatedUser.firstName || '',
      lastName: updatedUser.lastName || '',
      role: updatedUser.role as any,
      isActive: updatedUser.isActive,
      isEmailVerified: updatedUser.isEmailVerified,
      createdAt: updatedUser.createdAt,
      updatedAt: updatedUser.updatedAt,
      deletedAt: updatedUser.deletedAt,
      passwordHash: updatedUser.passwordHash,
    });
  }
}