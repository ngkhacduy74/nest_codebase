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
exports.PrismaUserRepository = void 0;
const common_1 = require("@nestjs/common");
const user_entity_1 = require("../../domain/entities/user.entity");
const prisma_service_1 = require("../../../prisma/prisma.service");
let PrismaUserRepository = class PrismaUserRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        const user = await this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
        });
        if (!user)
            return null;
        return user_entity_1.UserEntity.reconstitute({
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
            passwordHash: user.passwordHash,
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
        });
        if (!user)
            return null;
        return user_entity_1.UserEntity.reconstitute({
            id: user.id,
            email: user.email,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            role: user.role,
            isActive: user.isActive,
            isEmailVerified: user.isEmailVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            deletedAt: user.deletedAt,
            passwordHash: user.passwordHash,
        });
    }
    async save(user) {
        const snapshot = user.toSnapshot();
        const updatedUser = await this.prisma.user.update({
            where: { id: snapshot.id },
            data: {
                email: snapshot.email,
                firstName: snapshot.firstName,
                lastName: snapshot.lastName,
                role: snapshot.role,
                isActive: snapshot.isActive,
                isEmailVerified: snapshot.isEmailVerified,
                updatedAt: snapshot.updatedAt,
                deletedAt: snapshot.deletedAt,
                passwordHash: snapshot.passwordHash || '',
            },
        });
        return user_entity_1.UserEntity.reconstitute({
            id: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName || '',
            lastName: updatedUser.lastName || '',
            role: updatedUser.role,
            isActive: updatedUser.isActive,
            isEmailVerified: updatedUser.isEmailVerified,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt,
            deletedAt: updatedUser.deletedAt,
            passwordHash: updatedUser.passwordHash,
        });
    }
};
exports.PrismaUserRepository = PrismaUserRepository;
exports.PrismaUserRepository = PrismaUserRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrismaUserRepository);
//# sourceMappingURL=prisma-user.repository.js.map