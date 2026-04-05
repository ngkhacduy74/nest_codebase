import { StringField } from '@/decorators/field.decorators';
import { EnumField } from '@/decorators/field.decorators';
import { Role } from '../../domain/enums/role.enum';

export class UpdateUserDto {
  @StringField({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  firstName?: string;

  @StringField({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
    required: false,
  })
  lastName?: string;

  @EnumField(Role, {
    description: 'User role',
    example: 'user',
    required: false,
  })
  role?: Role;
}