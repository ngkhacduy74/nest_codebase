# 🔬 NestJS Codebase — Deep Analysis Report
> Analyzed by: Staff Backend Engineer Perspective (10+ YOE)
> Date: 2026-04-07
> Codebase: `nest_codebase` — NestJS SaaS Backend

---

## 📊 Executive Summary

| Dimension              | Score  | Notes                                      |
|------------------------|--------|--------------------------------------------|
| Architecture           | 8/10   | Clean Architecture + DDD đúng hướng        |
| Folder Structure       | 8/10   | Feature-based, rõ ràng, có thể cải thiện   |
| Security               | 7/10   | Tốt, nhưng có vài lỗ hổng nghiêm trọng    |
| Performance            | 6/10   | Cache tốt, thiếu index DB, thiếu query opt |
| Exception Handling     | 7/10   | Có filter, nhưng bị duplicate + fragmented |
| DI & Scope             | 8/10   | Symbols đúng chuẩn, nhưng có sai scope     |
| Testing                | 4/10   | Ít test, thiếu E2E, không có integration   |
| Developer Experience   | 9/10   | Husky, lint, commitlint, Swagger — rất tốt |
| **Overall**            | **7/10** | **Mid-Senior level — gần Production-ready** |

---

## 1. 🔥 Critical Issues (Must Fix)

### 1.1 — `AuthGuard` đọc `process.env.JWT_SECRET` trực tiếp
**File:** `src/common/guards/auth.guard.ts` (line ~42)

```typescript
// ❌ CRITICAL — Bypass ConfigService, không đồng bộ với config/config.ts
const payload = await this.jwtService.verifyAsync(token, {
  secret: process.env.JWT_SECRET,  // ← SAI: dùng sai env key
});
```

Config thực tế dùng `AUTH_JWT_ACCESS_SECRET`, nhưng guard lại đọc `JWT_SECRET`. Nếu biến này không set, token validation sẽ **fail silently** hoặc dùng `undefined` làm secret — **toàn bộ auth bị bypass**.

**Fix:**
```typescript
// ✅ Inject ConfigService, đọc đúng key
constructor(
  private readonly reflector: Reflector,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
) {}

// Trong canActivate:
const payload = await this.jwtService.verifyAsync(token, {
  secret: this.configService.get<string>('auth.jwt.accessToken.secret'),
});
```

---

### 1.2 — `UserController` không gọi Use-Cases — trả hardcoded data
**File:** `src/modules/user/presentation/controllers/user.controller.ts`

```typescript
// ❌ CRITICAL — Controller tự tạo data giả, không inject use-cases
async createUser(@Body() createUserDto: CreateUserDto): Promise<BaseResponse<UserResponse>> {
  const newUser: UserResponse = {
    id: 'temp-id',      // ← Hardcoded!
    email: createUserDto.email,
    ...
  };
  return { success: true, data: newUser, message: 'User created successfully' };
}
```

**Toàn bộ `UserController` không inject bất kỳ use-case nào.** Đây là controller bị "bỏ quên" kết nối với logic thực sự, dù use-cases đã được viết đầy đủ.

**Fix:**
```typescript
// ✅ Inject và gọi use-cases
constructor(
  private readonly createUserUseCase: CreateUserUseCase,
  private readonly getUserByIdUseCase: GetUserByIdUseCase,
  private readonly getUsersUseCase: GetUsersUseCase,
  private readonly updateUserUseCase: UpdateUserUseCase,
  private readonly deleteUserUseCase: DeleteUserUseCase,
) {}

async createUser(@Body() dto: CreateUserDto) {
  const user = await this.createUserUseCase.execute(dto);
  return { success: true, data: this.toResponse(user) };
}
```

---

### 1.3 — Logout không blacklist Access Token đúng cách
**File:** `src/modules/auth/presentation/controllers/auth.controller.ts`

