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
