import { afterEach, describe, expect, it } from 'vitest'

import { getLocale, setLocale, subscribeLocale, t } from '@src/i18n'
import { localizeUiLabel, localizeUiText } from '@src/i18n/uiLabels'

describe('zh-TW localization', () => {
  afterEach(() => {
    window.localStorage.removeItem('zoo-design-studio-locale')
  })

  it.each([
    ['Import into my current file', '匯入到目前檔案'],
    ['Dismiss', '關閉'],
    ['Session expired', '登入已逾時'],
    ['Export failed.', '匯出失敗。'],
    ['camera projection', '相機投影'],
    ['fixed size grid', '固定網格大小'],
    ['machine API', '機器 API Machine API'],
    ['ID', '識別碼'],
    ['The unique project identifier.', '專案的唯一識別碼。'],
    ['Help and resources', '說明與資源'],
  ])(
    'translates visible text %s while preserving English fallback',
    (english, chinese) => {
      expect(localizeUiText(english, 'zh-TW')).toBe(chinese)
      expect(localizeUiText(english, 'en')).toBe(english)
    }
  )

  it('notifies mounted UI and resolves toast text using the current locale', () => {
    const observed: string[] = []
    const unsubscribe = subscribeLocale(() => {
      observed.push(localizeUiText('Export failed.', getLocale()))
    })
    try {
      setLocale('zh-TW')
      setLocale('en')
      expect(observed).toEqual(['匯出失敗。', 'Export failed.'])
      unsubscribe()
      setLocale('zh-TW')
      expect(observed).toHaveLength(2)
    } finally {
      unsubscribe()
    }
  })

  it('does not translate KCL expressions, command IDs or user-defined names', () => {
    for (const text of [
      'Design.Start sketch',
      'extrude(sketch001, length = 10)',
      'myCustomBody',
      '',
    ]) {
      expect(localizeUiText(text, 'zh-TW')).toBe(text)
    }
    expect(localizeUiLabel(undefined, 'zh-TW')).toBeUndefined()
  })
  it('uses English fallback when locale is English', () => {
    expect(t('cad.extrude', 'Extrude', 'en')).toBe('Extrude')
  })

  it('returns Traditional Chinese dictionary values', () => {
    expect(t('cad.extrude', 'Extrude', 'zh-TW')).toBe('擠出 Extrude')
    expect(t('cad.fillet', 'Fillet', 'zh-TW')).toBe('圓角 Fillet')
  })

  it('localizes common dynamic UI labels', () => {
    expect(localizeUiLabel('Extrude', 'zh-TW')).toBe('擠出 Extrude')
    expect(localizeUiText('Continue', 'zh-TW')).toBe('繼續 Continue')
    expect(localizeUiText('Import from a file', 'zh-TW')).toBe(
      '從檔案匯入 Import from a file'
    )
  })

  it('leaves unknown labels untouched', () => {
    expect(localizeUiText('Unknown future command', 'zh-TW')).toBe(
      'Unknown future command'
    )
  })
})
