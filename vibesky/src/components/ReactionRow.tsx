import { useEffect, useRef, useState } from 'react'
import { SmilePlus } from 'lucide-react'
import type { Post } from '../types'
import { useAuth } from '../context/AuthContext'
import { toggleReaction, subscribeMyReaction } from '../lib/db'

const EMOJIS = ['✨', '🌊', '☀️', '🔥', '💜']

export default function ReactionRow({ post }: { post: Post }) {
  const { user } = useAuth()
  const [mine, setMine] = useState('')
  const [open, setOpen] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user) return
    return subscribeMyReaction(post.id, user.uid, setMine)
  }, [post.id, user])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const entries = Object.entries(post.reactions).filter(([, c]) => c > 0)

  async function react(e: React.MouseEvent, emoji: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    await toggleReaction(post.id, user.uid, emoji)
    setOpen(false)
  }

  return (
    <div ref={wrapRef} className="relative flex items-center gap-1.5">
      {entries.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={(e) => react(e, emoji)}
          className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full border transition-colors ${
            mine === emoji ? 'text-ink border-accent bg-accent/10' : 'text-ink2 border-transparent hover:text-ink'
          }`}
          title={mine === emoji ? 'Remove reaction' : 'React'}
        >
          <span>{emoji}</span>
          <span>{count}</span>
        </button>
      ))}
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={`flex items-center justify-center w-6 h-6 rounded-full transition-colors ${mine ? 'text-accent' : 'text-ink2 hover:text-ink'}`}
        title="Add reaction"
      >
        <SmilePlus className="w-[18px] h-[18px]" />
      </button>
      {open && (
        <div
          className="absolute bottom-8 left-0 z-30 panel rounded-xl p-2 flex gap-1 shadow-xl"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
          }}
        >
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              onClick={(e) => react(e, emoji)}
              className={`w-9 h-9 flex items-center justify-center text-lg rounded-lg transition-colors ${mine === emoji ? 'bg-accent/20' : 'hover:bg-white/5'}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
