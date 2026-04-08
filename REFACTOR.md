# 🏗️ NestJS Base — Hướng dẫn Refactor Toàn diện

> **Mục tiêu:** Production-ready, secure, maintainable NestJS codebase  
> **Stack:** NestJS + Fastify · Prisma · PostgreSQL · Redis · BullMQ · Pino

---

## 📋 Mục lục

1. [Tổng quan vấn đề](#1-tổng-quan-vấn-đề)
2. [Docker & Infrastructure](#2-docker--infrastructure)
3. [Custom Auth System](#3-custom-auth-system)
4. [Security & Guards](#4-security--guards)
5. [Exception Handling](#5-exception-handling)
6. [DeleteUser — Session Revoke](#6-deleteuser--session-revoke)
7. [File Upload → S3 Enforce](#7-file-upload--s3-enforce)
8. [Sentry Guard](#8-sentry-guard)
9. [Renovate Config](#9-renovate-config)
10. [ENV Strategy](#10-env-strategy)
11. [Shell Scripts hỗ trợ](#11-shell-scripts-hỗ-trợ)
12. [Checklist hoàn thiện](#12-checklist-hoàn-thiện)

---

## 1. Tổng quan vấn đề

| # | Mức độ | Vấn đề | Trạng thái |
|---|--------|--------|-----------|
| 1 | 🔴 Nguy hiểm | Migration chạy trong build stage Docker | Cần fix |
| 2 | 🔴 Nguy hiểm | Thiếu Dockerfile hoàn chỉnh | Cần tạo |
| 3 | 🔴 Nguy hiểม | Thiếu `.dockerignore` và `.env.docker` | Cần tạo |
| 4 | 🟠 Quan trọng | AuthGuard chưa wired global + chưa check blacklist token | Cần fix |
| 5 | 🟠 Quan trọng | `deleteUser` soft-delete nhưng không revoke session Redis | Cần fix |
| 6 | 🟠 Quan trọng | File upload có thể ghi vào local fs thay vì S3 | Cần enforce |
| 7 | 🟡 Nhỏ | `Sentry.init()` gọi kể cả khi DSN rỗng | Cần guard |
| 8 | 🟡 Nhỏ | `renovate.json` thiếu strategy chi tiết | Cần bổ sung |
| 9 | ✅ Đã có | Global exception filter | OK – đã register trong AppModule |
| 10 | ✅ Đã có | Custom JWT Auth (không dùng Better Auth) | OK |
| 11 | ✅ Đã có | RBAC RolesGuard + AuthorizationGuard | OK – cần wiring |

---

## 2. Docker & Infrastructure

### 2.1 Tạo `Dockerfile` (multi-stage, migration tách riêng)

```dockerfile
# ─────────────────────────────────────────────
# Stage 1: deps — cài production dependencies
# ─────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN npm install -g pnpm@latest \
  && pnpm install --frozen-lockfile --prod \
  && pnpm exec prisma generate

# ─────────────────────────────────────────────
# Stage 2: builder — build TypeScript
# ─────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
COPY prisma ./prisma

RUN npm install -g pnpm@latest \
  && pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec prisma generate \
  && pnpm build

# ─────────────────────────────────────────────
# Stage 3: runner — image chạy production
# ─────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Security: chạy với non-root user
RUN addgroup --system appgroup \
  && adduser --system --ingroup appgroup appuser

# Copy artifacts từ 2 stage trên
COPY --from=deps    /app/node_modules      ./node_modules
COPY --from=builder /app/dist              ./dist
COPY --from=builder /app/src/generated     ./src/generated
COPY --from=builder /app/prisma            ./prisma
COPY package.json ./

USER appuser

EXPOSE 3000

# ⚠️ KHÔNG chạy migration ở đây — xem scripts/migrate.sh
CMD ["node", "dist/main"]
```

> **Quy tắc vàng:** Image chỉ chạy `node dist/main`. Migration là bước **deploy** riêng — xem [scripts/migrate.sh](#script-migratesh).

---

### 2.2 Tạo `.dockerignore`

```
# Source control
.git
.gitignore

# Dependencies (sẽ được cài lại trong image)
node_modules

# Build output (sẽ được tạo trong image)
dist
*.tsbuildinfo

# Environment files — KHÔNG bao giờ đưa vào image
.env
.env.*
!.env.example

# Dev tools
.husky
.github
coverage
test
docs
*.md
!README.md

# IDE
.vscode
.idea
*.log
```

---

### 2.3 Tạo `docker-compose.yml` (dev) và `docker-compose.prod.yml`

**`docker-compose.yml` (local dev — chỉ infra):**

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    container_name: saas_postgres
    env_file: .env.docker
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    ports:
      - "${DATABASE_PORT:-5432}:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: saas_redis
    env_file: .env.docker
    command: >
      redis-server
      --requirepass ${REDIS_PASSWORD}
      --appendonly yes
    ports:
      - "${REDIS_PORT:-6379}:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  adminer:
    image: adminer:latest
    container_name: saas_adminer
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
    profiles: ["tools"]  # chỉ start khi dùng: docker compose --profile tools up

volumes:
  postgres_data:
  redis_data:
```

**`docker-compose.prod.yml` (production — bao gồm app):**

```yaml
version: '3.9'

services:
  app:
    image: ${REGISTRY}/saas-backend:${IMAGE_TAG:-latest}
    container_name: saas_app
    env_file: .env.docker
    ports:
      - "${PORT:-3000}:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:3000/api/v1/health || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '0.5'

  postgres:
    image: postgres:16-alpine
    env_file: .env.docker
    environment:
      POSTGRES_USER: ${DATABASE_USER}
      POSTGRES_PASSWORD: ${DATABASE_PASSWORD}
      POSTGRES_DB: ${DATABASE_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    # Port KHÔNG expose ra ngoài trong prod
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DATABASE_USER} -d ${DATABASE_NAME}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    env_file: .env.docker
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
```

---

### 2.4 Tạo `.env.docker` (environment cho Docker containers)

File này **không commit** (thêm vào `.gitignore`), chỉ dùng để pass env vào docker-compose.

```bash
# .env.docker — copy từ .env.docker.example
NODE_ENV=production

PORT=3000

DATABASE_USER=saas_user
DATABASE_PASSWORD=CHANGE_ME_STRONG_PASSWORD
DATABASE_NAME=saas_db
DATABASE_PORT=5432
DATABASE_URL=postgresql://saas_user:CHANGE_ME_STRONG_PASSWORD@postgres:5432/saas_db

REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGE_ME_REDIS_PASSWORD

JWT_ACCESS_SECRET=CHANGE_ME_MIN_32_CHARS_ACCESS_SECRET
JWT_REFRESH_SECRET=CHANGE_ME_MIN_32_CHARS_REFRESH_SECRET
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

ALLOWED_ORIGINS=https://yourdomain.com
```

Thêm vào `.gitignore`:

```gitignore
# Docker environment
.env.docker
.env.production
.env.staging
```

---

## 3. Custom Auth System

Auth system hiện tại đã **đúng hướng** (custom JWT + Redis token store). Không cần Better Auth. Dưới đây là các điểm cần bổ sung/làm chắc:

### 3.1 AuthGuard phải check Redis blacklist

File: `src/common/guards/auth.guard.ts`

```typescript
// THÊM vào constructor và canActivate:
import { Inject } from '@nestjs/common';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import type { ITokenStore } from '@/modules/auth/infrastructure/token-store/redis-token-store';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // ✅ THÊM: inject token store để check blacklist
    @Inject(INJECTION_TOKENS.TOKEN_STORE)
    private readonly tokenStore: ITokenStore,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // ... existing public/optional check ...

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('auth.jwt.accessToken.secret'),
      });

      if (!payload.sub || !payload.email || !payload.jti) {
        throw new UnauthorizedException('INVALID_TOKEN_PAYLOAD');
      }

      // ✅ THÊM: kiểm tra token có bị blacklist không
      const isBlacklisted = await this.tokenStore.isAccessTokenBlacklisted(payload.jti);
      if (isBlacklisted) {
        throw new UnauthorizedException('TOKEN_REVOKED');
      }

      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('INVALID_OR_EXPIRED_TOKEN');
    }
  }
}
```

### 3.2 Đăng ký AuthGuard global trong AppModule

File: `src/modules/app.module.ts` — thêm vào `providers`:

```typescript
import { AuthGuard } from '@common/guards/auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';

providers: [
  // Rate limiting
  { provide: APP_GUARD, useClass: ThrottlerGuard },

  // ✅ THÊM: Auth global — thứ tự quan trọng
  { provide: APP_GUARD, useClass: AuthGuard },

  // ✅ THÊM: RBAC global
  { provide: APP_GUARD, useClass: RolesGuard },

  // Exception filter
  { provide: APP_FILTER, useClass: GlobalExceptionFilter },

  // Logging
  { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
],
```

> Sau khi đăng ký global, **xóa** `@UseGuards(JwtAuthGuard, AuthorizationGuard)` ở từng controller — chỉ giữ lại `@Public()` cho route public và `@Roles()` cho route cần phân quyền.

### 3.3 Thêm `isAccessTokenBlacklisted` vào ITokenStore

File: `src/modules/auth/infrastructure/token-store/redis-token-store.ts`

```typescript
export interface ITokenStore {
  save(userId: string, tokenId: string, token: string, ttl: number): Promise<void>;
  verify(userId: string, tokenId: string, token: string): Promise<boolean>;
  revoke(userId: string, tokenId: string): Promise<void>;
  revokeAll(userId: string): Promise<void>;
  blacklistAccessToken(jti: string, ttlSeconds: number): Promise<void>;
  // ✅ THÊM:
  isAccessTokenBlacklisted(jti: string): Promise<boolean>;
}

// Trong class RedisTokenStore — thêm implementation:
async isAccessTokenBlacklisted(jti: string): Promise<boolean> {
  const key = `blacklist:access:${jti}`;
  const exists = await this.redis.exists(key);
  return exists === 1;
}
```

---

## 4. Security & Guards

### 4.1 RBAC Roles Decorator — dùng thống nhất

Hiện có 2 decorator `@Roles` từ 2 nguồn khác nhau. Consolidate về 1:

```typescript
// src/common/decorators/roles.decorator.ts — ĐÂY là source of truth
import { SetMetadata } from '@nestjs/common';
import { Role } from '@/modules/user/domain/enums/role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
```

```typescript
// src/common/guards/roles.guard.ts — update để dùng ROLES_KEY
import { ROLES_KEY } from '../decorators/roles.decorator';

const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
  context.getHandler(),
  context.getClass(),
]);
```

### 4.2 Bỏ `JwtAuthGuard` + `AuthorizationGuard` cũ ở từng controller

Sau khi wiring global guard, cập nhật UserController:

```typescript
// TRƯỚC:
@UseGuards(JwtAuthGuard, AuthorizationGuard)
@Controller('users')
export class UserController { ... }

// SAU — không cần UseGuards nữa, AuthGuard+RolesGuard đã global:
@Controller('users')
export class UserController { ... }
// Chỉ thêm @Roles(Role.ADMIN) cho endpoint cần phân quyền
```

---

## 5. Exception Handling

Global exception filter **đã được implement tốt** và register trong AppModule. Chỉ cần đảm bảo filter dùng Fastify response (không phải Express `Response`):

File: `src/common/filters/global-exception.filter.ts` — cập nhật type imports:

```typescript
// THAY:
import { Request, Response } from 'express';

// BẰNG (vì app dùng Fastify):
import { FastifyRequest, FastifyReply } from 'fastify';

// Và trong catch():
catch(exception: unknown, host: ArgumentsHost): void {
  const ctx = host.switchToHttp();
  const response = ctx.getResponse<FastifyReply>();   // ← FastifyReply
  const request = ctx.getRequest<FastifyRequest>();   // ← FastifyRequest

  const errorResponse = this.getErrorResponse(exception, request);
  this.logError(exception, request, errorResponse);

  // Fastify dùng .code() thay vì .status()
  response.code(errorResponse.meta.statusCode).send(errorResponse);
}
```

---

## 6. DeleteUser — Session Revoke

File: `src/modules/user/application/use-cases/delete-user.use-case.ts`

```typescript
import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { INJECTION_TOKENS } from '@/constants/injection-tokens';
import { CacheKeys } from '@/constants/cache.constant';
import type { ITokenStore } from '@/modules/auth/infrastructure/token-store/redis-token-store';

@Injectable()
export class DeleteUserUseCase {
  private readonly logger = new Logger(DeleteUserUseCase.name);

  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
    @Inject(CACHE_MANAGER)
    private readonly cache: Cache,
    // ✅ THÊM: inject token store
    @Inject(INJECTION_TOKENS.TOKEN_STORE)
    private readonly tokenStore: ITokenStore,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete
    await this.userRepo.delete(id);

    // ✅ THÊM: Revoke tất cả session của user trong Redis
    try {
      await this.tokenStore.revokeAll(id);
      this.logger.log(`[DeleteUser] Revoked all sessions: userId=${id}`);
    } catch (err) {
      // Log cảnh báo nhưng không block — user đã bị soft delete
      this.logger.error(`[DeleteUser] Failed to revoke sessions: userId=${id}`, err);
    }

    // Invalidate cache
    try {
      await Promise.all([
        this.cache.del(CacheKeys.user(id)),
        this.cache.del(CacheKeys.userByEmail(user.email)),
        this.cache.del(CacheKeys.userList(1, 20)),
      ]);
    } catch (err) {
      this.logger.warn('Cache invalidation failed', { id, err });
    }

    this.eventEmitter.emit('user.deleted', {
      userId: user.id,
      email: user.email,
    });
  }
}
```

Thêm `TOKEN_STORE` vào `injection-tokens.ts` nếu chưa có:

```typescript
// src/constants/injection-tokens.ts
export const INJECTION_TOKENS = {
  USER_REPOSITORY: 'USER_REPOSITORY',
  TOKEN_STORE: 'TOKEN_STORE',      // ✅ Đảm bảo có key này
  // ...
} as const;
```

---

## 7. File Upload → S3 Enforce

Codebase đã có `StorageService` và `aws-s3.provider.ts`. Cần enforce không bao giờ dùng local filesystem:

### 7.1 Cấu hình upload module

```typescript
// src/common/integrations/storage/storage.module.ts
// Đảm bảo throw rõ ràng nếu provider không phải S3/cloud

export class StorageModule {
  static forRoot(): DynamicModule {
    return {
      module: StorageModule,
      providers: [
        {
          provide: STORAGE_PROVIDER,
          inject: [ConfigService],
          useFactory: (config: ConfigService) => {
            const provider = config.get<string>('storage.provider');

            if (!provider) {
              throw new Error(
                '[StorageModule] STORAGE_PROVIDER không được cấu hình. ' +
                'Set STORAGE_PROVIDER=aws-s3 trong .env',
              );
            }

            // ✅ Không bao giờ cho phép local storage trong production
            if (provider === 'local' && config.get('app.nodeEnv') === 'production') {
              throw new Error(
                '[StorageModule] Local storage bị cấm trong production. ' +
                'Dùng aws-s3, cloudinary, hoặc google-cloud.',
              );
            }

            switch (provider) {
              case 'aws-s3':
                return new AwsS3Provider(config);
              default:
                throw new Error(`[StorageModule] Provider không hỗ trợ: ${provider}`);
            }
          },
        },
        StorageService,
      ],
      exports: [StorageService],
    };
  }
}
```

### 7.2 Xóa thư mục `./src/tmp` khỏi codebase

```bash
# Nếu có tmp directory trong source
rm -rf src/tmp

# Thêm vào .gitignore
echo "tmp/" >> .gitignore
echo "uploads/" >> .gitignore
```

---

## 8. Sentry Guard

Hiện `main.ts` không có Sentry (đã không có trong codebase). Nếu cần thêm, **bắt buộc guard DSN**:

```typescript
// src/main.ts — thêm vào đầu bootstrap() nếu dùng Sentry
import * as Sentry from '@sentry/node';

async function bootstrap(): Promise<void> {
  // ✅ Chỉ init Sentry khi có DSN
  const sentryDsn = process.env.SENTRY_DSN;
  if (sentryDsn && sentryDsn.trim() !== '') {
    Sentry.init({
      dsn: sentryDsn,
      environment: process.env.NODE_ENV || 'development',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });
  }

  // ... rest of bootstrap
}
```

---

## 9. Renovate Config

Tạo file `renovate.json` với strategy rõ ràng:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended"],
  "timezone": "Asia/Ho_Chi_Minh",
  "schedule": ["every weekend"],
  "labels": ["dependencies"],
  "prHourlyLimit": 5,
  "prConcurrentLimit": 10,
  "automerge": false,
  "separateMajorReleases": true,
  "separateMinorPatch": false,

  "packageRules": [
    {
      "description": "Major updates — cần review thủ công",
      "matchUpdateTypes": ["major"],
      "labels": ["dependencies", "breaking-change"],
      "automerge": false
    },
    {
      "description": "Minor + patch — auto-merge nếu CI pass",
      "matchUpdateTypes": ["minor", "patch"],
      "matchDepTypes": ["dependencies"],
      "automerge": true,
      "automergeType": "pr",
      "automergeStrategy": "squash"
    },
    {
      "description": "NestJS core — luôn review thủ công",
      "matchPackagePatterns": ["^@nestjs/"],
      "groupName": "NestJS",
      "automerge": false,
      "labels": ["dependencies", "nestjs"]
    },
    {
      "description": "Prisma — group lại để update cùng lúc",
      "matchPackageNames": ["prisma", "@prisma/client"],
      "groupName": "Prisma",
      "automerge": false
    },
    {
      "description": "Security advisories — update ngay",
      "matchCategories": ["security"],
      "schedule": ["at any time"],
      "labels": ["dependencies", "security"],
      "automerge": false,
      "prPriority": 10
    },
    {
      "description": "Dev dependencies patch",
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["patch"],
      "automerge": true
    }
  ],

  "ignoreDeps": [
    "typescript"
  ],

  "vulnerabilityAlerts": {
    "labels": ["security"],
    "automerge": false
  }
}
```

---

## 10. ENV Strategy

### Quy ước file môi trường

| File | Mục đích | Commit? |
|------|---------|---------|
| `.env.example` | Template với mô tả đầy đủ | ✅ Yes |
| `.env` | Local dev (cá nhân) | ❌ No |
| `.env.local` | Override local | ❌ No |
| `.env.docker` | Cho Docker containers | ❌ No |
| `.env.docker.example` | Template cho Docker env | ✅ Yes |
| `.env.test` | Test environment | ❌ No (nếu có secrets) |

### Cập nhật `.gitignore` đầy đủ

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build
dist/
*.tsbuildinfo
src/generated/

# Environment — KHÔNG COMMIT
.env
.env.*
!.env.example
!.env.*.example

# Docker env — KHÔNG COMMIT
.env.docker
.env.production
.env.staging

# Logs
*.log
logs/

# Uploads / temp files
tmp/
uploads/

# IDE
.vscode/settings.json
.idea/

# OS
.DS_Store
Thumbs.db

# Test artifacts
coverage/
test-results/
```

### Cập nhật `prisma/schema.prisma` — thêm DATABASE_URL

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")   // ✅ Bắt buộc có env
}
```

---

## 11. Shell Scripts hỗ trợ

**Có nên tạo `.sh` không?** → **Có**, đặc biệt cho 3 tác vụ quan trọng:

### `scripts/migrate.sh` — chạy migration an toàn (tách khỏi Docker build)

```bash
#!/usr/bin/env bash
# scripts/migrate.sh
# Chạy Prisma migration trong môi trường production
# Dùng trong: CI/CD pipeline TRƯỚC khi deploy app, KHÔNG trong Dockerfile
set -euo pipefail

ENV_FILE="${1:-.env.docker}"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ Không tìm thấy env file: $ENV_FILE"
  exit 1
fi

echo "📦 Loading env từ $ENV_FILE..."
export $(grep -v '^#' "$ENV_FILE" | xargs)

echo "🔄 Chạy Prisma migration..."
npx prisma migrate deploy

echo "✅ Migration hoàn thành"
```

### `scripts/docker-build.sh` — build và tag image

```bash
#!/usr/bin/env bash
# scripts/docker-build.sh
set -euo pipefail

REGISTRY="${REGISTRY:-ghcr.io/your-org/saas-backend}"
TAG="${1:-$(git rev-parse --short HEAD)}"

echo "🏗️  Building image: $REGISTRY:$TAG"

docker build \
  --tag "$REGISTRY:$TAG" \
  --tag "$REGISTRY:latest" \
  --file Dockerfile \
  --build-arg BUILD_DATE="$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
  --build-arg GIT_SHA="$TAG" \
  .

echo "✅ Build xong: $REGISTRY:$TAG"
echo "   Để push: docker push $REGISTRY:$TAG"
```

### `scripts/setup-dev.sh` — setup nhanh cho developer mới

```bash
#!/usr/bin/env bash
# scripts/setup-dev.sh
set -euo pipefail

echo "🚀 Setup môi trường development..."

# 1. Check tools
command -v node >/dev/null || { echo "❌ Node.js chưa cài"; exit 1; }
command -v pnpm >/dev/null || npm install -g pnpm

# 2. Copy env files nếu chưa có
[[ -f .env ]] || { cp .env.example .env; echo "📋 Đã copy .env.example → .env (cần cập nhật giá trị)"; }
[[ -f .env.docker ]] || { cp .env.docker.example .env.docker 2>/dev/null || echo "⚠️  Tạo .env.docker.example trước"; }

# 3. Install dependencies
echo "📦 Installing dependencies..."
pnpm install

# 4. Start infra
echo "🐳 Starting Docker services..."
docker compose up -d postgres redis

# 5. Wait for postgres
echo "⏳ Chờ PostgreSQL sẵn sàng..."
until docker compose exec postgres pg_isready -U "${DATABASE_USER:-user}" >/dev/null 2>&1; do
  sleep 1
done

# 6. Generate Prisma client + run migration
echo "🔄 Running migrations..."
pnpm exec prisma generate
pnpm exec prisma migrate dev

echo ""
echo "✅ Setup hoàn tất!"
echo "   Chạy app: pnpm start:dev"
echo "   Swagger:  http://localhost:3000/api/v1/docs"
```

---

## 12. Checklist hoàn thiện

### 🐳 Docker

- [ ] Tạo `Dockerfile` (multi-stage, non-root user)
- [ ] Tạo `.dockerignore`
- [ ] Tạo `docker-compose.yml` (dev infra only)
- [ ] Tạo `docker-compose.prod.yml` (production full stack)
- [ ] Tạo `.env.docker.example`
- [ ] Thêm `.env.docker` vào `.gitignore`
- [ ] **KHÔNG** chạy migration trong Dockerfile CMD

### 🔒 Auth & Security

- [ ] `AuthGuard.canActivate()` → thêm kiểm tra Redis blacklist (`isAccessTokenBlacklisted`)
- [ ] Đăng ký `AuthGuard` + `RolesGuard` làm `APP_GUARD` global trong `AppModule`
- [ ] Xóa `@UseGuards(JwtAuthGuard, AuthorizationGuard)` khỏi từng controller
- [ ] Thêm `@Public()` cho các route không cần auth
- [ ] Consolidate `@Roles` decorator về 1 nguồn

### 🏗️ Application

- [ ] `GlobalExceptionFilter` dùng `FastifyReply`/`FastifyRequest` (không phải Express)
- [ ] `DeleteUserUseCase` → gọi `tokenStore.revokeAll(id)` trước khi soft delete
- [ ] `StorageModule` → throw error rõ ràng nếu STORAGE_PROVIDER không phải cloud
- [ ] Xóa `./src/tmp` khỏi codebase và `.gitignore`
- [ ] `Sentry.init()` → guard bằng `if (sentryDsn)`
- [ ] Prisma schema → thêm `url = env("DATABASE_URL")`

### ⚙️ Config & DX

- [ ] Cập nhật `renovate.json` với strategy đầy đủ
- [ ] Cập nhật `.gitignore` đầy đủ (bao gồm `.env.docker`, `tmp/`, `uploads/`)
- [ ] Tạo `scripts/migrate.sh`
- [ ] Tạo `scripts/docker-build.sh`
- [ ] Tạo `scripts/setup-dev.sh`
- [ ] Chmod scripts: `chmod +x scripts/*.sh`

### 🧪 Testing

- [ ] Unit test cho `DeleteUserUseCase` với mock `tokenStore.revokeAll`
- [ ] Unit test cho `AuthGuard` với blacklisted token
- [ ] E2E test: login → delete user → cũ access token phải bị từ chối

---

## Thứ tự ưu tiên thực hiện

```
1. [🔴] Tạo Dockerfile + .dockerignore + .env.docker.example     (30 phút)
2. [🔴] Cập nhật docker-compose.yml                              (15 phút)
3. [🟠] Wiring AuthGuard + RolesGuard global trong AppModule      (20 phút)
4. [🟠] Thêm blacklist check vào AuthGuard                        (30 phút)
5. [🟠] Fix DeleteUserUseCase → revokeAll sessions                (15 phút)
6. [🟡] Fix GlobalExceptionFilter dùng Fastify types              (10 phút)
7. [🟡] Enforce StorageModule không dùng local                    (15 phút)
8. [🟡] Cập nhật .gitignore đầy đủ                               (5 phút)
9. [🟡] Cập nhật renovate.json                                    (10 phút)
10.[🟡] Tạo scripts/*.sh                                          (20 phút)
```

**Tổng thời gian ước tính: ~3 giờ**
