# So Sánh & Hướng Cải Thiện Codebase

> **Mục tiêu**: So sánh `nest_codebase` (của bạn — DDD) với `nest-base` (công ty — Feature-sliced), từ đó đề xuất hướng soạn lại codebase vừa mang phong cách công ty, vừa phù hợp dự án nhỏ và vừa, các folder liên kết chặt chẽ.

---

## 1. Tổng Quan Kiến Trúc

### Codebase của bạn (`nest_codebase`) — DDD thuần túy

```
src/
├── common/            # Decorators, domain base, filters, guards, integrations
│   ├── domain/        # BaseEntity, BaseValueObject, BaseEvent
│   ├── filters/       # AllExceptionsFilter, GlobalExceptionFilter
│   ├── guards/        # AuthGuard, JwtAuthGuard, RolesGuard
│   └── integrations/  # Email (SES/SendGrid), Storage (S3)
├── config/            # 1 file config.ts tổng hợp + validation riêng
├── constants/         # App constants, injection tokens
├── i18n/              # Translations
├── modules/           # Feature modules (auth, user, product, notification)
│   └── [feature]/
│       ├── application/    # Use-cases
│       ├── domain/         # Entities, ValueObjects, RepoInterfaces, Events
│       ├── infrastructure/ # PrismaRepo, Strategies, TokenStore
│       └── presentation/   # Controllers, DTOs
└── main.ts
```

**Ưu điểm**: Kiến trúc sạch, layer rõ ràng, testable cao, swap DB dễ dàng.  
**Nhược điểm**: Nhiều boilerplate, hơi nặng cho dự án nhỏ và vừa, thiếu nhiều tooling quan trọng mà công ty đang dùng.

---

### Codebase công ty (`nest-base`) — Feature-sliced + Pragmatic

```
src/
├── api/               # Controllers + Services + DTOs theo feature
│   ├── file/          # File upload feature
│   ├── health/        # Health check endpoint
│   └── user/          # User CRUD + resolver
├── auth/              # Auth module (better-auth, entities, guard)
│   └── entities/      # User, Session, Account, Passkey, TwoFactor...
├── common/            # Shared DTOs, types (pagination, errors)
│   ├── dto/           # cursor-pagination/, offset-pagination/, error DTOs
│   └── types/         # Common types, Branded types
├── config/            # Mỗi service có thư mục riêng
│   ├── app/           # app.config.ts + app-config.type.ts + spec
│   ├── auth/          # auth.config.ts + better-auth.config.ts
│   ├── database/      # database.config.ts + type + spec
│   ├── bull/          # bull.config.ts + factory + type
│   ├── mail/          # mail.config.ts + factory + type + spec
│   ├── redis/         # redis.config.ts + type
│   ├── sentry/        # sentry.config.ts + type
│   └── throttler/     # throttler.config.ts + factory + guard + type
├── constants/         # App, auth, cache, job, mail constants
├── database/          # TypeORM: models, migrations, seeds, logger
│   ├── migrations/    # Versioned migration files
│   ├── models/        # BaseModel, CreatorModel
│   └── seeds/         # Initial seed data
├── decorators/        # Tất cả decorators tập trung
│   ├── auth/          # CurrentUserSession, hooks, optional-auth, public-auth
│   ├── validators/    # is-ms, is-nullable, is-password, validate-dto...
│   ├── field.decorators.ts    # NumberField, StringField, EmailField...
│   ├── http.decorators.ts
│   ├── swagger.decorators.ts
│   └── transform.decorators.ts
├── interceptors/      # SentryInterceptor, FileUploadInterceptor
├── middlewares/       # BasicAuthMiddleware
├── services/          # External service integrations
│   ├── aws/           # AwsS3Service
│   └── gcp/           # GcpModule
├── shared/            # Reusable modules dùng nhiều nơi
│   ├── cache/         # CacheModule, CacheService, CacheFactory
│   ├── mail/          # MailModule, MailService, React Email templates
│   └── socket/        # SocketModule, SocketGateway, RedisAdapter
├── tools/             # Dev tooling
│   ├── grafana/       # Grafana dashboards + provisioning
│   ├── logger/        # Logger factory
│   └── swagger/       # Swagger setup
├── utils/             # Utility functions
│   ├── config/        # validateConfig utility + spec
│   ├── interceptors/  # serialize interceptor
│   ├── pagination/    # cursor-pagination, offset-pagination utils
│   └── validators/    # username validator
├── worker/            # BullMQ worker (tách process riêng)
│   └── queues/
│       └── email/     # EmailProcessor, EmailService, EmailType, EmailEvents
└── main.ts            # Fastify adapter, Sentry, graceful shutdown
```

