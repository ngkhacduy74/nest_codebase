import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';

// Import use-cases
import { CreateUserUseCase } from './application/use-cases/create-user.use-case';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';
import { GetUsersUseCase } from './application/use-cases/get-users.use-case';
import { UpdateUserUseCase } from './application/use-cases/update-user.use-case';
import { DeleteUserUseCase } from './application/use-cases/delete-user.use-case';

@Module({
  controllers: [UserController],
  providers: [
    // Repository binding - chỉ đổi 1 dòng này để swap DB
    {
      provide: INJECTION_TOKENS.USER_REPOSITORY,
      useClass: PrismaUserRepository,  // ← ĐỔI DUY NHẤT DÒNG NÀY ĐỂ SWAP DB
    },
    
    // Use-cases
    CreateUserUseCase,
    GetUserByIdUseCase,
    GetUsersUseCase,
    UpdateUserUseCase,
    DeleteUserUseCase,
  ],
  exports: [INJECTION_TOKENS.USER_REPOSITORY],
})
export class UserModule {}
