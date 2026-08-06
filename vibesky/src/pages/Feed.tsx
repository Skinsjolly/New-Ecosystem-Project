import { useEffect, useState } from 'react'
import type { Post } from '../types'
import { useAuth } from '../context/AuthContext'
import { subscribeFollowingIds, subscribeFeed, subscribeGlobalFeed, loadOlderPosts } from '../lib/db'
import PostComposer from '../components/PostComposer'
import PostCard from '../components/PostCard'
import SkyStrip from '../components/SkyStrip'

type Tab = 'following' | 'global'

export default function Feed() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState<Tab>('following')
  const [following, setFollowing] = useState<string[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [loadingMore, setLoadingMore] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeFollowingIds(user.uid, setFollowing)
  }, [user])

  useEffect(() => {
    if (!user) return
    if (tab === 'following') {
      return subscribeFeed(following, setPosts)
    }
    return subscribeGlobalFeed(setPosts)
  }, [tab, following, user])

  async function loadMore() {
    if (loadingMore || posts.length === 0) return
    setLoadingMore(true)
    const oldest = posts[posts.length - 1].createdAt
    const older = await loadOlderPosts(tab === 'following' ? following : [], oldest)
    setPosts((prev) => {
      const seen = new Set(prev.map((p) => p.id))
      return [...prev, ...older.filter((p) => !seen.has(p.id))].sort((a, b) => b.createdAt - a.createdAt)
    })
    setLoadingMore(false)
  }

  return (
    <div className="space-y-4">
      <SkyStrip />
      {profile && <PostComposer onPosted={() => {}} />}

      <div className="flex gap-2 panel rounded-full p-1">
        {(['following', 'global'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold capitalize transition-colors ${
              tab === t ? 'btn-primary' : 'text-ink2 hover:text-ink'
            }`}
          >
            {t === 'following' ? 'For You' : 'Global'}
          </button>
        ))}
      </div>

      {tab === 'following' && following.length === 0 && (
        <div className="panel rounded-2xl p-8 text-center">
          <p className="font-semibold">Your sky is empty</p>
          <p className="text-sm text-ink2 mt-1">Follow some people or check out the Global feed to get started.</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((p) => (
          <PostCard key={p.id} post={p} />
        ))}
        {posts.length === 0 && tab === 'global' && (
          <p className="text-center text-ink2 text-sm py-8">Nothing here yet — be the first to post.</p>
        )}
      </div>

      {posts.length > 0 && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-3 rounded-2xl panel text-sm text-ink2 hover:text-ink transition-colors disabled:opacity-50"
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}
