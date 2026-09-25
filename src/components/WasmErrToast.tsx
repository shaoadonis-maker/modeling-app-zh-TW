import { useLocale } from '@src/i18n'
import { localizeUiText } from '@src/i18n/uiLabels'
import { ActionButton } from '@src/components/ActionButton'

export type WasmErrorToastProps = {
  onDismiss: () => void
}
export function WasmErrToast({ onDismiss }: WasmErrorToastProps) {
  const locale = useLocale()
  return (
    <div
      data-testid="wasm-init-failed-toast"
      className="flex items-center gap-6 min-w-md"
    >
      <span className="flex-none w-24 text-3xl font-mono text-center">:(</span>
      <div className="flex flex-col justify-between gap-6 min-w-80">
        <section>
          <h2>{localizeUiText('Problem with our WASM blob', locale)}</h2>
          <p className="text-sm text-chalkboard-70 dark:text-chalkboard-30">
            <a
              href="https://webassembly.org/"
              rel="noopener noreferrer"
              target="_blank"
              className="!text-warn-80 dark:!text-warn-80 dark:hover:!text-warn-70 underline"
            >
              {localizeUiText('WASM or web assembly', locale)}
            </a>{' '}
            {localizeUiText(
              "is core part of how our app works. It might be because your OS is not up-to-date. If you're able to update your OS to a later version, try that. If not create an issue on",
              locale
            )}{' '}
            <a
              href="https://github.com/KittyCAD/modeling-app"
              rel="noopener noreferrer"
              target="_blank"
              className="!text-warn-80 dark:!text-warn-80 dark:hover:!text-warn-70 underline"
            >
              {localizeUiText('our Github', locale)}
            </a>
            .
          </p>
        </section>
        <div className="flex justify-end gap-8">
          <ActionButton
            Element="button"
            iconStart={{
              icon: 'close',
            }}
            data-negative-button="dismiss"
            name="dismiss"
            onClick={onDismiss}
          >
            {localizeUiText('Dismiss', locale)}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