```typescript
// ❌ CRITICAL — refreshTokenId truyền vào là chuỗi rỗng ''
async logout(@Req() req: any): Promise<void> {
  const user = req.user;
  await this.authService.logout(user.id, user.jti, ''); // ← refreshTokenId = ''
}
```

Refresh token không được revoke khi logout. User vẫn có thể dùng refresh token cũ để lấy access token mới sau khi "đã logout".

**Fix:** Yêu cầu client gửi `refreshToken` trong body logout request, hoặc lưu `refreshTokenId` vào JWT payload.

---

### 1.4 — `NotificationModule` không được import trong `AppModule`
**File:** `src/modules/app.module.ts`

```typescript
// ❌ CRITICAL — NotificationModule bị khai báo nhưng không import vào AppModule
import { NotificationModule } from '@modules/notification/notification.module';
// ... nhưng không có trong imports array!
```

Toàn bộ hệ thống email queue (BullMQ worker) sẽ **không chạy** vì module chưa được load.

**Fix:** Thêm `NotificationModule` vào `imports` array trong `AppModule`.

---

### 1.5 — `TOKEN_STORE` symbol bị định nghĩa ở 2 nơi — gây conflict
**Files:** 
- `src/modules/auth/infrastructure/token-store/redis-token-store.ts` → `export const TOKEN_STORE = Symbol('TOKEN_STORE')`
- `src/constants/injection-tokens.ts` → `INJECTION_TOKENS.TOKEN_STORE = Symbol('TOKEN_STORE')`

Hai `Symbol` khác nhau không bao giờ `===` nhau. `AuthService` import từ `injection-tokens.ts` nhưng `AuthModule` bind từ `redis-token-store.ts`. **DI sẽ fail ở runtime.**

**Fix:** Chỉ dùng một nguồn duy nhất — `INJECTION_TOKENS` trong `constants/injection-tokens.ts`.

---

### 1.6 — `CreateUserUseCase` dùng dynamic import cho argon2/uuid — anti-pattern
**File:** `src/modules/user/application/use-cases/create-user.use-case.ts`

```typescript
// ❌ CRITICAL (performance) — dynamic import trong hot path
async execute(dto: CreateUserDataDto): Promise<UserEntity> {
  const { v4: uuidv4 } = await import('uuid');
  const argon2 = await import('argon2');
  const passwordHash = await argon2.hash(dto.password);
```

Mỗi lần tạo user đều trigger dynamic import, gây overhead module resolution. Argon2 hash đã chậm (design) — thêm overhead import là không cần thiết.

**Fix:** Static import ở đầu file, hoặc tốt hơn, tách `PasswordHasher` thành một injectable service riêng.

---

### 1.7 — `RedisTokenStore` tạo Redis connection riêng — 3rd Redis connection pool
**File:** `src/modules/auth/infrastructure/token-store/redis-token-store.ts`

```typescript
// ❌ CRITICAL (resource) — tạo ioredis client mới, độc lập với CacheModule và BullMQ
constructor(configService: ConfigService) {
  this.redis = new Redis({ host: ..., port: ..., db: 1 });
}
```

App đang mở **3 Redis connections riêng biệt**: CacheModule, BullMQ, và RedisTokenStore. Trong production với nhiều instances, điều này nhanh chóng vượt quá connection limit.

**Fix:** Tạo một shared `RedisModule` cung cấp single IORedis client, inject vào các nơi cần.

---

## 2. ⚠️ Important Improvements

### 2.1 — Duplicate Exception Filters — `AllExceptionsFilter` vs `GlobalExceptionFilter`
**Files:** `src/common/filters/all-exceptions.filter.ts` và `global-exception.filter.ts`

Codebase có **hai exception filters** khác nhau:
- `AllExceptionsFilter` — được register trong `main.ts` bằng `app.useGlobalFilters()`
- `GlobalExceptionFilter` — được register bằng `APP_FILTER` trong `AppModule`

