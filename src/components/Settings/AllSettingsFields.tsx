import { ActionButton } from '@src/components/ActionButton'
import type { Feature } from '@kittycad/lib'
import { SettingsFieldInput } from '@src/components/Settings/SettingsFieldInput'
import { SettingsSection } from '@src/components/Settings/SettingsSection'
import { useApp } from '@src/lib/boot'
import { useLocale } from '@src/i18n'
import { localizeUiLabel, localizeUiText } from '@src/i18n/uiLabels'
import { getSettingsFolderPaths } from '@src/lib/desktopFS'
import { isDesktop } from '@src/lib/isDesktop'
import { onboardingStartPath } from '@src/lib/onboardingPaths'
import { openExternalBrowserIfDesktop } from '@src/lib/openWindow'
import { PATHS } from '@src/lib/paths'
import {
  canRevealInFileExplorer,
  revealInFileExplorer,
} from '@src/lib/revealInFileExplorer'
import type { Setting } from '@src/lib/settings/initialSettings'
import type {
  SetEventTypes,
  SettingsLevel,
} from '@src/lib/settings/settingsTypes'
import {
  formatSettingsLabel,
  shouldHideSetting,
  shouldShowSettingInput,
} from '@src/lib/settings/settingsUtils'
import { reportRejection } from '@src/lib/trap'
import { capitaliseFC, toSync } from '@src/lib/utils'
import { userFeaturesContextHas } from '@src/machines/userFeaturesMachine'
import {
  acceptOnboarding,
  reportOnboardingStartFailure,
  useOnboardingStartPending,
} from '@src/routes/Onboarding/utils'
import { APP_VERSION, getReleaseUrl } from '@src/routes/utils'
import type { ForwardedRef } from 'react'
import { forwardRef, useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Fragment } from 'react/jsx-runtime'

interface AllSettingsFieldsProps {
  searchParamTab: SettingsLevel
  isFileSettings: boolean
}

