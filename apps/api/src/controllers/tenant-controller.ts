import type { FastifyReply, FastifyRequest } from 'fastify'
import { tenantIdParamsSchema, tenantListQuerySchema } from '../schemas/tenants.js'
import { tenantService } from '../services/tenant-service.js'

export const tenantController = {
  async list(req: FastifyRequest, reply: FastifyReply) {
    const query = tenantListQuerySchema.parse(req.query)
    const response = await tenantService.list(query)

    return reply.send(response)
  },

  async getById(req: FastifyRequest, reply: FastifyReply) {
    const params = tenantIdParamsSchema.parse(req.params)
    const tenant = await tenantService.getById(params.id)

    return reply.send({
      data: tenant,
    })
  },

  async impersonate(req: FastifyRequest, reply: FastifyReply) {
    const params = tenantIdParamsSchema.parse(req.params)
    const target = await tenantService.getImpersonationTarget(params.id)
    const accessToken = await reply.jwtSign({
      sub: target.userId,
      tenantId: target.tenantId,
      role: target.role,
      type: 'tenant',
      isImpersonation: true,
    })

    return reply.send({
      data: {
        accessToken,
        user: target,
      },
    })
  },
}