Khi cả hai cùng active, **`AllExceptionsFilter` sẽ bị override bởi `APP_FILTER`**. Điều này gây confusion và là kết quả của refactor không sạch. Cần giữ đúng một filter.

**Fix:** Xóa `AllExceptionsFilter` khỏi `main.ts`, chỉ dùng `GlobalExceptionFilter` qua `APP_FILTER`.

---

### 2.2 — `GlobalExceptionFilter` dùng string matching để phân loại lỗi — fragile
**File:** `src/common/filters/global-exception.filter.ts`

```typescript
// ⚠️ Fragile — phụ thuộc vào string trong error message
private isAuthenticationError(exception: unknown): boolean {
  return exception.message.includes('unauthorized') ||
         exception.message.includes('authentication');
}
```

Nếu thư viện thứ 3 throw error với message chứa "authentication", nó sẽ bị misclassify. Cần dùng `instanceof` với custom error classes.

**Fix:**
```typescript
import { ApplicationError } from '@common/domain/errors/application.error';

private getStatus(exception: unknown): number {
  if (exception instanceof ApplicationError) return exception.statusCode;
  if (exception instanceof HttpException) return exception.getStatus();
  return HttpStatus.INTERNAL_SERVER_ERROR;
}
```

---

### 2.3 — `sanitizeErrorMessage` trong production filter quá aggressive
**File:** `src/common/filters/global-exception.filter.ts`

```typescript
// ⚠️ Bad UX — redact cả những message lành mạnh
const sensitivePatterns = [/password/i, /secret/i, /token/i, /key/i, /auth/i, /database/i, /connection/i];
```

Message `"Authentication failed"` sẽ bị thành `"[REDACTED] failed"`. Message `"Connection timeout"` thành `"[REDACTED] timeout"`. Đây là những thông tin hợp lệ mà client cần.

**Fix:** Chỉ redact error message khi exception là `InternalServerError` (5xx). Client-side errors (4xx) có thể giữ message gốc vì chúng không chứa server internals.

---

### 2.4 — Thiếu cache invalidation toàn diện trong `UpdateUserUseCase`
**File:** `src/modules/user/application/use-cases/update-user.use-case.ts`

```typescript
// ⚠️ Incomplete cache invalidation
await Promise.all([
  this.cache.del(CacheKeys.user(id)),
  this.cache.del(CacheKeys.userByEmail(oldUser.email)),
  this.cache.del(CacheKeys.userList(1, 20)), // ← Chỉ clear page 1!
]);
```

Chỉ invalidate page 1 của user list. Nếu user đang ở page 3, cache sẽ stale.

**Fix:** Dùng cache tag pattern hoặc prefix-based invalidation:
```typescript
// Xóa tất cả user list cache
await this.cache.del('users:list:*');
```

---

### 2.5 — `Prisma schema` thiếu indexes quan trọng
**File:** `prisma/schema.prisma`

```prisma
model User {
  email    String  @unique  // ✅ indexed via unique
  isActive Boolean @default(true)  // ❌ không có index
  deletedAt DateTime?  // ❌ không có index cho soft-delete queries
  @@index([createdAt])  // ✅ ok
}
```

Các query phổ biến như `findAll active users` hay `soft-delete filter` sẽ full table scan khi dữ liệu lớn.

**Fix:**
```prisma
model User {
  @@index([isActive])
  @@index([deletedAt])
  @@index([isActive, createdAt])  // composite cho list queries
}
```

---

### 2.6 — `AuthService.logout` dùng hardcoded TTL = 900 seconds
**File:** `src/modules/auth/application/services/auth.service.ts`

```typescript
// ⚠️ Magic number — không sync với actual token expiry
await this.tokenStore.blacklistAccessToken(jti, 900); // hardcoded 15 mins
```

Nếu `AUTH_JWT_ACCESS_EXPIRES_IN` thay đổi từ `'15m'` sang `'30m'`, blacklist TTL sẽ không theo kịp — blacklisted token sẽ hết hạn trước khi actual token expire.

