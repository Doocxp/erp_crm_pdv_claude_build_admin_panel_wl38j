import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  type: z.enum(['tenant', 'admin']).optional(),
  tenantSlug: z.string().min(1).optional(),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})
