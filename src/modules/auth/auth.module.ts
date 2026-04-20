import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthConfig } from '@/config/auth/auth-config.type';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { RedisTokenStore } from './infrastructure/token-store/redis-token-store';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import { MetricsModule } from '@modules/metrics/metrics.module';
import { AuthGuard } from '@common/guards/auth.guard';
import { PasswordHasherService, PASSWORD_HASHER } from '@common/services/password-hasher.service';

import { UserModule } from '../user/user.module';

@Module({
  imports: [
    MetricsModule,
    forwardRef(() => UserModule),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const authConfig = configService.getOrThrow<AuthConfig>('auth');
        return {
          global: true,
          secret: authConfig.jwt.accessToken.secret,
          signOptions: {
            expiresIn: authConfig.jwt.accessToken.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: PASSWORD_HASHER, useClass: PasswordHasherService },
    LocalStrategy,
    JwtStrategy,
    AuthGuard,
    {
      provide: INJECTION_TOKENS.TOKEN_STORE,
      useClass: RedisTokenStore,
    },
  ],
  exports: [AuthService, INJECTION_TOKENS.TOKEN_STORE, AuthGuard],
})
export class AuthModule {}
