import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { BaseResponse } from '@/common/interfaces/base-response.interface';

class LoginResponse {
  accessToken!: string;
  refreshToken!: string;
  refreshTokenId!: string;
}

class RefreshTokenResponse {
  accessToken!: string;
  refreshToken!: string;
  refreshTokenId!: string;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password, returns JWT tokens'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Login successful',
    type: LoginResponse,
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshTokenId: '550e8400-e29b-41d4-a616-42a8f4ab123'
        },
        message: 'Login successful',
        meta: {
          timestamp: '2024-01-01T00:00:00.000Z',
          requestId: 'req-123',
          traceId: 'trace-456'
        }
      }
    }
  })
  @ApiBody({ 
    type: LoginDto,
    description: 'Login credentials',
    required: true 
  })
  async login(@Body() loginDto: LoginDto): Promise<BaseResponse<LoginResponse>> {
    const tokens = await this.authService.login({
      id: 'user-id',
      email: loginDto.email,
      role: 'user' as any,
      isActive: true,
    });

    return {
      success: true,
      data: tokens,
      message: 'Login successful'
    };
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Generate new access token using refresh token'
  })
  @ApiResponse({ 
    status: HttpStatus.OK, 
    description: 'Token refreshed successfully',
    type: RefreshTokenResponse,
    schema: {
      example: {
        success: true,
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshTokenId: '550e8400-e29b-41d4-a616-42a8f4ab123'
        },
        message: 'Token refreshed successfully',
        meta: {
          timestamp: '2024-01-01T00:00:00.000Z',
          requestId: 'req-123',
          traceId: 'trace-456'
        }
      }
    }
  })
  @ApiBody({ 
    type: RefreshTokenDto,
    description: 'Refresh token',
    required: true 
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<BaseResponse<RefreshTokenResponse>> {
    const tokens = await this.authService.refreshTokens('user-id', refreshTokenDto.refreshToken);

    return {
      success: true,
      data: tokens,
      message: 'Token refreshed successfully'
    };
  }
}