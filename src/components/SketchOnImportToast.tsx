import toast from 'react-hot-toast'
import { useLocale } from '@src/i18n'

interface SketchOnImportToastProps {
  fileName: string
}

export function SketchOnImportToast({ fileName }: SketchOnImportToastProps) {
  const locale = useLocale()
  const zh = locale === 'zh-TW'

  return (
    <div className="flex flex-col gap-2">
      <span>{zh ? '這個面來自匯入的模型。' : 'This face is from an import.'}</span>
      <span className="font-mono text-sm bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
        {fileName}
      </span>
      <span>{zh ? '請從檔案面板選取該檔案進行編輯。' : 'Please select this from the files pane to edit.'}</span>
    </div>
  )
}

export function showSketchOnImportToast(fileName: string) {
  toast.error(<SketchOnImportToast fileName={fileName} />)
}
