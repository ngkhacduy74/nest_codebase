import { Injectable, Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import { IUserRepository, PaginationOptions } from '../../domain/repositories/user.repository.interface';

@Injectable()
export class GetUsersUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(options: PaginationOptions) {
    return this.userRepository.findAll(options);
  }
}