**Ưu điểm**: Thực tế, đầy đủ tooling, dễ onboard, phù hợp dự án vừa và nhỏ.  
**Nhược điểm**: Ít có separation of concern rõ ràng như DDD.

---

## 2. Bảng So Sánh Chi Tiết

| Tiêu chí | `nest_codebase` (bạn) | `nest-base` (công ty) | Ưu tiên cải thiện |
|---|---|---|---|
| **HTTP Adapter** | Express | **Fastify** — nhanh hơn ~2x | 🔴 Cao |
| **ORM** | Prisma | **TypeORM** + migrations versioned | 🔴 Cao |
| **Auth** | JWT custom + passport | **better-auth** (OAuth, passkey, 2FA, magic link) | 🔴 Cao |
| **Config pattern** | 1 file `config.ts` tổng hợp | **Mỗi service 1 folder** với `.type.ts` + `.spec.ts` | 🔴 Cao |
| **Config validation** | Joi schema chung | **class-validator** trên từng `EnvironmentVariablesValidator` | 🔴 Cao |
| **DTO decoration** | `@ApiProperty` thủ công từng field | **`field.decorators.ts`** — `@StringField()`, `@EmailField()`, v.v. | 🔴 Cao |
| **Validation pattern** | Joi song song class-validator (2 hệ thống) | **class-validator nhất quán** + custom decorators | 🔴 Cao |
| **Pagination** | Chỉ offset cơ bản | **Cả cursor + offset** với `OffsetPaginationDto`, `CursorPaginationDto` | 🟡 Trung bình |
| **Email templates** | String-based / provider SDK | **React Email** (`.tsx`) — type-safe, preview được | 🟡 Trung bình |
| **Worker process** | Notification trong main app | **Worker tách process riêng** (`IS_WORKER=true`) | 🟡 Trung bình |
| **AppModule pattern** | `@Module({})` thông thường | **`AppModule.main()` + `AppModule.worker()`** dynamic | 🟡 Trung bình |
| **Database migration** | Prisma migrate | **TypeORM versioned migrations** — kiểm soát rõ hơn | 🟡 Trung bình |
| **Database seeding** | Không có | **Versioned seed files** | 🟡 Trung bình |
| **BaseModel** | `BaseEntity` thủ công | **`BaseModel` extends `typeorm.BaseEntity`** với `toDto()` | 🟡 Trung bình |
| **Exception filter** | Có 2 filter trùng nhau | 1 filter nhất quán | 🟡 Trung bình |
| **Grafana dashboards** | Không có | **Dashboards sẵn cho Prometheus/Postgres/Server** | 🟢 Thấp |
| **Socket.IO** | Không có | **Redis adapter + Gateway + Service** | 🟢 Thấp |
| **Sentry** | Không có | **SentryInterceptor + config** | 🟢 Thấp |
| **CI/CD** | Không có | **GitHub Actions**: CI, release, deploy-docs, semantic PR | 🟢 Thấp |
| **Docker** | 1 compose file | **dev + prod + maildev** compose riêng | 🟢 Thấp |
| **BullBoard** | Không có | **BullBoard UI** (protected bởi basic auth) | 🟢 Thấp |
| **PM2 config** | Không có | `pm2.config.json` sẵn | 🟢 Thấp |
| **Renovate** | Không có | `renovate.json` tự cập nhật deps | 🟢 Thấp |
| **ERD generator** | Không có | `scripts/erd-generator.ts` | 🟢 Thấp |
| **madge (circular dep)** | Không có | Detect circular dependency trong CI | 🟢 Thấp |
| **Test cho config** | Không có | **Config spec files** (`app-config.spec.ts`, v.v.) | 🟢 Thấp |
| **DDD architecture** | ✅ Đầy đủ | Không có | (Giữ lại 1 phần) |
| **Security (Auth)** | ✅ Rất tốt (argon2, JWT rotation, blacklist, session limit) | Delegate cho better-auth | Giữ lại tư duy |
| **CONVENTION.md** | ✅ Có | Không có | Giữ lại |