**Fix:**
```typescript
// Extract TTL from token payload's exp field
const exp = payload.exp ?? 0;
const ttl = Math.max(0, exp - Math.floor(Date.now() / 1000));
await this.tokenStore.blacklistAccessToken(jti, ttl);
```

---

### 2.7 — `JwtAuthGuard` và `AuthGuard` (custom) không blacklist check
**Files:** `auth.guard.ts`, `jwt-auth.guard.ts`

Sau khi user logout, access token bị blacklisted trong Redis. **Nhưng không guard nào check blacklist.** Token đã logout vẫn có thể được dùng đến khi hết hạn tự nhiên.

**Fix:** Inject `ITokenStore` vào `JwtAuthGuard` và check:
```typescript
const isBlacklisted = await this.tokenStore.isAccessTokenBlacklisted(payload.jti);
if (isBlacklisted) throw new UnauthorizedException('TOKEN_REVOKED');
```

---

### 2.8 — Không có Roles Guard applied trên controllers
**File:** `src/common/guards/roles.guard.ts` — file tồn tại nhưng **rỗng hoàn toàn** (0 bytes)

`@Roles()` decorator được định nghĩa nhưng không guard nào enforce nó. Admin routes hiện tại không được bảo vệ theo role.

**Fix:** Implement `RolesGuard` và register như `APP_GUARD` sau `JwtAuthGuard`.

---

### 2.9 — `UserController` thiếu Authentication Guards
**File:** `src/modules/user/presentation/controllers/user.controller.ts`

Controller không có `@UseGuards()` hay `@ApiBearerAuth()`. Các routes như `DELETE /users/:id` không cần auth theo code hiện tại.

---

### 2.10 — `findAll` trong repository không filter soft-deleted users
**File:** `src/modules/user/infrastructure/repositories/prisma-user.repository.ts`

```typescript
// ⚠️ Trả về cả users đã bị soft-delete
const [users, total] = await Promise.all([
  this.prisma.user.findMany({ skip, take: limit, orderBy: {...} }),
  this.prisma.user.count(),  // ← Count cả deleted users
]);
```

**Fix:**
```typescript
const whereClause = { deletedAt: null };
const [users, total] = await Promise.all([
  this.prisma.user.findMany({ where: whereClause, skip, take: limit, ... }),
  this.prisma.user.count({ where: whereClause }),
]);
```

---

## 3. 💡 Nice-to-have Enhancements

### 3.1 — Thiếu Lazy Loading cho feature modules
Tất cả modules được load eager tại startup. Với hệ thống lớn, dùng `LazyModuleLoader` cho các heavy modules (NotificationModule, IntegrationsModule) để cải thiện startup time.

### 3.2 — `NotificationModule` thiếu `presentation/` layer
Folder `src/modules/notification/presentation/` rỗng. Nếu cần expose notification status API (ví dụ: kiểm tra email delivery), cần thêm controller.

### 3.3 — Không có OpenTelemetry / Distributed Tracing
CLS đã tracking `requestId` và `traceId` nhưng không integrate với OpenTelemetry. Ở scale 100k+ users, cần distributed tracing (Jaeger/Tempo) để debug production issues.

### 3.4 — `dto/` naming inconsistency giữa modules
- `user/presentation/dtos/` (có 's')
- `product/presentation/dto/` (không có 's')
Cần thống nhất naming convention.

### 3.5 — Thiếu `@ApiProperty()` decorators trên DTOs cho Swagger
Một số DTOs không có `@ApiProperty()` đầy đủ, làm Swagger docs không hiển thị schema đúng.

### 3.6 — `save()` method trong `PrismaUserRepository` — upsert anti-pattern
```typescript
// ⚠️ Race condition: check-then-act
async save(user: UserEntity): Promise<UserEntity> {
  const exists = await this.findById(user.id); // <- Round trip 1
  if (exists) {
    return this.update(user.id, {...}); // <- Round trip 2
  }
  return this.create({...}); // <- Round trip 2 (alt)
}
```
Dùng `prisma.user.upsert()` thay thế để atomic operation.

