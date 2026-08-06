import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search as SearchIcon } from 'lucide-react'
import type { Profile, Post } from '../types'
import { searchUsers, searchPosts } from '../lib/db'
import Avatar from '../components/Avatar'
import FollowButton from '../components/FollowButton'
import PostCard from '../components/PostCard'

export default function Search() {
  const [term, setTerm] = useState('')
  const [users, setUsers] = useState<Profile[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [searched, setSearched] = useState(false)

  useEffect(() => {
    if (term.trim().length < 2) {
      setUsers([])
      setPosts([])
      setSearched(false)
      return
    }
    setSearched(true)
    const unsub = searchUsers(term.trim(), setUsers)
    searchPosts(term.trim()).then(setPosts)
    return unsub
  }, [term])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">Explore</h1>
      <div className="panel rounded-full flex items-center gap-3 px-4 py-2.5">
        <SearchIcon className="w-5 h-5 text-ink2" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search people and posts…"
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>

      <section>
        <h2 className="text-sm font-semibold text-ink2 uppercase tracking-wider mb-2">People</h2>
        <div className="space-y-3">
          {users.map((u) => (
            <div key={u.uid} className="panel rounded-2xl p-4 flex items-center gap-3">
              <Link to={`/${u.handle}`}>
                <Avatar src={u.avatarUrl} name={u.name} size={44} />
              </Link>
              <div className="min-w-0 flex-1">
                <Link to={`/${u.handle}`} className="font-semibold hover:underline">
                  {u.name}
                </Link>
                <p className="text-sm text-ink2">@{u.handle}</p>
              </div>
              <FollowButton targetUid={u.uid} />
            </div>
          ))}
          {searched && users.length === 0 && <p className="text-sm text-ink2 text-center py-4">No people found.</p>}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-ink2 uppercase tracking-wider mb-2 pt-4">Posts</h2>
        <div className="space-y-4">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {searched && posts.length === 0 && <p className="text-sm text-ink2 text-center py-4">No posts found.</p>}
        </div>
      </section>

      {!searched && (
        <div className="panel-2 rounded-2xl p-8 text-center">
          <p className="font-semibold">Find your community</p>
          <p className="text-sm text-ink2 mt-1">Search for a handle, name, or keyword.</p>
        </div>
      )}
    </div>
  )
}