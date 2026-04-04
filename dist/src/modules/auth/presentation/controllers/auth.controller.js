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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("../../application/services/auth.service");
const login_dto_1 = require("../dtos/login.dto");
const refresh_token_dto_1 = require("../dtos/refresh-token.dto");
class LoginResponse {
    accessToken;
    refreshToken;
    refreshTokenId;
}
class RefreshTokenResponse {
    accessToken;
    refreshToken;
    refreshTokenId;
}
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        const tokens = await this.authService.login({
            id: 'user-id',
            email: loginDto.email,
            role: 'user',
            isActive: true,
        });
        return {
            success: true,
            data: tokens,
            message: 'Login successful'
        };
    }
    async refreshToken(refreshTokenDto) {
        const tokens = await this.authService.refreshTokens('user-id', refreshTokenDto.refreshToken);
        return {
            success: true,
            data: tokens,
            message: 'Token refreshed successfully'
        };
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'User login',
        description: 'Authenticate user with email and password, returns JWT tokens'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
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
    }),
    (0, swagger_1.ApiBody)({
        type: login_dto_1.LoginDto,
        description: 'Login credentials',
        required: true
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({
        summary: 'Refresh access token',
        description: 'Generate new access token using refresh token'
    }),
    (0, swagger_1.ApiResponse)({
        status: common_1.HttpStatus.OK,
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
    }),
    (0, swagger_1.ApiBody)({
        type: refresh_token_dto_1.RefreshTokenDto,
        description: 'Refresh token',
        required: true
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [refresh_token_dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('Authentication'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map