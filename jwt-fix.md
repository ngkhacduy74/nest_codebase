# JWT Security Fix

## Tóm tắt

| File                        | Hành động     | Vấn đề                                                                    |
| --------------------------- | ------------- | ------------------------------------------------------------------------- |
| `auth.guard.ts`             | Viết lại      | Thiếu `role` trong payload, `sub` không map sang `id`, thiếu `algorithms` |
| `authorization.guard.ts`    | Viết lại      | SUPER_ADMIN bị chặn bởi role check                                        |
| `current-user.decorator.ts` | Cập nhật type | Không đồng bộ với `AuthenticatedUser`                                     |
| `auth.middleware.ts`        | **Xóa**       | Dead code chưa register, lỗ hổng query string token                       |

---

## `src/common/guards/auth.guard.ts`

```typescript
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import type { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_OPTIONAL_KEY } from '../decorators/optional.decorator';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import type { ITokenStore } from '@/modules/auth/infrastructure/token-store/redis-token-store';
import type { AuthConfig } from '@/config/auth/auth-config.type';

// Single source of truth cho req.user trong toàn bộ app.
// authorization.guard.ts và current-user.decorator.ts đều dùng type này.
export interface AuthenticatedUser {
  /** userId — map từ JWT claim `sub` */
  id: string;
  email: string;
  role: string;
  /** JWT ID — dùng để blacklist khi logout */
  jti: string;
  /** Unix timestamp (giây) — dùng để tính TTL blacklist */
  exp: number;
}

export type AuthenticatedRequest = FastifyRequest & {
  user?: AuthenticatedUser;
};

// Raw JWT payload — validate trước khi map sang AuthenticatedUser
interface RawJwtPayload {
  sub: string;
  email: string;
  role: string;
  jti: string;
  exp: number;
  iat?: number;
}

function isValidAccessTokenPayload(value: unknown): value is RawJwtPayload {
  if (typeof value !== 'object' || value === null) return false;
  const o = value as Record<string, unknown>;
  return (
    typeof o.sub === 'string' &&
    o.sub.length > 0 &&
    typeof o.email === 'string' &&
    o.email.length > 0 &&
    typeof o.role === 'string' &&
    o.role.length > 0 &&
    typeof o.jti === 'string' &&
    o.jti.length > 0 &&
    typeof o.exp === 'number'
  );
}

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly accessTokenSecret: string;

  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    configService: ConfigService,
    @Inject(INJECTION_TOKENS.TOKEN_STORE)
    private readonly tokenStore: ITokenStore,
  ) {
    // Fail-fast khi khởi động nếu secret chưa được cấu hình
    const authConfig = configService.getOrThrow<AuthConfig>('auth');
    this.accessTokenSecret = authConfig.jwt.accessToken.secret;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractBearerToken(request);

    if (!token) {
      const isOptional = this.reflector.getAllAndOverride<boolean>(IS_OPTIONAL_KEY, [
        context.getHandler(),
        context.getClass(),
      ]);
      if (isOptional) return true;
      throw new UnauthorizedException('MISSING_TOKEN');
    }

    const payload = await this.verifyAndExtractPayload(token);
    request.user = this.mapToAuthenticatedUser(payload);
    return true;
  }

  /**
   * Chỉ chấp nhận Bearer token từ Authorization header.
   * KHÔNG đọc từ query string — token trong URL bị lộ qua server log,
   * browser history, và Referer header.
   */
  private extractBearerToken(request: FastifyRequest): string | undefined {
    const authHeader = request.headers.authorization;
    if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
      return authHeader.slice(7);
    }
    return undefined;
  }

  private async verifyAndExtractPayload(token: string): Promise<RawJwtPayload> {
    let rawPayload: unknown;

    try {
      rawPayload = await this.jwtService.verifyAsync(token, {
        secret: this.accessTokenSecret,
        algorithms: ['HS256'], // chặn "alg: none" attack
      });
    } catch {
      // Message chung — không tiết lộ token hết hạn hay chữ ký sai
      throw new UnauthorizedException('INVALID_OR_EXPIRED_TOKEN');
    }

    if (!isValidAccessTokenPayload(rawPayload)) {
      throw new UnauthorizedException('INVALID_TOKEN_PAYLOAD');
    }

    const isBlacklisted = await this.tokenStore.isAccessTokenBlacklisted(rawPayload.jti);
    if (isBlacklisted) {
      throw new UnauthorizedException('TOKEN_REVOKED');
    }

    return rawPayload;
  }

  /**
   * Map raw JWT payload sang AuthenticatedUser.
   * `sub` (JWT standard claim) → `id` (app convention).
   */
  private mapToAuthenticatedUser(payload: RawJwtPayload): AuthenticatedUser {
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
      exp: payload.exp,
    };
  }
}
```

