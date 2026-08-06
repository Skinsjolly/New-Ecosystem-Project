import { useRef, useState } from 'react'
import { X, Camera } from 'lucide-react'
import type { Profile } from '../types'
import { useAuth } from '../context/AuthContext'
import { updateUserProfile, uploadImage } from '../lib/db'
import Avatar from './Avatar'

export default function EditProfileModal({ profile, onClose }: { profile: Profile; onClose: () => void }) {
  const { user } = useAuth()
  const [name, setName] = useState(profile.name)
  const [handle, setHandle] = useState(profile.handle)
  const [bio, setBio] = useState(profile.bio)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function save() {
    if (!user || busy) return
    if (!/^[a-z0-9_]{3,30}$/i.test(handle.trim())) {
      alert('Handle must be 3-30 characters (letters, numbers, underscore).')
      return
    }
    setBusy(true)
    await updateUserProfile(user.uid, {
      name: name.trim(),
      handle: handle.trim().toLowerCase(),
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
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-9 h-9 rounded-full btn-primary flex items-center justify-center"
              title="Change avatar"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            hidden
            onChange={async (e) => {
              const f = e.target.files?.[0]
              if (f && user) setAvatarUrl(await uploadImage(f, user.uid))
            }}
          />
        </div>

        <label className="block text-xs text-ink2 mb-1">Name</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none mb-3" style={{ borderColor: 'var(--stroke)' }} />

        <label className="block text-xs text-ink2 mb-1">Handle</label>
        <input value={handle} onChange={(e) => setHandle(e.target.value)} className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none mb-3" style={{ borderColor: 'var(--stroke)' }} />

        <label className="block text-xs text-ink2 mb-1">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="w-full bg-transparent border rounded-lg px-3 py-2 text-sm outline-none resize-none mb-4" style={{ borderColor: 'var(--stroke)' }} />

        <button onClick={save} disabled={busy} className="btn-primary w-full rounded-xl py-2.5 text-sm disabled:opacity-50">
          {busy ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
