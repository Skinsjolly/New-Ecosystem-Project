import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Repeat2, MessageSquare } from 'lucide-react'
import type { Post } from '../types'
import { useAuth } from '../context/AuthContext'
import {
  toggleLike, subscribeLiked, toggleRepost, subscribeReposted,
  timeAgo, triggerNotificationForPost
} from '../lib/db'
import Avatar from './Avatar'
import ReactionRow from './ReactionRow'

export default function PostCard({ post }: { post: Post }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [liked, setLiked] = useState(false)
  const [reposted, setReposted] = useState(false)
  const [pop, setPop] = useState(false)

  useEffect(() => {
    if (!user) return
    const unL = subscribeLiked(post.id, user.uid, setLiked)
    const unR = subscribeReposted(post.id, user.uid, setReposted)
    return () => {
      unL()
      unR()
    }
  }, [post.id, user])

  async function onLike(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user) return
    await toggleLike(post.id, user.uid)
    setPop(true)
    setTimeout(() => setPop(false), 350)
    if (!liked) {
      await triggerNotificationForPost(post.authorId, user.uid, profile, 'like', post.id, post.text)
    }
  }

  async function onRepost(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!user || !profile) return
    await toggleRepost(post.id, user.uid, profile)
    await triggerNotificationForPost(post.authorId, user.uid, profile, 'repost', post.id, post.text)
  }

  if (post.type === 'repost') {
    return (
      <article className="panel rounded-2xl p-4 rise">
        <div className="flex items-center gap-2 text-sm text-ink2 mb-2">
          <Repeat2 className="w-4 h-4" />
          <Link to={`/${post.authorHandle}`} className="hover:underline font-medium">
            {post.authorName}
          </Link>
          <span className="text-ink2">reposted</span>
          <span className="ml-auto">{timeAgo(post.createdAt)}</span>
        </div>
        <div className="border-l-2 pl-3" style={{ borderColor: 'var(--stroke)' }}>
          <p className="text-sm text-ink2">Repost of a post by {post.authorName}</p>
          <Link to={`/post/${post.originalPostId}`} className="text-sm text-accent hover:underline">
            View original
          </Link>
        </div>
      </article>
    )
  }

  return (
    <article
      className="panel rounded-2xl p-4 rise hover:bg-panel2/50 transition-colors cursor-pointer"
      onClick={() => navigate(`/post/${post.id}`)}
    >
      <div className="flex gap-3">
        <Link to={`/${post.authorHandle}`} onClick={(e) => e.stopPropagation()}>
          <Avatar src={post.authorAvatar} name={post.authorName} size={44} />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <Link to={`/${post.authorHandle}`} onClick={(e) => e.stopPropagation()} className="font-semibold hover:underline">
              {post.authorName}
            </Link>
            <Link to={`/${post.authorHandle}`} onClick={(e) => e.stopPropagation()} className="text-sm text-ink2 hover:underline">
              @{post.authorHandle}
            </Link>
            <span className="text-ink2 text-sm ml-auto">{timeAgo(post.createdAt)}</span>
          </div>
          <p className="mt-1.5 whitespace-pre-wrap break-words">{post.text}</p>
          {post.imageUrl && (
            <img
              src={post.imageUrl}
              alt=""
              loading="lazy"
              onClick={(e) => e.stopPropagation()}
              className="mt-3 rounded-xl max-h-96 object-cover border"
              style={{ borderColor: 'var(--stroke)' }}
            />
          )}
          <div className="flex items-center gap-6 mt-3 pt-2 border-t" style={{ borderColor: 'var(--stroke)' }}>
            <Link
              to={`/post/${post.id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-sm text-ink2 hover:text-accent transition-colors"
            >
              <MessageSquare className="w-[18px] h-[18px]" />
              {post.commentCount > 0 && <span>{post.commentCount}</span>}
            </Link>
            <button onClick={onLike} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: liked ? 'var(--accent)' : 'var(--ink-2)' }}>
              <Heart className={`w-[18px] h-[18px] ${pop ? 'like-pop' : ''}`} fill={liked ? 'currentColor' : 'none'} />
              {post.likeCount > 0 && <span>{post.likeCount}</span>}
            </button>
            <button onClick={onRepost} className="flex items-center gap-1.5 text-sm transition-colors" style={{ color: reposted ? 'var(--warm)' : 'var(--ink-2)' }}>
              <Repeat2 className="w-[18px] h-[18px]" />
              {post.repostCount > 0 && <span>{post.repostCount}</span>}
            </button>
            <ReactionRow post={post} />
          </div>
        </div>
      </div>
    </article>
  )
}
