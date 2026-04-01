import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10)
  const ownerPasswordHash = await bcrypt.hash('Owner@123', 10)

  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-store' },
    update: {},
    create: {
      name: 'Demo Store',
      slug: 'demo-store',
      segment: 'supermarket',
      planName: 'Professional',
      status: 'active',
      mrr: 349,
    },
  })

  const branch = await prisma.branch.upsert({
    where: { id: `${tenant.id}-main-branch` },
    update: {},
    create: {
      id: `${tenant.id}-main-branch`,
      tenantId: tenant.id,
      name: 'Matriz',
      isMain: true,
      address: 'Rua Exemplo, 123',
      phone: '(11) 99999-0000',
    },
  })

  const category = await prisma.category.upsert({
    where: { id: `${tenant.id}-default-category` },
    update: {},
    create: {
      id: `${tenant.id}-default-category`,
      tenantId: tenant.id,
      name: 'Geral',
    },
  })

  await prisma.adminUser.upsert({
    where: { email: 'admin@erp.local' },
    update: {
      passwordHash: adminPasswordHash,
      role: 'superadmin',
      name: 'Admin ERP',
    },
    create: {
      name: 'Admin ERP',
      email: 'admin@erp.local',
      passwordHash: adminPasswordHash,
      role: 'superadmin',
    },
  })

  await prisma.tenantUser.upsert({
    where: {
      tenantId_email: {
        tenantId: tenant.id,
        email: 'owner@demo.local',
      },
    },
    update: {
      passwordHash: ownerPasswordHash,
      role: 'owner',
      name: 'Owner Demo',
      branchId: branch.id,
      status: 'active',
    },
    create: {
      tenantId: tenant.id,
      branchId: branch.id,
      name: 'Owner Demo',
      email: 'owner@demo.local',
      passwordHash: ownerPasswordHash,
      role: 'owner',
      status: 'active',
    },
  })

  await prisma.product.upsert({
    where: {
      tenantId_sku: {
        tenantId: tenant.id,
        sku: 'DEMO-001',
      },
    },
    update: {},
    create: {
      tenantId: tenant.id,
      categoryId: category.id,
      sku: 'DEMO-001',
      name: 'Produto Demo',
      price: 19.9,
      costPrice: 10,
      stock: 25,
      minStock: 5,
      unit: 'un',
      isActive: true,
    },
  })

  console.log('Seed concluído.')
  console.log('Admin:', 'admin@erp.local / Admin@123')
  console.log('Tenant:', 'owner@demo.local / Owner@123', 'slug:', tenant.slug)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
