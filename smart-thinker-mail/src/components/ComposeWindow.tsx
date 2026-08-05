'use client'

import { useState } from 'react'
import { Minus, Maximize2, X, Send, Paperclip, Image, Bold, Italic, Underline, Link2, List, ListOrdered } from 'lucide-react'
import { EmailAccount } from '@/app/page'

interface ComposeWindowProps {
  onClose: () => void
  accounts: EmailAccount[]
  activeAccount: EmailAccount | null
  initialTo?: string
  initialSubject?: string
}

export default function ComposeWindow({ onClose, accounts, activeAccount, initialTo = '', initialSubject = '' }: ComposeWindowProps) {
  const [to, setTo] = useState(initialTo)
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState(initialSubject)
  const [body, setBody] = useState('')
  const [showCcBcc, setShowCcBcc] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  const handleSend = async () => {
    setSending(true)
    setError('')
    try {
      const res = await fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to,
          subject,
          body,
          from: activeAccount?.email || '',
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send')
      }
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to send')
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  if (minimized) {
    return (
      <div className="compose-overlay bg-white" style={{ height: 48, maxHeight: 48 }}>
        <div
          className="flex items-center justify-between px-4 h-12 cursor-pointer bg-st-dark rounded-t-lg"
          onClick={() => setMinimized(false)}
        >
          <span className="text-sm font-medium text-white truncate">{subject || 'New Message'}</span>
          <div className="flex items-center gap-1">
            <button onClick={(e) => { e.stopPropagation(); setMinimized(false) }} className="p-1 hover:bg-white/10 rounded">
              <Maximize2 className="w-4 h-4 text-white/70" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onClose() }} className="p-1 hover:bg-white/10 rounded">
              <X className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="compose-overlay bg-white slide-up" onKeyDown={handleKeyDown}>
      <div className="flex items-center justify-between px-4 h-12 bg-st-dark rounded-t-lg">
        <span className="text-sm font-medium text-white">New Message</span>
        <div className="flex items-center gap-1">
          <button onClick={() => setMinimized(true)} className="p-1 hover:bg-white/10 rounded" title="Minimize">
            <Minus className="w-4 h-4 text-white/70" />
          </button>
          <button onClick={() => setMinimized(false)} className="p-1 hover:bg-white/10 rounded" title="Full screen">
            <Maximize2 className="w-4 h-4 text-white/70" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded" title="Close">
            <X className="w-4 h-4 text-white/70" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="flex items-center gap-2 border-b border-st-border px-4 py-2">
          <label className="text-sm text-st-gray w-14 flex-shrink-0">From:</label>
          <select className="flex-1 text-sm outline-none bg-transparent text-st-dark cursor-pointer">
            <option>{activeAccount?.email || 'Smart Thinker Mail'}</option>
            {accounts.map((a) => (
              <option key={a.id}>{a.email}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 border-b border-st-border px-4 py-2">
          <label className="text-sm text-st-gray w-14 flex-shrink-0">To:</label>
          <input
            type="email"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-st-dark"
            placeholder="Recipients"
            autoFocus
          />
          {!showCcBcc && (
            <button onClick={() => setShowCcBcc(true)} className="text-xs text-st-gray hover:underline flex-shrink-0">
              Cc / Bcc
            </button>
          )}
        </div>

        {showCcBcc && (
          <>
            <div className="flex items-center gap-2 border-b border-st-border px-4 py-2">
              <label className="text-sm text-st-gray w-14 flex-shrink-0">Cc:</label>
              <input
                type="email"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-st-dark"
              />
            </div>
            <div className="flex items-center gap-2 border-b border-st-border px-4 py-2">
              <label className="text-sm text-st-gray w-14 flex-shrink-0">Bcc:</label>
              <input
                type="email"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
                className="flex-1 text-sm outline-none bg-transparent text-st-dark"
              />
            </div>
          </>
        )}

        <div className="flex items-center gap-2 border-b border-st-border px-4 py-2">
          <label className="text-sm text-st-gray w-14 flex-shrink-0">Subject:</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="flex-1 text-sm outline-none bg-transparent text-st-dark"
          />
        </div>

        <div className="flex items-center gap-0.5 py-1.5 px-3 border-b border-st-border">
          {[
            { icon: Bold, title: 'Bold' },
            { icon: Italic, title: 'Italic' },
            { icon: Underline, title: 'Underline' },
            { icon: Link2, title: 'Insert link' },
            { icon: List, title: 'Bulleted list' },
            { icon: ListOrdered, title: 'Numbered list' },
          ].map(({ icon: Icon, title }, i) => (
            <button key={i} className="toolbar-btn" title={title}>
              <Icon className="w-4 h-4 text-st-gray" />
            </button>
          ))}
          <div className="w-px h-4 bg-st-border mx-1" />
          <button className="toolbar-btn" title="Insert image">
            <Image className="w-4 h-4 text-st-gray" />
          </button>
          <button className="toolbar-btn" title="Attach file">
            <Paperclip className="w-4 h-4 text-st-gray" />
          </button>
        </div>

        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="flex-1 text-sm outline-none resize-none p-4 text-st-dark min-h-[200px]"
          placeholder="Write your message..."
        />

        <div className="flex items-center gap-3 px-4 py-3 border-t border-st-border bg-white">
          {error && (
            <span className="text-xs text-red-500 max-w-[200px] truncate">{error}</span>
          )}
          <button
            onClick={handleSend}
            disabled={sending || !to}
            className="flex items-center gap-2 bg-st-blue text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-blue-600 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending...' : 'Send'}
          </button>
          <button onClick={onClose} className="text-sm text-st-gray hover:text-st-dark px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            Discard
          </button>
        </div>
      </div>
    </div>
  )
}
