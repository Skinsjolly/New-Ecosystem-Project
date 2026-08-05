'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { CHARACTERS, type Character, type Message, saveChats, loadChats, clearChats, genId } from '@/lib/characters'
import { Send, Trash2, RefreshCw, Settings, MessageSquare, Sun, Moon, ChevronDown, Sparkles, StopCircle } from 'lucide-react'

function formatTime(ts: number): string {
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function parseMarkdown(text: string): string {
  // Code blocks (```lang...```)
  let html = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    const langLabel = lang ? `<span>${lang}</span>` : '<span>code</span>'
    return `<div class="code-block-wrapper"><div class="code-header">${langLabel}<button class="copy-btn" onclick="navigator.clipboard.writeText(this.parentElement.nextElementSibling.textContent)">Copy</button></div><code>${escapeHtml(code.trim())}</code></div>`
  })

  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')

  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Strikethrough
  html = html.replace(/~~(.+?)~~/g, '<del>$1</del>')

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Blockquotes
  html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>')

  // Headings
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>')
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>')

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>[\s\S]*?<\/li>)\n(?!<li>)/g, '$1')
  html = html.replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
  html = html.replace(/<\/ul>\n<ul>/g, '')

  // Ordered lists
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')

  // Line breaks
  html = html.replace(/\n\n/g, '</p><p>')
  html = html.replace(/\n/g, '<br/>')

  return `<p>${html}</p>`
}

function escapeHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function MarkdownRender({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('click', (e) => {
        const target = e.target as HTMLElement
        if (target.classList.contains('copy-btn')) {
          const text = target.parentElement?.nextElementSibling?.textContent
          if (text) navigator.clipboard.writeText(text).catch(() => {})
        }
      })
    }
  }, [])

  return (
    <div
      ref={ref}
      className="markdown-body"
      style={{ color: 'var(--text-assistant)' }}
      dangerouslySetInnerHTML={{ __html: parseMarkdown(escapeHtml(content)) }}
    />
  )
}

