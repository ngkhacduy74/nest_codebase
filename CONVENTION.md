# NestJS SaaS Project Conventions

Tài liệu này quy chuẩn hóa kiến trúc và quy trình phát triển cho dự án, bắt buộc tất cả thành viên trong team phải đọc trước khi code.

## 1. TRIẾT LÝ KIẾN TRÚC

Chúng ta tuân thủ nghiêm ngặt mô hình **Domain-Driven Design (DDD)** với 4 layers độc lập:

1.  **Domain (Core)**: Chứa logic nghiệp vụ cốt lõi (Entity, Value Object, Repo Interface, Domain Event).
    *   **QUY TẮC VÀNG**: Domain layer **KHÔNG** được chứa bất kỳ import nào từ framework (NestJS) hay ORM (Prisma/TypeORM).
    *   **Vì sao?**: Để khi thay đổi database hoặc framework, logic nghiệp vụ vẫn giữ nguyên và không bị ảnh hưởng (Unit test chạy offline cực nhanh).
2.  **Application (Orchestrator)**: Chứa Use-cases, Services điều phối luồng xử lý, Gọi cache, Gửi email, Emit events.
3.  **Infrastructure (External)**: Implement Repository cụ thể (Prisma, TypeORM), Connect Redis, Call API bên thứ ba.
4.  **Presentation (API)**: Controller, DTO, Swagger decorator, Guard xử lý HTTP request/response.

> [!IMPORTANT]
> **Mũi tên chỉ đi xuống**: Presentation → Application → Domain ← Infrastructure.
> **Ví dụ vi phạm**: Nếu bạn import `PrismaService` vào `UserEntity` để check email trùng, bạn sẽ không thể chạy Unit Test cho Entity mà không cần nhấc cả database lên. Điều này làm chậm tốc độ phát triển và vi phạm tính đóng gói của Domain.

---

## 2. CÁCH THÊM MODULE MỚI (VÍ DỤ: PRODUCT)

Khi cần thêm tính năng quản lý Product, hãy thực hiện theo đúng thứ tự sau:

1.  **Domain Entity**: Tạo `product.entity.ts` với các thuộc tính và method nghiệp vụ.
2.  **Repo Interface**: Tạo `product.repository.interface.ts` định nghĩa các hàm `save`, `findById`.
3.  **DI Token**: Thêm `PRODUCT_REPOSITORY` vào `src/constants/injection-tokens.ts`.
4.  **Infrastructure**: Tạo `prisma-product.repository.ts` kế thừa interface và dùng Prisma để query.
5.  **Use-cases**: Tạo `create-product.use-case.ts` và inject bằng `PRODUCT_REPOSITORY` token.
6.  **Presentation**: Tạo `product.controller.ts` và `create-product.dto.ts`.
7.  **Module Registration**: Đăng ký tất cả vào `product.module.ts`.
8.  **Unit Test**: Viết `create-product.use-case.spec.ts` cho nghiệp vụ quan trọng.

---

## 3. CÁCH SWAP DATABASE

Để đổi từ Prisma sang TypeORM, chúng ta làm 4 bước:

1.  **Tạo Repostitory mới**: Tạo `typeorm-user.repository.ts` implement `IUserRepository`.
2.  **Update Module**:
    ```typescript
    // user.module.ts
    { 
      provide: USER_REPOSITORY, 
      useClass: TypeORMUserRepository // Chỉ đổi dòng này
    }
    ```
3.  **Không đổi Use-case**: Vì use-case dùng `@Inject(USER_REPOSITORY)`, nó không hề biết database đã thay đổi.
4.  **Chạy Test**: Chạy lại unit test cũ, nếu pass hết thì việc swap thành công 100%.

---

## 4. QUY TẮC NAMING CONVENTION

| Loại file | Tên | Ví dụ |
| :--- | :--- | :--- |
| **Entity** | `*.entity.ts` | `user.entity.ts` |
| **Value Object** | `*.value-object.ts` | `email.value-object.ts` |
| **Repo interface** | `*.repository.interface.ts` | `user.repository.interface.ts` |
| **Repo impl** | `[orm]-*.repository.ts` | `prisma-user.repository.ts` |
| **Use-case** | `[action]-[entity].use-case.ts` | `create-user.use-case.ts` |
| **Controller** | `*.controller.ts` | `user.controller.ts` |
| **DTO** | `[action]-[entity].dto.ts` | `create-user.dto.ts` |
| **Event** | `[entity]-[action].event.ts` | `user-created.event.ts` |
| **Handler** | `[entity]-[action].handler.ts` | `user-created.handler.ts` |
| **Processor** | `[type].processor.ts` | `email.processor.ts` |
| **Spec (Test)** | `*.spec.ts` | `create-user.use-case.spec.ts` |

---

## 5. QUY TẮC INJECT DEPENDENCY

Bắt buộc dùng `Symbol` token cho các interface để đảm bảo tính duy nhất và decoupled.

✅ **ĐÚNG (Inject qua Interface/Token)**:
```typescript
constructor(
  @Inject(USER_REPOSITORY) 
  private readonly userRepository: IUserRepository
) {}
```

