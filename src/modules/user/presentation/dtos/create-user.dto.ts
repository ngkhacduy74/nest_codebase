import { EmailField } from '@/decorators/field.decorators';
import { StringField } from '@/decorators/field.decorators';
import { PasswordField } from '@/decorators/field.decorators';
import { EnumField } from '@/decorators/field.decorators';
import { Role } from '../../domain/enums/role.enum';

export class CreateUserDto {
  @EmailField({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  email: string;

  @StringField({
    description: 'User first name',
    example: 'John',
    minLength: 2,
    maxLength: 50,
  })
  firstName: string;

  @StringField({
    description: 'User last name',
    example: 'Doe',
    minLength: 2,
    maxLength: 50,
  })
  lastName: string;

  @PasswordField({
    description: 'User password',
    example: 'SecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  password: string;

  @EnumField(Role, {
    description: 'User role (optional)',
    example: 'user',
    required: false,
  })
  role?: Role;
}