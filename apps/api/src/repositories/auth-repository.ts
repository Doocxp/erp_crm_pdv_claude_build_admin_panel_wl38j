import { prisma } from '../lib/prisma.js'

export const authRepository = {
  async findAdminUserByEmail(email: string) {
    return prisma.adminUser.findUnique({
      where: { email },
    })
  },

  async findTenantUsersByEmail(email: string, tenantSlug?: string) {
    return prisma.tenantUser.findMany({
      where: {
        email,
        ...(tenantSlug
          ? {
              tenant: {
                slug: tenantSlug,
              },
            }
          : {}),
      },
      include: {
        tenant: true,
        branch: true,
      },
      take: tenantSlug ? 1 : 10,
    })
  },

  async touchTenantUserLastLogin(userId: string) {
    await prisma.tenantUser.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    })
  },
}
