import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function aiBackendPlugin(): Plugin {
  return {
    name: 'ai-backend-plugin',
    configureServer(server) {
      server.middlewares.use('/api/chat', (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', (chunk) => {
          body += chunk
        })
        req.on('end', async () => {
          try {
            const data = JSON.parse(body || '{}')
            const { messages, systemPrompt, prompt } = data

            const payloadMessages: any[] = []
            if (systemPrompt) {
              payloadMessages.push({ role: 'system', content: systemPrompt })
            }
            if (Array.isArray(messages)) {
              for (const m of messages) {
                payloadMessages.push({
                  role: m.role === 'assistant' ? 'assistant' : 'user',
                  content: m.content,
                })
              }
            }
            if (prompt) {
              payloadMessages.push({ role: 'user', content: prompt })
            }

            const aiResponse = await fetch('https://text.pollinations.ai/', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'AskMe-Mobile/1.0',
              },
              body: JSON.stringify({
                messages: payloadMessages,
                model: 'openai',
                seed: Math.floor(Math.random() * 100000),
              }),
            })

            if (!aiResponse.ok) {
              res.statusCode = aiResponse.status
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: `Upstream AI error (${aiResponse.status})` }))
              return
            }

            const text = await aiResponse.text()
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ reply: text }))
          } catch (err: any) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: err.message || 'Internal proxy error' }))
          }
        })
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    aiBackendPlugin(),
  ],
  server: {
    host: true, // Allows accessing from mobile devices on local network
    port: 5173,
  },
})
