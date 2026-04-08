<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# 🚀 NestJS SaaS Enterprise Boilerplate

Enterprise-grade NestJS SaaS template designed for teams of 5-15 developers. This codebase follows strict **Domain-Driven Design (DDD)** principles and is built for scalability, maintainability, and observability.

---

## 🏗️ Architecture Overview

```
┌─────────────────┬──────────────────┬─────────────────┐
│   Presentation  │   Application   │   Domain       │
│   (Controllers) │   (Use-cases)  │   (Entities)    │
│                 │                  │                 │
│ • HTTP API     │ • Business Logic │ • Value Objects │
│ • DTOs        │ • Cache/Events  │ • Repo Interface│
│ • Swagger      │ • Orchestration │ • Domain Events │
└─────────────────┴──────────────────┴─────────────────┘
                      ↑
              Infrastructure
          (Repositories, DB, Redis)
```

---

## Quick Start

### 1. Clone & Install
```bash
git clone <repo-url>
cd nest-base
pnpm install
```

### 2. Environment Setup
```bash
# Local development
cp .env.example .env

# Docker environment
cp .env.docker.example .env.docker
# Edit files with your configuration
```

### 3. Quick Setup (Recommended)
```bash
# Automated setup with script
chmod +x scripts/setup-dev.sh
./scripts/setup-dev.sh

# Manual setup
docker-compose up -d postgres redis
pnpm prisma generate
pnpm prisma migrate dev
```

### 4. Run Application
```bash
# Development mode
pnpm start:dev

# Production mode  
pnpm build
pnpm start:prod
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js**: v20 or later
- **pnpm**: v9 or later (`npm install -g pnpm`)
- **Docker & Docker Compose**: For local infrastructure (Postgres, Redis)

---

## ⚡ Quick Start (3 Steps)

Get the application running locally in minutes:

1. **Setup Environment & Infrastructure**:
   ```bash
   cp .env.example .env
   docker-compose up -d
   ```

2. **Install & Sync Database**:
   ```bash
   pnpm install
   pnpx prisma migrate dev
   ```

3. **Start Development Server**:
   ```bash
   pnpm run start:dev
   ```
   *API will be available at http://localhost:3000/api/v1*  
   *Swagger docs at http://localhost:3000/api/v1/docs*

---

## 📁 Folder Structure Overview

```bash
src/
├── common/           # Shared logic (interceptors, filters, guards, domain base)
├── config/           # Centralized configuration (Joi validation)
├── constants/        # Global constants and DI Tokens (Symbols)
├── modules/          # Domain-driven feature modules
│   ├── auth/         # Authentication, Token Store, Session management
│   ├── user/         # Core User domain (Entities, Use-cases, Repositories)
│   └── notification/ # Event listeners and BullMQ background workers
├── main.ts           # App entry point (Helmet, CORS, Versioning, Graceful Shutdown)
└── app.module.ts     # Root module (Module registration)
```

> [!TIP]
> Each module under `src/modules/` follows the 4-layer architecture:
> **Presentation** → **Application** → **Domain** ← **Infrastructure**

---

## 📜 Coding Conventions

We follow strict architectural rules to ensure the codebase remains "clean" and database-swappable.

**READ THIS BEFORE CODING:**  
� **[CONVENTION.md](./CONVENTION.md)** - Complete architectural rules and module creation guide

---

## ✅ Development Checklist

**Before committing code, run these checks:**

```bash
# 1. Code Quality
pnpm typecheck      # No TypeScript errors
pnpm lint:check     # No ESLint warnings
pnpm spellcheck      # No typos in comments/docs

# 2. Testing
pnpm test:cov       # All tests pass, coverage ≥ 70%
```

**Manual Checklist:**
- [ ] Domain layer has **NO** framework imports (Prisma/NestJS)
- [ ] Use-cases inject via **DI Tokens**, not concrete classes
- [ ] Cache is invalidated after Update/Delete operations
- [ ] Swagger documentation is complete (`@ApiBody`, `@ApiResponse`)
- [ ] Error types are correct (`DomainError`, `ApplicationError`, `InfrastructureError`)
- [ ] Code is formatted with Prettier
- [ ] New module follows folder structure in CONVENTION.md

**Quick Commands:**
```bash
# Create new module (example: Product)
mkdir -p src/modules/product/{domain/{entities,repositories},application/use-cases,infrastructure/repositories,presentation/{controllers,dtos}}

# Add new repository token
# Edit src/constants/injection-tokens.ts

# Register module
# Edit src/modules/app.module.ts
```

---

## 🔑 Architecture Decision Records (ADR)

### 1. Why Domain-Driven Design (DDD)?
To prevent the "Big Ball of Mud". By isolating business logic (Domain) from external concerns (Prisma/TypeORM), we ensure the core logic is testable and robust.

### 2. Why the Repository Pattern?
To allow switching databases (e.g., Prisma to TypeORM) by simply changing a Dependency Injection token in the Module, without touching any business logic in Use-cases.

### 3. Why BullMQ (Redis)?
For handling heavy tasks (like Sending Emails) asynchronously. This prevents blocking the main request loop, improves user experience, and provides automatic retries.

---

## Docker Deployment

### Build & Deploy
```bash
# Build Docker image
chmod +x scripts/docker-build.sh
./scripts/docker-build.sh

# Run production migrations
./scripts/migrate.sh .env.docker

# Deploy with Docker Compose (production)
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Architecture
- **Multi-stage build**: Optimized production images
- **Non-root user**: Security best practice
- **Separate migrations**: Database migrations run outside of container startup
- **Health checks**: Automatic service monitoring

### Environment Files
- **Development**: `.env.example` 
- **Docker**: `.env.docker.example`
- **Never commit**: Actual `.env` files with secrets

---

## Security Features

### Authentication & Authorization
- **Custom JWT**: Access tokens (15min) + Refresh tokens (7days)
- **Redis Blacklist**: Revoked tokens immediately invalidated
- **Global Guards**: AuthGuard + RolesGuard applied globally
- **Session Management**: Automatic session revocation on user deletion

### Infrastructure Security
- **Cloud Storage Only**: Local storage blocked in production
- **Non-root Containers**: All services run as non-root users
- **Environment Isolation**: Separate configs for dev/staging/production
- **Rate Limiting**: Built-in throttling protection

### Data Protection
- **Fastify Exception Handling**: Secure error responses
- **Production Logging**: No sensitive data in logs
- **Input Validation**: Comprehensive DTO validation
- **CORS Security**: Configurable origin restrictions

---

## Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Environment (development/production) | `development` |
| `PORT` | API Port | `3000` |
| `DATABASE_URL` | PostgreSQL connection string | - |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | Secret for signing Access Tokens | - |
| `REFRESH_SECRET` | Secret for signing Refresh Tokens | - |

---

## 🛠 Available Scripts

- `pnpm run start:dev`: Start development server with hot reload.
- `pnpm run build`: Build the production bundle.
- `pnpm run test`: Run unit tests.
- `pnpm run typecheck`: Run TypeScript compiler checks.
- `pnpm run lint`: Run ESLint and Prettier checks.

---

## 🤝 Contributing

1. Ensure you've read [CONVENTION.md](./CONVENTION.md).
2. Write unit tests for every new Use-case.
3. Keep the Domain layer free of external dependencies.
4. Open a PR and ensure the CI passes.
