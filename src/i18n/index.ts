import { zhTW, type TranslationKey } from './locales/zh-TW'

export type AppLocale = 'en' | 'zh-TW'

const STORAGE_KEY = 'zoo-design-studio-locale'

const dictionaries = {
  'zh-TW': zhTW,
} as const

export function getLocale(): AppLocale {
  if (typeof window === 'undefined') return 'en'

  const saved = window.localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'zh-TW') return saved

  return window.navigator.language.toLowerCase().startsWith('zh') ? 'zh-TW' : 'en'
}

export function setLocale(locale: AppLocale): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(STORAGE_KEY, locale)
  window.dispatchEvent(new CustomEvent('zoo-locale-change', { detail: locale }))
}

export function t(key: TranslationKey, fallback: string): string {
  const locale = getLocale()
  if (locale === 'en') return fallback
  return dictionaries[locale][key] ?? fallback
}
