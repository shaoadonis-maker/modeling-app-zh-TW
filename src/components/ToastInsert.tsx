import { useLocale } from '@src/i18n'
import { localizeUiText } from '@src/i18n/uiLabels'
import toast from 'react-hot-toast'

import { ActionButton } from '@src/components/ActionButton'

export function ToastInsert({ onInsert }: { onInsert: () => void }) {
  const locale = useLocale()
  return (
    <div className="inset-0 z-50 grid place-content-center rounded bg-chalkboard-110/50 shadow-md">
      <div className="max-w-3xl min-w-[35rem] p-8 rounded bg-chalkboard-10 dark:bg-chalkboard-90">
        <p className="text-md">
          {localizeUiText(
            "Non-KCL files aren't editable here in Zoo Studio, but you may import them using the button below or the Import command.",
            locale
          )}
        </p>
        <div className="mt-4 flex justify-between gap-8">
          <ActionButton
            Element="button"
            iconStart={{
              icon: 'checkmark',
            }}
            name="insert"
            onClick={onInsert}
          >
            {localizeUiText('Import into my current file', locale)}
          </ActionButton>
          <ActionButton
            Element="button"
            iconStart={{
              icon: 'close',
            }}
            name="dismiss"
            onClick={() => {
              toast.dismiss()
            }}
          >
            {localizeUiText('Dismiss', locale)}
          </ActionButton>
        </div>
      </div>
    </div>
  )
}
