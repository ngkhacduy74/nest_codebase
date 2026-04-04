import { AuthService } from '../../application/services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { RefreshTokenDto } from '../dtos/refresh-token.dto';
import { BaseResponse } from '@/common/interfaces/base-response.interface';
declare class LoginResponse {
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
}
declare class RefreshTokenResponse {
    accessToken: string;
    refreshToken: string;
    refreshTokenId: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<BaseResponse<LoginResponse>>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<BaseResponse<RefreshTokenResponse>>;
}
export {};
