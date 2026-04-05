import { PrismaService } from '@/modules/prisma/prisma.service';
import { AppLoggerService, LogContext } from '@/common/services/logger.service';
import { AppError } from '@/common/errors/app.error';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface QueryOptions {
  include?: any;
  select?: any;
  where?: any;
  orderBy?: any;
}

export abstract class BaseRepository<T> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly logger: AppLoggerService,
    protected readonly modelName: string,
  ) {}

  protected async executeWithLogging<R>(
    operation: string,
    callback: () => Promise<R>,
    metadata?: Record<string, any>
  ): Promise<R> {
    const timer = this.logger.startTimer(`${this.modelName}.${operation}`, metadata);
    
    try {
      const result = await callback();
      timer();
      
      this.logger.database(
        `${this.modelName} ${operation} completed successfully`,
        {
          ...metadata,
          operation: `${this.modelName}.${operation}`,
          success: true,
        }
      );
      
      return result;
    } catch (error) {
      timer();
      
      this.logger.errorWithException(
        `${this.modelName} ${operation} failed`,
        error as Error,
        LogContext.DATABASE,
        {
          ...metadata,
          operation: `${this.modelName}.${operation}`,
          success: false,
        }
      );

      if (error instanceof AppError) {
        throw error;
      }

      // Convert database errors to AppError
      throw AppError.databaseError(
        `Database ${operation} failed for ${this.modelName}`,
        error as Error,
        {
          modelName: this.modelName,
          operation,
        }
      );
    }
  }

  protected async findById(
    id: string,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.executeWithLogging('findById', async () => {
      const model = this.getModel();
      const result = await model.findUnique({
        where: { id },
        ...options,
      });
      
      return result as T | null;
    }, { id });
  }

  protected async findOne(
    where: any,
    options?: QueryOptions
  ): Promise<T | null> {
    return this.executeWithLogging('findOne', async () => {
      const model = this.getModel();
      const result = await model.findFirst({
        where,
        ...options,
      });
      
      return result as T | null;
    }, { where });
  }

  protected async findMany(
    where?: any,
    options?: QueryOptions
  ): Promise<T[]> {
    return this.executeWithLogging('findMany', async () => {
      const model = this.getModel();
      const result = await model.findMany({
        where,
        ...options,
      });
      
      return result as T[];
    }, { where });
  }

  protected async findManyWithPagination(
    where?: any,
    pagination?: PaginationOptions,
    options?: QueryOptions
  ): Promise<PaginationResult<T>> {
    return this.executeWithLogging('findManyWithPagination', async () => {
      const model = this.getModel();
      const page = pagination?.page || 1;
      const limit = pagination?.limit || 10;
      const skip = (page - 1) * limit;

      // Get total count
      const total = await model.count({ where });

      // Get data
      const orderBy = pagination?.sortBy 
        ? { [pagination.sortBy]: pagination.sortOrder || 'asc' }
        : options?.orderBy || {};

      const data = await model.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        ...options,
      });

      const totalPages = Math.ceil(total / limit);

      return {
        data: data as T[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      };
    }, { where, pagination });
  }

  protected async create(
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<T> {
    return this.executeWithLogging('create', async () => {
      const model = this.getModel();
      const result = await model.create({
        data,
        ...options,
      });
      
      return result as T;
    }, { data });
  }

  protected async createMany(
    data: Partial<T>[]
  ): Promise<{ count: number }> {
    return this.executeWithLogging('createMany', async () => {
      const model = this.getModel();
      const result = await model.createMany({
        data,
      });
      
      return result;
    }, { count: data.length });
  }

  protected async update(
    id: string,
    data: Partial<T>,
    options?: QueryOptions
  ): Promise<T> {
    return this.executeWithLogging('update', async () => {
      const model = this.getModel();
      const result = await model.update({
        where: { id },
        data,
        ...options,
      });
      
      return result as T;
    }, { id, data });
  }

  protected async updateMany(
    where: any,
    data: Partial<T>
  ): Promise<{ count: number }> {
    return this.executeWithLogging('updateMany', async () => {
      const model = this.getModel();
      const result = await model.updateMany({
        where,
        data,
      });
      
      return result;
    }, { where, data });
  }

  protected async delete(
    id: string,
    options?: QueryOptions
  ): Promise<T> {
    return this.executeWithLogging('delete', async () => {
      const model = this.getModel();
      const result = await model.delete({
        where: { id },
        ...options,
      });
      
      return result as T;
    }, { id });
  }

  protected async deleteMany(
    where: any
  ): Promise<{ count: number }> {
    return this.executeWithLogging('deleteMany', async () => {
      const model = this.getModel();
      const result = await model.deleteMany({
        where,
      });
      
      return result;
    }, { where });
  }

  protected async count(
    where?: any
  ): Promise<number> {
    return this.executeWithLogging('count', async () => {
      const model = this.getModel();
      const result = await model.count({ where });
      
      return result;
    }, { where });
  }

  protected async exists(
    where: any
  ): Promise<boolean> {
    return this.executeWithLogging('exists', async () => {
      const model = this.getModel();
      const result = await model.count({ where });
      
      return result > 0;
    }, { where });
  }

  // Transaction support
  protected async runInTransaction<R>(
    callback: (tx: any) => Promise<R>,
    metadata?: Record<string, any>
  ): Promise<R> {
    return this.executeWithLogging('transaction', async () => {
      return await this.prisma.$transaction(callback);
    }, metadata);
  }

  // Health check
  protected async healthCheck(): Promise<{
    connected: boolean;
    responseTime: number;
    error?: string;
  }> {
    const startTime = Date.now();
    
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - startTime;
      
      return {
        connected: true,
        responseTime,
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        connected: false,
        responseTime,
        error: (error as Error).message,
      };
    }
  }

  // Abstract method to get the specific model
  protected abstract getModel(): any;
}
