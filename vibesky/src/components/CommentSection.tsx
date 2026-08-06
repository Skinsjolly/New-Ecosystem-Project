import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import type { Comment } from '../types'
import { useAuth } from '../context/AuthContext'
import { subscribeComments, addComment, timeAgo, triggerNotificationForPost, getUser } from '../lib/db'
import Avatar from './Avatar'

export default function CommentSection({ postId, authorId, postText }: { postId: string; authorId: string; postText: string }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    return subscribeComments(postId, setComments)
  }, [postId])

  async function submit() {
    if (!user || !text.trim()) return
    await addComment(postId, user.uid, text.trim())
    setText('')
    if (authorId !== user.uid) {
      const me = await getUser(user.uid)
      await triggerNotificationForPost(authorId, user.uid, me, 'comment', postId, postText)
    }
  }

  return (
    <div className="mt-4">
      <div className="flex gap-3 items-start">
        <Avatar src={profile?.avatarUrl} name={profile?.name} size={36} />
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            placeholder="Add a comment…"
            className="flex-1 bg-transparent border rounded-full px-4 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--stroke)' }}
          />
          <button onClick={submit} disabled={!text.trim()} className="btn-primary rounded-full px-4 py-2 text-sm disabled:opacity-40">
            Reply
          </button>
        </div>
      </div>
      <div className="mt-4 space-y-4">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-3">
            <Link to={`/${c.authorHandle}`}>
              <Avatar src={c.authorAvatar} name={c.authorName} size={36} />
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <Link to={`/${c.authorHandle}`} className="font-semibold text-sm hover:underline">
                  {c.authorName}
                </Link>
                <span className="text-xs text-ink2">@{c.authorHandle}</span>
                <span className="text-xs text-ink2 ml-auto">{timeAgo(c.createdAt)}</span>
              </div>
              <p className="text-sm mt-0.5">{c.text}</p>
            </div>
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-ink2 text-center py-4">No comments yet — start the conversation.</p>}
      </div>
    </div>
  )
}
