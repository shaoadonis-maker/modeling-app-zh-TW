import { describe, expect, it } from 'vitest'

import { t } from '@src/i18n'
import { localizeUiLabel, localizeUiText } from '@src/i18n/uiLabels'

describe('zh-TW localization', () => {
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
