import "i18next"
import type { defaultNamespace, Resources } from "../../core"

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: typeof defaultNamespace
    resources: Resources
  }
}