---

## 3. Những Điểm Cần Cải Thiện Cụ Thể

### 3.1 🔴 Chuyển sang Fastify Adapter

**Vấn đề hiện tại**: Bạn đang dùng Express (mặc định của NestJS). Công ty dùng Fastify.

**Tại sao quan trọng**: Fastify nhanh hơn ~2x về throughput, công ty dùng Fastify nên codebase mới cần theo chuẩn này.

```typescript
// main.ts — Cần đổi sang
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

const app = await NestFactory.create<NestFastifyApplication>(
  AppModule.main(),
  new FastifyAdapter({ logger: envToLogger[env] }),
  { bufferLogs: true },
);
```

**Lưu ý khi migrate**:
- `@fastify/cookie` thay vì `cookie-parser`
- `app.useStaticAssets()` cần `@fastify/static`
- `app.listen()` nhận object `{ port, host }` thay vì 2 argument riêng

---

### 3.2 🔴 Tách Cấu Trúc Config — Mỗi Service 1 Folder

**Vấn đề hiện tại**: Toàn bộ config nằm trong 1 file `src/config/config.ts`.

**Cách công ty làm**: Mỗi service config có folder riêng gồm 3 files:

```
src/config/
├── app/
│   ├── app-config.type.ts   ← Định nghĩa type
│   ├── app.config.ts        ← validateConfig + registerAs
│   └── app-config.spec.ts   ← Unit test
├── database/
│   ├── database-config.type.ts
│   ├── database.config.ts
│   └── database-config.spec.ts
├── redis/
│   ├── redis-config.type.ts
│   └── redis.config.ts
└── config.type.ts           ← GlobalConfig gộp tất cả
```

**Pattern chuẩn của công ty**:

```typescript
// app-config.type.ts
export type AppConfig = {
  nodeEnv: `${Environment}`;
  port: number;
  name: string;
  corsOrigin: boolean | string[] | '*';
};

// app.config.ts — Dùng class-validator thay vì Joi
class EnvironmentVariablesValidator {
  @IsEnum(Environment) @IsOptional() NODE_ENV: string;
  @IsInt() @Min(0) @Max(65535) APP_PORT: number;
  @IsString() @IsNotEmpty() APP_NAME: string;
}

export default registerAs<AppConfig>('app', () => {
  validateConfig(process.env, EnvironmentVariablesValidator);
  return { /* ... */ };
});

// config.type.ts — GlobalConfig
export type GlobalConfig = {
  app: AppConfig;
  database: DatabaseConfig;
  redis: RedisConfig;
  auth: AuthConfig;
};
```

**Lợi ích**: Mỗi config được test độc lập, type-safe hoàn toàn, `ConfigService<GlobalConfig>` gợi ý autocomplete đầy đủ.

---

### 3.3 🔴 Bỏ Joi — Dùng Nhất Quán class-validator

**Vấn đề hiện tại**: Codebase đang dùng song song 2 hệ thống:
- `class-validator` + `@ApiProperty` cho DTOs
- `Joi` schema song song (`createUserSchema`) cho validation pipe

**Hậu quả**: Logic validation bị trùng lặp, người mới không biết dùng cái nào.

```typescript
// ❌ Hiện tại — 2 hệ thống song song
export class CreateUserDto {
  @ApiProperty({ description: 'Email' })
  email: string;
}
export const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
});

// ✅ Chuẩn công ty — Dùng field.decorators.ts
export class CreateUserDto {
  @EmailField()          // = @IsEmail() + @ApiProperty() + @IsNotEmpty() + ToLowerCase()
  email: string;

  @StringField({ minLength: 2, maxLength: 50 })
  firstName: string;

  @PasswordField()       // = @IsPassword() + @MinLength(6) + ...
  password: string;
}
```

**Cần làm**: Xây dựng `field.decorators.ts` giống công ty — là file quan trọng nhất giúp code DTO gọn, nhất quán.

---

### 3.4 🔴 Cải Thiện Pattern Config Validation

**Vấn đề hiện tại**: Dùng Joi schema trong `config/validation/` — dài dòng, khó extend.

**Cách công ty làm** — `validateConfig` utility:

```typescript
// utils/config/validate-config.ts
function validateConfig<T extends object>(
  config: Record<string, unknown>,
  envVariablesClass: ClassConstructor<T>,
) {
  const validatedConfig = plainToClass(envVariablesClass, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });
  if (errors.length > 0) throw new Error(/* formatted errors */);
  return validatedConfig;
}
```

