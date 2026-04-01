import { prisma } from '../lib/prisma.js'

interface ListTenantsParams {
  search?: string
  plan?: 'Starter' | 'Professional' | 'Enterprise'
  status?: 'active' | 'suspended' | 'trial' | 'cancelled'
  skip: number
  take: number
}

export const tenantRepository = {
  async list(params: ListTenantsParams) {
    const where = {
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' as const } },
              { slug: { contains: params.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(params.plan ? { planName: params.plan } : {}),
      ...(params.status ? { status: params.status } : {}),
    }

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.tenant.count({ where }),
    ])

    return { tenants, total }
  },

  async findById(id: string) {
    return prisma.tenant.findUnique({
      where: { id },
    })
  },

  async findTenantUserForImpersonation(tenantId: string) {
    return prisma.tenantUser.findFirst({
      where: {
        tenantId,
        status: 'active',
      },
      orderBy: { createdAt: 'asc' },
      include: {
        branch: true,
      },
    })
  },
}
