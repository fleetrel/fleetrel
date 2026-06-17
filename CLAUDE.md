# Fleetrel

Control-plane + web dashboard + agent for managing fleets of remote servers.

## Domain context

<!-- TODO: describe what Fleetrel manages — what the "fleet" is, key workflows,
     and why operators need the panel + agent model. Fill in once the domain
     stabilises. -->

Key domain entities: <!-- Node/Agent, Client, FleetGroup, ... — fill in. -->

### Terminology — panel vs agent vs server

| Term              | Meaning                                                                                                                      | Where it shows up                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| **Panel**         | The `panel-api` NestJS service — central control plane; exposes REST API consumed by `panel-ui` and agents.                  | `apps/panel-api`, HTTP routes, DB.         |
| **Agent**         | The `apps/agent` NestJS service running on each managed host — connects back to the panel, executes jobs, reports telemetry. | `apps/agent` (planned), DB table `agents`. |
| **Server / Node** | The physical or virtual machine being managed — operator-visible "box" with a name, group, and deployed config.              | UI copy, domain language.                  |

## Repository layout

```
apps/
  panel-api/          NestJS backend — HTTP :3000, Swagger at /api/docs
    prisma/           Prisma schema + migrations
    src/
      common/         Shared utilities, exceptions, database client, decorators
      modules/        Feature modules (auth, sessions, users, …)
      app.module.ts
      main.ts
  agent/              NestJS agent service (planned — not yet scaffolded)
  panel-ui/           Frontend (planned — framework not decided)
packages/
  contract/           Shared API contract types (DTOs, Zod schemas, route shapes)
  i18n/               Shared i18n resources
tools/                Workspace-level scripts (generate-types.sh, etc.)
docker-compose.dev.yml  PostgreSQL + pgAdmin for local dev
```

## Tech stack

- **Runtime**: Node.js 24.x, TypeScript ~5.9, pnpm 11.x
- **Framework**: NestJS 11 (platform-express)
- **Validation**: nestjs-zod + Zod 4 — all DTOs are Zod schemas; `ZodValidationPipe` is registered globally
- **ORM**: Prisma 7 with `@prisma/adapter-pg` (PostgreSQL)
- **CLS transactions**: `nestjs-cls` + `@nestjs-cls/transactional` + `@nestjs-cls/transactional-adapter-prisma`
- **Auth**: JWT (`@nestjs/jwt`), Passport (`passport-jwt`), Argon2 for password hashing, cookie-based sessions
- **API docs**: `@nestjs/swagger` — Swagger UI auto-generated from NestJS + nestjs-zod decorators
- **Utilities**: `remeda` (functional utilities)
- **Build**: NX 22 monorepo, webpack-cli for app bundles, SWC transpilation
- **Storage**: PostgreSQL (dev via Docker Compose)
- **Agent transport**: REST/HTTP + gRPC + WebSocket (mix TBD per feature; gRPC and WS for real-time agent ↔ panel)
- **Queues**: BullMQ (planned — not yet wired)
- **Code quality**: ESLint 9, Prettier ~3.8, commitlint (conventional commits), husky + lint-staged
- **Deploy**: Docker (multi-stage, TBD)

## Key conventions

### NX boundaries

Project tags enforce module boundaries — no direct cross-app imports:

| Project             | Tags                       |
| ------------------- | -------------------------- |
| `panel-api`         | `scope:panel`, `type:api`  |
| `agent`             | `scope:agent`, `type:api`  |
| `panel-ui`          | `scope:panel`, `type:ui`   |
| `packages/contract` | `scope:shared`, `type:lib` |
| `packages/i18n`     | `scope:shared`, `type:lib` |

Shared code lives in `packages/*` and is imported via each library's public API (`index.ts`). Never import between `apps/*` directly.

### Prisma

- Schema lives at `apps/panel-api/prisma/schema.prisma`; generated client output is `apps/panel-api/src/common/database/generated` — **do not edit generated files manually**
- To generate the client after schema changes: `nx run panel-api:generate-types` (or `pnpm postinstall`)
- To create a migration: `nx run panel-api:prisma -- migrate dev --name <name>` — never run migrations automatically; propose and wait for approval
- Use `include`/`select` deliberately — no N+1 patterns
- Wrap multi-step writes in `$transaction` or the CLS `@Transactional()` decorator

### CLS transactions

Use `@Transactional()` from `nestjs-cls/transactional` for service-layer atomicity. The adapter is `@nestjs-cls/transactional-adapter-prisma`. Do not start raw `$transaction` blocks where the CLS decorator already handles the boundary.

### Validation

All request DTOs are `nestjs-zod` schemas (`createZodDto`). The global `ZodValidationPipe` handles validation automatically — do not add `class-validator` decorators alongside Zod schemas.

### Error handling

- `CatchAllExceptionFilter` is the global catch-all registered in `main.ts`
- Domain errors should be thrown as NestJS `HttpException` subclasses (or custom equivalents)
- Never silently swallow errors or use bare `catch (_) {}`

### Auth

- JWT tokens are passed via HTTP-only cookies (cookie-parser is enabled globally)
- `@nestjs/passport` + `passport-jwt` strategy — guards are applied per-controller or per-module
- Passwords hashed with Argon2

### Contract package

`packages/contract` is the source of truth for shared request/response shapes between `panel-api`, `agent`, and `panel-ui`. Any REST/WebSocket/gRPC payload shape lives here. Changing contract shapes requires updating all consumers in the same patch.

### Logging

Use NestJS `Logger` (class-based, injected per service). Do not log secrets, tokens, credentials, or PII. Structured context (request ID, user ID) should propagate via CLS where available.

### Code style

- No comments that restate what the code does — only architecture decisions, invariants, or non-obvious constraints
- TSDoc on all exported classes, interfaces, types, and functions
- Files should not exceed 350–550 lines; split by responsibility within the same module when they do
- Preserve existing formatting — do not run `prettier --fix` or `eslint --fix` unless explicitly asked; fix only imports broken by your own patch

## Commands

```bash
# Install dependencies
pnpm install

# Start panel-api in dev mode (hot-reload)
pnpm serve:api
# or: nx serve panel-api

# Build all projects
pnpm build
# or single: nx build panel-api

# Lint all projects
pnpm lint

# Full check (lint + build + prettier)
pnpm check

# Check only affected projects (vs main~1)
pnpm check:affected

# Start dev infrastructure (PostgreSQL :5432, pgAdmin :5050)
pnpm docker:dev:up

# Stop dev infrastructure
pnpm docker:dev:down

# Prisma — generate client (run after schema changes)
nx run panel-api:generate-types
# or: pnpm postinstall

# Prisma — create and apply a migration (dev only)
nx run panel-api:prisma -- migrate dev --name <name>

# Prisma — open Prisma Studio
nx run panel-api:prisma -- studio

# Run a specific Prisma command
nx run panel-api:prisma -- <command>
```

pgAdmin: http://localhost:5050 (admin@gmail.com / admin in dev)

## Context propagation

- HTTP handlers: always use `@Req() req: Request` context — never `context.Background()` equivalents
- CLS store (from `nestjs-cls`) carries request-scoped values (user, transaction, request ID) — use `ClsService` to read/write; do not pass these as function arguments through deep call stacks
- `onModuleInit` / `onModuleDestroy` / `onApplicationShutdown` hooks handle lifecycle — preserve them when restructuring providers
