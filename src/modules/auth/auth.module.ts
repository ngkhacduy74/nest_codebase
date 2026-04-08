import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { RedisTokenStore } from './infrastructure/token-store/redis-token-store';
import { LocalStrategy } from './infrastructure/strategies/local.strategy';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';

import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const authConfig = configService.get<any>('auth');
        return {
          global: true,
          secret: authConfig?.jwt?.accessToken?.secret || 'secret',
          signOptions: {
            expiresIn: authConfig?.jwt?.accessToken?.expiresIn || '15m',
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    {
      provide: INJECTION_TOKENS.TOKEN_STORE,
      useClass: RedisTokenStore,
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