❌ **SAI (Inject Concrete Class trực tiếp)**:
```typescript
constructor(
  private readonly prismaUserRepository: PrismaUserRepository
) {}
```
*Lỗi này khiến code bị "dính chặt" vào Prisma, không thể unit test độc lập.*

---

## 6. QUY TẮC XỬ LÝ LỖI

*   **Domain Error**: Ném lỗi khi vi phạm logic nghiệp vụ (vượt quá số lượng, sai trạng thái). Ví dụ: `InsufficientFundsError`.
*   **Infrastructure Error**: Catch lỗi database (unique constraint) và bọc lại thành Application/Domain Error.
*   **Khi nào throw gì?**: 
    *   Validation fail → `BadRequestException` (dùng class-validator).
    *   Nghiệp vụ sai → Domain Error → Map sang `4xx` HTTP.
    *   Lỗi hệ thống → `InternalServerErrorException`.
*   **Global Exception Filter**: Tự động bắt lỗi và format response chuẩn cho frontend.

---

## 7. QUY TẮC VIẾT TEST

Mỗi Use-case **BẮT BUỘC** phải có file test đi kèm.

*   **MOCKING**: Luôn mock repository dựa trên Interface, không bao giờ mock Class thật.
*   **Ví dụ ngắn gọn**:
```typescript
// create-user.use-case.spec.ts
const repo = { save: jest.fn(), findByEmail: jest.fn() };
const useCase = new CreateUserUseCase(repo as any);

it('should fail if email exists', async () => {
  repo.findByEmail.mockResolvedValue({ id: '1' });
  await expect(useCase.execute(dto)).rejects.toThrow(ConflictException);
});
```

---

## 8. CHECKLIST TRƯỚC KHI MỞ PR

Trước khi yêu cầu review, hãy tự kiểm tra:
- [ ] Đã viết spec cho use-case mới.
- [ ] KHÔNG có import Prisma/Framework trong domain layer.
- [ ] Không có concrete class nào được inject trực tiếp vào use-case.
- [ ] Cache được clear sau khi Update/Delete.
- [ ] Swagger documentation đầy đủ (@ApiBody, @ApiResponse).
- [ ] Error được throw đúng loại (Domain/App Error).
- [ ] Định dạng code chuẩn qua `Prettier`.

---

## 9. QUY TẮC BAO MAT & AUTHENTICATION

### 9.1 JWT Token Management
- **Access Token**: 15 phút expiry, có blacklist trong Redis
- **Refresh Token**: 7 ngày expiry, lưu trong Redis
- **Blacklist**: Token revoked sẽ được blacklist trong Redis
- **Session Revocation**: Khi user xóa, revoke tất cả session

### 9.2 Security Guards
- **AuthGuard**: Global guard, kiểm tra JWT và blacklist
- **RolesGuard**: Global RBAC, kiểm tra permissions
- **@Public()**: Dùng cho routes không cần authentication
- **@Roles()**: Dùng cho routes cần phân quyền

### 9.3 Storage Security
- **Production**: CHỈ cho phép cloud storage (AWS S3, Cloudinary, Google Cloud)
- **Local Storage**: BỊ cấm trong production environment
- **Validation**: Storage provider phải validate config trước khi sử dụng

### 9.4 Exception Handling
- **GlobalExceptionFilter**: Dùng FastifyRequest/FastifyReply (không Express)
- **Error Types**: DomainError, ApplicationError, InfrastructureError
- **Production Safety**: Không hiển thị stack trace trong production

---

## 10. DOCKER & DEPLOYMENT

### 10.1 Multi-stage Build
- **Stage 1 (deps)**: Install production dependencies
- **Stage 2 (builder)**: Build TypeScript và generate Prisma client
- **Stage 3 (runner)**: Runtime image với non-root user

### 10.2 Migration Strategy
- **KHÔNG** chạy migration trong Dockerfile
- **Dùng scripts/migrate.sh** trước khi deploy
- **Separate concern**: Build vs Deploy

### 10.3 Environment Files
- **.env.example**: Template cho local dev
- **.env.docker.example**: Template cho Docker containers
- **KHÔNG** commit các .env files

---

## 11. CHECKLIST TRƯỚC KHI MỞ PR

Trước khi yêu cầu review, hãy tự kiểm tra:

### 11.1 Code Quality
- [ ] Đã viết spec cho use-case mới.
- [ ] KHÔNG có import Prisma/Framework trong domain layer.
- [ ] Không có concrete class nào được inject trực tiếp vào use-case.
- [ ] Cache được clear sau khi Update/Delete.
- [ ] Swagger documentation đầy đủ (@ApiBody, @ApiResponse).
- [ ] Error được throw đúng loại (Domain/App Error).
- [ ] Định dạng code chuẩn qua `Prettier`.

### 11.2 Security
- [ ] AuthGuard kiểm tra Redis blacklist
- [ ] DeleteUserUseCase revokeAll sessions
- [ ] StorageModule enforce cloud-only trong production
- [ ] Không có sensitive data trong logs/exceptions
- [ ] GlobalExceptionFilter dùng Fastify types

### 11.3 Docker & Deployment
- [ ] Dockerfile multi-stage với non-root user
- [ ] .dockerignore đầy đủ và chính xác
- [ ] Environment variables không hardcode
- [ ] Scripts có executable permissions (Linux/Mac)
