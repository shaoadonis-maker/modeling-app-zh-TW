import { Menu } from '@headlessui/react'

import { useApp } from '@src/lib/boot'
import { useLocale } from '@src/i18n'
import { localizeUiText } from '@src/i18n/uiLabels'

import Tooltip from '@src/components/Tooltip'
import { HeaderMenu } from '@src/components/layout/Panel/HeaderMenu'
import { isDesktop } from '@src/lib/isDesktop'
import styles from './KclEditorMenu.module.css'

export const FeatureTreeMenu = () => {
  const locale = useLocale()
  const { commands } = useApp()
  return (
    <HeaderMenu>
      <Menu.Item>
        <button
          type="button"
          onClick={() =>
            commands.send({
              type: 'Find and select command',
              data: {
                groupId: 'code',
                name: 'parameter.create',
              },
            })
          }
          className={styles.button}
        >
          <span>{localizeUiText('Create parameter', locale)}</span>
        </button>
      </Menu.Item>
      <Menu.Item>
        <button
          type="button"
          onClick={() =>
            commands.send({
              type: 'Find and select command',
              data: {
                groupId: 'code',
                name: 'Import',
              },
            })
          }
          disabled={!isDesktop()}
          className={styles.button}
        >
          <span>{localizeUiText('Import from a file', locale)}</span>
          {!isDesktop() && (
            <Tooltip position="right">
              {locale === 'zh-TW'
                ? '僅桌面版可使用'
                : 'Available only in the desktop app'}
            </Tooltip>
          )}
        </button>
      </Menu.Item>
    </HeaderMenu>
  )
}
