import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:streamGenerateContent'

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, temperature, maxTokens } = await req.json()

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 })
    }

    const params = new URLSearchParams({ key: GEMINI_API_KEY, alt: 'sse' })
    const url = `${GEMINI_URL}?${params}`

    const body: any = {
      contents: messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        temperature: temperature ?? 0.7,
        maxOutputTokens: maxTokens ?? 1024,
        topP: 0.9,
        topK: 40,
      },
      safetySettings: [
        { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      ],
    }

    if (systemPrompt) {
      body.system_instruction = { parts: [{ text: systemPrompt }] }
    }

    const geminiRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!geminiRes.ok) {
      const errText = await geminiRes.text()
      console.error('Gemini API error:', geminiRes.status, errText)
      return NextResponse.json(
        { error: `Gemini API error: ${geminiRes.status}` },
        { status: geminiRes.status }
      )
    }

    const reader = geminiRes.body?.getReader()
    if (!reader) {
      return NextResponse.json({ error: 'No response stream' }, { status: 500 })
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let buffer = ''
          while (true) {
            const { done, value } = await reader!.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              const trimmed = line.trim()
              if (!trimmed || !trimmed.startsWith('data: ')) continue
              try {
                const json = JSON.parse(trimmed.slice(6))
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  controller.enqueue(encoder.encode(text))
                }
              } catch {
                // skip malformed JSON chunks
              }
            }
          }

          if (buffer.trim()) {
            const trimmed = buffer.trim()
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6))
                const text = json.candidates?.[0]?.content?.parts?.[0]?.text
                if (text) {
                  controller.enqueue(encoder.encode(text))
                }
              } catch {}
            }
          }
        } catch (err) {
          console.error('Stream error:', err)
          controller.error(err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Chat API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}