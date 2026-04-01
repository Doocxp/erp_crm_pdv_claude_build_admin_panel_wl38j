import bcrypt from 'bcryptjs'
import type { AdminRole, TenantRole } from '@erp/shared-types'
import { authRepository } from '../repositories/auth-repository.js'
import { AppError } from '../utils/errors.js'

type LoginType = 'tenant' | 'admin'

interface LoginParams {
  email: string
  password: string
  type?: LoginType
  tenantSlug?: string
}

interface TenantLoginResult {
  type: 'tenant'
  user: {
    id: string
    name: string
    email: string
    role: TenantRole
    tenantId: string
    tenantName: string
    tenantSlug: string
    branchId: string | null
    branchName: string | null
    isImpersonation: boolean
  }
}

interface AdminLoginResult {
  type: 'admin'
  user: {
    id: string
    name: string
    email: string
    role: AdminRole
    tenantId: null
    isImpersonation: false
  }
}

export type LoginResult = TenantLoginResult | AdminLoginResult

export const authService = {
  async login(params: LoginParams): Promise<LoginResult> {
    if (params.type === 'admin') {
      return this.loginAdmin(params.email, params.password)
    }

    if (params.type === 'tenant') {
      return this.loginTenant(params.email, params.password, params.tenantSlug)
    }

    const adminUser = await authRepository.findAdminUserByEmail(params.email)
    if (adminUser && (await bcrypt.compare(params.password, adminUser.passwordHash))) {
      return {
        type: 'admin',
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
          tenantId: null,
          isImpersonation: false,
        },
      }
    }

    return this.loginTenant(params.email, params.password, params.tenantSlug)
  },

  async loginAdmin(email: string, password: string): Promise<AdminLoginResult> {
    const user = await authRepository.findAdminUserByEmail(email)
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.')
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.')
    }

    return {
      type: 'admin',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: null,
        isImpersonation: false,
      },
    }
  },

  async loginTenant(email: string, password: string, tenantSlug?: string): Promise<TenantLoginResult> {
    const candidates = await authRepository.findTenantUsersByEmail(email, tenantSlug)
    if (candidates.length === 0) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.')
    }

    if (!tenantSlug && candidates.length > 1) {
      throw new AppError(
        400,
        'TENANT_REQUIRED',
        'Informe o slug do tenant para concluir o login deste usuário.',
      )
    }

    const user = candidates[0]
    if (!user) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.')
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatches) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'E-mail ou senha inválidos.')
    }

    if (user.tenant.status === 'suspended') {
      throw new AppError(403, 'TENANT_SUSPENDED', 'Este tenant está suspenso.')
    }

    await authRepository.touchTenantUserLastLogin(user.id)

    return {
      type: 'tenant',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        tenantSlug: user.tenant.slug,
        branchId: user.branchId,
        branchName: user.branch?.name ?? null,
        isImpersonation: false,
      },
    }
  },
}
