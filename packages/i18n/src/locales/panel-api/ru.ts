import type { LocaleShape } from "../../core"

import type { panelApiEn } from "./en"

export const panelApiRu: LocaleShape<typeof panelApiEn> = {
  errors: {
    notFound: "Ресурс не найден",
    forbidden: "У вас нет доступа к этому ресурсу",
    validationFailed: "Ошибка валидации запроса",
  },
  health: {
    ok: "API работает",
  },
}
