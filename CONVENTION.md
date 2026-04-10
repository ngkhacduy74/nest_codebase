# NestJS Enterprise Development Conventions 🏛️

This document defines the architectural patterns, coding standards, and development workflows for the project. Every team member is required to adhere to these standards to ensure codebase consistency, testability, and scalability.

---

## 🏗 1. Architectural Philosophy: Domain-Driven Design (DDD)

We follow a strict **4-Layer DDD Architecture** to ensure high decoupling and business-centric logic.

### 1.1 The Layers

1.  **Domain Layer (Core)**: Business logic, Entities, Value Objects, and Repository Interfaces.
    - **CRITICAL**: ZERO dependencies on frameworks (NestJS) or ORMs (Prisma).
2.  **Application Layer (Orchestration)**: Use-Cases and Services that coordinate workflows (calling repositories, clearing cache, sending notification).
3.  **Infrastructure Layer (External)**: Technical implementations (Prisma Repositories, Redis, AWS API clients).
4.  **Presentation Layer (API)**: Controllers, DTOs, Swagger decorators, and Guards.

### 1.2 The Dependency Rule

> Modules must always point **INWARDS**.
> `Presentation → Application → Domain ← Infrastructure`

---

## 📏 2. Naming Conventions

Consistency in naming facilitates rapid navigation and automated tooling.

| Component          | File Suffix         | Format      | Example                        |
| :----------------- | :------------------ | :---------- | :----------------------------- |
| **Entity**         | `*.entity.ts`       | PascalCase  | `user.entity.ts`               |
| **Value Object**   | `*.value-object.ts` | PascalCase  | `email.value-object.ts`        |
| **Interface**      | `*.interface.ts`    | IPascalCase | `user.repository.interface.ts` |
| **Implementation** | `[type]-*.ts`       | kebab-case  | `prisma-user.repository.ts`    |
| **Use-Case**       | `*.use-case.ts`     | kebab-case  | `create-user.use-case.ts`      |
| **Controller**     | `*.controller.ts`   | PascalCase  | `user.controller.ts`           |
| **DTO**            | `*.dto.ts`          | PascalCase  | `create-user.dto.ts`           |
| **Event**          | `*.event.ts`        | kebab-case  | `user-created.event.ts`        |

---

## 🛠 3. Coding Standards

### 3.1 Strict TypeScript

- **No `any`**: The use of `any` is strictly prohibited. Use `unknown` or define proper `interfaces/types`.
- **Explicit Returns**: All public methods and functions must have explicit return types.
- **Strict Null Checks**: Always handle `null` and `undefined` using optional chaining or type guards.

### 3.2 Dependency Injection (DI)

- **Interface-based**: Always inject using **Injection Tokens** (Symbols) for persistence-layer interfaces.
- **Example**:
  ```typescript
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository
  ) {}
  ```

---

## 🌿 4. Git Workflow & Commits

### 4.1 Branching Strategy

- **`main` / `master`**: Production-ready code only.
- **`feature.xxx`**: New features.
- **`bugfix.xxx`**: Bug fixes.
- **`hotfix.xxx`**: Critical production fixes.

### 4.2 Conventional Commits

Commit messages must follow the format: `<type>(<scope>): <description>`

- `feat`: New feature.
- `fix`: Bug fix.
- `docs`: Documentation only.
- `refactor`: Code change that neither fixes a bug nor adds a feature.
- `chore`: Maintenance tasks (deps, build, etc.).

---

## 🚨 5. Error Handling & Observability

### 5.1 Error Hierarchy

- **DomainError**: Business rule violations (e.g., `InsufficientBalanceError`).
- **ApplicationError**: Workflow failures.
- **InfrastructureError**: Technical failures (e.g., `DatabaseConnectionError`).

### 5.2 Guidelines

- Never throw raw `InternalServerErrorException` in business logic; use an appropriate `4xx` domain error and let the `GlobalExceptionFilter` map it.
- Log context matters: Use `LogContext` constants when using the `AppLoggerService`.

---

## 🧪 6. Testing Strategy

### 6.1 Unit Tests

- **Mandatory**: Every Use-Case must have a corresponding `.spec.ts` file.
- **Mocking**: Use `jest.fn()` to mock repository interfaces. Never inject real database services into unit tests.

### 6.2 E2E Tests

- Focus on critical user flows (Auth, Payments, Onboarding).
- Run against a dedicated test database (Teardown/Setup before every suite).

---

## 🚢 7. Deployment & Infrastructure

- **Docker**: Multi-stage builds are required. Production images must run with a `non-root` user.
- **Migrations**: Database migrations must be executed via automated scripts before the application entrypoint.
- **Storage**: Use Cloud Storage (AWS S3) for production. Local storage is strictly for development environments.

---

## ✅ 8. Pull Request Checklist

Before opening a PR, ensure:

- [ ] Code passes `pnpm run lint`.
- [ ] Code passes `pnpm run typecheck`.
- [ ] Unit tests are added/updated and passing.
- [ ] Swagger documentation updated for all new API endpoints.
- [ ] Proper error handling implemented.
- [ ] Conventional commit message used.

---

> [!NOTE]
> This project is built for high standards. If in doubt, consult the Architectural Philosophy section or ask a lead developer.
