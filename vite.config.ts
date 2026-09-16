/// <reference types="vitest/config" />
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { createChatHandler } from './server/chat'

function openRouterChat(mode: string): Plugin {
  const handler = createChatHandler(loadEnv(mode, '.', ''))
  const middleware = (req: any, res: any, next: () => void) => {
    if (req.url?.split('?')[0] !== '/api/chat') return next()
    return handler(req, res)
  }
  return {
    name: 'openrouter-chat-api',
    configureServer: server => { server.middlewares.use(middleware) },
    configurePreviewServer: server => { server.middlewares.use(middleware) },
  }
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), openRouterChat(mode)],
  test: { environment: 'jsdom' },
}))
