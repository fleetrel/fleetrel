# @fleetrel/contract

Framework-agnostic API contract for Fleetrel — the single source of truth for the wire format shared by `panel-api`, the future `panel-ui`, and agents. The only runtime dependency is `zod` (peer): no NestJS, express, fetch, or axios, so the package can be published to npm as an SDK core.

## Layers

```
src/
  shared/                — transport-independent layer (depends on nothing)
    domain/              — wire schemas of domain entities (user, session)
    errors/              — ERRORS registry, ErrorCode, getErrorByCode
    rbac/                — ROLES, PERMISSIONS, ROLE_PERMISSIONS, hasPermissions,
                           canAssignRole
  rest/                  — REST transport (depends only on shared/)
    core/                — API_PREFIX, HttpMethod, RouteDef, defineRoute,
                           buildPath, Infer* type helpers, errorResponseSchema
    auth/                — auth module: constants, schemas, AUTH_ROUTES
    sessions/            — sessions module: schemas, SESSIONS_ROUTES
    users/               — users module: schemas, USERS_ROUTES
  index.ts               — re-exports shared + rest
```

Dependency rules:

- `shared` imports nothing from other layers.
- Transports (`rest`, future `webhooks`/`ws`/`grpc`) import only from `shared`.
- Transports never import from each other.

Reserved locations (created with their first consumer — no empty directories): `webhooks/` (event/command definitions and constants), `ws/`, `grpc/`, `shared/constants/` (header names and other cross-transport constants).

## Concepts

**Contract = wire format (JSON).** Dates in response schemas are ISO strings (`z.iso.datetime()`), never `Date`. The backend maps `Date -> toISOString()` at its boundary.

**Domain vs transport.** `shared/domain` holds entity shapes reused by every transport (`userSchema`, `sessionSchema`). Transport modules compose them: `meResponseSchema = userSchema`, `sessionItemSchema = sessionSchema.extend({ isCurrent })` — `isCurrent` is a view field relative to the caller, so it belongs to the REST layer, not the domain.

**Internal DTOs stay out.** Backend service-layer shapes that never cross the wire (hashed passwords, refresh-token payloads) must not be added here.

## Routes

Routes are plain data built with `defineRoute`; `path` is derived from `base` + `segment` with literal types preserved:

```ts
export const SESSIONS_ROUTES = {
  revoke: defineRoute({
    method: "POST",
    base: "sessions",
    segment: ":sessionId/revoke",
    request: { params: z.object({ sessionId: z.uuid() }) },
    responses: { 201: sessionRevokeResponseSchema },
    errors: ["SESSION_NOT_FOUND", "SESSION_ERROR_REVOKE"],
  }),
}
```

`base` and `segment` may contain inner slashes and `:param` tokens, so nested resources are expressed directly: `base: "fleet/servers"`, `segment: ":serverId/configs"`.

Consumers:

- **NestJS** uses the segments: `@Controller(SESSIONS_BASE)`, `@Post(SESSIONS_ROUTES.revoke.segment)`.
- **Clients** build concrete URLs with `buildPath` — it substitutes `:param` tokens (URL-encoded) and serializes query params, typed from the route's `request.params` / `request.query` schemas:

```ts
const path = buildPath(SESSIONS_ROUTES.revoke, {
  params: { sessionId: "cb811c58-fb7a-4bb5-bc7c-c81f84feb6f2" },
})
// "/sessions/cb811c58-fb7a-4bb5-bc7c-c81f84feb6f2/revoke"

const url = `${host}${API_PREFIX}${path}`
// "https://panel.example.com/api/sessions/cb811c58-…/revoke"
```

`options.params` is required when the route declares path params, `options.query` is optional, and routes without either accept no options at all — enforced at the type level. A missing path param value throws (programmer error).

## Errors

`ERRORS` is the registry of all domain error codes (`{ code, message, httpCode }`); the key always equals `code` (enforced at compile time). Backend failures must reference registry entries; clients match on `code` and can resolve metadata with `getErrorByCode`. The REST error body shape is `errorResponseSchema`: `{ timestamp, path, message, code }`.

## Adding a module or transport

- **New REST module**: create `rest/<module>/` with `<module>.schemas.ts` (compose `shared/domain` where possible), `<module>.routes.ts`, optional `<module>.constants.ts`, and an `index.ts`; re-export it from `rest/index.ts`. Register new error codes in `shared/errors`.
- **New transport**: create a top-level directory with its own `core/` and modules, importing only from `shared/`; re-export from `src/index.ts`.
