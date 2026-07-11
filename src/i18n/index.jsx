import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { LOCALES, MESSAGES } from './translations'

const I18nContext = createContext(null)
const LANG_KEY = 'wg-lang'

function readStoredLang() {
  try {
    const id = localStorage.getItem(LANG_KEY)
    if (id && MESSAGES[id]) return id
  } catch {
    /* ignore */
  }
  return 'en'
}

export function interpolate(str, vars = {}) {
  if (!str) return ''
  return String(str).replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] != null ? String(vars[k]) : `{${k}}`
  )
}

export function I18nProvider({ children, initialLang }) {
  const [lang, setLangState] = useState(() => initialLang || readStoredLang())

  const setLang = useCallback((id) => {
    if (!MESSAGES[id]) return
    setLangState(id)
    try {
      localStorage.setItem(LANG_KEY, id)
    } catch {
      /* ignore */
    }
  }, [])

  const locale = useMemo(() => LOCALES.find((l) => l.id === lang) || LOCALES[0], [lang])

  const t = useCallback(
    (key, vars) => {
      const table = MESSAGES[lang] || MESSAGES.en
      const raw = table[key] ?? MESSAGES.en[key] ?? key
      return vars ? interpolate(raw, vars) : raw
    },
    [lang]
  )

  useEffect(() => {
    document.documentElement.lang = lang === 'ckb' ? 'ckb' : lang === 'ku' ? 'ku' : 'en'
    document.documentElement.dir = locale.dir || 'ltr'
  }, [lang, locale])

  const value = useMemo(
    () => ({ lang, setLang, t, locale, locales: LOCALES }),
    [lang, setLang, t, locale]
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) {
    return {
      lang: 'en',
      setLang: () => {},
      t: (k, vars) => interpolate(MESSAGES.en[k] ?? k, vars || {}),
      locale: LOCALES[0],
      locales: LOCALES,
    }
  }
  return ctx
}

export { LOCALES, MESSAGES }
