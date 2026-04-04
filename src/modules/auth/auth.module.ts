import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './application/services/auth.service';
import { AuthController } from './presentation/controllers/auth.controller';
import { RedisTokenStore } from './infrastructure/token-store/redis-token-store';
import { AUTH_CONFIG_KEY } from '@/config/auth.config';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const authConfig = configService.get(AUTH_CONFIG_KEY);
        return {
          global: true,
          secret: authConfig?.accessToken.secret,
          signOptions: {
            expiresIn: authConfig?.accessToken.expiresIn,
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, RedisTokenStore],
  exports: [AuthService],
})
export class AuthModule {}