### 3.7 — Thiếu Health Check cho Redis và BullMQ
`HealthModule` hiện chỉ check database. Cần thêm Redis và Queue health check.

### 3.8 — `integration-tokens.ts` export cả object lẫn individual symbols
```typescript
export const INJECTION_TOKENS = { USER_REPOSITORY: Symbol(...) } // object
export const USER_REPOSITORY = INJECTION_TOKENS.USER_REPOSITORY;  // individual
```
Gây confusion — nên chỉ dùng `INJECTION_TOKENS.X` pattern, bỏ re-exports.

---

## 📁 Proposed Folder Structure

```
src/
├── common/                        # Shared infrastructure
│   ├── decorators/
│   ├── domain/
│   │   ├── base.entity.ts
│   │   ├── base.value-object.ts
│   │   └── errors/
│   │       ├── application.error.ts
│   │       ├── domain.error.ts
│   │       └── infrastructure.error.ts
│   ├── filters/
│   │   └── global-exception.filter.ts   # ← Chỉ GIỮ 1 filter duy nhất
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── local-auth.guard.ts
│   │   └── roles.guard.ts              # ← Cần implement
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── response.interceptor.ts
│   ├── interfaces/
│   ├── pipes/
│   └── utils/
│
├── config/
│   ├── config.ts
│   └── validation/
│
├── constants/
│   ├── app.constant.ts
│   ├── auth.constant.ts
│   ├── cache.constant.ts
│   └── injection-tokens.ts          # ← Single source of truth cho DI tokens
│
├── infrastructure/                  # ← THÊM MỚI: shared infra layer
│   └── redis/
│       └── redis.module.ts          # ← Shared Redis client (fix triple connection)
│
├── modules/
│   ├── app.module.ts
│   ├── auth/
│   │   ├── application/
│   │   │   └── services/
│   │   │       └── auth.service.ts
│   │   ├── domain/                  # ← THÊM: auth domain nếu cần
│   │   ├── infrastructure/
│   │   │   ├── strategies/
│   │   │   └── token-store/
│   │   │       └── redis-token-store.ts
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   └── dtos/
│   │   └── auth.module.ts
│   │
│   ├── user/
│   │   ├── application/
│   │   │   └── use-cases/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── enums/
│   │   │   ├── events/
│   │   │   ├── repositories/        # ← Interfaces only
│   │   │   └── value-objects/
│   │   ├── infrastructure/
│   │   │   └── repositories/        # ← Implementations
│   │   ├── presentation/
│   │   │   ├── controllers/
│   │   │   └── dtos/
│   │   └── user.module.ts
│   │
│   ├── product/                     # ← Tương tự user module
│   ├── notification/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── jobs/
│   │   └── notification.module.ts
│   │
│   ├── health/
│   ├── metrics/
│   ├── cls/
│   └── prisma/
│
├── i18n/
├── generated/                       # ← gitignore this (prisma generated)
└── main.ts
```

---

## 🧱 Architecture Overview

Codebase đang triển khai **Clean Architecture** kết hợp **DDD (Domain-Driven Design)** theo module — đây là lựa chọn tốt cho SaaS backend. Mỗi feature module có 3 lớp rõ ràng:

```
┌─────────────────────────────────────────────────────────┐
│                   PRESENTATION LAYER                      │
│     Controllers · DTOs · Swagger · Guards · Pipes        │
├─────────────────────────────────────────────────────────┤
│                   APPLICATION LAYER                       │
│          Use-Cases · Services · Event Handlers           │
├─────────────────────────────────────────────────────────┤
│                     DOMAIN LAYER                          │
│    Entities · Value Objects · Repository Interfaces      │
│              Domain Events · Domain Errors               │
├─────────────────────────────────────────────────────────┤
│                 INFRASTRUCTURE LAYER                      │
│   Prisma Repositories · Redis · BullMQ · Email/S3        │
└─────────────────────────────────────────────────────────┘
```

