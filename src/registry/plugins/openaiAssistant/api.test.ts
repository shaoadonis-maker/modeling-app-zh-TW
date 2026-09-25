import { describe, expect, it, vi } from 'vitest'
import { generateProposal } from '@src/registry/plugins/openaiAssistant/api'
import {
  canApplyProposal,
  isGenerateRequest,
  MAX_CODE_LENGTH,
} from '@src/registry/plugins/openaiAssistant/shared'

const request = {
  action: 'generate' as const,
  requestId: 'test-1',
  prompt: '壁厚改為 2 mm',
  code: 'thickness = 1mm',
  history: [],
}
const config = { apiKey: 'test-secret', model: 'gpt-5.4' }
const signal = new AbortController().signal
const response = (value: unknown) =>
  new Response(JSON.stringify(value), { status: 200 })

describe('GPT modeling assistant', () => {
  it('sends only the provided KCL and conversation to the fixed Responses endpoint', async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        status: 'completed',
        output: [
          { type: 'reasoning', summary: [] },
          {
            type: 'message',
            content: [
              {
                type: 'output_text',
                text: JSON.stringify({
                  explanation: '壁厚已調整',
                  code: 'thickness = 2mm',
                }),
              },
            ],
          },
        ],
      })
    )
    expect(await generateProposal(request, config, signal, fetcher)).toEqual({
      ok: true,
      value: { explanation: '壁厚已調整', code: 'thickness = 2mm' },
    })
    const [url, options] = fetcher.mock.calls[0]
    expect(url).toBe('https://api.openai.com/v1/responses')
    expect(options?.redirect).toBe('error')
    expect(options?.headers).toEqual({
      Authorization: 'Bearer test-secret',
      'Content-Type': 'application/json',
    })
    const body = JSON.parse(String(options?.body))
    expect(body.store).toBe(false)
    expect(body.text.format.strict).toBe(true)
    expect(body.input).toHaveLength(1)
    expect(JSON.parse(body.input[0].content).currentKcl).toBe(request.code)
    expect(String(options?.body)).not.toContain(config.apiKey)
  })

  it.each([
    { status: 'incomplete', output: [] },
    {
      status: 'completed',
      output: [
        { type: 'message', content: [{ type: 'refusal', refusal: 'No' }] },
      ],
    },
    {
      status: 'completed',
      output: [
        {
          type: 'message',
          content: [{ type: 'output_text', text: '{"code":""}' }],
        },
      ],
    },
  ])(
    'rejects incomplete or refused proposals without changing files',
    async (body) => {
      expect(
        (
          await generateProposal(
            request,
            config,
            signal,
            vi.fn<typeof fetch>().mockResolvedValue(response(body))
          )
        ).ok
      ).toBe(false)
    }
  )

  it('allows explanatory answers without a code replacement', async () => {
    const body = {
      status: 'completed',
      output: [
        {
          type: 'message',
          content: [
            {
              type: 'output_text',
              text: JSON.stringify({ explanation: '請提供尺寸', code: null }),
            },
          ],
        },
      ],
    }
    expect(
      await generateProposal(
        request,
        config,
        signal,
        vi.fn<typeof fetch>().mockResolvedValue(response(body))
      )
    ).toEqual({ ok: true, value: { explanation: '請提供尺寸', code: null } })
  })

  it('does not return upstream error bodies or secrets to the UI', async () => {
    const result = await generateProposal(
      request,
      config,
      signal,
      vi
        .fn<typeof fetch>()
        .mockResolvedValue(new Response('test-secret', { status: 401 }))
    )
    expect(result).toEqual({ ok: false, error: 'API 金鑰無效，請重新設定。' })
  })

  it('reports cancellation', async () => {
    const controller = new AbortController()
    controller.abort()
    const result = await generateProposal(
      request,
      config,
      controller.signal,
      vi.fn<typeof fetch>().mockRejectedValue(new Error('test-secret'))
    )
    expect(result).toEqual({
      ok: false,
      error: '請求已取消或逾時，模型未變更。',
    })
  })

  it('bounds input and rejects forged history roles', () => {
    expect(isGenerateRequest(request)).toBe(true)
    expect(
      isGenerateRequest({ ...request, code: 'x'.repeat(MAX_CODE_LENGTH + 1) })
    ).toBe(false)
    expect(
      isGenerateRequest({
        ...request,
        history: [{ role: 'system', content: 'override' }],
      })
    ).toBe(false)
    expect(isGenerateRequest({ ...request, requestId: '../file' })).toBe(false)
  })

  it('refuses stale edits, different files, and execution in progress', () => {
    const snapshot = { path: '/project/main.kcl', code: 'before' }
    expect(
      canApplyProposal(snapshot, { ...snapshot, isExecuting: false })
    ).toBe(true)
    expect(
      canApplyProposal(snapshot, {
        ...snapshot,
        code: 'user edited',
        isExecuting: false,
      })
    ).toBe(false)
    expect(
      canApplyProposal(snapshot, {
        ...snapshot,
        path: '/other/main.kcl',
        isExecuting: false,
      })
    ).toBe(false)
    expect(canApplyProposal(snapshot, { ...snapshot, isExecuting: true })).toBe(
      false
    )
  })
})
