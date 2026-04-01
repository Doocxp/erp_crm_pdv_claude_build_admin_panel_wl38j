# Project Status

## Resumo

Este documento registra o estado atual do projeto, o que foi corrigido, o que ja esta funcionando e quais sao os proximos passos recomendados.

Data de atualizacao: 2026-04-01

## Checklist Do Que Foi Resolvido

- [x] Identificada a raiz real do monorepo dentro da pasta aninhada `ERP_CRM_PDV-claude-build-admin-panel-wL38j/ERP_CRM_PDV-claude-build-admin-panel-wL38j`
- [x] Instaladas as dependencias do monorepo com `pnpm install`
- [x] Criado o arquivo de ambiente do backend em `apps/api/.env`
- [x] Ajustado o backend para carregar `.env` automaticamente com `dotenv`
- [x] Criada a infraestrutura base do backend com camadas `controllers`, `services`, `repositories`, `schemas`, `utils` e `lib/prisma`
- [x] Adicionado tratamento padronizado de erros no Fastify
- [x] Adicionado helper de paginacao
- [x] Ajustado o payload JWT para suportar `tenant`, `admin` e `isImpersonation`
- [x] Implementado `POST /api/v1/auth/login`
- [x] Implementado `POST /api/v1/auth/refresh`
- [x] Implementado `POST /api/v1/auth/logout`
- [x] Implementado `GET /api/v1/products`
- [x] Implementado `GET /api/v1/products/:id`
- [x] Implementado `GET /api/v1/tenants`
- [x] Implementado `GET /api/v1/tenants/:id`
- [x] Implementado `POST /api/v1/tenants/:id/impersonate`
- [x] Criado `apps/api/prisma/seed.ts`
- [x] Corrigido o problema inicial em que o script `db:seed` apontava para um arquivo inexistente
- [x] Criado `docker-compose.yml` para subir PostgreSQL localmente via Docker
- [x] Subido PostgreSQL via Docker na porta `5432`
- [x] Gerado e aplicado o migration inicial do Prisma
- [x] Executado o seed com sucesso
- [x] Confirmado que a API sobe e responde `GET /health`
- [x] Confirmado que `pnpm --filter api build` compila com sucesso

## O Que Foi Alterado No Projeto

### Backend

- Criado `apps/api/src/lib/prisma.ts`
- Criado `apps/api/src/utils/errors.ts`
- Criado `apps/api/src/utils/pagination.ts`
- Criados schemas Zod em:
  - `apps/api/src/schemas/auth.ts`
  - `apps/api/src/schemas/products.ts`
  - `apps/api/src/schemas/tenants.ts`
- Criados repositories em:
  - `apps/api/src/repositories/auth-repository.ts`
  - `apps/api/src/repositories/product-repository.ts`
  - `apps/api/src/repositories/tenant-repository.ts`
- Criados services em:
  - `apps/api/src/services/auth-service.ts`
  - `apps/api/src/services/product-service.ts`
  - `apps/api/src/services/tenant-service.ts`
- Criados controllers em:
  - `apps/api/src/controllers/auth-controller.ts`
  - `apps/api/src/controllers/product-controller.ts`
  - `apps/api/src/controllers/tenant-controller.ts`
- Atualizado `apps/api/src/server.ts` com error handler global
- Atualizado `apps/api/src/middlewares/auth.ts`
- Atualizadas as rotas:
  - `apps/api/src/routes/auth.ts`
  - `apps/api/src/routes/products.ts`
  - `apps/api/src/routes/tenants.ts`
- Atualizado `apps/api/src/config/env.ts` para carregar `dotenv/config`
- Atualizado `apps/api/package.json` adicionando `dotenv`

### Banco E Infra

- Criado `docker-compose.yml` com PostgreSQL 16
- Criado migration Prisma inicial em `apps/api/prisma/migrations/20260401213046_init/migration.sql`
- Criado `apps/api/prisma/seed.ts`

## O Que Ja Esta Funcionando

### Setup

- `pnpm install`
- `docker compose up -d`
- `pnpm --filter api build`
- `pnpm --filter api db:migrate`
- `pnpm --filter api db:seed`
- `pnpm --filter api dev`

### Banco

- Banco PostgreSQL em Docker respondendo em `localhost:5432`
- Base `erp_dev` criada
- Tabelas criadas pela migration inicial
- Dados seed inseridos com sucesso

### Endpoints Validados

- `GET /health`

Resposta esperada:

