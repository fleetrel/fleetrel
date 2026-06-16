# @fleetrel/i18n

Shared localization package for frontend, backend, and runtime/agent code.

The package keeps translation sources in TypeScript for type safety and uses
`i18next` as the runtime engine. The public API is split into one framework-free
core entry point and small adapters for concrete environments.

## Structure

```txt
packages/i18n/
  scripts/
    validate-translations.ts
  src/
    core/
      config.ts          # supported locales, namespaces, fallback settings
      resources.ts       # resource registry helpers
      translator.ts      # framework-free i18next translator factory
      types.ts           # locale/key/resource types
      index.ts
    adapters/
      backend/           # NestJS module and injectable service
      frontend/
        index.ts         # browser/i18next initialization
        i18next-types.ts # i18next key autocomplete/type augmentation
    locales/
      common/
        en.ts
        ru.ts
      panel-api/
        en.ts
        ru.ts
      schema.ts          # source language resource shape
      index.ts           # composed resource store for all locales
    index.ts             # public core entry point
```

## Entry Points

Use the public entry point for general import convenience, and still keep narrow adapters available when needed:

```ts
import {
  createTranslator,
  i18nConfig,
  TelemtI18nModule,
  TelemtI18nService,
  initFrontendI18n,
} from "@fleetrel/i18n"
```

`@fleetrel/i18n` is runtime-agnostic and now re-exports the backend and frontend adapters as well.
Use it in scripts, tests, workers, agents, shared code, and Nest apps. If you prefer explicit adapter imports, `@fleetrel/i18n/backend` remains available. `@fleetrel/i18n/frontend` is the browser/i18next adapter.

## Backend Usage

Import the module once in the Nest app/module that should expose translations:

```ts
import { Module } from "@nestjs/common"
import { TelemtI18nModule } from "@fleetrel/i18n"

@Module({
  imports: [
    TelemtI18nModule.forRoot({
      defaultLocale: "en",
      localeCookieName: "locale",
      localeHeaderNames: ["x-locale", "accept-language"],
    }),
  ],
})
export class AppModule {}
```

Inject `TelemtI18nService` where text is produced:

```ts
import { Injectable } from "@nestjs/common"
import type { SupportedLocale } from "@fleetrel/i18n"
import { TelemtI18nService } from "@fleetrel/i18n"

@Injectable()
export class ApiErrorPresenter {
  constructor(private readonly i18n: TelemtI18nService) {}

  getNotFound() {
    return this.i18n.t("panel-api:errors.notFound")
  }

  getNotFoundForLocale(locale: SupportedLocale) {
    return this.i18n.tLocale(locale, "panel-api:errors.notFound")
  }
}
```

Use request-based resolution when you want automatic locale detection from a cookie or headers:

```ts
import { Controller, Get, Req } from "@nestjs/common"
import type { Request } from "express"
import { AppService } from "./app.service"

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getData(@Req() req: Request) {
    return this.appService.getData(req)
  }
}
```

```ts
import { Injectable } from "@nestjs/common"
import { TelemtI18nService, type I18nRequest } from "@fleetrel/i18n/backend"

@Injectable()
export class AppService {
  constructor(private readonly i18: TelemtI18nService) {}

  getData(request: I18nRequest) {
    return { message: this.i18.tRequest(request, "common:actions.cancel") }
  }
}
```

The built-in resolver checks, in order:

- a configured locale cookie (default: `locale`)
- `x-locale` header
- `Accept-Language` header
- fallback locale from `TelemtI18nModule.forRoot(...)`

Translation keys are typed as `NamespacedKey`, so editors should autocomplete
values like `common:actions.save` and `panel-api:errors.notFound`.

## Frontend Usage

Initialize i18next near the app bootstrap. Pass only the namespaces needed for
the current app/surface:

```ts
import { initFrontendI18n } from "@fleetrel/i18n/frontend"

export const i18n = await initFrontendI18n({
  locale: "ru",
  namespaces: ["common"],
})
```

If the app uses `react-i18next`, initialize this package before rendering React
and then use the normal hook:

```ts
import { useTranslation } from "react-i18next"

export function SaveButton() {
  const { t } = useTranslation("common")

  return <button>{t("actions.save")}</button>
}
```

The frontend adapter includes i18next module augmentation. When the app imports
`@fleetrel/i18n/frontend`, i18next/react-i18next can infer namespaces and keys from
the source translations.

