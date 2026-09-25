import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EventEmitter } from 'node:events'
import type { IpcMain, IpcMainInvokeEvent } from 'electron'
import type { PluginIpcHandler } from '@src/registry/pluginIpc'

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  rm: vi.fn(),
  encrypt: vi.fn(),
  decrypt: vi.fn(),
  available: vi.fn(),
  generate: vi.fn(),
}))
vi.mock('node:fs/promises', () => ({
  default: {
    readFile: mocks.readFile,
    writeFile: mocks.writeFile,
    rm: mocks.rm,
  },
}))
vi.mock('electron', () => ({
  app: { getPath: () => '/user-data' },
  safeStorage: {
    encryptString: mocks.encrypt,
    decryptString: mocks.decrypt,
    isEncryptionAvailable: mocks.available,
    getSelectedStorageBackend: () => 'gnome_libsecret',
  },
}))
vi.mock('@src/registry/plugins/openaiAssistant/api', () => ({
  generateProposal: mocks.generate,
}))

import { register } from '@src/registry/plugins/openaiAssistant/electron'

function setup() {
  let handler: PluginIpcHandler | undefined
  register({
    ipcMain: {} as IpcMain,
    isPluginEnabled: () => true,
    handlePluginInvoke: (_id, _channel, callback) => {
      handler = callback
    },
  })
  const frame = {}
  const sender = Object.assign(new EventEmitter(), {
    id: 1,
    mainFrame: frame,
    isDestroyed: () => false,
  })
  const event = { sender, senderFrame: frame } as unknown as IpcMainInvokeEvent
  return (request: unknown) => handler?.(event, request)
}

beforeEach(() => {
  vi.resetAllMocks()
  mocks.readFile.mockResolvedValue(Buffer.from('encrypted'))
  mocks.decrypt.mockReturnValue(
    JSON.stringify({ apiKey: 'test-secret', model: 'gpt-5.4' })
  )
  mocks.encrypt.mockReturnValue(Buffer.from('encrypted-output'))
  mocks.available.mockReturnValue(true)
  mocks.writeFile.mockResolvedValue(undefined)
})

describe('desktop API credentials', () => {
  it('returns key presence without exposing the saved key', async () => {
    const invoke = setup()
    expect(await invoke({ action: 'status' })).toEqual({
      ok: true,
      value: { hasKey: true, model: 'gpt-5.4' },
    })
  })

  it('writes only encrypted credentials and refuses plaintext fallback', async () => {
    const invoke = setup()
    expect(
      await invoke({
        action: 'configure',
        apiKey: 'new-secret',
        model: 'gpt-5.4',
      })
    ).toEqual({ ok: true, value: { hasKey: true, model: 'gpt-5.4' } })
    expect(mocks.writeFile).toHaveBeenCalledWith(
      expect.stringContaining('openai-assistant.enc'),
      Buffer.from('encrypted-output'),
      { mode: 0o600 }
    )
    mocks.writeFile.mockClear()
    mocks.available.mockReturnValue(false)
    await invoke({
      action: 'configure',
      apiKey: 'new-secret',
      model: 'gpt-5.4',
    })
    expect(mocks.writeFile).not.toHaveBeenCalled()
  })

  it('cancels even before the credential read has finished', async () => {
    let finishRead: (value: Buffer) => void = () => undefined
    mocks.readFile.mockReturnValue(
      new Promise<Buffer>((resolve) => {
        finishRead = resolve
      })
    )
    const invoke = setup()
    const pending = invoke({
      action: 'generate',
      requestId: 'first',
      prompt: 'modify',
      code: '',
      history: [],
    })
    await invoke({ action: 'cancel', requestId: 'first' })
    finishRead(Buffer.from('encrypted'))
    expect(await pending).toEqual({
      ok: false,
      error: '請求已取消，模型未變更。',
    })
    expect(mocks.generate).not.toHaveBeenCalled()
  })
})
