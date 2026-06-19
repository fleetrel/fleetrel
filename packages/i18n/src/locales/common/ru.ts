import type { LocaleShape } from "../../core"

import type { commonEn } from "./en"

export const commonRu: LocaleShape<typeof commonEn> = {
  actions: {
    cancel: "Отмена",
    confirm: "Подтвердить",
    save: "Сохранить",
  },
  status: {
    loading: "Загрузка",
    error: "Что-то пошло не так",
    empty: "Пока нет данных",
  },
  language: {
    en: "Английский",
    ru: "Русский",
  },
}
