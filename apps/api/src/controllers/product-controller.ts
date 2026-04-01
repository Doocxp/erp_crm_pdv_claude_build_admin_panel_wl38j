import type { FastifyReply, FastifyRequest } from 'fastify'
import { getTenantId } from '../middlewares/auth.js'
import { productIdParamsSchema, productListQuerySchema } from '../schemas/products.js'
import { productService } from '../services/product-service.js'

export const productController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = getTenantId(req)
    const query = productListQuerySchema.parse(req.query)
    const response = await productService.list({
      tenantId,
      ...query,
    })

    return reply.send(response)
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const tenantId = getTenantId(req)
    const params = productIdParamsSchema.parse(req.params)
    const product = await productService.getById(tenantId, params.id)

    return reply.send({
      data: product,
    })
  },
}