### Những gì đã thay đổi và tại sao

**Thiếu `role` trong payload validation**
`auth.service.ts` sign JWT với `{ sub, email, role, jti }` nhưng guard cũ chỉ validate `{ sub, email, jti }`. Kết quả: `user.role` là `undefined` trong suốt vòng đời request — mọi permission check âm thầm thất bại mà không có error.

**`sub` không được map sang `id`**
Guard cũ gán `request.user = payload` trực tiếp. Vì JWT dùng `sub` (không phải `id`), `authorization.guard.ts` đọc `user.id` ra `undefined`, và `auth.controller.ts` blacklist sai jti khi logout.

**Thiếu `algorithms: ['HS256']`**
Không giới hạn algorithm cho phép kẻ tấn công dùng `alg: none` để tạo token không cần ký (JWT "none algorithm" attack). Chỉ một dòng nhưng là lỗ hổng nghiêm trọng.

---

## `src/common/guards/authorization.guard.ts`

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector, SetMetadata } from '@nestjs/core';
import type { FastifyRequest } from 'fastify';
import { AppLoggerService } from '@/common/services/logger.service';
import { ForbiddenError, UnauthorizedError } from '@/common/domain/errors/application.error';
import { ResourceOwnershipService } from '@/common/services/resource-ownership.service';
import type { AuthenticatedUser } from '@/common/guards/auth.guard';

export interface Permission {
  resource: string;
  action: string;
  conditions?: readonly string[];
}

export type AuthHttpRequest = FastifyRequest & { user?: AuthenticatedUser };

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  USER: 'USER',
} as const;

export type RoleValue = (typeof ROLES)[keyof typeof ROLES];

export const PERMISSIONS = {
  USER_READ_OWN: { resource: 'user', action: 'read', conditions: ['own'] },
  USER_UPDATE_OWN: { resource: 'user', action: 'update', conditions: ['own'] },
  USER_DELETE_OWN: { resource: 'user', action: 'delete', conditions: ['own'] },
  USER_READ_ALL: { resource: 'user', action: 'read' },
  USER_UPDATE_ALL: { resource: 'user', action: 'update' },
  USER_DELETE_ALL: { resource: 'user', action: 'delete' },
  PRODUCT_READ: { resource: 'product', action: 'read' },
  PRODUCT_CREATE: { resource: 'product', action: 'create' },
  PRODUCT_UPDATE_OWN: { resource: 'product', action: 'update', conditions: ['own'] },
  PRODUCT_DELETE_OWN: { resource: 'product', action: 'delete', conditions: ['own'] },
  PRODUCT_UPDATE_ALL: { resource: 'product', action: 'update' },
  PRODUCT_DELETE_ALL: { resource: 'product', action: 'delete' },
} as const;

