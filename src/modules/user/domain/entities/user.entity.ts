import { BaseEntity } from '@/shared/domain/base.entity';

import {
  InvalidNameError,
  UserAlreadyDeactivatedError,
} from '@/shared/domain/errors/domain.error';
import { Role } from '../enums/role.enum';
import { Email } from '../value-objects/email.value-object';

// ── No Prisma imports here — domain is pure ──────────────────────────────────

export interface UserProps {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  passwordHash?: string | null;
}

export class UserEntity extends BaseEntity<string> {
  private _email: Email;
  private _firstName: string;
  private _lastName: string;
  private _role: Role;
  private _isActive: boolean;
  readonly isEmailVerified: boolean;
  readonly deletedAt?: Date | null;
  private _passwordHash?: string | null;

  private constructor(props: UserProps) {
    super(props.id, props.createdAt, props.updatedAt);
    this._email = Email.create(props.email);
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._role = props.role;
    this._isActive = props.isActive;
    this.isEmailVerified = props.isEmailVerified;
    this.deletedAt = props.deletedAt;
    this._passwordHash = props.passwordHash;
  }

  static reconstitute(props: UserProps): UserEntity {
    return new UserEntity(props);
  }

  get email(): string {
    return this._email.value;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get fullName(): string {
    return `${this._firstName} ${this._lastName}`;
  }
  get role(): Role {
    return this._role;
  }
  get isActive(): boolean {
    return this._isActive;
  }
  get isDeleted(): boolean {
    return !!this.deletedAt;
  }

  deactivate(): void {
    if (!this._isActive) {
      throw new UserAlreadyDeactivatedError(this._id);
    }
    this._isActive = false;
    this.touch();
  }

  activate(): void {
    this._isActive = true;
    this.touch();
  }

  updateProfile(firstName: string, lastName: string): void {
    if (!firstName.trim()) throw new InvalidNameError('firstName');
    if (!lastName.trim()) throw new InvalidNameError('lastName');
    this._firstName = firstName.trim();
    this._lastName = lastName.trim();
    this.touch();
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this._passwordHash) return false;
    const argon2 = await import('argon2');
    return argon2.verify(this._passwordHash, password);
  }

  setPassword(password: string): void {
    // This should be called from a domain service or factory
    // For now, we'll keep it simple
    this._passwordHash = password;
    this.touch();
  }

  toSnapshot(): UserProps {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      isEmailVerified: this.isEmailVerified,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
      passwordHash: this._passwordHash,
    };
  }
}
