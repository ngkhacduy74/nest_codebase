import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpStatus,
  HttpCode,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { BaseResponse } from '@/common/interfaces/base-response.interface';
import { Role } from '@/modules/user/domain/enums/role.enum';
import { PaginationUtil } from '@/common/utils/pagination.util';

class UserResponse {
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

@ApiTags('Users')
@Controller('users')
export class UserController {
  
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Create a new user',
    description: 'Register a new user with email, name, and password'
  })
  @ApiResponse({ 
    status: HttpStatus.CREATED, 
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
  })
  @ApiBody({ 
    type: CreateUserDto,
    description: 'User registration data',
    required: true 
  })
  async createUser(@Body() createUserDto: CreateUserDto): Promise<BaseResponse<UserResponse>> {
    // This would call the user creation use case
    const newUser: UserResponse = {
      id: 'temp-id',
      email: createUserDto.email,
      firstName: createUserDto.firstName,
      lastName: createUserDto.lastName,
      fullName: `${createUserDto.firstName} ${createUserDto.lastName}`,
      role: createUserDto.role as Role || Role.USER,
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

  @Get()
  @ApiOperation({ 
    summary: 'Get all users with pagination',
    description: 'Retrieve paginated list of users with optional filtering'
  })
  @ApiQuery({ 
    name: 'page', 
    required: false, 
    description: 'Page number for pagination',
    example: 1,
    type: 'number'
  })
  @ApiQuery({ 
    name: 'limit', 
    required: false, 
    description: 'Number of items per page',
    example: 10,
    type: 'number'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
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
  })
  async getUsers(
    @Query() paginationParams: PaginationParams
  ): Promise<BaseResponse<UsersResponse[]>> {
    // This would call the get users use case with pagination
    const users: UsersResponse[] = [
      { id: '1', email: 'user1@example.com', firstName: 'John', lastName: 'Doe', fullName: 'John Doe', role: Role.USER },
      { id: '2', email: 'user2@example.com', firstName: 'Jane', lastName: 'Smith', fullName: 'Jane Smith', role: Role.ADMIN }
    ];

    const paginatedResult = PaginationUtil.createPagination(users, paginationParams);

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

  @Get(':id')
  @ApiOperation({ 
    summary: 'Get user by ID',
    description: 'Retrieve a specific user by their unique identifier'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User unique identifier',
    example: '550e8400-e29b-41d4-a616-42a8f4ab123',
    type: 'string'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
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
  })
  @ApiResponse({ 
    status: HttpStatus.NOT_FOUND, 
    description: 'User not found'
  })
  async getUserById(@Param('id') id: string): Promise<BaseResponse<UserResponse>> {
    // This would call the get user by ID use case
    const user: UserResponse = {
      id,
      email: 'john.doe@example.com',
      firstName: 'John',
      lastName: 'Doe',
      fullName: 'John Doe',
      role: Role.USER,
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
}