export const ROLE_PERMISSIONS: Readonly<Record<string, readonly Permission[]>> = {
  [ROLES.USER]: [
    PERMISSIONS.USER_READ_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.USER_DELETE_OWN,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE_OWN,
    PERMISSIONS.PRODUCT_DELETE_OWN,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.USER_READ_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.USER_DELETE_OWN,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE_OWN,
    PERMISSIONS.PRODUCT_DELETE_OWN,
    PERMISSIONS.PRODUCT_UPDATE_ALL,
  ],
  [ROLES.ADMIN]: [
    PERMISSIONS.USER_READ_OWN,
    PERMISSIONS.USER_UPDATE_OWN,
    PERMISSIONS.USER_DELETE_OWN,
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.USER_UPDATE_ALL,
    PERMISSIONS.USER_DELETE_ALL,
    PERMISSIONS.PRODUCT_READ,
    PERMISSIONS.PRODUCT_CREATE,
    PERMISSIONS.PRODUCT_UPDATE_OWN,
    PERMISSIONS.PRODUCT_DELETE_OWN,
    PERMISSIONS.PRODUCT_UPDATE_ALL,
    PERMISSIONS.PRODUCT_DELETE_ALL,
  ],
} as const;

// Dùng SetMetadata của NestJS thay vì Reflect.defineMetadata trực tiếp
// để tương thích đúng với Reflector.getAllAndOverride
export const PERMISSIONS_KEY = 'permissions';
export const ROLES_KEY = 'roles';

export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_KEY, permissions);

export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly logger: AppLoggerService,
    private readonly ownershipService: ResourceOwnershipService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthHttpRequest>();
    const { user } = request;

    if (!user) {
      this.logger.security('Unauthorized access attempt — no user on request', {
        path: request.url,
        method: request.method,
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      });
      throw new UnauthorizedError('Authentication required');
    }

    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Không có yêu cầu nào → chỉ cần đăng nhập
    if (!requiredRoles?.length && !requiredPermissions?.length) {
      return true;
    }

    // SUPER_ADMIN bypass mọi kiểm tra role và permission.
    // Đặt tại đây — một chỗ duy nhất, dễ audit — thay vì rải rác trong
    // từng helper function như code cũ.
    if (user.role === ROLES.SUPER_ADMIN) {
      this.logger.auth('SUPER_ADMIN access granted', {
        userId: user.id,
        path: request.url,
        method: request.method,
      });
      return true;
    }

    if (requiredRoles?.length && !requiredRoles.includes(user.role)) {
      this.logger.security('Access denied — insufficient role', {
        userId: user.id,
        userRole: user.role,
        requiredRoles,
        path: request.url,
        method: request.method,
        ip: request.ip,
      });
      throw new ForbiddenError('Insufficient role', { requiredRoles });
    }

    if (
      requiredPermissions?.length &&
      !this.hasRequiredPermissions(user, requiredPermissions, request)
    ) {
      this.logger.security('Access denied — insufficient permissions', {
        userId: user.id,
        userRole: user.role,
        requiredPermissions,
        path: request.url,
        method: request.method,
        ip: request.ip,
      });
      throw new ForbiddenError('Insufficient permissions', { requiredPermissions });
    }

    return true;
  }

  private hasRequiredPermissions(
    user: AuthenticatedUser,
    requiredPermissions: string[],
    request: AuthHttpRequest,
  ): boolean {
    return requiredPermissions.every((perm) => {
      const parts = perm.split(':');
      if (parts.length !== 2 || !parts[0] || !parts[1]) {
        // Format sai → throw để phát hiện lúc dev, không lúc runtime production
        throw new Error(
          `[AuthorizationGuard] Invalid permission format: "${perm}". Expected "resource:action"`,
        );
      }
      const permission: Permission = { resource: parts[0], action: parts[1] };
      return this.checkPermission(user, permission, request);
    });
  }

  private checkPermission(
    user: AuthenticatedUser,
    permission: Permission,
    request: AuthHttpRequest,
  ): boolean {
    const userPermissions = ROLE_PERMISSIONS[user.role] ?? [];
    const matched = userPermissions.find(
      (p) => p.resource === permission.resource && p.action === permission.action,
    );
    if (!matched) return false;
    if (!matched.conditions?.length) return true;
    return this.checkConditions(user, matched, request);
  }

  private checkConditions(
    user: AuthenticatedUser,
    permission: Permission,
    request: AuthHttpRequest,
  ): boolean {
    return (permission.conditions ?? []).every((condition) => {
      switch (condition) {
        case 'own':
          return this.checkOwnership(user, permission.resource, request);
        default:
          this.logger.warn(`[AuthorizationGuard] Unknown condition: "${condition}"`);
          return false;
      }
    });
  }

  private checkOwnership(
    user: AuthenticatedUser,
    resource: string,
    request: AuthHttpRequest,
  ): boolean {
    const params = request.params as Record<string, string>;
    const resourceId = params['id'] ?? params['userId'] ?? params['productId'];
    if (!resourceId) return true; // collection endpoint — không áp dụng ownership
    return this.ownershipService.isOwner(user.id, resource, resourceId);
  }
}
```

### Những gì đã thay đổi và tại sao

**SUPER_ADMIN bị chặn bởi role check**
Code cũ xử lý SUPER_ADMIN không nhất quán: `checkPermission()` có early return cho SUPER_ADMIN nhưng `hasRequiredRoles()` thì không — SUPER_ADMIN bị 403 khi endpoint dùng `@Roles(Role.ADMIN)`. Fix là đặt bypass một lần duy nhất ở đầu `canActivate()`, trước mọi kiểm tra.

**`Reflect.defineMetadata` → `SetMetadata`**
Code cũ dùng `Reflect.defineMetadata` trực tiếp trong decorator. Cách này không tương thích đúng với `Reflector.getAllAndOverride` của NestJS — metadata có thể không được merge đúng khi kết hợp class-level và method-level decorator. `SetMetadata` là cách NestJS khuyến nghị.

---

## `src/common/decorators/current-user.decorator.ts`

```typescript
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { AuthenticatedUser } from '@/common/guards/auth.guard';