export const AllSettingsFields = forwardRef(
  (
    { searchParamTab, isFileSettings }: AllSettingsFieldsProps,
    scrollRef: ForwardedRef<HTMLDivElement>
  ) => {
    const app = useApp()
    const locale = useLocale()
    const { settings, layout, userFeatures } = app
    const location = useLocation()
    const navigate = useNavigate()
    const context = settings.useSettings()
    const userFeaturesContext = userFeatures.useContext()
    const isOnboardingStartPending = useOnboardingStartPending()
    const hasFeature = (feature: Feature) =>
      userFeaturesContextHas(userFeaturesContext, feature, false)
    const projectPath = useMemo(() => {
      const filteredPathname = location.pathname
        .replace(PATHS.FILE, '')
        .replace(PATHS.SETTINGS, '')
      const lastSlashIndex = filteredPathname.lastIndexOf(
        // This is slicing off any remaining browser path segments,
        // so we don't use window.electron.sep here
        '/'
      )
      const projectPath =
        isFileSettings && isDesktop()
          ? decodeURIComponent(filteredPathname.slice(lastSlashIndex + 1))
          : undefined

      return projectPath
    }, [location.pathname, isFileSettings])

    function restartOnboarding() {
      return acceptOnboarding({
        app,
        onboardingStatus: onboardingStartPath,
        navigate,
      })
    }

    return (
      <div className="relative overflow-y-auto">
        <div ref={scrollRef} className="flex flex-col gap-4 px-2">
          {Object.entries(context)
            .filter(([_, categorySettings]) =>
              // Filter out categories that don't have any non-hidden settings
              Object.values(categorySettings).some(
                (setting) =>
                  !shouldHideSetting(setting, searchParamTab, hasFeature)
              )
            )
            .map(([category, categorySettings]) => (
              <Fragment key={category}>
                <h2
                  id={`category-${category}`}
                  className="text-xl mt-6 first-of-type:mt-0 capitalize font-bold"
                >
                  {localizeUiLabel(formatSettingsLabel(category), locale)}
                </h2>
                {Object.entries(categorySettings)
                  .filter((item: [string, Setting<unknown>]) =>
                    shouldShowSettingInput(item[1], searchParamTab, hasFeature)
                  )
                  .map(([settingName, s]) => {
                    const setting = s as Setting
                    const parentValue =
                      setting[setting.getParentLevel(searchParamTab)]
                    return (
                      <SettingsSection
                        title={localizeUiLabel(formatSettingsLabel(settingName), locale) ?? formatSettingsLabel(settingName)}
                        id={settingName}
                        className={
                          location.hash === `#${settingName}`
                            ? 'bg-primary/5 dark:bg-chalkboard-90'
                            : ''
                        }
                        key={`${category}-${settingName}-${searchParamTab}`}
                        description={localizeUiText(setting.description, locale)}
                        settingHasChanged={
                          setting[searchParamTab] !== undefined &&
                          setting[searchParamTab] !==
                            setting.getFallback(searchParamTab)
                        }
                        parentLevel={setting.getParentLevel(searchParamTab)}
                        onFallback={() =>
                          settings.send({
                            type: `set.${category}.${settingName}`,
                            data: {
                              level: searchParamTab,
                              value:
                                parentValue !== undefined
                                  ? parentValue
                                  : setting.getFallback(searchParamTab),
                            },
                          } as SetEventTypes)
                        }
                      >
                        <SettingsFieldInput
                          category={category}
                          settingName={settingName}
                          settingsLevel={searchParamTab}
                          setting={setting}
                        />
                      </SettingsSection>
                    )
                  })}
              </Fragment>
            ))}
          <h2 id="settings-resets" className="text-2xl mt-6 font-bold">
            {localizeUiText('Resets', locale)}
          </h2>
          <SettingsSection
            title={localizeUiText('Onboarding', locale)}
            description={locale === 'zh-TW' ? '重新播放新手導覽流程' : 'Replay the onboarding process'}
          >
            <ActionButton
              Element="button"
              aria-busy={isOnboardingStartPending}
              disabled={isOnboardingStartPending}
              onClick={() => {
                void restartOnboarding().catch(reportOnboardingStartFailure)
              }}
              className="disabled:cursor-wait disabled:opacity-70"
              iconStart={{
                icon: 'refresh',
                size: 'sm',
                className: `p-1 ${
                  isOnboardingStartPending ? 'animate-spin' : ''
                }`,
              }}
            >
              {isOnboardingStartPending
                ? locale === 'zh-TW' ? '正在啟動新手導覽…' : 'Starting Onboarding...'
                : locale === 'zh-TW' ? '重新播放新手導覽' : 'Replay Onboarding'}
            </ActionButton>
          </SettingsSection>
          <SettingsSection
            title={localizeUiText('Reset settings', locale)}
            description={
              locale === 'zh-TW'
                ? `將設定還原為預設值。設定會儲存在${isDesktop() ? '作業系統的應用程式資料資料夾中。' : '瀏覽器的本機儲存空間中。'}`
                : `Restore settings to their default values. Your settings are saved in${isDesktop() ? ' a file in the app data folder for your OS.' : " your browser's local storage."}`
            }
          >
            <div className="flex flex-col items-start gap-4">
              {canRevealInFileExplorer() && (
                <ActionButton
                  Element="button"
                  onClick={toSync(async () => {
                    const paths = await getSettingsFolderPaths(projectPath)
                    const finalPath = paths[searchParamTab]
                    if (!finalPath) {
                      return new Error('finalPath undefined')
                    }
                    revealInFileExplorer(finalPath)
                  }, reportRejection)}
                  iconStart={{
                    icon: 'folder',
                    size: 'sm',
                    className: 'p-1',
                  }}
                >
                  {localizeUiText('Show in Folder', locale)}
                </ActionButton>
              )}
              <ActionButton
                Element="button"
                onClick={() => {
                  settings.send({
                    type: 'Reset settings',
                    level: searchParamTab,
                  })
                }}
                iconStart={{
                  icon: 'refresh',
                  size: 'sm',
                  className: 'p-1 text-chalkboard-10',
                  bgClassName: 'bg-destroy-70',
                }}
              >
                {locale === 'zh-TW' ? `重設 ${capitaliseFC(searchParamTab)} 層級設定` : `Reset ${capitaliseFC(searchParamTab)}-Level Settings`}
              </ActionButton>
            </div>
          </SettingsSection>
          <SettingsSection
            title={localizeUiText('Layout', locale)}
            description={locale === 'zh-TW' ? '還原為預設版面配置' : 'Reset to the default layout'}
          >
            <ActionButton
              Element="button"
              onClick={layout.reset}
              iconStart={{
                icon: 'refresh',
                size: 'sm',
                className: 'p-1',
              }}
            >
              {localizeUiText('Reset Layout', locale)}
            </ActionButton>
          </SettingsSection>
          <h2 id="settings-about" className="text-2xl mt-6 font-bold">
            {localizeUiText('About Design Studio', locale)}
          </h2>
          <div className="text-sm mb-12">
            {APP_VERSION && <p>{locale === 'zh-TW' ? `應用程式版本 ${APP_VERSION}` : `App version ${APP_VERSION}.`}</p>}
            <div className="flex gap-2 flex-wrap my-4">
              {APP_VERSION && (
                <ActionButton
                  Element="externalLink"
                  to={getReleaseUrl()}
                  iconStart={{ icon: 'file', className: 'p-1' }}
                >
                  {localizeUiText('View version on GitHub', locale)}
                </ActionButton>
              )}
              <ActionButton
                Element="button"
                onClick={() => {
                  window.electron?.appCheckForUpdates().catch(reportRejection)
                }}
                iconStart={{
                  icon: 'refresh',
                  size: 'sm',
                  className: 'p-1',
                }}
              >
                {localizeUiText('Check for Updates', locale)}
              </ActionButton>
            </div>
            <p className="max-w-2xl mt-6">
              Don't see the feature you want? Check to see if it's on{' '}
              <a
                onClick={openExternalBrowserIfDesktop(
                  'https://zoo.dev/roadmap'
                )}
                href="https://zoo.dev/roadmap"
                target="_blank"
                rel="noopener noreferrer"
              >
                our roadmap
              </a>{' '}
              or reach out. Your feedback will help us prioritize what to build
              next.
            </p>
          </div>
        </div>
      </div>
    )
  }
)
