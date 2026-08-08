import { useState } from 'react'
import { X } from 'lucide-react'
import type { Profile } from '../types'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile } from '../lib/db'
import Avatar from './Avatar'

export default function EditProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const { user } = useAuth()
  const [name, setName] = useState(profile.name)
  const [bio, setBio] = useState(profile.bio)
  const [avatarUrl] = useState(profile.avatarUrl)
  const [busy, setBusy] = useState(false)

  async function save() {
    if (!user || busy) return
    if (!name.trim()) {
      alert('Display name cannot be empty.')
      return
    }
    setBusy(true)
    await updateUserProfile(user.uid, {
      name: name.trim(),
      bio: bio.trim(),
      avatarUrl
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="panel rounded-2xl w-full max-w-md p-6 rise" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Edit profile</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/5">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 mb-4">
          <div className="relative">
            <Avatar src={avatarUrl} name={name} size={88} />
          </div>
        </div>

        <label className="block text-xs text-ink2 mb-1">Display name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none mb-3" style={{ borderColor: 'var(--stroke)' }} />

        <label className="block text-xs text-ink2 mb-1">Username</label>
        <input value={`@${profile.handle}`} readOnly className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none opacity-60 mb-3" style={{ borderColor: 'var(--stroke)' }} />

        <label className="block text-xs text-ink2 mb-1">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none resize-none mb-4" style={{ borderColor: 'var(--stroke)' }} />

        <button onClick={save} disabled={busy} className="btn-primary w-full rounded-xl py-2.5 text-sm disabled:opacity-50">
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
