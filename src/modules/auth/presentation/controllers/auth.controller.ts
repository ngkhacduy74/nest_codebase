import {
  Body,
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { AuthResponseDto } from '../dtos/auth-response.dto';
import { Public } from '@/common/decorators/public.decorator';
import { LocalAuthGuard } from '@/common/guards/local-auth.guard';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  async login(
    @Req() req: any,
    @Body() loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.login(req.user);

    return {
      ...tokens,
      expiresIn: 900, // 15 mins
      user: {
        id: req.user.id,
        email: req.user.email,
        role: req.user.role,
      },
    };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: HttpStatus.OK, type: AuthResponseDto })
  async refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<AuthResponseDto> {
    const tokens = await this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
    );
    const payload = this.authService.decodePayload(tokens.accessToken);

    return {
      ...tokens,
      expiresIn: 900,
      user: {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      },
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Req() req: any): Promise<void> {
    const user = req.user;
    // Revoking access token (blacklist) and session
    await this.authService.logout(user.id, user.jti, '');
  }
}
