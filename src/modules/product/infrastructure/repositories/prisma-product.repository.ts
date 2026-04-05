import { Injectable } from '@nestjs/common';
import { Prisma } from '@/generated/prisma/client';
import { ProductEntity } from '../../domain/entities/product.entity';
import { IProductRepository, PaginationOptions, PaginatedResult, CreateProductDto, UpdateProductDto } from '../../domain/repositories/product.repository.interface';
import { PrismaService } from '@/modules/prisma/prisma.service';
import { BaseRepository, PaginationResult } from '@/common/repositories/base.repository';
import { AppError } from '@/common/errors/app.error';
import { AppLoggerService } from '@/common/services/logger.service';

@Injectable()
export class PrismaProductRepository extends BaseRepository<ProductEntity> implements IProductRepository {
  constructor(
    prisma: PrismaService,
    logger: AppLoggerService,
  ) {
    super(prisma, logger, 'Product');
  }

  protected getModel() {
    return this.prisma.product;
  }

  private mapToDomain(product: any): ProductEntity {
    return ProductEntity.reconstitute({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    });
  }

  async findById(id: string): Promise<ProductEntity | null> {
    const product = await super.findById(id);
    return product ? this.mapToDomain(product) : null;
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<ProductEntity>> {
    const { page, limit, sortBy = 'createdAt', sortOrder = 'desc' } = options;
    
    const result = await super.findManyWithPagination(
      undefined,
      { page, limit, sortBy, sortOrder }
    );
    
    return {
      data: result.data.map(product => this.mapToDomain(product)),
      pagination: result.pagination,
    };
  }

  async create(data: CreateProductDto): Promise<ProductEntity> {
    const product = await super.create(data);
    return this.mapToDomain(product);
  }

  async update(id: string, data: UpdateProductDto): Promise<ProductEntity> {
    const product = await super.update(id, data);
    return this.mapToDomain(product);
  }

  async delete(id: string): Promise<void> {
    await super.delete(id);
  }

  async count(where?: any): Promise<number> {
    return await super.count(where);
  }

  async exists(where: any): Promise<boolean> {
    return await super.exists(where);
  }

  async existsByName(name: string): Promise<boolean> {
    return await super.exists({ name });
  }
}
