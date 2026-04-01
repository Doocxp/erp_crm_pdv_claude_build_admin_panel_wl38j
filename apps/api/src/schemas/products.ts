import { z } from 'zod'

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  categoryId: z.string().trim().optional(),
  lowStock: z.coerce.boolean().optional(),
  isActive: z.coerce.boolean().optional(),
})

export const productIdParamsSchema = z.object({
  id: z.string().uuid(),
})
