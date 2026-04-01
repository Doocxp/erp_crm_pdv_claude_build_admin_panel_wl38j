import type { Product } from '@erp/shared-types'
import { productRepository } from '../repositories/product-repository.js'
import { AppError } from '../utils/errors.js'
import { getPagination, getPaginationMeta } from '../utils/pagination.js'

interface ListProductsParams {
  tenantId: string
  page: number
  perPage: number
  search?: string
  categoryId?: string
  lowStock?: boolean
  isActive?: boolean
}

type ProductEntity = NonNullable<Awaited<ReturnType<typeof productRepository.findById>>>
type ProductListEntity = Awaited<ReturnType<typeof productRepository.list>>['products'][number]

function mapProduct(product: ProductEntity): Product {
  return {
    id: product.id,
    sku: product.sku,
    name: product.name,
    category: product.category.name,
    categoryId: product.categoryId,
    price: product.price,
    costPrice: product.costPrice,
    stock: product.stock,
    minStock: product.minStock,
    unit: product.unit as Product['unit'],
    barcode: product.barcode,
    isWeighable: product.isWeighable,
    isActive: product.isActive,
    customFields: product.customFields as Record<string, unknown>,
  }
}

export const productService = {
  async list(params: ListProductsParams) {
    const pagination = getPagination(params)
    const { products, total } = await productRepository.list({
      tenantId: params.tenantId,
      search: params.search,
      categoryId: params.categoryId,
      isActive: params.isActive,
      skip: pagination.skip,
      take: pagination.take,
    })

    const filteredProducts = params.lowStock
      ? products.filter((product: ProductListEntity) => product.stock <= product.minStock)
      : products

    return {
      data: filteredProducts.map((product: ProductListEntity) => mapProduct(product)),
      meta: getPaginationMeta(params.page, params.perPage, total),
    }
  },

  async getById(tenantId: string, id: string) {
    const product = await productRepository.findById(tenantId, id)
    if (!product) {
      throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Produto não encontrado.')
    }

    return mapProduct(product)
  },
}
