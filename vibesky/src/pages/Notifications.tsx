import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Repeat2, MessageSquare, UserPlus } from 'lucide-react'
import type { NotificationItem } from '../types'
import { useAuth } from '../context/AuthContext'
import { subscribeNotifications, markNotificationsRead, timeAgo } from '../lib/db'
import Avatar from '../components/Avatar'

export default function Notifications() {
  const { profile } = useAuth()
  const [items, setItems] = useState<NotificationItem[]>([])

  useEffect(() => {
    if (!profile) return
    return subscribeNotifications(profile.uid, setItems)
  }, [profile])

  useEffect(() => {
    if (!profile) return
    markNotificationsRead(profile.uid)
  }, [profile])

  const icon = (type: string) =>
    type === 'like' ? (
      <Heart className="w-4 h-4 text-accent" fill="currentColor" />
    ) : type === 'comment' ? (
      <MessageSquare className="w-4 h-4 text-accent2" />
    ) : type === 'repost' ? (
      <Repeat2 className="w-4 h-4 text-warm" />
    ) : (
      <UserPlus className="w-4 h-4 text-warm" />
    )

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">Alerts</h1>
      <div className="space-y-3">
        {items.map((n) => (
          <div key={n.id} className="panel rounded-2xl p-4 flex gap-3 items-center rise">
            <Link to={`/${n.actorId}`} className="shrink-0 relative">
              <Avatar src={n.actorAvatar} name={n.actorName} size={44} />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-panel flex items-center justify-center border" style={{ borderColor: 'var(--stroke)' }}>
                {icon(n.type)}
              </span>
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-sm leading-snug">
                <Link to={`/${n.actorId}`} className="font-semibold hover:underline">
                  {n.actorName}
                </Link>{' '}
                {n.text}
              </p>
              {n.postId && (
                <Link to={`/post/${n.postId}`} className="text-xs text-accent hover:underline">
                  View post
                </Link>
              )}
            </div>
            <span className="text-xs text-ink2 shrink-0">{timeAgo(n.createdAt)}</span>
            {!n.read && <span className="w-2 h-2 rounded-full bg-accent shrink-0" />}
          </div>
        ))}
        {items.length === 0 && <p className="text-center text-ink2 text-sm py-12">No alerts yet.</p>}
      </div>
    </div>
  )
}
