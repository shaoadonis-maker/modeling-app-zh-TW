import fs from 'node:fs/promises'
import path from 'node:path'
import { app, safeStorage } from 'electron'
import type { ElectronPluginContext } from '@src/registry/pluginIpc'
import { generateProposal } from '@src/registry/plugins/openaiAssistant/api'
import {
  DEFAULT_MODEL,
  OPENAI_CHANNEL,
  OPENAI_PLUGIN_ID,
  isGenerateRequest,
  isRecord,
} from '@src/registry/plugins/openaiAssistant/shared'

type Credentials = { apiKey: string; model: string }

async function readCredentials(): Promise<Credentials> {
  const file = await fs
    .readFile(path.join(app.getPath('userData'), 'openai-assistant.enc'))
    .catch(() => undefined)
  if (!file) return { apiKey: '', model: DEFAULT_MODEL }
  const parsed: unknown = JSON.parse(safeStorage.decryptString(file))
  if (
    isRecord(parsed) &&
    typeof parsed.apiKey === 'string' &&
    typeof parsed.model === 'string'
  ) {
    return { apiKey: parsed.apiKey, model: parsed.model }
  }
  return { apiKey: '', model: DEFAULT_MODEL }
}

export function register({ handlePluginInvoke }: ElectronPluginContext) {
  const pending = new Map<number, { id: string; controller: AbortController }>()
  handlePluginInvoke(
    OPENAI_PLUGIN_ID,
    OPENAI_CHANNEL,
    async (event, request: unknown) => {
      if (event.senderFrame !== event.sender.mainFrame || !isRecord(request)) {
        return { ok: false, error: '無效的外掛請求。' }
      }
      try {
        const owner = event.sender.id
        if (request.action === 'cancel') {
          const active = pending.get(owner)
          if (active && active.id === request.requestId)
            active.controller.abort()
          return { ok: true, value: null }
        }
        if (request.action === 'forget') {
          await fs.rm(
            path.join(app.getPath('userData'), 'openai-assistant.enc'),
            { force: true }
          )
          return { ok: true, value: { hasKey: false, model: DEFAULT_MODEL } }
        }
        if (request.action === 'status') {
          const credentials = await readCredentials()
          return {
            ok: true,
            value: {
              hasKey: Boolean(credentials.apiKey),
              model: credentials.model,
            },
          }
        }
        if (request.action === 'configure') {
          if (
            typeof request.model !== 'string' ||
            !/^[a-zA-Z0-9._:-]{1,100}$/.test(request.model) ||
            typeof request.apiKey !== 'string' ||
            request.apiKey.length > 512 ||
            /\s/.test(request.apiKey)
          ) {
            return { ok: false, error: '請輸入有效的模型名稱與 API 金鑰。' }
          }
          const credentials = await readCredentials()
          const apiKey = request.apiKey || credentials.apiKey
          if (!apiKey) return { ok: false, error: '請先輸入 API 金鑰。' }
          if (
            !safeStorage.isEncryptionAvailable() ||
            (process.platform === 'linux' &&
              safeStorage.getSelectedStorageBackend() === 'basic_text')
          ) {
            return {
              ok: false,
              error: '此系統無法安全儲存金鑰，請啟用系統金鑰儲存服務。',
            }
          }
          await fs.writeFile(
            path.join(app.getPath('userData'), 'openai-assistant.enc'),
            safeStorage.encryptString(
              JSON.stringify({ apiKey, model: request.model })
            ),
            { mode: 0o600 }
          )
          return { ok: true, value: { hasKey: true, model: request.model } }
        }
        if (!isGenerateRequest(request))
          return {
            ok: false,
            error: '請求過長或格式無效，請縮小檔案或需求範圍。',
          }
        if (pending.has(owner))
          return { ok: false, error: '仍有請求處理中，請稍候再試。' }
        const controller = new AbortController()
        pending.set(owner, { id: request.requestId, controller })
        const abort = () => controller.abort()
        event.sender.once('destroyed', abort)
        const timer = setTimeout(abort, 180_000)
        try {
          const credentials = await readCredentials()
          if (controller.signal.aborted)
            return { ok: false, error: '請求已取消，模型未變更。' }
          if (!credentials.apiKey)
            return { ok: false, error: '請先設定 OpenAI API 金鑰。' }
          return await generateProposal(request, credentials, controller.signal)
        } finally {
          clearTimeout(timer)
          pending.delete(owner)
          if (!event.sender.isDestroyed())
            event.sender.removeListener('destroyed', abort)
        }
      } catch {
        return {
          ok: false,
          error: '無法讀取或儲存本機金鑰設定。請移除金鑰後重新設定。',
        }
      }
    }
  )
}