**Điểm mạnh đang làm đúng:**
- Domain entities không import Prisma (pure domain)
- Repository pattern với DI token (easy to swap)
- Event-driven giữa modules (EventEmitter → BullMQ)
- Value Objects (`Email.value-object.ts`)
- Separate `application.error.ts`, `domain.error.ts`, `infrastructure.error.ts`

**Điểm yếu cần cải thiện:**
- Controller chưa wire đến use-cases (Critical #1.2)
- AuthModule coupling với UserModule có thể gây circular dependency khi grow
- Thiếu Application Services layer cho cross-module orchestration

---

## 🚀 Performance Improvements

### P1 — Database Query Optimization

```prisma
// Thêm composite indexes cho common queries
model User {
  @@index([isActive, deletedAt])         // Filter active non-deleted users
  @@index([email, isActive])             // Auth lookup
  @@index([role, isActive])              // Role-based queries
  @@index([createdAt, isActive])         // Sorted active user list
}
```

### P2 — Fix Cache Invalidation Strategy

Thay vì hardcode page numbers, dùng tag-based cache:

```typescript
// Cache với namespace prefix
const CACHE_NS = 'users';
await this.cache.del(`${CACHE_NS}:${id}`);
// Flush toàn bộ namespace khi write:
const keys = await this.redis.keys(`${CACHE_NS}:*`);
await this.redis.del(...keys);
```

### P3 — Connection Pooling for Redis

```typescript
// src/infrastructure/redis/redis.module.ts
@Module({
  providers: [{
    provide: REDIS_CLIENT,
    useFactory: (config: ConfigService) => new Redis({
      host: config.get('cache.redis.host'),
      port: config.get('cache.redis.port'),
      maxRetriesPerRequest: 3,
      enableReadyCheck: true,
      lazyConnect: false,
    }),
    inject: [ConfigService],
  }],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

### P4 — Pagination với Cursor-Based approach ở scale

Khi users > 100k, `skip/offset` pagination rất chậm. Chuyển sang cursor-based:

```typescript
// Thay vì: skip = (page - 1) * limit
// Dùng:
const users = await prisma.user.findMany({
  take: limit + 1,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { createdAt: 'desc' },
});
```

### P5 — Argon2 trong hot path của Authentication

`argon2.hash()` tốn ~100ms. Đây là thiết kế đúng cho security, nhưng cần đảm bảo không block event loop bằng cách giới hạn concurrent hash operations:

```typescript
// Tạo PasswordService với concurrency control
import PLimit from 'p-limit';
const limit = PLimit(10); // Tối đa 10 concurrent hash operations
await limit(() => argon2.hash(password));
```

---

## 🔐 Security Improvements

### S1 — Fix JWT Secret mismatch (Critical — xem #1.1)

### S2 — Implement Blacklist Check trong JWT Guards (xem #2.7)

### S3 — Fix Logout không revoke refresh token (xem #1.3)

### S4 — Thêm Rate Limiting per user (không chỉ per IP)

```typescript
// ThrottlerModule hiện tại chỉ rate-limit theo IP
// Thêm custom throttler theo userId:
@Throttle({ default: { ttl: 60, limit: 30 } })
@UseGuards(ThrottlerGuard, JwtAuthGuard)
async sensitiveOperation() {...}
```

### S5 — Validate UUID format trước DB query

```typescript
// ParseUUIDPipe đã tồn tại nhưng không được dùng
@Get(':id')
async getUserById(@Param('id', ParseUUIDPipe) id: string) {...}
```

### S6 — Token trong Query String (security risk)

`AuthGuard` đang chấp nhận token từ query string:
```typescript
// ❌ Token trong URL có thể bị log trong nginx/CDN
if (request.query?.token) return request.query.token;
```
Xóa phần này — chỉ chấp nhận Bearer token trong header.

### S7 — Thêm Request Size Limit

```typescript
// main.ts
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb', extended: true }));
```

### S8 — CORS wildcard fallback

```typescript
// config.ts — default là '*' trong CORS
allowedOrigins: process.env.SECURITY_CORS_ALLOWED_ORIGINS?.split(',') || ['*'],
```

Production **không bao giờ** nên dùng `*`. Phải validate env này không được empty trong production.

---

## 🧠 DI & Scope Recommendations

### Hiện tại

| Provider | Scope | Đánh giá |
|---|---|---|
| `AuthService` | Singleton ✅ | Đúng — stateless logic |
| `PrismaUserRepository` | Singleton ✅ | Đúng — Prisma client là singleton |
| `RedisTokenStore` | Singleton ✅ | Đúng — giữ Redis connection |
| `LoggingInterceptor` | Singleton ✅ | Đúng — dùng ClsService cho context |
| Use-Cases | Singleton ✅ | Đúng — không có state |

### Vấn đề scope

`LoggingInterceptor` inject `ClsService<AppClsStore>` — điều này OK vì ClsService truy cập async context per-request dù bản thân là singleton. **Nhưng cần chú ý:**

```typescript
// ⚠️ Nếu LoggingInterceptor lưu request state vào instance variable — sẽ BUG
// ✅ Hiện tại code đúng vì chỉ đọc từ ClsService
const requestId = this.cls.get('requestId'); // ← Per-request via AsyncLocalStorage
```

### Recommendation

Không cần REQUEST scope cho bất kỳ provider nào hiện tại. REQUEST scope có overhead vì NestJS tạo new instance mỗi request — chỉ dùng khi provider thực sự cần store per-request mutable state.

---

## ⚡ Lazy Loading Strategy

### Modules nên Lazy Load

| Module | Lý do |
|---|---|
| `IntegrationsModule` (Email/S3) | Heavy AWS SDK, không cần ở startup |
| `NotificationModule` | Queue worker — chỉ cần khi có jobs |
| Swagger Module | Dev-only, không cần trong production |

### Implementation

```typescript
// app.module.ts — Conditional lazy loading
if (nodeEnv !== 'production') {
  // Swagger đã được handle trong main.ts — OK
}

// Với feature modules heavy:
// Dùng dynamic import trong controller nếu route hiếm được gọi
```

**Thực tế:** Với NestJS monolith, lazy loading ít có tác dụng hơn microservices. Tập trung vào module isolation trước.

---

## 🚨 Exception Handling Design

### Vấn đề hiện tại
1. Hai filters cùng lúc (`AllExceptionsFilter` + `GlobalExceptionFilter`)
2. Filter dùng string matching thay vì `instanceof`
3. `ApplicationError` có `statusCode` nhưng filter không tận dụng

### Recommended Design

```
Exception Hierarchy:
├── HttpException (NestJS built-in)
├── ApplicationError (custom base)
│   ├── NotFoundError (404)
│   ├── ConflictError (409)
│   ├── UnauthorizedError (401)
│   ├── ForbiddenError (403)
│   ├── UserNotFoundException (404)
│   ├── InvalidCredentialsError (401)
│   └── TokenRevokedError (401)
├── DomainError (custom)
│   ├── InvalidNameError
│   └── UserAlreadyDeactivatedError
└── InfrastructureError (custom)
    └── DatabaseError
```

### Fixed Filter (simplified)

```typescript
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // Priority: ApplicationError > HttpException > Unknown
    let status: number;
    let code: string;
    let message: string;

    if (exception instanceof ApplicationError) {
      status = exception.statusCode;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = this.httpStatusToCode(status);
      message = this.extractMessage(exception);
    } else {
      status = 500;
      code = 'INTERNAL_SERVER_ERROR';
      message = isProd ? 'Internal server error' : (exception as Error).message;
      this.logger.error('Unhandled exception', exception);
    }

    res.status(status).json({
      success: false,
      error: { code, message, timestamp: new Date().toISOString(), path: req.url },
    });
  }
}
```

---

## 🧪 Testing Strategy

### Hiện trạng
- ✅ Unit tests tồn tại: `auth.service.spec.ts`, `create-user.use-case.spec.ts`, `get-user-by-id.use-case.spec.ts`, `email.value-object.spec.ts`, `prisma-user.repository.spec.ts`
- ❌ Không có E2E tests
- ❌ Không có Integration tests với real DB
- ❌ Không có test coverage threshold
- ❌ Không có mock factory pattern

### Recommended Testing Pyramid

```
         /──────────────────\
        /    E2E Tests        \    ← 10% — test full HTTP flow
       /  (Supertest + TestDB)  \
      /────────────────────────\
     /    Integration Tests      \  ← 20% — test use-case + real repo
    /  (Jest + Prisma TestDB)      \
   /────────────────────────────────\
  /         Unit Tests               \  ← 70% — test domain logic
 /  (Jest + mocks — đã có, cần thêm)  \
