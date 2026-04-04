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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const jwt_1 = require("@nestjs/jwt");
const public_decorator_1 = require("../decorators/public.decorator");
const optional_decorator_1 = require("../decorators/optional.decorator");
let AuthGuard = class AuthGuard {
    reflector;
    jwtService;
    constructor(reflector, jwtService) {
        this.reflector = reflector;
        this.jwtService = jwtService;
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const request = this.getRequest(context);
        const token = this.extractTokenFromRequest(request);
        if (!token) {
            const isOptional = this.reflector.getAllAndOverride(optional_decorator_1.IS_OPTIONAL_KEY, [context.getHandler(), context.getClass()]);
            if (isOptional)
                return true;
            throw new common_1.UnauthorizedException('MISSING_TOKEN');
        }
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_SECRET,
            });
            if (!payload.sub || !payload.email) {
                throw new common_1.UnauthorizedException('INVALID_TOKEN_PAYLOAD');
            }
            request.user = payload;
            return true;
        }
        catch (error) {
            if (process.env.NODE_ENV === 'development') {
                console.error('Auth error:', error);
            }
            throw new common_1.UnauthorizedException('INVALID_OR_EXPIRED_TOKEN');
        }
    }
    getRequest(context) {
        return context.switchToHttp().getRequest();
    }
    extractTokenFromRequest(request) {
        const authHeader = request.headers?.authorization;
        if (authHeader?.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        if (request.query?.token) {
            return request.query.token;
        }
        return undefined;
    }
};
exports.AuthGuard = AuthGuard;
exports.AuthGuard = AuthGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        jwt_1.JwtService])
], AuthGuard);
//# sourceMappingURL=auth.guard.js.map