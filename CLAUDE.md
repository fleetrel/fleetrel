# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Fleetrel

Control-plane + web dashboard + agent for managing fleets of remote servers.

## Terminology — panel vs agent vs server

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
  contract/           Framework-agnostic API contract (Zod schemas, types, error registry, route definitions)
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
```

pgAdmin: http://localhost:5050 (admin@gmail.com / admin in dev)

## Architecture patterns

### Module anatomy

Every feature module follows this vertical slice layout:

```
modules/<feature>/
  <feature>.module.ts
  <feature>.controller.ts
  <feature>.service.ts
  dtos/          — Zod-derived DTOs for request/response
  entities/      — Domain entities (extend BaseEntity)
  mappers/       — Prisma model ↔ entity conversion
  repositories/  — DB access layer implementing ICrud<Entity>
  index.ts
```

### TResult<T> — service return pattern

Services never throw; they return `TResult<T>` from `common/utils/result.ts`:

```ts
// constructors
ok(value) // TResult<T> success
fail(ERRORS.FOO) // TResult<never> failure

// guards
isFail(result) // narrows to the failure branch
```

Controllers call `errorHandler(result)` from `common/helpers/error-handler.helper.ts` to convert a failure into the matching `HttpException` using the error registry from `@fleetrel/contract` (`packages/contract/src/errors/errors.ts`). All domain errors must be registered in `ERRORS` before use.

Error response shape (from `BaseAppException`):

```json
{ "timestamp": "…", "path": "…", "message": "…", "code": "ERROR_CODE" }
```

### Entities and mappers

- All entities extend `BaseEntity` (`common/entities/base.entity.ts`) — provides `id` (UUID auto-generated), `createdAt`, `updatedAt`, and `isPersisted()`.
- Repositories implement `ICrud<Entity>` and use `TransactionHost<TransactionalAdapterPrisma>` for DB access.
- Mappers extend `UniversalMapper<Entity, PrismaModel>` or implement `IMapper<Entity, PrismaModel>`.

### Auth decorators

- `@Public()` — opt a route out of the global `JwtAuthGuard`; routes are authenticated by default.
- `@ApiAuth()` — adds the Swagger cookie-auth lock icon; apply to every authenticated controller.
- `@CurrentUser(field?)` — param decorator; injects `IRequestUser` (or a single field) from the JWT strategy.

### NX boundaries

No direct cross-app imports. Project tags:

| Project             | Tags                       |
| ------------------- | -------------------------- |
| `panel-api`         | `scope:panel`, `type:api`  |
| `agent`             | `scope:agent`, `type:api`  |
| `panel-ui`          | `scope:panel`, `type:ui`   |
| `packages/contract` | `scope:shared`, `type:lib` |
| `packages/i18n`     | `scope:shared`, `type:lib` |

Shared code lives in `packages/*` and is imported via each library's `index.ts`. Never import between `apps/*` directly.

## Key conventions

### Prisma

- Schema: `apps/panel-api/prisma/schema.prisma`; generated client output: `apps/panel-api/src/common/database/generated` — do not edit generated files.
- After schema changes: `nx run panel-api:generate-types`.
- Migrations: propose and wait for approval, never run automatically.
- Use `include`/`select` deliberately — no N+1 patterns.

### CLS transactions

Use `@Transactional()` from `@nestjs-cls/transactional` for service-layer atomicity. Do not use raw `$transaction` blocks where the CLS decorator already handles the boundary.

### Validation

All request DTOs are `nestjs-zod` schemas (`createZodDto`). The global `ZodValidationPipe` is the only validation layer — do not add `class-validator` decorators.

### Error handling

- `CatchAllExceptionFilter` is the global catch-all registered in `main.ts`.
- Domain errors: throw `HttpExceptionWithErrorCodeType` (or a standard NestJS `HttpException` subclass). All error codes live in the `ERRORS` registry in `packages/contract/src/errors/errors.ts`.
- Never silently swallow errors or use bare `catch (_) {}`.

### Auth

- JWT access tokens are passed via HTTP-only cookies (`cookie-parser` enabled globally).
- `passport-jwt` strategy; `JwtAuthGuard` is applied globally — all routes are protected unless marked `@Public()`.
- Passwords hashed with Argon2. Refresh tokens stored as an HMAC-SHA256 hash (peppered). Token rotation uses a compare-and-swap to prevent TOCTOU races.

### Contract package

`packages/contract` (`@fleetrel/contract`) is the source of truth for the API wire format, shared by the backend and (future) frontend/agent. Any payload shape change must update all consumers in the same patch.

- **Framework-agnostic**: the only runtime dependency is `zod` (peer). No NestJS, express, fetch, or axios imports — the package is designed for future standalone npm publication as an SDK core.
- **Structure** (`src/`): layered by transport. `shared/` is the transport-independent layer — `domain/` (entity wire schemas: `userSchema`, `sessionSchema`) and `errors/` (`ERRORS` registry, `ErrorCode`, `getErrorByCode`). `rest/` is the REST transport — `core/` (`API_PREFIX`, `HttpMethod`, `RouteDef`, `defineRoute`, `buildPath`, `Infer*` type helpers, `errorResponseSchema`) plus one directory per API module (`auth/`, `sessions/`) with `*.schemas.ts`, `*.routes.ts`, optional `*.constants.ts`. Layer rules: `shared` imports nothing; transports import only `shared`; transports never import each other. Future transports (`webhooks/`, `ws/`, `grpc/`) get their own top-level directory.
- **Domain vs transport views**: transport schemas compose `shared/domain` (`meResponseSchema = userSchema`; `sessionItemSchema = sessionSchema.extend({ isCurrent })`) — caller-relative view fields live in the transport layer, not the domain.
- **Clients build URLs with `buildPath(route, { params, query })`** (`rest/core/path.ts`): substitutes `:param` tokens URL-encoded and serializes the query string; `params`/`query` are typed from the route's request schemas.
- **Contract = wire format (JSON)**: dates in response schemas are ISO strings (`z.iso.datetime()`), never `Date`. The backend maps `Date -> toISOString()` at the controller/service boundary.
- **Routes are plain data**: `defineRoute` produces `{ method, base, segment, path, request, responses, errors }`. NestJS decorators consume `base`/`segment` (`@Controller(AUTH_BASE)`, `@Post(AUTH_ROUTES.signIn.segment)`); a future typed client consumes `path`/schemas.
- **Backend wraps, never redefines**: panel-api DTOs are thin wrappers — `class SignInDto extends createZodDto(signInBodySchema) {}`. Validation rules live only in the contract.
- **Internal DTOs stay in the backend**: service-layer shapes that never cross the wire (e.g. `CreateUserDto` with a hashed password, `CreateSessionDto` with refresh tokens) must not be added to the contract.

### Logging

Use NestJS `Logger` (class-based, per service). Do not log secrets, tokens, credentials, or PII. Propagate structured context (request ID, user ID) via CLS where available.

### Code style

- No comments that restate what the code does — only architecture decisions, invariants, or non-obvious constraints.
- TSDoc on all exported classes, interfaces, types, and functions.
- Files should not exceed 350–550 lines; split by responsibility within the same module.
- Preserve existing formatting — do not run `prettier --fix` or `eslint --fix` unless explicitly asked; fix only imports broken by your own patch.
- Code, comments, commit messages, identifiers: **English only**.

## Required environment variables

Validated at startup by `configSchema` (`common/config/app-config/config.schema.ts`):

| Variable                   | Required | Default       |
| -------------------------- | -------- | ------------- |
| `DATABASE_HOST`            | yes      |               |
| `DATABASE_PORT`            | yes      |               |
| `DATABASE_USER`            | yes      |               |
| `DATABASE_PASSWORD`        | yes      |               |
| `DATABASE_NAME`            | yes      |               |
| `JWT_AUTH_SECRET`          | yes      |               |
| `JWT_AUTH_EXPIRES`         | no       | `10m`         |
| `JWT_AUTH_REFRESH_SECRET`  | yes      |               |
| `JWT_AUTH_EXPIRES_REFRESH` | no       | `30d`         |
| `REFRESH_TOKEN_PEPPER`     | yes      |               |
| `SWAGGER_ENABLED`          | no       | `false`       |
| `NODE_ENV`                 | no       | `development` |

## Scope control

**Always in scope when touching a file** (coordinated fixes):

- Non-English comments → rewrite in English
- Missing TSDoc on exported identifiers in modules that already use TSDoc

**Never in scope without explicit approval:**

- Renaming classes, methods, providers, modules, DTOs, Prisma models/fields, env vars
- Changing business logic, control flow, or data transformations
- Adding/removing endpoints, providers, modules, queue handlers, Prisma models/fields
- Changing DTO shape, validation rules, or any public contract
- Fixing unrelated lint findings or removing unused code

## Response format for code changes

Every response proposing code changes must have:

**`## Reasoning`** — what, why, which modules/files are affected, risks.

**`## Changes`** — for each file: full repo-relative path in backticks, then the code block.

- Files under 200 lines: return the full file.
- Files over 200 lines: return only changed functions/methods with 3+ lines of context above and below.

If a change requires a Prisma migration, list the command under `## Migrations`. Never apply migrations automatically.

End with a suggested conventional-commit message.

If you spot issues outside the requested scope, list them under `## Out-of-scope observations`. Do not fix them silently.

## Critical invariants

- Correct `async`/`await` — no unhandled rejections, no silent fire-and-forget
- NestJS DI scoping and module lifecycle hooks (`onModuleInit`, `onModuleDestroy`, `onApplicationShutdown`)
- Prisma transaction boundaries and connection handling
- The `TResult` error-handling style — do not introduce a different pattern
- No new uncaught exceptions on production paths
- No logging of secrets, tokens, credentials, or PII
- No weakening of auth guards, JWT/session validation, or crypto logic
- No extra DB round-trips, allocations, or blocking sync work in hot paths (request handlers, job processors) without explicit justification

## Context propagation

- CLS store (`nestjs-cls`) carries request-scoped values (user, transaction, request ID) — use `ClsService` to read/write; do not pass these as function arguments through deep call stacks.
- `onModuleInit` / `onModuleDestroy` / `onApplicationShutdown` hooks handle lifecycle — preserve them when restructuring providers.
