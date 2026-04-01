-- CreateEnum
CREATE TYPE "TenantStatus" AS ENUM ('active', 'suspended', 'trial', 'cancelled');

-- CreateEnum
CREATE TYPE "PlanName" AS ENUM ('Starter', 'Professional', 'Enterprise');

-- CreateEnum
CREATE TYPE "TenantRole" AS ENUM ('owner', 'manager', 'cashier', 'stock_clerk', 'seller', 'financial');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('superadmin', 'support', 'sales', 'technician');

-- CreateEnum
CREATE TYPE "SegmentType" AS ENUM ('pharmacy', 'supermarket', 'bakery', 'butcher', 'restaurant', 'clothing', 'electronics', 'other');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('open', 'completed', 'cancelled');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('cash', 'card_debit', 'card_credit', 'pix', 'voucher');

-- CreateEnum
CREATE TYPE "DealStage" AS ENUM ('lead', 'contact', 'proposal', 'negotiation', 'won', 'lost');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('receivable', 'payable');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('pending', 'paid', 'overdue', 'cancelled');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('in', 'out', 'adjustment');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "segment" "SegmentType" NOT NULL,
    "planName" "PlanName" NOT NULL DEFAULT 'Starter',
    "status" "TenantStatus" NOT NULL DEFAULT 'trial',
    "logoUrl" TEXT,
    "primaryColor" TEXT NOT NULL DEFAULT '#2563EB',
    "accentColor" TEXT NOT NULL DEFAULT '#16A34A',
    "darkMode" BOOLEAN NOT NULL DEFAULT false,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "mrr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_users" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "role" "TenantRole" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenant_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "address" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdv_devices" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "activationCode" TEXT NOT NULL,
    "appVersion" TEXT NOT NULL DEFAULT '0.0.0',
    "lastSyncAt" TIMESTAMP(3),
    "currentOperator" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdv_devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "minStock" INTEGER NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'un',
    "barcode" TEXT,
    "isWeighable" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "quantity" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'open',
    "subtotal" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "cashRegisterId" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "operatorName" TEXT NOT NULL,
    "customerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" TEXT NOT NULL,
    "saleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "discount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total" DOUBLE PRECISION NOT NULL,
    "customFields" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "document" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalPurchases" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastPurchaseAt" TIMESTAMP(3),
    "customFields" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "stage" "DealStage" NOT NULL DEFAULT 'lead',
    "assignedTo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "status" "TransactionStatus" NOT NULL DEFAULT 'pending',
    "category" TEXT NOT NULL,
    "contactName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_field_defs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "entityType" TEXT NOT NULL,

    CONSTRAINT "custom_field_defs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenant_users_tenantId_idx" ON "tenant_users"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_users_tenantId_email_key" ON "tenant_users"("tenantId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_email_key" ON "admin_users"("email");

-- CreateIndex
CREATE INDEX "branches_tenantId_idx" ON "branches"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "pdv_devices_activationCode_key" ON "pdv_devices"("activationCode");

-- CreateIndex
CREATE INDEX "pdv_devices_tenantId_idx" ON "pdv_devices"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "pdv_devices_branchId_number_key" ON "pdv_devices"("branchId", "number");

-- CreateIndex
CREATE INDEX "categories_tenantId_idx" ON "categories"("tenantId");

-- CreateIndex
CREATE INDEX "products_tenantId_idx" ON "products"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "products_tenantId_sku_key" ON "products"("tenantId", "sku");

-- CreateIndex
CREATE INDEX "stock_movements_productId_idx" ON "stock_movements"("productId");

-- CreateIndex
CREATE INDEX "stock_movements_tenantId_idx" ON "stock_movements"("tenantId");

-- CreateIndex
CREATE INDEX "sales_tenantId_idx" ON "sales"("tenantId");

-- CreateIndex
CREATE INDEX "sales_branchId_idx" ON "sales"("branchId");

-- CreateIndex
CREATE UNIQUE INDEX "sales_tenantId_number_key" ON "sales"("tenantId", "number");

-- CreateIndex
CREATE INDEX "sale_items_saleId_idx" ON "sale_items"("saleId");

-- CreateIndex
CREATE INDEX "contacts_tenantId_idx" ON "contacts"("tenantId");

-- CreateIndex
CREATE INDEX "deals_tenantId_idx" ON "deals"("tenantId");

-- CreateIndex
CREATE INDEX "transactions_tenantId_idx" ON "transactions"("tenantId");

-- CreateIndex
CREATE INDEX "transactions_dueDate_idx" ON "transactions"("dueDate");

-- CreateIndex
CREATE UNIQUE INDEX "custom_field_defs_tenantId_entityType_key_key" ON "custom_field_defs"("tenantId", "entityType", "key");

-- AddForeignKey
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_users" ADD CONSTRAINT "tenant_users_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdv_devices" ADD CONSTRAINT "pdv_devices_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_saleId_fkey" FOREIGN KEY ("saleId") REFERENCES "sales"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_field_defs" ADD CONSTRAINT "custom_field_defs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
