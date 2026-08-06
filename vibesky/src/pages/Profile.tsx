import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Settings, MessagesSquare } from 'lucide-react'
import type { Profile, Post } from '../types'
import { useAuth } from '../context/AuthContext'
import { getUserByHandle, subscribeUser, subscribeUserPosts, timeAgo, getOrCreateConversation } from '../lib/db'
import Avatar from '../components/Avatar'
import FollowButton from '../components/FollowButton'
import PostCard from '../components/PostCard'
import EditProfileModal from '../components/EditProfileModal'

export default function Profile() {
  const { handle } = useParams<{ handle: string }>()
  const navigate = useNavigate()
  const { user, profile: me } = useAuth()
  const [target, setTarget] = useState<Profile | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [notFound, setNotFound] = useState(false)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    let unsubProfile: (() => void) | undefined
    let unsubPosts: (() => void) | undefined
    let cancelled = false
    setNotFound(false)
    setTarget(null)
    ;(async () => {
      const p = handle ? await getUserByHandle(handle) : null
      if (cancelled) return
      if (!p) {
        setNotFound(true)
        return
      }
      setTarget(p)
      unsubProfile = subscribeUser(p.uid, setTarget)
      unsubPosts = subscribeUserPosts(p.uid, setPosts)
    })()
    return () => {
      cancelled = true
      unsubProfile?.()
      unsubPosts?.()
    }
  }, [handle])

  const isMe = user && target && user.uid === target.uid

  if (notFound) {
    return (
      <div className="panel rounded-2xl p-10 text-center">
        <p className="font-bold text-xl">Profile not found</p>
        <p className="text-sm text-ink2 mt-1">No vibe hunter with that handle.</p>
      </div>
    )
  }

  if (!target) {
    return <p className="text-center text-ink2 py-16">Loading…</p>
  }

  return (
    <div className="space-y-4 rise">
      <div className="panel rounded-2xl overflow-hidden">
        <div
          className="h-36"
          style={{
            background: target.bannerUrl
              ? `url(${target.bannerUrl}) center/cover`
              : 'linear-gradient(120deg, rgba(255,122,198,0.5), rgba(143,91,255,0.5), rgba(77,208,255,0.5))'
          }}
        />
        <div className="px-5 pb-5">
          <div className="flex items-end justify-between -mt-9 mb-3">
            <Avatar src={target.avatarUrl} name={target.name} size={84} />
            <div className="flex items-center gap-2">
              {isMe && (
                <button
                  onClick={() => setEditing(true)}
                  className="panel-2 rounded-full px-4 py-1.5 text-sm flex items-center gap-2 hover:text-ink transition-colors"
                >
                  <Settings className="w-4 h-4" /> Edit
                </button>
              )}
              {!isMe && user && (
                <button
                  onClick={async () => {
                    const id = await getOrCreateConversation(user.uid, target.uid)
                    navigate(`/messages/${id}`)
                  }}
                  className="panel-2 rounded-full px-4 py-1.5 text-sm flex items-center gap-2 hover:text-ink transition-colors"
                >
                  <MessagesSquare className="w-4 h-4" /> Message
                </button>
              )}
              {!isMe && <FollowButton targetUid={target.uid} />}
            </div>
          </div>
          <h1 className="text-xl font-extrabold">{target.name}</h1>
          <p className="text-sm text-ink2">@{target.handle}</p>
          {target.bio && <p className="mt-2 text-sm leading-relaxed">{target.bio}</p>}
          <div className="flex gap-5 mt-3 text-sm text-ink2">
            <span>
              <b className="text-ink">{target.postCount}</b> posts
            </span>
            <span>
              <b className="text-ink">{target.followerCount}</b> followers
            </span>
            <span>
              <b className="text-ink">{target.followingCount}</b> following
            </span>
            <span className="ml-auto">Joined {timeAgo(target.createdAt)} ago</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {posts.length === 0 && <p className="text-center text-ink2 text-sm py-8">No posts yet.</p>}
      </div>

      {editing && me && <EditProfileModal profile={me} onClose={() => setEditing(false)} />}
    </div>
  )
}
