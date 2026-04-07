import { Module } from '@nestjs/common';
import { ProductController } from './presentation/controllers/product.controller';
import { PrismaProductRepository } from './infrastructure/repositories/prisma-product.repository';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import { CreateProductUseCase } from './application/use-cases/create-product.use-case';

@Module({
  controllers: [ProductController],
  providers: [
    // Repository binding - chỉ đổi 1 dòng này để swap DB
    {
      provide: INJECTION_TOKENS.PRODUCT_REPOSITORY,
      useClass: PrismaProductRepository, // ← ĐỔI DUY NHẤT DÒNG NÀY ĐỂ SWAP DB
    },

    // Use-cases
    CreateProductUseCase,
  ],
  exports: [INJECTION_TOKENS.PRODUCT_REPOSITORY],
})
export class ProductModule {}
