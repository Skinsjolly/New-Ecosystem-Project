import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import type { Post } from '../types'
import { subscribePost, timeAgo } from '../lib/db'
import { useAuth } from '../context/AuthContext'
import Avatar from '../components/Avatar'
import CommentSection from '../components/CommentSection'
import { Heart, Repeat2, MessageSquare } from 'lucide-react'
import { toggleLike, subscribeLiked, toggleRepost, subscribeReposted, triggerNotificationForPost } from '../lib/db'

export default function PostDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, profile } = useAuth()
  const [post, setPost] = useState<Post | null>(null)
  const [liked, setLiked] = useState(false)
  const [reposted, setReposted] = useState(false)

  useEffect(() => {
    if (!id) return
    return subscribePost(id, setPost)
  }, [id])

  useEffect(() => {
    if (!id || !user) return
    const unL = subscribeLiked(id, user.uid, setLiked)
    const unR = subscribeReposted(id, user.uid, setReposted)
    return () => {
      unL()
      unR()
    }
  }, [id, user])

  if (!post) {
    return (
      <div className="space-y-4">
        <button onClick={() => history.back()} className="flex items-center gap-2 text-ink2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <p className="text-center text-ink2 py-16">Post not found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <button onClick={() => history.back()} className="flex items-center gap-2 text-ink2 hover:text-ink text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <article className="panel rounded-2xl p-5 rise">
        <div className="flex gap-3">
          <Link to={`/${post.authorHandle}`}>
            <Avatar src={post.authorAvatar} name={post.authorName} size={48} />
          </Link>
          <div className="min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <Link to={`/${post.authorHandle}`} className="font-semibold hover:underline">
                {post.authorName}
              </Link>
              <Link to={`/${post.authorHandle}`} className="text-sm text-ink2 hover:underline">
                @{post.authorHandle}
              </Link>
            </div>
            <p className="mt-2 whitespace-pre-wrap break-words text-[15px] leading-relaxed">{post.text}</p>
            {post.imageUrl && (
              <img src={post.imageUrl} alt="" className="mt-3 rounded-xl max-h-96 object-cover border" style={{ borderColor: 'var(--stroke)' }} />
            )}
            <p className="text-xs text-ink2 mt-3">{new Date(post.createdAt).toLocaleString()}</p>
            <div className="flex items-center gap-6 mt-3 pt-3 border-t" style={{ borderColor: 'var(--stroke)' }}>
              <button
                onClick={async () => {
                  if (!user) return
                  await toggleLike(post.id, user.uid)
                  if (!liked) await triggerNotificationForPost(post.authorId, user.uid, profile, 'like', post.id, post.text)
                }}
                className="flex items-center gap-1.5 text-sm"
                style={{ color: liked ? 'var(--accent)' : 'var(--ink-2)' }}
              >
                <Heart className="w-[18px] h-[18px]" fill={liked ? 'currentColor' : 'none'} /> {post.likeCount}
              </button>
              <button
                onClick={async () => {
                  if (!user || !profile) return
                  await toggleRepost(post.id, user.uid, profile)
                  await triggerNotificationForPost(post.authorId, user.uid, profile, 'repost', post.id, post.text)
                }}
                className="flex items-center gap-1.5 text-sm"
                style={{ color: reposted ? 'var(--warm)' : 'var(--ink-2)' }}
              >
                <Repeat2 className="w-[18px] h-[18px]" /> {post.repostCount}
              </button>
              <span className="flex items-center gap-1.5 text-sm text-ink2">
                <MessageSquare className="w-[18px] h-[18px]" /> {post.commentCount}
              </span>
              <span className="ml-auto text-sm text-ink2">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        </div>
      </article>

      <CommentSection postId={post.id} authorId={post.authorId} postText={post.text} />
    </div>
  )
}