/──────────────────────────────────────\
```

### Action Items

```typescript
// 1. Thêm coverage threshold vào jest.config.ts
coverageThreshold: {
  global: { branches: 70, functions: 80, lines: 80, statements: 80 }
}

// 2. Tạo mock factories
// test/factories/user.factory.ts
export const createMockUser = (overrides?: Partial<UserProps>): UserEntity =>
  UserEntity.reconstitute({ id: uuid(), email: 'test@test.com', ...overrides });

// 3. E2E test với real database
// test/e2e/user.e2e-spec.ts
describe('POST /users', () => {
  it('should create user and return 201', async () => {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ email: 'new@test.com', ... })
      .expect(201);
    expect(res.body.data.email).toBe('new@test.com');
  });
});
```

---

## 🎯 Final Verdict

### Codebase Maturity Level

```
Junior ──────────── Mid ──── [★ HERE] ──── Senior ──── Production-Ready
                                 ↑
                         Mid-Senior (~7/10)
```

### Scalability Score: **6.5 / 10**

| Bottleneck | Current | At 100k Users | Fix |
|---|---|---|---|
| DB Queries | OK | Slow (no composite indexes) | Add indexes |
| Redis Connections | 3 pools | Connection exhaustion | Shared RedisModule |
| Cache Invalidation | Partial | Stale data bugs | Tag-based invalidation |
| Auth Blacklist Check | Missing | Security holes | Implement in guards |
| Pagination | Offset | Very slow | Cursor-based |

---

### 🟢 What's Done Well (Giữ lại)
1. **Clean Architecture** với separation of concerns — domain không leak infrastructure
2. **DI Token pattern** với Symbols — clean và typesafe
3. **Event-driven notifications** qua EventEmitter → BullMQ — decoupled và scalable
4. **Argon2 password hashing** — best practice
5. **JWT Rotation** với Redis token store và per-user session management
6. **Prometheus metrics** integration với Grafana-ready metrics
7. **Pino structured logging** với redaction của sensitive fields
8. **Husky + Commitlint + ESLint** — excellent DX setup
9. **Joi validation** cho env variables — fail fast at startup
10. **Helmet + CORS strict matching** — good security foundation

### 🔴 Top 5 Things To Fix Immediately
1. **Fix `AuthGuard` JWT secret** — production auth is broken
2. **Wire `UserController` to use-cases** — entire user API returns fake data
3. **Fix Logout** — refresh tokens are not being revoked
4. **Import `NotificationModule`** — email queue is dead
5. **Resolve `TOKEN_STORE` duplicate Symbol** — DI runtime failure

---

*Report generated from full static analysis of NestJS SaaS codebase.*
*Files analyzed: 60+ TypeScript source files across 8 feature modules.*
