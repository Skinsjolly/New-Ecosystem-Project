import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import type { Comment } from '../types'
import { useAuth } from '../context/AuthContext'
import { subscribeComments, addComment, timeAgo, triggerNotificationForPost, getUser } from '../lib/db'
import Avatar from './Avatar'

export default function CommentSection({ postId, authorId, postText }: { postId: string; authorId: string; postText: string }) {
  const { user, profile } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [text, setText] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  useEffect(() => {
    return subscribeComments(postId, setComments)
  }, [postId])

  async function submit() {
    if (!user || !text.trim()) return
    await addComment(postId, user.uid, text.trim())
    setText('')
  }

  async function submitReply(parentId: string) {
    if (!user || !replyText.trim()) return
    await addComment(postId, user.uid, replyText.trim(), parentId)
    setReplyText('')
    setReplyingTo(null)
  }

  async function notifyAuthor() {
    if (authorId !== user!.uid) {
      const me = await getUser(user!.uid)
      await triggerNotificationForPost(authorId, user!.uid, me, 'comment', postId, postText)
    }
  }

  const top = comments.filter((c) => !c.parentId)
  const childrenOf = (parentId: string) => comments.filter((c) => c.parentId === parentId)

  return (
    <div className="mt-4">
      <div className="flex gap-3 items-start">
        <Avatar src={profile?.avatarUrl} name={profile?.name} size={36} />
        <div className="flex-1 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (submit(), notifyAuthor())}
            placeholder="Add a comment…"
            className="flex-1 bg-transparent border rounded-full px-4 py-2 text-sm outline-none"
            style={{ borderColor: 'var(--stroke)' }}
          />
          <button
            onClick={() => {
              submit()
              notifyAuthor()
            }}
            disabled={!text.trim()}
            className="btn-primary rounded-full px-4 py-2 text-sm disabled:opacity-40"
          >
            Reply
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {top.map((c) => (
          <div key={c.id}>
            <div className="flex gap-3">
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
                <button onClick={() => { if (replyingTo === c.id) setReplyingTo(null); else setReplyingTo(c.id) }} className="mt-1 flex items-center gap-1 text-xs text-ink2 hover:text-accent transition-colors">
                  <MessageCircle className="w-3 h-3" /> Reply
                </button>
                {replyingTo === c.id && (
                  <div className="flex gap-2 mt-2">
                    <input
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && (submitReply(c.id), notifyAuthor())}
                      autoFocus
                      placeholder={`Reply to ${c.authorName}…`}
                      className="flex-1 bg-transparent border rounded-full px-3 py-1.5 text-sm outline-none"
                      style={{ borderColor: 'var(--stroke)' }}
                    />
                    <button
                      onClick={() => {
                        submitReply(c.id)
                        notifyAuthor()
                      }}
                      disabled={!replyText.trim()}
                      className="btn-primary rounded-full px-3 py-1.5 text-sm disabled:opacity-40"
                    >
                      Send
                    </button>
                  </div>
                )}
              </div>
            </div>
            {childrenOf(c.id).length > 0 && (
              <div className="ml-8 mt-3 pl-3 space-y-3 border-l-2" style={{ borderColor: 'var(--stroke)' }}>
                {childrenOf(c.id).map((r) => (
                  <div key={r.id} className="flex gap-3">
                    <Link to={`/${r.authorHandle}`}>
                      <Avatar src={r.authorAvatar} name={r.authorName} size={32} />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <Link to={`/${r.authorHandle}`} className="font-semibold text-sm hover:underline">
                          {r.authorName}
                        </Link>
                        <span className="text-xs text-ink2">@{r.authorHandle}</span>
                        <span className="text-xs text-ink2 ml-auto">{timeAgo(r.createdAt)}</span>
                      </div>
                      <p className="text-sm mt-0.5">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {comments.length === 0 && <p className="text-sm text-ink2 text-center py-4">No comments yet — start the conversation.</p>}
      </div>
    </div>
  )
}