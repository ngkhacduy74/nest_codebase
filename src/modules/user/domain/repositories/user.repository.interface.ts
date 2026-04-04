import { UserEntity } from '../entities/user.entity';
import { Role } from '../enums/role.enum';

export interface IUserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  findById(id: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}