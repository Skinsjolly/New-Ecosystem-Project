import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { toggleFollow, subscribeIsFollowing } from '../lib/db'

export default function FollowButton({ targetUid }: { targetUid: string }) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    if (!user) return
    return subscribeIsFollowing(user.uid, targetUid, setFollowing)
  }, [user, targetUid])

  if (!user || user.uid === targetUid) return null

  return (
    <button
      onClick={() => toggleFollow(targetUid, user.uid)}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-all ${
        following ? 'panel-2 text-ink' : 'btn-primary'
      }`}
    >
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
