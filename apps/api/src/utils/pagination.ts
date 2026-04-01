export interface PaginationInput {
  page: number
  perPage: number
}

export function getPagination({ page, perPage }: PaginationInput) {
  return {
    page,
    perPage,
    skip: (page - 1) * perPage,
    take: perPage,
  }
}

export function getPaginationMeta(page: number, perPage: number, total: number) {
  return {
    page,
    perPage,
    total,
    totalPages: Math.max(1, Math.ceil(total / perPage)),
  }
}
