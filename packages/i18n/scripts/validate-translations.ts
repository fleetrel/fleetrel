import { namespaces, supportedLocales } from "../src/core/config"
import type { Namespace, SupportedLocale } from "../src/core/types"
import { resources } from "../src/locales"

type LeafMap = Map<string, string>

function flatten(
  value: unknown,
  prefix = "",
  result: LeafMap = new Map(),
): LeafMap {
  if (typeof value === "string") {
    result.set(prefix, value)

    return result
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    for (const [key, child] of Object.entries(value)) {
      flatten(child, prefix ? `${prefix}.${key}` : key, result)
    }

    return result
  }

  result.set(prefix, String(value))

  return result
}

function interpolationKeys(message: string): string[] {
  return [...message.matchAll(/{{\s*([\w.-]+)\s*}}/g)].map((match) => match[1])
}

let hasErrors = false

for (const namespace of namespaces) {
  const source = flatten(resources.en[namespace])

  for (const locale of supportedLocales.filter((item) => item !== "en")) {
    const target = flatten(resources[locale][namespace])
    const missing = [...source.keys()].filter((key) => !target.has(key))
    const extra = [...target.keys()].filter((key) => !source.has(key))
    const invalidInterpolations = findInvalidInterpolations(
      namespace,
      locale,
      source,
      target,
    )

    if (missing.length || extra.length || invalidInterpolations.length) {
      hasErrors = true
      console.error(`\n${locale}/${namespace}`)

      for (const key of missing) {
        console.error(`  missing: ${key}`)
      }

      for (const key of extra) {
        console.error(`  extra: ${key}`)
      }

      for (const message of invalidInterpolations) {
        console.error(`  ${message}`)
      }
    } else {
      console.log(`${locale}/${namespace}: ok (${source.size} keys)`)
    }
  }
}

if (hasErrors) {
  process.exit(1)
}

function findInvalidInterpolations(
  namespace: Namespace,
  locale: Exclude<SupportedLocale, "en">,
  source: LeafMap,
  target: LeafMap,
): string[] {
  const errors: string[] = []

  for (const [key, sourceMessage] of source) {
    const targetMessage = target.get(key)

    if (!targetMessage) {
      continue
    }

    const sourceKeys = interpolationKeys(sourceMessage).sort()
    const targetKeys = interpolationKeys(targetMessage).sort()

    if (sourceKeys.join(",") !== targetKeys.join(",")) {
      errors.push(
        `interpolation mismatch: ${key} (${namespace}/en has {{${sourceKeys.join(
          "}}, {{",
        )}}, ${namespace}/${locale} has {{${targetKeys.join("}}, {{")}})`,
      )
    }
  }

  return errors
}
