import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessagesSquare } from 'lucide-react'
import type { Conversation } from '../types'
import { useAuth } from '../context/AuthContext'
import { subscribeConversations, timeAgo } from '../lib/db'
import Avatar from '../components/Avatar'

export default function Messages() {
  const { profile } = useAuth()
  const [convs, setConvs] = useState<Conversation[]>([])

  useEffect(() => {
    if (!profile) return
    return subscribeConversations(profile.uid, setConvs)
  }, [profile])

  const totalUnread = useMemo(() => convs.reduce((a, c) => a + c.unread, 0), [convs])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MessagesSquare className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-extrabold">Messages</h1>
        {totalUnread > 0 && (
          <span className="text-xs bg-accent text-white rounded-full px-2 py-0.5 font-bold">{totalUnread} unread</span>
        )}
      </div>
      <div className="space-y-3">
        {convs.map((c) => (
          <Link key={c.id} to={`/messages/${c.id}`} className="panel rounded-2xl p-4 flex items-center gap-3 rise hover:bg-panel2/50 transition-colors">
            <Avatar src={c.otherAvatar} name={c.otherName} size={48} />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold">{c.otherName}</p>
                <p className="text-xs text-ink2">@{c.otherHandle}</p>
                <span className="text-xs text-ink2 ml-auto">{timeAgo(c.lastMessageAt)}</span>
              </div>
              <p className={`text-sm truncate ${c.unread > 0 ? 'text-ink font-medium' : 'text-ink2'}`}>
                {c.lastMessage || 'Say hi…'}
              </p>
            </div>
            {c.unread > 0 && <span className="w-2.5 h-2.5 rounded-full bg-accent shrink-0" />}
          </Link>
        ))}
        {convs.length === 0 && (
          <div className="panel-2 rounded-2xl p-8 text-center">
            <p className="font-semibold">No messages yet</p>
            <p className="text-sm text-ink2 mt-1">Open someone's profile and hit "Message" to start a chat.</p>
          </div>
        )}
      </div>
    </div>
  )
}