import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import type { Message, Profile } from '../types'
import { useAuth } from '../context/AuthContext'
import { subscribeMessages, sendMessage, markConversationRead, subscribeConversationOther, timeAgo } from '../lib/db'
import Avatar from '../components/Avatar'

export default function Chat() {
  const { convId } = useParams<{ convId: string }>()
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [other, setOther] = useState<Profile | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!convId) return
    return subscribeMessages(convId, setMessages)
  }, [convId])

  useEffect(() => {
    if (!convId || !user) return
    markConversationRead(user.uid, convId)
    const unsub = subscribeConversationOther(convId, user.uid, setOther)
    return unsub
  }, [convId, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.text])

  async function send() {
    if (!convId || !user || !text.trim()) return
    await sendMessage(convId, user.uid, text.trim())
    setText('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/messages" className="p-2 rounded-full text-ink2 hover:text-ink transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        {other && (
          <Link to={`/${other.handle}`} className="flex items-center gap-2">
            <Avatar src={other.avatarUrl} name={other.name} size={36} />
            <div>
              <p className="font-semibold leading-tight">{other.name}</p>
              <p className="text-xs text-ink2">@{other.handle}</p>
            </div>
          </Link>
        )}
      </div>

      <div className="panel rounded-2xl p-4 h-[calc(100vh-16rem)] min-h-[320px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((m) => {
            const mine = m.senderId === user?.uid
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                    mine ? 'brand-gradient text-white rounded-br-md' : 'panel-2 rounded-bl-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={`text-[10px] mt-0.5 ${mine ? 'text-white/70' : 'text-ink2'}`}>{timeAgo(m.createdAt)}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2 pt-3">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={`Message ${other?.name ?? ''}…`}
            className="flex-1 bg-transparent border rounded-full px-4 py-2 text-sm outline-none focus:border-accent"
            style={{ borderColor: 'var(--stroke)' }}
          />
          <button onClick={send} disabled={!text.trim()} className="btn-primary rounded-full w-11 h-10 flex items-center justify-center disabled:opacity-40">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
