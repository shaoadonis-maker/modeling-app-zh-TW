import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react'
import { signal } from '@preact/signals-core'
import type { App } from '@src/lib/app'
import { executingEditorService } from '@src/registry/contracts/executingEditor'

vi.mock('@src/lang/wasm', () => ({
  parse: vi.fn(() => ({ program: {}, errors: [] })),
  resultIsOk: vi.fn(() => true),
}))

import { parse, resultIsOk } from '@src/lang/wasm'
import { AssistantButton } from '@src/registry/plugins/openaiAssistant/AssistantButton'

function setup() {
  const editor = {
    code: signal('thickness = 1mm'),
    isExecuting: signal(false),
    updateCode: vi.fn(),
  }
  const project = { executingPathSignal: signal({ value: '/test/main.kcl' }) }
  const app = {
    project,
    projectSignal: signal(project),
    wasmPromise: Promise.resolve({}),
    registry: {
      signal: vi.fn((service: unknown) =>
        service === executingEditorService
          ? { value: editor }
          : { value: undefined }
      ),
    },
  } as unknown as App
  const invoke = vi.fn(
    async (_channel: string, payload: { action: string }) => {
      if (payload.action === 'status')
        return { ok: true, value: { hasKey: true, model: 'gpt-5.4' } }
      return {
        ok: true,
        value: { explanation: '壁厚改為 2 mm', code: 'thickness = 2mm' },
      }
    }
  )
  vi.stubGlobal('electron', { pluginIpc: { invoke } })
  render(<AssistantButton app={app} className="" />)
  fireEvent.click(screen.getByRole('button', { name: 'GPT 建模助手' }))
  return { editor, project, invoke }
}

async function generate() {
  await screen.findByText(/已儲存金鑰/)
  fireEvent.change(screen.getByRole('textbox', { name: '你的需求' }), {
    target: { value: '壁厚改為 2 mm' },
  })
  fireEvent.click(screen.getByRole('button', { name: '送出需求' }))
  await screen.findByRole('textbox', { name: '建議修改' })
}

afterEach(() => {
  cleanup()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
  vi.mocked(resultIsOk).mockReturnValue(true)
})

describe('GPT assistant review and apply', () => {
  it('previews without changing code, then applies one undoable edit after validation', async () => {
    const { editor, invoke } = setup()
    await generate()
    expect(editor.updateCode).not.toHaveBeenCalled()
    expect(invoke).toHaveBeenCalledWith(
      'plugin:openai-assistant.request',
      expect.objectContaining({ action: 'generate', code: 'thickness = 1mm' })
    )
    fireEvent.click(
      screen.getByRole('button', { name: '檢查語法並套用到編輯器' })
    )
    await waitFor(() =>
      expect(editor.updateCode).toHaveBeenCalledWith('thickness = 2mm', {
        shouldExecute: false,
        shouldWriteToDisk: false,
        shouldAddToHistory: true,
      })
    )
    expect(parse).toHaveBeenCalled()
  })

  it('blocks a proposal when the user edits after generation', async () => {
    const { editor } = setup()
    await generate()
    editor.code.value = 'thickness = 3mm'
    fireEvent.click(
      screen.getByRole('button', { name: '檢查語法並套用到編輯器' })
    )
    expect(editor.updateCode).not.toHaveBeenCalled()
  })

  it('does not apply invalid KCL', async () => {
    const { editor } = setup()
    await generate()
    vi.mocked(resultIsOk).mockReturnValue(false)
    fireEvent.click(
      screen.getByRole('button', { name: '檢查語法並套用到編輯器' })
    )
    await screen.findByRole('alert')
    expect(editor.updateCode).not.toHaveBeenCalled()
  })
})
