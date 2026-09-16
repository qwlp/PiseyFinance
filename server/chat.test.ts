import { afterEach, expect, it, vi } from 'vitest'
import { Readable } from 'node:stream'
import { createChatHandler } from './chat'

const body = { messages: [{ role: 'user', content: 'Hello' }], locale: 'en' }
function response() {
  return { statusCode: 0, setHeader: vi.fn(), end: vi.fn() }
}
afterEach(() => vi.unstubAllGlobals())

it.each(['parsed', 'stream'])('handles %s request bodies used by Vercel and Vite', async kind => {
  const upstream = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'Hello there' } }] }) })
  vi.stubGlobal('fetch', upstream)
  const req = kind === 'parsed' ? { method: 'POST', body } : Object.assign(Readable.from([JSON.stringify(body)]), { method: 'POST' })
  const res = response()
  await createChatHandler({ OPENROUTER_KEY: 'test-key' })(req, res)
  expect(res.statusCode).toBe(200)
  expect(JSON.parse(res.end.mock.calls[0][0])).toEqual({ reply: 'Hello there' })
  expect(JSON.parse(upstream.mock.calls[0][1].body).messages.at(-1)).toEqual(body.messages[0])
})

it('rejects an empty conversation before calling the provider', async () => {
  const upstream = vi.fn()
  vi.stubGlobal('fetch', upstream)
  const res = response()
  await createChatHandler({ OPENROUTER_KEY: 'test-key' })({ method: 'POST', body: { messages: [] } }, res)
  expect(res.statusCode).toBe(400)
  expect(upstream).not.toHaveBeenCalled()
})
