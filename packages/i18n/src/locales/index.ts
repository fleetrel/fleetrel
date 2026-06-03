import { commonRu } from "./common/ru"
import { panelApiRu } from "./panel-api/ru"
import { sourceResources } from "./schema"

export const resources = {
  en: sourceResources,
  ru: {
    common: commonRu,
    "panel-api": panelApiRu,
  },
} as const

export { commonRu, panelApiRu, sourceResources }