export type { AuthenticatedUser };

export type RequestWithUser = FastifyRequest & { user?: AuthenticatedUser };

/**
 * Lấy user đã xác thực từ request.
 *
 * @example — endpoint bảo vệ (user luôn có giá trị)
 * async getProfile(@CurrentUser() user: AuthenticatedUser) { ... }
 *
 * @example — endpoint optional auth
 * @OptionalAuth()
 * async getPost(@CurrentUser() user: AuthenticatedUser | undefined) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUser | undefined => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
```

---

## Xóa `src/common/middlewares/auth.middleware.ts`

File này chưa bao giờ được đăng ký — không có `configure(consumer: MiddlewareConsumer)` trong bất kỳ module nào. Ngoài ra có 3 vấn đề:

**Lỗ hổng query string token**

```typescript
// Xóa đoạn này — token trong URL bị lộ qua server log, browser history, Referer header
const tokenQuery = query.token;
if (tokenQuery) {
  return tokenQuery;
}
```

**Payload struct không khớp**
Middleware kỳ vọng `{ id, isActive, sessionId }` nhưng `auth.service.ts` sign `{ sub, role, jti }` — `id` và `isActive` không tồn tại trong token thực.

**Trùng lặp hoàn toàn**
AuthGuard xử lý: verify JWT, blacklist check, gắn `req.user`. Security headers xử lý bởi `@fastify/helmet` trong `main.ts`. Không có lý do để giữ middleware này.

---

## Checklist triển khai

```
[ ] Thay auth.guard.ts
[ ] Thay authorization.guard.ts
[ ] Thay current-user.decorator.ts
[ ] Xóa auth.middleware.ts
[ ] npx tsc --noEmit
[ ] npm test
[ ] Test thủ công:
    [ ] Login → nhận accessToken + refreshToken
    [ ] Request không có token → 401 MISSING_TOKEN
    [ ] Token hợp lệ, đúng role → 200
    [ ] Token hợp lệ, sai role → 403
    [ ] Logout → 204, gọi lại với token cũ → 401 TOKEN_REVOKED
    [ ] SUPER_ADMIN gọi endpoint @Roles(ADMIN) → 200
```
