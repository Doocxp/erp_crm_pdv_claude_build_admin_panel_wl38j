import { z } from 'zod'

export const tenantListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  plan: z.enum(['Starter', 'Professional', 'Enterprise']).optional(),
  status: z.enum(['active', 'suspended', 'trial', 'cancelled']).optional(),
})

export const tenantIdParamsSchema = z.object({
  id: z.string().uuid(),
})
