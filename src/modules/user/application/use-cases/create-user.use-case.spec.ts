import { CreateUserUseCase } from './create-user.use-case';
import { ConflictError } from '@/common/domain/errors/application.error';
import { USER_REPOSITORY } from '@/constants/injection-tokens';
import {
  createMockRepository,
  createTestModule,
} from '@/common/utils/test-helpers';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CreateUserDataDto } from '../../domain/repositories/user.repository.interface';
import { Role } from '../../domain/enums/role.enum';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let repo: any;
  let eventEmitter: any;

  beforeEach(async () => {
    repo = createMockRepository({
      findByEmail: jest.fn(),
      existsByEmail: jest.fn(),
      create: jest.fn(),
    });

    eventEmitter = {
      emit: jest.fn(),
    };

    const module = await createTestModule({
      providers: [
        CreateUserUseCase,
        { provide: USER_REPOSITORY, useValue: repo },
        { provide: EventEmitter2, useValue: eventEmitter },
      ],
    });

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
    repo.existsByEmail.mockResolvedValue(false);
    repo.create.mockResolvedValue({
      id: '1',
      email: dto.email,
      firstName: dto.firstName,
      lastName: dto.lastName,
      createdAt: new Date(),
    });

    // Act
    const result = await useCase.execute(dto);

    // Assert
    expect(result).toBeDefined();
    expect(result.email).toBe(dto.email);
    expect(repo.create).toHaveBeenCalled();
    expect(eventEmitter.emit).toHaveBeenCalledWith(
      'user.created',
      expect.objectContaining({
        email: dto.email,
        firstName: 'John',
      }),
    );
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
    repo.existsByEmail.mockResolvedValue(true);

    // Act & Assert
    await expect(useCase.execute(dto)).rejects.toThrow(ConflictError);
    expect(repo.create).not.toHaveBeenCalled();
    expect(eventEmitter.emit).not.toHaveBeenCalled();
  });
});
