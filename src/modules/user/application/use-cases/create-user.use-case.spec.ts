import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { USER_REPOSITORY } from '@/constants/injection-tokens';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConflictException } from '@nestjs/common';
import { CreateUserDataDto } from '../../domain/repositories/user.repository.interface';
import { Role } from '../../domain/enums/role.enum';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repo: any;
  let eventEmitter: any;

  beforeEach(async () => {
    repo = {
      findByEmail: jest.fn(),
      create: jest.fn(),
    };
    eventEmitter = {
      emit: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateUserUseCase,
        { provide: USER_REPOSITORY, useValue: repo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
  });

  it('should create a user successfully and emit UserCreatedEvent', async () => {
    // Arrange
    const dto: CreateUserDataDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
    };
    repo.findByEmail.mockResolvedValue(null);
    repo.create.mockResolvedValue(undefined);

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.email).toBe(dto.email);
    expect(repo.create).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith('user.created', expect.objectContaining({
      email: dto.email,
      fullName: 'John Doe',
    }));
  });

  it('should throw ConflictException if email already exists', async () => {
    // Arrange
    const dto: CreateUserDataDto = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      role: Role.USER,
    };
    repo.findByEmail.mockResolvedValue({ id: 'existing-id' });

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
    expect(repo.create).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});
