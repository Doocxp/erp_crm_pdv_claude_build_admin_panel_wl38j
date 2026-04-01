import { prisma } from '../lib/prisma.js'

interface ListProductsParams {
  tenantId: string
  search?: string
  categoryId?: string
  isActive?: boolean
  skip: number
  take: number
}

export const productRepository = {
  async list(params: ListProductsParams) {
    const where = {
      tenantId: params.tenantId,
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' as const } },
              { sku: { contains: params.search, mode: 'insensitive' as const } },
              { barcode: { contains: params.search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(params.categoryId ? { categoryId: params.categoryId } : {}),
      ...(typeof params.isActive === 'boolean' ? { isActive: params.isActive } : {}),
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: params.skip,
        take: params.take,
      }),
      prisma.product.count({ where }),
    ])

    return { products, total }
  },

  async findById(tenantId: string, id: string) {
    return prisma.product.findFirst({
      where: {
        id,
        tenantId,
      },
      include: {
        category: true,
      },
    })
  },
}
