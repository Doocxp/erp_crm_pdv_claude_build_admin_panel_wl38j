import type { FastifyReply, FastifyRequest } from 'fastify'
import type { JwtPayload } from '../middlewares/auth.js'
import { loginSchema, refreshSchema } from '../schemas/auth.js'
import { authService } from '../services/auth-service.js'
import { AppError } from '../utils/errors.js'

function buildJwtPayload(user: {
  id: string
  role: string
  tenantId: string | null
  type: 'tenant' | 'admin'
  isImpersonation?: boolean
}) {
  return {
    sub: user.id,
    role: user.role,
    tenantId: user.tenantId,
    type: user.type,
    isImpersonation: user.isImpersonation ?? false,
  }
}

export const authController = {
  async login(req: FastifyRequest, reply: FastifyReply) {
    const body = loginSchema.parse(req.body)
    const result = await authService.login(body)
    const payload = buildJwtPayload({
      id: result.user.id,
      role: result.user.role,
      tenantId: result.user.tenantId,
      type: result.type,
      isImpersonation: result.user.isImpersonation,
    })

    const accessToken = await reply.jwtSign(payload)
    const refreshToken = await reply.jwtSign(
      {
        ...payload,
        tokenType: 'refresh',
      },
      { expiresIn: '30d' },
    )

    return reply.send({
      data: {
        user: result.user,
        accessToken,
        refreshToken,
      },
    })
  },

  async refresh(req: FastifyRequest, reply: FastifyReply) {
    const body = refreshSchema.parse(req.body)

    let decoded: JwtPayload & { tokenType?: string }
    try {
      decoded = await req.server.jwt.verify(body.refreshToken)
    } catch {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido ou expirado.')
    }

    if (decoded.tokenType !== 'refresh') {
      throw new AppError(401, 'INVALID_REFRESH_TOKEN', 'Refresh token inválido ou expirado.')
    }

    const accessToken = await reply.jwtSign({
      sub: decoded.sub,
      role: decoded.role,
      tenantId: decoded.tenantId,
      type: decoded.type,
      isImpersonation: decoded.isImpersonation ?? false,
    })

    return reply.send({
      data: {
        accessToken,
      },
    })
  },

  async logout(_req: FastifyRequest, reply: FastifyReply) {
    return reply.send({
      data: {
        success: true,
      },
    })
  },
}