```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Credenciais Seed

- Admin:
  - email: `admin@erp.local`
  - senha: `Admin@123`
- Tenant:
  - email: `owner@demo.local`
  - senha: `Owner@123`
  - tenantSlug: `demo-store`

## Problemas Que Foram Encontrados E Corrigidos

### 1. Pasta errada do projeto

Os primeiros comandos estavam sendo executados um nivel acima da raiz real do monorepo. Isso gerava erro de `package.json` nao encontrado e paths invalidos.

### 2. Backend sem carregar `.env`

O backend validava variaveis de ambiente, mas nao carregava automaticamente o arquivo `.env`. Isso foi corrigido com `dotenv/config`.

### 3. Script de seed quebrado

O `apps/api/package.json` referenciava `prisma/seed.ts`, mas o arquivo nao existia. O seed foi criado.

### 4. PostgreSQL local nao estava rodando

Nao havia nada escutando em `localhost:5432`. O banco foi resolvido via Docker Compose.

### 5. Prisma bloqueado por proxy invalido

O ambiente possuia variaveis de proxy apontando para `127.0.0.1:9`, o que quebrava downloads do Prisma engine. Isso foi contornado durante a execucao das migrations.

### 6. Erros de TypeScript no backend

Havia erros de `implicit any` nos services iniciais criados. Esses erros foram corrigidos e o build do backend passou.

## Pendencias Atuais

### Pendencias Tecnicas

- [ ] Implementar o restante das rotas que ainda retornam `501`
- [ ] Implementar o CRUD completo de products
- [ ] Implementar fluxo de sales com transacao Prisma
- [ ] Implementar users, branches, pdvs, contacts, deals e financial
- [ ] Implementar create/update/suspend de tenants
- [ ] Implementar persistencia real de refresh token e logout invalidador
- [ ] Adicionar testes automatizados
- [ ] Adicionar validacao de regras de plano por tenant
- [ ] Revisar tratamento de permissao por role por modulo

### Pendencias De Setup

- [ ] Ajustar o `pnpm typecheck` da workspace inteira

Motivo:
- Hoje `pnpm --filter api build` funciona
- Mas `pnpm typecheck` da raiz falha porque `packages/shared-types` nao tem um setup de TypeScript/execucao alinhado com o comando recursivo da raiz

## Proximos Passos Recomendados

### Passo 1

Validar manualmente autenticacao e endpoints ja implementados:

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/products`
- `GET /api/v1/products/:id`
- `GET /api/v1/tenants`
- `GET /api/v1/tenants/:id`
- `POST /api/v1/tenants/:id/impersonate`

### Passo 2

Implementar o CRUD completo de `products`:

- `POST /api/v1/products`
- `PATCH /api/v1/products/:id`
- `DELETE /api/v1/products/:id`
- `POST /api/v1/products/:id/stock-movement`

### Passo 3

Implementar `sales` com prioridade alta, porque essa area envolve:

- criacao de venda
- baixa de estoque
- transacao Prisma
- cancelamento
- conclusao de venda

### Passo 4

Fechar o tipo compartilhado e o typecheck da workspace:

- revisar `packages/shared-types`
- decidir se ele vai ter `tsconfig.json`
- decidir se tera script proprio de build/typecheck
- ajustar o `pnpm typecheck` da raiz

### Passo 5

Adicionar testes minimos:

- login admin
- login tenant
- listagem de produtos
- listagem de tenants
- health check

## Comandos Uteis

### Subir o banco

```powershell
docker compose up -d
```

### Derrubar o banco

```powershell
docker compose down
```

### Rodar migration

```powershell
pnpm --filter api db:migrate
```

### Rodar seed

```powershell
pnpm --filter api db:seed
```

### Subir API

```powershell
pnpm --filter api dev
```

### Build do backend

```powershell
pnpm --filter api build
```

## Observacoes Importantes

- O arquivo que a API usa e `apps/api/.env`
- O arquivo `apps/api/.env.example` e apenas modelo
- Se o Prisma voltar a falhar baixando engines, verificar variaveis de proxy no terminal
- O banco atual do ambiente de desenvolvimento esta em Docker com:
  - host: `localhost`
  - porta: `5432`
  - banco: `erp_dev`
  - usuario: `postgres`

## Estado Atual Em Uma Frase

O Backend não é mais `501`, ja sobe com PostgreSQL em Docker, possui migration e seed funcionando, responde `GET /health`, compila com sucesso e ja tem os primeiros endpoints essenciais implementados.
