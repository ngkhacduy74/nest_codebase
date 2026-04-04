import { BaseEntity } from '@/shared/domain/base.entity';
import { Role } from '../enums/role.enum';
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
export declare class UserEntity extends BaseEntity<string> {
    private _email;
    private _firstName;
    private _lastName;
    private _role;
    private _isActive;
    readonly isEmailVerified: boolean;
    readonly deletedAt?: Date | null;
    private _passwordHash?;
    private constructor();
    static reconstitute(props: UserProps): UserEntity;
    get email(): string;
    get firstName(): string;
    get lastName(): string;
    get fullName(): string;
    get role(): Role;
    get isActive(): boolean;
    get isDeleted(): boolean;
    deactivate(): void;
    activate(): void;
    updateProfile(firstName: string, lastName: string): void;
    validatePassword(password: string): Promise<boolean>;
    setPassword(password: string): void;
    toSnapshot(): UserProps;
}
