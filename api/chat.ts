import { createChatHandler } from '../server/chat.js'

declare const process: { env: Record<string, string | undefined> }

export default createChatHandler(process.env)
