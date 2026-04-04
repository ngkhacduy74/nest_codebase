import { CreateUserDto } from '../dtos/create-user.dto';
import { BaseResponse } from '@/common/interfaces/base-response.interface';
import { Role } from '@/modules/user/domain/enums/role.enum';
declare class UserResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: Role;
    isActive: boolean;
    isEmailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
}
interface UsersResponse {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: Role;
}
interface PaginationParams {
    page?: number;
    limit?: number;
}
export declare class UserController {
    createUser(createUserDto: CreateUserDto): Promise<BaseResponse<UserResponse>>;
    getUsers(paginationParams: PaginationParams): Promise<BaseResponse<UsersResponse[]>>;
    getUserById(id: string): Promise<BaseResponse<UserResponse>>;
}
export {};
