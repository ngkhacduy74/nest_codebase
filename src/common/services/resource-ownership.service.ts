import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/modules/prisma/prisma.service';

@Injectable()
export class ResourceOwnershipService {
  constructor(private readonly prisma: PrismaService) {}

  async isOwner(userId: string, resource: string, resourceId: string): Promise<boolean> {
    switch (resource) {
      case 'user':
        return userId === resourceId;
      case 'product':
        return this.isProductOwner(userId, resourceId);
      default:
        return false;
    }
  }

  private async isProductOwner(userId: string, productId: string): Promise<boolean> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return false;
    }

    // Current schema has no owner field on product.
    // Deny "own" checks for product until ownership columns are introduced.
    return false;
  }
}
