import { useSyncExternalStore } from 'react'

import { zhTW, type TranslationKey } from './locales/zh-TW'

export type AppLocale = 'en' | 'zh-TW'

const STORAGE_KEY = 'zoo-design-studio-locale'
const LOCALE_EVENT = 'zoo-locale-change'

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
  window.dispatchEvent(new CustomEvent<AppLocale>(LOCALE_EVENT, { detail: locale }))
}

export function subscribeLocale(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined

  const listener = () => onStoreChange()
  window.addEventListener(LOCALE_EVENT, listener)
  window.addEventListener('storage', listener)

  return () => {
    window.removeEventListener(LOCALE_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

export function useLocale(): AppLocale {
  return useSyncExternalStore(subscribeLocale, getLocale, () => 'en')
}

export function t(key: TranslationKey, fallback: string, locale = getLocale()): string {
  if (locale === 'en') return fallback
  return dictionaries[locale][key] ?? fallback
}
