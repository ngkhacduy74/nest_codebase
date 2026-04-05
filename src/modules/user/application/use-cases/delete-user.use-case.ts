import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import { CacheKeys } from '@/constants/cache.constant';

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY) private readonly userRepo: IUserRepository,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepo.delete(id);

    try {
      await Promise.all([
        this.cache.del(CacheKeys.user(id)),
        this.cache.del(CacheKeys.userByEmail(user.email)),
        // Clear user list cache
        this.cache.del(CacheKeys.userList(1, 20)), // Clear first page
      ]);
    } catch (err) {
      this.logger.warn('Cache invalidation failed', { id, err });
      // Không throw — tiếp tục
    }

    this.eventEmitter.emit('user.deleted', {
      userId: user.id,
      email: user.email,
    });
  }
}