**Lợi ích**: Dùng chung class-validator, dễ test, error message rõ ràng.

---

### 3.5 🟡 Tái Cấu Trúc Exception Filter

**Vấn đề hiện tại**: Có 2 exception filter làm cùng việc — `AllExceptionsFilter` và `GlobalExceptionFilter`. Gây confuse cho người mới.

**Cần làm**: Giữ lại 1 filter duy nhất, đặt trong `src/common/filters/http-exception.filter.ts`. Xóa cái còn lại.

---

### 3.6 🟡 Xây Dựng Hệ Thống Pagination Đầy Đủ

**Vấn đề hiện tại**: Chỉ có offset pagination cơ bản, không có cursor pagination.

**Cần thêm** (theo pattern công ty):

```
src/common/dto/
├── offset-pagination/
│   ├── offset-pagination.dto.ts    ← Meta: currentPage, totalPages, nextPage...
│   ├── page-options.dto.ts         ← limit, page, order
│   └── paginated.dto.ts            ← Wrapper { data[], meta }
└── cursor-pagination/
    ├── cursor-pagination.dto.ts    ← afterCursor, beforeCursor, limit
    ├── page-options.dto.ts
    └── paginated.dto.ts

src/utils/pagination/
├── offset-pagination.ts            ← paginate() function cho TypeORM
└── cursor-pagination.ts            ← buildPaginator() function
```

---

### 3.7 🟡 Email Templates — Chuyển sang React Email

**Vấn đề hiện tại**: Email templates dạng string hoặc dựa vào SDK provider.

**Cách công ty làm**:

```tsx
// src/shared/mail/templates/email-verification.tsx
import { Body, Button, Container, Html, Tailwind, Text } from '@react-email/components';

export const EmailVerification = ({ email, url }: Props) => (
  <Html>
    <Tailwind>
      <Body>
        <Container>
          <Text>Hi {email},</Text>
          <Button href={url}>Verify Email</Button>
        </Container>
      </Body>
    </Tailwind>
  </Html>
);
```

**Lợi ích**: Preview template trong browser (`pnpm email:dev`), type-safe props, Tailwind CSS, tách biệt hoàn toàn khỏi business logic.

---


### 3.9 🟡 Cải Thiện BaseModel

**Vấn đề hiện tại**: `BaseEntity` tự viết, thiếu `toDto()` method.

**Cách công ty làm**:

```typescript
// database/models/base.model.ts
import { plainToInstance } from 'class-transformer';
import { BaseEntity, CreateDateColumn, DeleteDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

export abstract class BaseModel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date;

  toDto<Dto>(dtoClass: new () => Dto): Dto {
    return plainToInstance(dtoClass, this);
  }
}
```

**Lợi ích**: `user.toDto(UserDto)` — map entity sang DTO tự động qua `class-transformer`.

---

### 3.10 🟡 Thêm `src/constants/constraint-errors.ts`

**Vấn đề hiện tại**: Không có centralized error codes.

**Cách công ty làm**: Map database constraint errors thành readable codes.

```typescript
// constants/constraint-errors.ts
export const CONSTRAINT_ERRORS = {
  UNIQUE_EMAIL: 'UQ_user_email',
  UNIQUE_USERNAME: 'UQ_user_username',
} as const;
```

---

## 4. Kiến Trúc Đề Xuất Cho Codebase Mới

Kết hợp điểm mạnh của cả hai: DDD layer ở core module, pragmatic ở module thường.