If autocomplete does not appear in an app, check that the file where i18next is
initialized imports `@fleetrel/i18n/frontend` and is included by the app
`tsconfig`.

## Runtime Or Agent Usage

For non-Nest and non-browser code, use the core translator:

```ts
import { createTranslator } from "@fleetrel/i18n"

const translator = await createTranslator({
  locale: "en",
  namespaces: ["common"],
})

const label = translator.t("common:actions.confirm")
```

This is the preferred path for agents, CLI scripts, background workers, and
tests.

## Adding A New Translation Key

Add the key to the source language first:

```ts
// src/locales/common/en.ts
export const commonEn = {
  actions: {
    save: "Save",
    retry: "Retry",
  },
} as const
```

Then add the same key to every supported locale:

```ts
// src/locales/common/ru.ts
export const commonRu: LocaleShape<typeof commonEn> = {
  actions: {
    save: "Сохранить",
    retry: "Повторить",
  },
}
```

Run validation:

```sh
pnpm nx run i18n:validate
```

The validator fails if a locale is missing a key, has an extra key, or has
different interpolation placeholders.

## Adding A New Namespace

Use a namespace when translations belong to a feature, package, or runtime
surface. Prefer clear ownership names:

```txt
common
validation
panel.nodes
panel-api.errors
agent.prompts
```

Create files:

```txt
src/locales/panel-nodes/
  en.ts
  ru.ts
```

Register the namespace in three places:

```ts
// src/core/config.ts
export const namespaces = ["common", "panel-api", "panel-nodes"] as const
```

```ts
// src/locales/schema.ts
import { panelNodesEn } from "./panel-nodes/en"

export const sourceResources = {
  common: commonEn,
  "panel-api": panelApiEn,
  "panel-nodes": panelNodesEn,
} as const
```

```ts
// src/locales/index.ts
import { panelNodesRu } from "./panel-nodes/ru"

export const resources = {
  en: sourceResources,
  ru: {
    common: commonRu,
    "panel-api": panelApiRu,
    "panel-nodes": panelNodesRu,
  },
} as const
```

Use kebab-case for folder and namespace names unless there is an existing domain
convention. Keep folder name, namespace string, and export names obviously
related.

## Adding A New Language

Add the locale to config:

```ts
// src/core/config.ts
export const supportedLocales = ["en", "ru", "de"] as const
```

Create one file per namespace:

```txt
src/locales/common/de.ts
src/locales/panel-api/de.ts
```

Each file should use the source namespace shape:

```ts
import type { LocaleShape } from "../../core"
import type { commonEn } from "./en"

export const commonDe: LocaleShape<typeof commonEn> = {
  actions: {
    cancel: "Abbrechen",
    confirm: "Bestätigen",
    save: "Speichern",
  },
}
```

Register the locale in `src/locales/index.ts`, then run:

```sh
pnpm nx run i18n:validate
```

## Interpolation

Use i18next interpolation syntax:

```ts
export const commonEn = {
  greeting: "Hello, {{name}}",
} as const
```

All locales must keep the same placeholders:

```ts
export const commonRu: LocaleShape<typeof commonEn> = {
  greeting: "Привет, {{name}}",
}
```

The validator checks placeholder names across languages, so `{{name}}` cannot
accidentally become `{{userName}}` in another locale.

## Validation And CI

Available Nx targets:

```sh
pnpm nx run i18n:validate
pnpm nx run i18n:build
pnpm nx run i18n:lint
```

`i18n:validate` is the main translation check. The root `check` script also runs `nx run i18n:validate`.

Run validation whenever you add or rename keys, namespaces, or languages.

## Daily Workflow

1. Add or change source text in the namespace `en.ts`.
2. Mirror the same key in every other locale file.
3. Use typed keys from code instead of building keys dynamically.
4. Run `pnpm nx run i18n:validate`.
5. Run the app-specific build or `pnpm nx run i18n:build` if only this package
   changed.

## Best Practices

- Keep `en` as the source language and update it first.
- Prefer namespaces by ownership or feature, not by UI component.
- Keep shared phrases in `common`; avoid copying the same label into feature
  namespaces.
- Keep backend-only text out of frontend namespaces.
- Load only namespaces needed by the current app/page/runtime.
- Avoid dynamic translation keys. They weaken autocomplete and unused-key checks.
- Use interpolation for values, not string concatenation.
- Do not remove or rename keys without running validation and searching usages.
- Keep translations as plain data. Formatting decisions belong in UI/backend
  presenters, not in translation files.