export default function ChatPage() {
  const [character, setCharacter] = useState<Character>(CHARACTERS[0])
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamingContent, setStreamingContent] = useState('')
  const [abortController, setAbortController] = useState<AbortController | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [temperature, setTemperature] = useState(0.7)
  const [maxTokens, setMaxTokens] = useState(1024)
  const [dark, setDark] = useState(false)
  const [showCharSelector, setShowCharSelector] = useState(false)
  const [regenerating, setRegenerating] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem('chat-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  // Load messages on character change
  useEffect(() => {
    setMessages(loadChats(character.id))
    setStreamingContent('')
    setIsStreaming(false)
  }, [character.id])

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    })
  }, [])

  useEffect(() => { scrollToBottom() }, [messages, streamingContent, scrollToBottom])

  // Toggle theme
  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('chat-theme', next ? 'dark' : 'light')
  }

  // Clear conversation
  const handleClear = () => {
    clearChats(character.id)
    setMessages([])
    setStreamingContent('')
    setIsStreaming(false)
  }

  // Stop generation
  const handleStop = () => {
    abortController?.abort()
    setIsStreaming(false)
    if (streamingContent) {
      const msg: Message = { id: genId(), role: 'assistant', content: streamingContent, timestamp: Date.now() }
      const updated = [...messages, msg]
      setMessages(updated)
      saveChats(character.id, updated)
      setStreamingContent('')
    }
    setAbortController(null)
  }

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || isStreaming) return

    const userMsg: Message = { id: genId(), role: 'user', content: content.trim(), timestamp: Date.now() }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setInput('')
    setIsStreaming(true)
    setStreamingContent('')
    setRegenerating(null)

    const controller = new AbortController()
    setAbortController(controller)

    try {
      const chatMessages = updated.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatMessages,
          systemPrompt: character.systemPrompt,
          temperature,
          maxTokens,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        setStreamingContent(`*Sorry, something went wrong: ${err.error || 'Unknown error'}*`)
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) throw new Error('No response stream')

      let fullText = ''
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        setStreamingContent(fullText)
      }

      if (fullText) {
        const assistantMsg: Message = { id: genId(), role: 'assistant', content: fullText, timestamp: Date.now() }
        const final = [...updated, assistantMsg]
        setMessages(final)
        saveChats(character.id, final)
        setStreamingContent('')
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setStreamingContent(`*Sorry, I couldn't process that. Please try again.*`)
      }
    } finally {
      setIsStreaming(false)
      setAbortController(null)
      setRegenerating(null)
      inputRef.current?.focus()
    }
  }

  // Regenerate last response
  const handleRegenerate = () => {
    const lastUserIdx = messages.map((m, i) => m.role === 'user' ? i : -1).filter(i => i >= 0).pop()
    if (lastUserIdx === undefined) return

    const msgsWithoutLast = messages.slice(0, lastUserIdx + 1)
    setMessages(msgsWithoutLast)
    saveChats(character.id, msgsWithoutLast)
    setRegenerating(character.id)

    const userContent = messages[lastUserIdx].content
    // Small delay to let state update
    setTimeout(() => sendMessage(userContent), 100)
  }

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  // Handle keydown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="glass flex-shrink-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5" style={{ color: '#7C3AED' }} />
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Smart Thinker Chat</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowCharSelector(!showCharSelector)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
              >
                <span>{character.avatar}</span>
                <span>{character.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCharSelector ? 'rotate-180' : ''}`} />
              </button>

              {showCharSelector && (
                <div
                  className="absolute top-full right-0 mt-2 p-2 rounded-xl animate-scale-in z-50"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)', minWidth: '260px' }}
                >
                  {CHARACTERS.map(c => (
                    <button
                      key={c.id}
                      onClick={() => { setCharacter(c); setShowCharSelector(false) }}
                      className={`char-select-btn w-full mb-1 last:mb-0 ${character.id === c.id ? 'active' : ''}`}
                      style={{
                        '--active-color': c.color,
                        background: character.id === c.id ? `${c.color}10` : 'var(--bg-card)',
                      } as React.CSSProperties}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.avatar}</span>
                        <div>
                          <div className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>{c.name}</div>
                          <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>{c.role} &middot; Age {c.age}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button onClick={handleClear} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg transition-colors" style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button onClick={toggleTheme} className="theme-toggle" title={dark ? 'Light mode' : 'Dark mode'} />
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="border-t animate-slide-up" style={{ borderColor: 'var(--border)' }}>
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Temperature</label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  value={temperature}
                  onChange={e => setTemperature(parseFloat(e.target.value))}
                  className="slider w-24"
                />
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{temperature.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Max tokens</label>
                <input
                  type="range"
                  min="128"
                  max="4096"
                  step="128"
                  value={maxTokens}
                  onChange={e => setMaxTokens(parseInt(e.target.value))}
                  className="slider w-24"
                />
                <span className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{maxTokens}</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Chat messages */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Character info card */}
          {messages.length === 0 && !streamingContent && (
            <div className="glass-card rounded-2xl p-8 text-center animate-fade-in mt-8">
              <div className="text-5xl mb-4">{character.avatar}</div>
              <h2 className="text-xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{character.name}</h2>
              <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>{character.role} &middot; Age {character.age}</p>
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {character.personality.map(t => (
                  <span key={t} className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: `${character.color}15`, color: character.color }}
                  >{t}</span>
                ))}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Start a conversation with {character.name}!
              </p>
            </div>
          )}

          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[85%] sm:max-w-[70%] ${msg.role === 'user' ? 'order-1' : 'order-1'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1.5 px-1">
                    <span className="text-sm">{character.avatar}</span>
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{character.name}</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>{formatTime(msg.timestamp)}</span>
                  </div>
                )}
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: msg.role === 'user' ? 'var(--bg-user)' : 'var(--bg-assistant)',
                    color: msg.role === 'user' ? '#fff' : 'var(--text-assistant)',
                    boxShadow: msg.role === 'user' ? 'none' : 'var(--shadow)',
                  }}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRender content={msg.content} />
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="text-[10px] mt-1 text-right px-1" style={{ color: 'var(--text-secondary)' }}>
                    {formatTime(msg.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Streaming message */}
          {isStreaming && streamingContent && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[85%] sm:max-w-[70%]">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-sm">{character.avatar}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{character.name}</span>
                  <span className="text-[10px]" style={{ color: 'var(--text-secondary)' }}>typing...</span>
                </div>
                <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-assistant)', boxShadow: 'var(--shadow)' }}>
                  <MarkdownRender content={streamingContent} />
                </div>
              </div>
            </div>
          )}

          {/* Typing indicator */}
          {isStreaming && !streamingContent && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-[85%] sm:max-w-[70%]">
                <div className="flex items-center gap-2 mb-1.5 px-1">
                  <span className="text-sm">{character.avatar}</span>
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{character.name}</span>
                </div>
                <div className="rounded-2xl px-5 py-4 flex items-center gap-1.5" style={{ background: 'var(--bg-assistant)', boxShadow: 'var(--shadow)' }}>
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </div>
            </div>
          )}

          {/* Regenerate button */}
          {!isStreaming && messages.length >= 2 && messages[messages.length - 1].role === 'assistant' && (
            <div className="flex justify-center animate-fade-in">
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium transition-all"
                style={{ color: 'var(--text-secondary)', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--border)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-card)')}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 border-t" style={{ borderColor: 'var(--border)', background: 'var(--bg-primary)' }}>
        <div className="max-w-3xl mx-auto px-4 py-3">
          {isStreaming && streamingContent && (
            <div className="flex justify-center mb-3">
              <button onClick={handleStop} className="stop-btn">
                <StopCircle className="w-4 h-4" />
                Stop generating
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${character.name}...`}
                rows={1}
                className="w-full resize-none rounded-xl px-4 py-3 pr-12 text-sm outline-none transition-shadow"
                style={{
                  background: 'var(--bg-input)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  maxHeight: '120px',
                }}
                onFocus={e => (e.currentTarget.style.boxShadow = '0 0 0 2px #7C3AED40')}
                onBlur={e => (e.currentTarget.style.boxShadow = 'none')}
                onInput={e => {
                  const el = e.currentTarget
                  el.style.height = 'auto'
                  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
              style={{
                background: input.trim() && !isStreaming ? '#7C3AED' : 'var(--border)',
                color: input.trim() && !isStreaming ? '#fff' : 'var(--text-secondary)',
              }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          <p className="text-[10px] text-center mt-2" style={{ color: 'var(--text-secondary)' }}>
            Responses are AI-generated. Characters may occasionally say unexpected things.
          </p>
        </div>
      </div>
    </div>
  )
}