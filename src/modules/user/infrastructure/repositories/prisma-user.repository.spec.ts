import { Test, TestingModule } from '@nestjs/testing';
import { PrismaUserRepository } from './prisma-user.repository';
import { PrismaService } from '@/modules/prisma/prisma.service';

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository;
  let prisma: any;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrismaUserRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    repository = module.get<PrismaUserRepository>(PrismaUserRepository);
  });

  describe('findById', () => {
    it('should return UserEntity if user found', async () => {
      const dbUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };
      prisma.user.findUnique.mockResolvedValue(dbUser);

      const result = await repository.findById('1');

      expect(result).toBeDefined();
      expect(result?.id).toBe('1');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: '1' } });
    });

    it('should return null if user not found', async () => {
      prisma.user.findUnique.mockResolvedValue(null);
      const result = await repository.findById('1');
      expect(result).toBeNull();
    });
  });
});
