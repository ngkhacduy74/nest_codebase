import { Inject, Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUserRepository, CreateUserDataDto, CreateUserDto } from '../../domain/repositories/user.repository.interface';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import { UserEntity } from '../../domain/entities/user.entity';
import { ConflictError } from '@/common/domain/errors/application.error';

@Injectable()
export class CreateUserUseCase {
  private readonly logger = new Logger(CreateUserUseCase.name);

  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY) private readonly userRepo: IUserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(dto: CreateUserDataDto): Promise<UserEntity> {
    const exists = await this.userRepo.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictError(`User with email ${dto.email} already exists`);
    }

    const { v4: uuidv4 } = await import('uuid');
    const argon2 = await import('argon2');
    
    const passwordHash = await argon2.hash(dto.password);

    const user = await this.userRepo.create({
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      passwordHash,
      role: dto.role,
    });

    // Emit event — listener sẽ push vào queue async
    this.eventEmitter.emit('user.created', {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      createdAt: user.createdAt,
    });

    return user;
  }
}
