import { Dialog } from '@headlessui/react'
import { useSignals } from '@preact/signals-react/runtime'
import { useEffect, useRef, useState } from 'react'
import { parse, resultIsOk } from '@src/lang/wasm'
import type { AppHeaderItemProps } from '@src/registry/contracts/appHeader'
import { executingEditorService } from '@src/registry/contracts/executingEditor'
import {
  type AssistantConfig,
  type AssistantResult,
  type ChatMessage,
  type Proposal,
  DEFAULT_MODEL,
  MAX_CODE_LENGTH,
  OPENAI_CHANNEL,
  canApplyProposal,
} from '@src/registry/plugins/openaiAssistant/shared'

async function invoke<T>(payload: unknown): Promise<AssistantResult<T>> {
  try {
    if (!window.electron)
      return { ok: false, error: 'GPT 建模助手僅支援桌面版。' }
    return await window.electron.pluginIpc.invoke<AssistantResult<T>>(
      OPENAI_CHANNEL,
      payload
    )
  } catch {
    return { ok: false, error: '外掛連線失敗，請重新開啟助手後重試。' }
  }
}

export function AssistantButton({ app, className }: AppHeaderItemProps) {
  useSignals()
  const [open, setOpen] = useState(false)
  const project = app.projectSignal.value
  const filePath = project?.executingPathSignal.value?.value
  if (!window.electron) return null
  return (
    <>
      <button type="button" className={className} onClick={() => setOpen(true)}>
        GPT 建模助手
      </button>
      {open && (
        <AssistantPanel
          key={filePath ?? 'no-file'}
          app={app}
          className={className}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}

function AssistantPanel({
  app,
  onClose,
}: AppHeaderItemProps & { onClose: () => void }) {
  useSignals()
  const editor = app.registry.signal(executingEditorService).value
  const project = app.projectSignal.value
  const filePath = project?.executingPathSignal.value?.value
  const [config, setConfig] = useState<AssistantConfig>({
    hasKey: false,
    model: DEFAULT_MODEL,
  })
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState(DEFAULT_MODEL)
  const [prompt, setPrompt] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [proposal, setProposal] = useState<
    (Proposal & { path: string; original: string }) | null
  >(null)
  const [busy, setBusy] = useState(false)
  const [configBusy, setConfigBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const requestId = useRef<string | null>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    void invoke<AssistantConfig>({ action: 'status' }).then((result) => {
      if (!mounted.current) return
      if (result.ok) {
        setConfig(result.value)
        setModel(result.value.model)
      } else setError(result.error)
    })
    return () => {
      mounted.current = false
      if (requestId.current)
        void invoke({ action: 'cancel', requestId: requestId.current })
    }
  }, [])

  async function configure(forget = false) {
    setConfigBusy(true)
    setError('')
    setNotice('')
    const result = await invoke<AssistantConfig>(
      forget
        ? { action: 'forget' }
        : { action: 'configure', apiKey: apiKey.trim(), model: model.trim() }
    )
    if (!mounted.current) return
    setConfigBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setApiKey('')
    setConfig(result.value)
    setModel(result.value.model)
    setNotice(forget ? '已移除本機金鑰。' : '已加密儲存設定。')
  }

  async function send() {
    if (
      !editor ||
      !filePath?.toLowerCase().endsWith('.kcl') ||
      busy ||
      !prompt.trim()
    )
      return
    if (editor.code.value.length > MAX_CODE_LENGTH) {
      setError('目前檔案過大，請將修改範圍拆分成較小的 KCL 檔案。')
      return
    }
    const id = crypto.randomUUID()
    requestId.current = id
    const original = editor.code.value
    const question = prompt.trim()
    setBusy(true)
    setError('')
    setNotice('')
    setProposal(null)
    const result = await invoke<Proposal>({
      action: 'generate',
      requestId: id,
      prompt: question,
      code: original,
      history: messages.slice(-12),
    })
    if (!mounted.current || requestId.current !== id) return
    requestId.current = null
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setMessages((previous) => [
      ...previous.slice(-10),
      { role: 'user', content: question },
      { role: 'assistant', content: result.value.explanation },
    ])
    setPrompt('')
    setProposal({ ...result.value, path: filePath, original })
  }

  async function apply() {
    if (!editor || !proposal?.code || busy) return
    const current = () => ({
      path: app.project?.executingPathSignal.value?.value,
      code: editor.code.value,
      isExecuting: editor.isExecuting.value,
    })
    const snapshot = { path: proposal.path, code: proposal.original }
    if (!canApplyProposal(snapshot, current())) {
      setError('檔案已變更或模型正在執行，請重新提出修改需求。')
      return
    }
    setBusy(true)
    setError('')
    setNotice('')
    try {
      const wasm = await app.wasmPromise
      if (!mounted.current) return
      const parsed = parse(proposal.code, wasm)
      if (parsed instanceof Error || !resultIsOk(parsed)) {
        setError(
          '產生的 KCL 未通過語法檢查，原始檔案未變更。請要求 GPT 修正後重試。'
        )
        return
      }
      if (
        app.project !== project ||
        app.registry.signal(executingEditorService).value !== editor ||
        !canApplyProposal(snapshot, current())
      ) {
        setError('目前專案或檔案已變更，請重新產生修改建議。')
        return
      }
      editor.updateCode(proposal.code, {
        shouldExecute: false,
        shouldWriteToDisk: false,
        shouldAddToHistory: true,
      })
      setProposal(null)
      setNotice(
        '修改已放入編輯器，可使用「復原」撤回。請按 Zoo 的執行／儲存按鈕檢查模型並儲存。'
      )
    } catch {
      setError('無法完成套用，請檢查編輯器內容後重試。')
    } finally {
      if (mounted.current) setBusy(false)
    }
  }

  const editable = Boolean(editor && filePath?.toLowerCase().endsWith('.kcl'))
  const stale =
    proposal &&
    editor &&
    !canApplyProposal(
      { path: proposal.path, code: proposal.original },
      {
        path: filePath,
        code: editor.code.value,
        isExecuting: editor.isExecuting.value,
      }
    )
  return (
    <Dialog open={true} onClose={onClose} className="fixed inset-0 z-50">
      <Dialog.Overlay className="fixed inset-0 bg-chalkboard-110/50" />
      <Dialog.Panel className="absolute right-0 top-0 h-full w-full max-w-3xl overflow-y-auto bg-chalkboard-10 p-6 shadow-xl dark:bg-chalkboard-100">
        <div className="flex items-center justify-between gap-4">
          <Dialog.Title className="text-xl font-bold">
            GPT 建模助手
          </Dialog.Title>
          <button
            type="button"
            onClick={onClose}
            aria-label="關閉 GPT 建模助手"
          >
            關閉
          </button>
        </div>
        <Dialog.Description className="my-3 text-sm">
          用對話產生或修改目前的 KCL 檔案，確認預覽後再套用。
        </Dialog.Description>
        <p className="mb-4 break-all text-xs">
          目前檔案：{filePath ?? '尚未開啟 KCL 檔案'}
        </p>
        <details
          className="mb-4 rounded border border-chalkboard-40 p-3"
          open={!config.hasKey}
        >
          <summary>
            OpenAI 連線設定 · {config.hasKey ? '已儲存金鑰' : '尚未設定'}
          </summary>
          <label className="mt-3 block text-sm">
            API 金鑰
            <input
              type="password"
              autoComplete="off"
              spellCheck={false}
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
              placeholder={
                config.hasKey
                  ? '留白以沿用已儲存金鑰'
                  : '貼上你的 OpenAI API 金鑰'
              }
              className="mt-1 w-full"
            />
          </label>
          <label className="mt-3 block text-sm">
            模型
            <input
              value={model}
              onChange={(event) => setModel(event.target.value)}
              className="mt-1 w-full"
              spellCheck={false}
            />
          </label>
          <p className="mt-2 text-xs">
            金鑰加密保存在本機。送出時會將目前 KCL 與此段對話傳送至 OpenAI，API
            費用由你的 OpenAI 帳號計算。
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              disabled={busy || configBusy}
              onClick={() => void configure()}
            >
              儲存設定
            </button>
            <button
              type="button"
              disabled={busy || configBusy}
              onClick={() => void configure(true)}
            >
              移除金鑰
            </button>
          </div>
        </details>
        <div role="log" aria-label="GPT 對話" className="space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className="rounded bg-chalkboard-20 p-3 dark:bg-chalkboard-90"
            >
              <strong className="text-xs">
                {message.role === 'user' ? '你' : 'GPT'}
              </strong>
              <p className="whitespace-pre-wrap text-sm">{message.content}</p>
            </div>
          ))}
        </div>
        {proposal?.code && (
          <section className="my-4">
            <h3 className="font-semibold">修改預覽</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-sm">
                修改前
                <textarea
                  readOnly
                  value={proposal.original}
                  className="mt-1 h-64 w-full font-mono text-xs"
                />
              </label>
              <label className="text-sm">
                建議修改
                <textarea
                  readOnly
                  value={proposal.code}
                  className="mt-1 h-64 w-full font-mono text-xs"
                />
              </label>
            </div>
            {stale && (
              <p className="text-sm text-warn-80">
                檔案已變更或正在執行，請重新產生建議。
              </p>
            )}
            <button
              type="button"
              disabled={busy || Boolean(stale)}
              onClick={() => void apply()}
            >
              檢查語法並套用到編輯器
            </button>
          </section>
        )}
        {error && (
          <p role="alert" className="my-3 text-sm text-destroy-80">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="my-3 text-sm">
            {notice}
          </p>
        )}
        <form
          className="mt-4"
          onSubmit={(event) => {
            event.preventDefault()
            void send()
          }}
        >
          <label className="block text-sm">
            你的需求
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              maxLength={8_000}
              disabled={busy}
              rows={4}
              className="mt-2 w-full"
              placeholder="例如：將電池盒外殼壁厚改為 2 mm，保留目前的孔位與外部尺寸。"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="submit"
              disabled={
                busy ||
                configBusy ||
                !config.hasKey ||
                !editable ||
                !prompt.trim()
              }
            >
              {busy ? '處理中…' : '送出需求'}
            </button>
            {busy && requestId.current && (
              <button
                type="button"
                onClick={() =>
                  void invoke({
                    action: 'cancel',
                    requestId: requestId.current,
                  })
                }
              >
                取消請求
              </button>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMessages([])
                setProposal(null)
                setError('')
                setNotice('')
              }}
            >
              清除對話
            </button>
          </div>
          {!editable && (
            <p className="mt-2 text-sm">
              請先建立或開啟 KCL 檔案。STEP 等匯入模型需透過 KCL 操作。
            </p>
          )}
        </form>
      </Dialog.Panel>
    </Dialog>
  )
}
