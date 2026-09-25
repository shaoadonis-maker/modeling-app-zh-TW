import type { PluginIpcChannel } from '@src/registry/pluginIpc'
import { isArray } from '@src/lib/utils'

export const OPENAI_PLUGIN_ID = 'openai-assistant'
export const OPENAI_CHANNEL =
  'plugin:openai-assistant.request' satisfies PluginIpcChannel
export const DEFAULT_MODEL = 'gpt-5.4'
export const MAX_CODE_LENGTH = 120_000

export type ChatMessage = { role: 'user' | 'assistant'; content: string }
export type GenerateRequest = {
  action: 'generate'
  requestId: string
  prompt: string
  code: string
  history: ChatMessage[]
}
export type Proposal = { explanation: string; code: string | null }
export type AssistantConfig = { hasKey: boolean; model: string }
export type AssistantResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string }

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !isArray(value)
}

export function isGenerateRequest(value: unknown): value is GenerateRequest {
  return (
    isRecord(value) &&
    value.action === 'generate' &&
    typeof value.requestId === 'string' &&
    /^[a-zA-Z0-9-]{1,80}$/.test(value.requestId) &&
    typeof value.prompt === 'string' &&
    value.prompt.trim().length > 0 &&
    value.prompt.length <= 8_000 &&
    typeof value.code === 'string' &&
    value.code.length <= MAX_CODE_LENGTH &&
    isArray(value.history) &&
    value.history.length <= 12 &&
    value.history.every(
      (message: unknown) =>
        isRecord(message) &&
        (message.role === 'user' || message.role === 'assistant') &&
        typeof message.content === 'string' &&
        message.content.length <= 12_000
    )
  )
}

export function canApplyProposal(
  snapshot: { path: string; code: string },
  current: { path: string | undefined; code: string; isExecuting: boolean }
): boolean {
  return (
    !current.isExecuting &&
    snapshot.path === current.path &&
    snapshot.code === current.code
  )
}
