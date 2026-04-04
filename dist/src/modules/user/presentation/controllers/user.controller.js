"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_user_dto_1 = require("../dtos/create-user.dto");
const role_enum_1 = require("../../domain/enums/role.enum");
const pagination_util_1 = require("../../../../common/utils/pagination.util");
class UserResponse {
    id;
    email;
    firstName;
    lastName;
    fullName;
    role;
    isActive;
    isEmailVerified;
    createdAt;
    updatedAt;
}
let UserController = class UserController {
    async createUser(createUserDto) {
        const newUser = {
            id: 'temp-id',
            email: createUserDto.email,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            fullName: `${createUserDto.firstName} ${createUserDto.lastName}`,
            role: createUserDto.role || role_enum_1.Role.USER,
            isActive: true,
            isEmailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return {
            success: true,
            data: newUser,
            message: 'User created successfully'
        };
    }
    async getUsers(paginationParams) {
        const users = [
            { id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', fullName: 'John Doe', role: role_enum_1.Role.USER },
            { id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', fullName: 'Jane Smith', role: role_enum_1.Role.ADMIN }
        ];
        const paginatedResult = pagination_util_1.PaginationUtil.createPagination(users, paginationParams);
        return {
            success: true,
            data: paginatedResult.data,
            message: 'Users retrieved successfully',
            meta: {
                timestamp: new Date().toISOString(),
                pagination: paginatedResult.pagination
            }
        };
    }
    async getUserById(id) {
        const user = {
            id,
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            fullName: 'John Doe',
            role: role_enum_1.Role.USER,
            isActive: true,
            isEmailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return {
            success: true,
            data: user,
            message: 'User retrieved successfully'
        };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, swagger_1.ApiOperation)({
        summary: 'Create a new user',
        description: 'Register a new user with email, name, and password'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.CREATED,
        description: 'User created successfully',
        type: UserResponse,
        schema: {
            example: {
                success: true,
                data: {
                    id: '550e8400-e29b-41d4-a616-42a8f4ab123',
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    fullName: 'John Doe',
                    role: 'user',
                    isActive: true,
                    isEmailVerified: false,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                message: 'User created successfully',
                meta: {
                    timestamp: '2024-01-01T00:00:00.000Z',
                    requestId: 'req-123',
                    traceId: 'trace-456'
                }
            }
        }
    }),
    (0, swagger_1.ApiBody)({
        type: create_user_dto_1.CreateUserDto,
        description: 'User registration data',
        required: true
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_user_dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "createUser", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Get all users with pagination',
        description: 'Retrieve paginated list of users with optional filtering'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        description: 'Page number for pagination',
        example: 1,
        type: 'number'
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        description: 'Number of items per page',
        example: 10,
        type: 'number'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'Users retrieved successfully',
        schema: {
            example: {
                success: true,
                data: [
                    { id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', fullName: 'John Doe', role: 'user' },
                    { id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', fullName: 'Jane Smith', role: 'admin' }
                ],
                message: 'Users retrieved successfully',
                meta: {
                    timestamp: '2024-01-01T00:00:00.000Z',
                    requestId: 'req-123',
                    pagination: {
                        page: 1,
                        limit: 10,
                        total: 2,
                        totalPages: 1
                    }
                }
            }
        }
    }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUsers", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Get user by ID',
        description: 'Retrieve a specific user by their unique identifier'
    }),
    (0, swagger_1.ApiParam)({
        name: 'id',
        description: 'User unique identifier',
        example: '550e8400-e29b-41d4-a616-42a8f4ab123',
        type: 'string'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
        description: 'User retrieved successfully',
        type: UserResponse,
        schema: {
            example: {
                success: true,
                data: {
                    id: '550e8400-e29b-41d4-a616-42a8f4ab123',
                    email: 'john.doe@example.com',
                    firstName: 'John',
                    lastName: 'Doe',
                    fullName: 'John Doe',
                    role: 'user',
                    isActive: true,
                    isEmailVerified: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z'
                },
                message: 'User retrieved successfully',
                meta: {
                    timestamp: '2024-01-01T00:00:00.000Z',
                    requestId: 'req-123',
                    traceId: 'trace-456'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.NOT_FOUND,
        description: 'User not found'
    }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getUserById", null);
exports.UserController = UserController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users')
], UserController);
//# sourceMappingURL=user.controller.js.map