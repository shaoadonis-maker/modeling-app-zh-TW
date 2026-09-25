import { useLocale } from '@src/i18n'
import { localizeUiText } from '@src/i18n/uiLabels'
import { Popover } from '@headlessui/react'
import { CustomIcon } from '@src/components/CustomIcon'
import { defaultStatusBarItemClassNames } from '@src/components/StatusBar/StatusBar'
import Tooltip from '@src/components/Tooltip'
import { useAbsoluteFilePath } from '@src/hooks/useAbsoluteFilePath'
import { useMenuListener } from '@src/hooks/useMenu'
import { useApp } from '@src/lib/boot'
import { isDesktop } from '@src/lib/isDesktop'
import { onboardingStartPath } from '@src/lib/onboardingPaths'
import { openExternalBrowserIfDesktop } from '@src/lib/openWindow'
import { PATHS } from '@src/lib/paths'
import { reportRejection } from '@src/lib/trap'
import { withSiteBaseURL } from '@src/lib/withBaseURL'
import type { WebContentSendPayload } from '@src/menu/channels'
import {
  acceptOnboarding,
  reportOnboardingStartFailure,
  useOnboardingStartPending,
} from '@src/routes/Onboarding/utils'
import { useNavigate } from 'react-router-dom'

const HelpMenuDivider = () => (
  <div className="h-[1px] bg-chalkboard-110 dark:bg-chalkboard-80" />
)

export function HelpMenu() {
  const locale = useLocale()
  const app = useApp()
  const navigate = useNavigate()
  const filePath = useAbsoluteFilePath({ warnIfNoExecutingPath: false })
  const isOnboardingStartPending = useOnboardingStartPending()

  const replayOnboardingWorkflow = (onSuccess?: () => void) => {
    void acceptOnboarding({
      app,
      onboardingStatus: onboardingStartPath,
      navigate,
    })
      .then(onSuccess)
      .catch(reportOnboardingStartFailure)
  }

  const cb = (data: WebContentSendPayload) => {
    if (data.menuLabel === 'Help.Replay onboarding tutorial') {
      replayOnboardingWorkflow()
    }
  }
  useMenuListener(cb)

  return (
    <Popover className="relative flex items-stretch">
      <Popover.Button
        className={`${defaultStatusBarItemClassNames} m-0`}
        data-testid="help-button"
      >
        <CustomIcon name="questionMark" className="w-5 h-5" />
        <span className="sr-only">
          {localizeUiText('Help and resources', locale)}
        </span>
        <Tooltip position="top-right" wrapperClassName="ui-open:hidden">
          {localizeUiText('Help and resources', locale)}
        </Tooltip>
      </Popover.Button>
      <Popover.Panel
        data-testid="help-menu"
        as="ul"
        className="absolute right-0 left-auto flex flex-col w-64 gap-1 p-0 py-2 m-0 mb-1 text-sm border border-solid rounded shadow-lg bottom-full align-stretch text-chalkboard-10 dark:text-inherit bg-chalkboard-110 dark:bg-chalkboard-100 border-chalkboard-110 dark:border-chalkboard-80"
      >
        {({ close }) => (
          <>
            <HelpMenuItem
              as="a"
              href="https://github.com/KittyCAD/modeling-app/issues/new/choose"
              target="_blank"
              rel="noopener noreferrer"
            >
              {localizeUiText('Report a bug', locale)}
            </HelpMenuItem>
            <HelpMenuItem
              as="a"
              href="https://github.com/KittyCAD/modeling-app/discussions"
              target="_blank"
              rel="noopener noreferrer"
            >
              {localizeUiText('Request a feature', locale)}
            </HelpMenuItem>
            <HelpMenuItem
              as="a"
              href="https://discord.gg/JQEpHR7Nt2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {localizeUiText('Ask the community', locale)}
            </HelpMenuItem>
            <HelpMenuDivider />
            <HelpMenuItem
              as="a"
              href={withSiteBaseURL('/docs/kcl-samples')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {localizeUiText('KCL code samples', locale)}
            </HelpMenuItem>
            <HelpMenuItem
              as="a"
              href={withSiteBaseURL('/docs/kcl-lang')}
              target="_blank"
              rel="noopener noreferrer"
            >
              {localizeUiText('KCL docs', locale)}
            </HelpMenuItem>
            <HelpMenuDivider />
            <HelpMenuItem
              as="a"
              href="https://github.com/KittyCAD/modeling-app/releases"
              target="_blank"
              rel="noopener noreferrer"
            >
              {localizeUiText('Release notes', locale)}
            </HelpMenuItem>
            {isDesktop() && (
              <HelpMenuItem
                as="button"
                onClick={() => {
                  close()
                  window.electron?.appCheckForUpdates().catch(reportRejection)
                }}
              >
                {localizeUiText('Check for updates', locale)}
              </HelpMenuItem>
            )}
            <HelpMenuItem
              as="button"
              onClick={() => {
                const targetPath =
                  filePath !== undefined
                    ? filePath + PATHS.SETTINGS_KEYBINDINGS
                    : PATHS.HOME + PATHS.SETTINGS_KEYBINDINGS
                void navigate(targetPath)
              }}
              data-testid="keybindings-button"
            >
              {localizeUiText('Keyboard shortcuts', locale)}
            </HelpMenuItem>
            <HelpMenuItem
              as="button"
              aria-busy={isOnboardingStartPending}
              disabled={isOnboardingStartPending}
              onClick={() => {
                replayOnboardingWorkflow(close)
              }}
            >
              {isOnboardingStartPending
                ? localizeUiText('Starting onboarding tutorial...', locale)
                : localizeUiText('Replay onboarding tutorial', locale)}
            </HelpMenuItem>
          </>
        )}
      </Popover.Panel>
    </Popover>
  )
}

type HelpMenuItemProps =
  | ({
      as: 'a'
    } & React.ComponentProps<'a'>)
  | ({
      as: 'button'
    } & React.ComponentProps<'button'>)

function HelpMenuItem({
  as,
  children,
  className,
  ...props
}: HelpMenuItemProps) {
  const baseClassName =
    'block px-2 py-1 hover:bg-chalkboard-80 disabled:cursor-wait disabled:text-chalkboard-50 disabled:hover:bg-transparent dark:disabled:text-chalkboard-60'
  return (
    <li className="p-0 m-0">
      {as === 'a' ? (
        // eslint-disable-next-line jsx-a11y/no-static-element-interactions
        <a
          {...(props as React.ComponentProps<'a'>)}
          onClick={openExternalBrowserIfDesktop(
            (props as React.ComponentProps<'a'>).href
          )}
          className={`no-underline text-inherit ${baseClassName} ${className}`}
        >
          {children}
        </a>
      ) : (
        <button
          {...(props as React.ComponentProps<'button'>)}
          className={`border-0 p-0 m-0 text-sm w-full rounded-none text-left ${baseClassName} ${className}`}
        >
          {children}
        </button>
      )}
    </li>
  )
}
