# NestJS Base - Professional Enterprise Boilerplate 🚀

![NestJS](https://img.shields.io/badge/nestjs-%23E0234E.svg?style=for-the-badge&logo=nestjs&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)

A robust, enterprise-grade NestJS boilerplate designed for scalability, maintainability, and high-performance, featuring a strict development workflow and state-of-the-art backend technologies.

---

## 🛠 Technology Stack

- **Core Framework**: [NestJS](https://nestjs.com/) (v11+) with **Fastify** for maximum performance.
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict Mode).
- **Database Engine**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL support.
- **Caching & Messaging**: [Redis](https://redis.io/) (ioredis) & [BullMQ](https://docs.bullmq.io/) for high-throughput background jobs.
- **Authentication**: [Passport.js](https://www.passportjs.org/) (JWT & Local Strategy) with Redis-backed session/token management.
- **Observability**: [Prometheus](https://prometheus.io/) metrics, Pino logging, and integrated Health Checks.
- **Integrations**: AWS S3 (Storage), Amazon SES / SendGrid (Email).
- **DevOps**: Docker, Husky, Commitlint, ESLint (Airbnb Style Guide), and Prettier.

---

## 📂 Project Structure

```text
src/
├── common/           # Shared modules, decorators, filters, and utilities
├── config/           # Centralized configuration management (app, database, redis, etc.)
├── constants/        # Application-wide constants and injection tokens
├── i18n/             # Multi-language (i18n) support files
└── modules/          # Domain-specific business logic
    ├── auth/         # Authentication & Authorization domain
    ├── user/         # User management domain
    ├── product/      # Product domain example
    ├── notification/ # Background jobs and email processing
    └── ...           # Other business modules
```

---

## 🚀 Getting Started

### 1. Prerequisites

- **Node.js**: v22+
- **pnpm**: v10+ (Recommended)
- **Docker**: For running Postgres & Redis

### 2. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

### 3. Installation

```bash
pnpm install
```

### 4. Database Migration

```bash
pnpm prisma generate
pnpm prisma migrate dev
```

### 5. Running the App

```bash
# Development mode
pnpm run start:dev

# Production mode
pnpm run build
pnpm run start:prod
```

---

## 🛡 Development Workflow & Standards

We enforce strict coding standards to ensure code quality and consistency across the team.

### 📝 Commit Message Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org/). Every commit message is validated against these rules:

- `feat: ...` (New feature)
- `fix: ...` (Bug fix)
- `docs: ...` (Documentation changes)
- `style: ...` (Formatting, missing semi-colons, etc)
- `refactor: ...` (Code change that neither fixes a bug nor adds a feature)
- `test: ...` (Adding or fixing tests)
- `build: ...` (Changes to the build system or external dependencies)

### ⚓ Git Hooks (Husky)

The following checks are automated via **Husky** hooks:

1. **lint-staged**: Checks formatting (Prettier) and coding rules (ESLint) **only on files you changed**.
2. **TypeScript Check**: Ensures there are no type errors globally.
3. **Format Check**: Validates project-wide Prettier compliance.
4. **Branch Naming**: Enforces branch names like `feature.xxx`, `bugfix.xxx`, etc. (allows `main`).
5. **Pre-push**: Runs all **Unit Tests** before pushing to the remote repository.

### 🧩 Linting & Formatting

- All code must pass the **Airbnb ESLint Style Guide**.
- Strict TypeScript rules are active (no `any`, explicit return types required).
- Run `pnpm run lint` to fix common issues automatically.
- Run `pnpm format` to beautify the entire codebase.

---

## 🧪 Testing

```bash
# Run all unit tests
pnpm run test

# Run e2e tests
pnpm run test:e2e

# Code coverage report
pnpm run test:cov
```

---

## 🐳 Deployment (Docker)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

---

## 📜 License

This project is [UNLICENSED](LICENSE).