```
src/
├── api/                    ← Phong cách công ty: flat feature modules
│   ├── api.module.ts
│   ├── user/
│   │   ├── dto/
│   │   │   ├── user.dto.ts            (response DTO)
│   │   │   └── update-profile.dto.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts            (trực tiếp inject Repository)
│   │   ├── user.enum.ts
│   │   └── user.module.ts
│   ├── file/
│   └── health/
│
├── auth/                   ← Module auth riêng biệt (better-auth hoặc custom)
│   ├── entities/           ← TypeORM entities
│   ├── auth.guard.ts
│   ├── auth.module.ts
│   └── auth.service.ts
│
├── common/                 ← Shared primitives
│   ├── dto/
│   │   ├── offset-pagination/
│   │   └── cursor-pagination/
│   └── types/
│       ├── common.type.ts  (Uuid, Branded types)
│       └── types.ts
│
├── config/                 ← 1 folder per service (phong cách công ty)
│   ├── app/
│   │   ├── app-config.type.ts
│   │   ├── app.config.ts
│   │   └── app-config.spec.ts
│   ├── database/
│   ├── redis/
│   ├── auth/
│   ├── bull/
│   ├── mail/
│   ├── throttler/
│   └── config.type.ts      ← GlobalConfig
│
├── constants/              ← Tập trung tất cả constants
│   ├── app.constant.ts     (Environment enum)
│   ├── auth.constant.ts
│   ├── cache.constant.ts
│   ├── job.constant.ts
│   └── constraint-errors.ts
│
├── database/               ← TypeORM data layer
│   ├── models/
│   │   ├── base.model.ts   (id, createdAt, updatedAt, deletedAt, toDto())
│   │   └── creator.model.ts
│   ├── migrations/         ← Versioned migrations
│   └── seeds/              ← Versioned seeds
│
├── decorators/             ← Tất cả decorators tập trung 1 chỗ
│   ├── auth/
│   │   ├── current-user.decorator.ts
│   │   └── public.decorator.ts
│   ├── validators/
│   │   ├── is-password.decorator.ts
│   │   └── is-nullable.decorator.ts
│   ├── field.decorators.ts      ← QUAN TRỌNG: StringField, EmailField, UUIDField...
│   ├── swagger.decorators.ts
│   └── transform.decorators.ts
│
├── filters/                ← 1 exception filter duy nhất
│   └── http-exception.filter.ts
│
├── interceptors/
│   ├── response.interceptor.ts
│   ├── logging.interceptor.ts
│   └── sentry.interceptor.ts
│
├── middlewares/
│   └── basic-auth.middleware.ts
│
├── shared/                 ← Reusable modules
│   ├── cache/
│   │   ├── cache.module.ts
│   │   ├── cache.service.ts
│   │   └── cache.factory.ts
│   ├── mail/
│   │   ├── mail.module.ts
│   │   ├── mail.service.ts
│   │   └── templates/      ← React Email .tsx
│   └── socket/             ← Tùy chọn nếu cần realtime
│
├── tools/
│   ├── logger/             ← Pino logger factory
│   └── swagger/            ← Swagger setup
│
├── utils/
│   ├── config/
│   │   ├── validate-config.ts
│   │   └── validate-config.spec.ts
│   └── pagination/
│       ├── offset-pagination.ts
│      
│
├── worker/                 ← Tách process riêng
│   ├── worker.module.ts
│   └── queues/
│       └── email/
│           ├── email.processor.ts
│           ├── email.service.ts
│           └── email.type.ts
│
├── app.module.ts           ← main() + worker() pattern
└── main.ts                 ← Fastify adapter
```

---

## 5. Checklist Ưu Tiên Khi Soạn Lại

### Giai đoạn 1 — Nền tảng (Bắt buộc)
- [ ] Đổi sang **Fastify adapter** trong `main.ts`
- [ ] Tách config theo **folder per service** (`app/`, `database/`, `redis/`...) với `.type.ts` + `.spec.ts`
- [ ] Xây dựng **`validate-config.ts`** utility dùng class-validator
- [ ] Xây dựng **`field.decorators.ts`** (`StringField`, `EmailField`, `UUIDField`, `EnumField`...)
- [ ] Xây dựng **`GlobalConfig`** type tổng hợp
- [ ] Chuyển sang **TypeORM** + migrations versioned (theo chuẩn công ty)
- [ ] Xóa Joi, **dùng nhất quán class-validator**
- [ ] Hợp nhất 2 exception filter thành **1 filter duy nhất**

### Giai đoạn 2 — Tính năng (Quan trọng)
- [ ] Xây dựng **pagination đầy đủ** (offset + cursor) trong `common/dto/`
- [ ] Xây dựng **`BaseModel`** với `toDto()` method
- [ ] Chuyển email templates sang **React Email** (`.tsx`)
- [ ] Implement **`AppModule.main()` + `AppModule.worker()`** pattern
- [ ] Thêm **`database/seeds/`** cho initial data

