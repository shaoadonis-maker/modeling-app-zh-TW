import { RadioGroup } from '@headlessui/react'

import { SettingsTabButton } from '@src/components/Settings/SettingsTabButton'
import { t, useLocale } from '@src/i18n'

interface SettingsTabButtonProps {
  value: string
  onChange: (value: string) => void
  showProjectTab: boolean
}

export function SettingsTabs({
  value,
  onChange,
  showProjectTab,
}: SettingsTabButtonProps) {
  const locale = useLocale()

  return (
    <RadioGroup
      value={value}
      onChange={onChange}
      className="flex justify-start pl-4 pr-5 gap-5 border-0 border-b border-b-chalkboard-20 dark:border-b-chalkboard-90"
    >
      <RadioGroup.Option value="user">
        {({ checked }) => (
          <SettingsTabButton checked={checked} icon="person" text={t('app.user', 'User', locale)} />
        )}
      </RadioGroup.Option>
      {showProjectTab && (
        <RadioGroup.Option value="project">
          {({ checked }) => (
            <SettingsTabButton
              checked={checked}
              icon="folder"
              text={t('app.thisProject', 'This project', locale)}
            />
          )}
        </RadioGroup.Option>
      )}
      <RadioGroup.Option value="keybindings">
        {({ checked }) => (
          <SettingsTabButton
            checked={checked}
            icon="keyboard"
            text={t('app.keybindings', 'Keybindings', locale)}
          />
        )}
      </RadioGroup.Option>
      <RadioGroup.Option value="plugins">
        {({ checked }) => (
          <SettingsTabButton checked={checked} icon="function" text={t('app.plugins', 'Plugins', locale)} />
        )}
      </RadioGroup.Option>
    </RadioGroup>
  )
}
