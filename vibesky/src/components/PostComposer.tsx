import { useRef, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { createPost, uploadImage } from '../lib/db'
import Avatar from './Avatar'

export default function PostComposer({ onPosted }: { onPosted?: () => void }) {
  const { user, profile } = useAuth()
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function pickImage(f: File) {
    if (!user) return
    setUploading(true)
    try {
      setImageUrl(await uploadImage(f, user.uid))
    } catch (e) {
      alert('Could not upload image.')
    } finally {
      setUploading(false)
    }
  }

  async function submit() {
    if (!user || (!text.trim() && !imageUrl) || busy) return
    setBusy(true)
    try {
      await createPost(user.uid, text.trim(), imageUrl)
      setText('')
      setImageUrl('')
      onPosted?.()
    } finally {
      setBusy(false)
    }
  }

  const canPost = (text.trim() || imageUrl) && !busy && !uploading

  return (
    <div className="panel rounded-2xl p-4">
      <div className="flex gap-3">
        <Avatar src={profile?.avatarUrl} name={profile?.name} size={44} />
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Share something bright…"
          className="flex-1 resize-none bg-transparent outline-none placeholder:text-ink2/60 text-[15px] leading-relaxed"
        />
      </div>
      {imageUrl && (
        <div className="relative mt-2 ml-[56px]">
          <img src={imageUrl} alt="" className="rounded-xl max-h-72 object-cover border" style={{ borderColor: 'var(--stroke)' }} />
          <button
            onClick={() => setImageUrl('')}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <div className="flex items-center justify-between mt-3 ml-[56px]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="p-2 rounded-full text-accent2 hover:bg-accent2/10 transition-colors disabled:opacity-50"
            title="Attach image"
          >
            {uploading ? <span className="text-xs text-ink2">Uploading…</span> : <ImagePlus className="w-5 h-5" />}
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && pickImage(e.target.files[0])} />
        </div>
        <button
          onClick={submit}
          disabled={!canPost}
          className="btn-primary rounded-full px-5 py-2 text-sm disabled:opacity-40 transition-opacity"
        >
          {busy ? 'Posting…' : 'Launch'}
        </button>
      </div>
    </div>
  )
}