### Giai đoạn 3 — Tooling (Nên có)
- [ ] Thêm **`src/tools/swagger/`** setup riêng thay vì inline trong main.ts
- [ ] Thêm **`src/tools/logger/`** factory
- [ ] Thêm **config spec files** để test config validation
- [ ] Thêm **`constraint-errors.ts`** constants
- [ ] Thêm **`renovate.json`** để auto-update dependencies
- [ ] Thêm **GitHub Actions** CI workflow
- [ ] Thêm **`pm2.config.json`** cho production

---

## 6. Những Điểm Tốt Nên GIỮ Lại Từ Codebase Của Bạn

Dù đổi phong cách, những tư duy sau vẫn rất valuable:

| Điểm mạnh | Giữ lại như thế nào |
|---|---|
| **CONVENTION.md chi tiết** | Tiếp tục viết convention docs, cập nhật theo kiến trúc mới |
| **JWT rotation + refresh token hashing** | Port logic vào `auth.service.ts` mới dù dùng better-auth hay custom |
| **Redis token store với session limit (max 5)** | Giữ nguyên concept, có thể implement qua better-auth plugins |
| **Blacklist access token khi logout** | Giữ pattern này trong `auth.service.ts` |
| **Layered error classes** | Giữ `ApplicationError`, `DomainError`, `InfrastructureError` trong `common/` |
| **ClsService cho request tracing** | Giữ, rất hữu ích cho logging correlation |
| **UnitOfWork cho transactions** | Giữ trong `database/unit-of-work.ts` |
| **argon2 cho password hashing** | Giữ, tốt hơn bcrypt |
| **Graceful shutdown** | Công ty dùng `nestjs-graceful-shutdown`, cùng mục đích |

---

## 7. Vấn Đề Nhỏ Cần Sửa Trong Code Hiện Tại

Những bug/vấn đề phát hiện khi review codebase hiện tại, cần sửa trước hoặc trong quá trình soạn lại:

1. **Bug test**: `create-user.use-case.spec.ts` mock `repo.findByEmail` nhưng use-case gọi `repo.existsByEmail` — test không bao giờ catch đúng bug.

2. **Vi phạm DDD**: `user.entity.ts` có `await import('argon2')` trong `validatePassword()` — Domain entity không được import infrastructure library. Chuyển sang `AuthService`.

3. **Dynamic import lặp**: `create-user.use-case.ts` dùng `await import('uuid')` và `await import('argon2')` mỗi lần gọi. Đổi sang static import.

4. **Prisma schema thiếu enum**: `role` field dùng `String` thay vì `enum Role` — mất type-safety ở database level.

5. **Magic number**: `604800` (7 ngày) hardcode ở 2 chỗ trong `auth.service.ts`. Đặt vào constant.

6. **`ProductEntity.create()` dùng `require('uuid')`**: Dùng CommonJS require trong TypeScript class — không đúng pattern.

7. **Controller không inject use-cases**: `user.controller.ts` trả về dummy data hardcode thay vì gọi use-cases — cần wire up đầy đủ.

---

## 8. Gợi Ý Đặt Tên File Theo Phong Cách Công Ty

| Loại | Pattern công ty | Ví dụ |
|---|---|---|
| Config type | `*-config.type.ts` | `app-config.type.ts` |
| Config factory | `*.config.ts` | `app.config.ts` |
| Config test | `*-config.spec.ts` | `app-config.spec.ts` |
| DTO | `*.dto.ts` | `user.dto.ts`, `update-user-profile.dto.ts` |
| Entity | `*.entity.ts` | `user.entity.ts` |
| Model (base) | `*.model.ts` | `base.model.ts` |
| Service | `*.service.ts` | `user.service.ts` |
| Controller | `*.controller.ts` | `user.controller.ts` |
| Guard | `*.guard.ts` | `auth.guard.ts` |
| Factory | `*.factory.ts` | `bull.factory.ts`, `cache.factory.ts` |
| Type (shared) | `*.type.ts` | `auth.type.ts`, `cache.type.ts` |
| Decorator | `*.decorator.ts` | `public.decorator.ts` |
| Field decorators | `field.decorators.ts` (tập trung) | — |
| Processor | `*.processor.ts` | `email.processor.ts` |
| Enum | `*.enum.ts` | `user.enum.ts` |
| Constant | `*.constant.ts` | `app.constant.ts` |

---

*Tài liệu được tổng hợp từ việc phân tích trực tiếp source code của cả hai codebase.*
