import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user.repository';

@Module({
  controllers: [UserController],
  providers: [
    {
      provide: 'IUserRepository',
      useClass: PrismaUserRepository,
    },
  ],
  exports: ['IUserRepository'],
})
export class UserModule {}
