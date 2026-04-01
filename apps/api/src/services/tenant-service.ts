import type { Tenant } from '@erp/shared-types'
import { tenantRepository } from '../repositories/tenant-repository.js'
import { AppError } from '../utils/errors.js'
import { getPagination, getPaginationMeta } from '../utils/pagination.js'

interface ListTenantsParams {
  page: number
  perPage: number
  search?: string
  plan?: 'Starter' | 'Professional' | 'Enterprise'
  status?: 'active' | 'suspended' | 'trial' | 'cancelled'
}

interface ImpersonationTarget {
  userId: string
  name: string
  email: string
  role: string
  tenantId: string
  branchId: string | null
  branchName: string | null
}

type TenantEntity = NonNullable<Awaited<ReturnType<typeof tenantRepository.findById>>>
type TenantListEntity = Awaited<ReturnType<typeof tenantRepository.list>>['tenants'][number]

function mapTenant(tenant: TenantEntity): Tenant {
  return {
    id: tenant.id,
    name: tenant.name,
    slug: tenant.slug,
    segment: tenant.segment,
    planName: tenant.planName,
    status: tenant.status,
    logoUrl: tenant.logoUrl,
    primaryColor: tenant.primaryColor,
    accentColor: tenant.accentColor,
    darkMode: tenant.darkMode,
    onboardingCompleted: tenant.onboardingCompleted,
    createdAt: tenant.createdAt.toISOString(),
    mrr: tenant.mrr,
  }
}

export const tenantService = {
  async list(params: ListTenantsParams) {
    const pagination = getPagination(params)
    const { tenants, total } = await tenantRepository.list({
      search: params.search,
      plan: params.plan,
      status: params.status,
      skip: pagination.skip,
      take: pagination.take,
    })

    return {
      data: tenants.map((tenant: TenantListEntity) => mapTenant(tenant)),
      meta: getPaginationMeta(params.page, params.perPage, total),
    }
  },

  async getById(id: string) {
    const tenant = await tenantRepository.findById(id)
    if (!tenant) {
      throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant não encontrado.')
    }

    return mapTenant(tenant)
  },

  async getImpersonationTarget(tenantId: string): Promise<ImpersonationTarget> {
    const tenant = await tenantRepository.findById(tenantId)
    if (!tenant) {
      throw new AppError(404, 'TENANT_NOT_FOUND', 'Tenant não encontrado.')
    }

    const user = await tenantRepository.findTenantUserForImpersonation(tenantId)
    if (!user) {
      throw new AppError(404, 'TENANT_USER_NOT_FOUND', 'Nenhum usuário ativo encontrado para impersonação.')
    }

    return {
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      branchId: user.branchId,
      branchName: user.branch?.name ?? null,
    }
  },
}
