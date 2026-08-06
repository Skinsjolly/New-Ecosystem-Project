import { useEffect, useRef, useState } from 'react'
import { Plus, Trash2, X, ImagePlus } from 'lucide-react'
import type { Sky } from '../types'
import { useAuth } from '../context/AuthContext'
import { subscribeSkies, addSky, deleteSky, uploadImage } from '../lib/db'
import Avatar from './Avatar'

export default function SkyStrip() {
  const { user, profile } = useAuth()
  const [skies, setSkies] = useState<Sky[]>([])
  const [composing, setComposing] = useState(false)
  const [viewing, setViewing] = useState<Sky | null>(null)
  const [text, setText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return subscribeSkies(setSkies)
  }, [])

  async function submit() {
    if (!user || (!text.trim() && !imageUrl)) return
    await addSky(user.uid, text.trim(), imageUrl)
    setText('')
    setImageUrl('')
    setComposing(false)
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto py-1 -mx-1 px-1">
        <button
          onClick={() => setComposing(true)}
          className="shrink-0 w-16 flex flex-col items-center gap-1.5 group"
        >
          <span className="w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center transition-colors" style={{ borderColor: 'var(--stroke)' }}>
            <Plus className="w-5 h-5 text-ink2 group-hover:text-accent transition-colors" />
          </span>
          <span className="text-[11px] text-ink2">Your sky</span>
        </button>
        {skies.map((sky) => (
          <button key={sky.id} onClick={() => setViewing(sky)} className="shrink-0 w-16 flex flex-col items-center gap-1.5">
            <span className="w-14 h-14 rounded-full p-0.5 brand-gradient">
              <span className="w-full h-full rounded-full overflow-hidden block" style={{ background: 'var(--panel)' }}>
                <Avatar src={sky.authorAvatar} name={sky.authorName} size={52} />
              </span>
            </span>
            <span className="text-[11px] text-ink2 max-w-16 truncate">{sky.authorName.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      {composing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" onClick={() => setComposing(false)}>
          <div className="panel rounded-2xl w-full max-w-md p-6 rise" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-lg">Add to your sky</h2>
              <button onClick={() => setComposing(false)} className="p-2 rounded-full hover:bg-white/5">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-ink2 mb-3">Fades away after 24 hours — a fleeting lightpost.</p>
            <div className="flex gap-3">
              <Avatar src={profile?.avatarUrl} name={profile?.name} size={40} />
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
                autoFocus
                placeholder="A moment, a thought, a flash…"
                className="flex-1 resize-none bg-transparent outline-none text-sm"
              />
            </div>
            {imageUrl && (
              <div className="relative mt-2">
                <img src={imageUrl} alt="" className="rounded-xl max-h-64 object-cover border" style={{ borderColor: 'var(--stroke)' }} />
                <button onClick={() => setImageUrl('')} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="p-2 rounded-full text-accent2 hover:bg-accent2/10 transition-colors disabled:opacity-50"
              >
                {uploading ? <span className="text-xs text-ink2">Uploading…</span> : <ImagePlus className="w-5 h-5" />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={async (e) => {
                const f = e.target.files?.[0]
                if (f && user) {
                  setUploading(true)
                  setImageUrl(await uploadImage(f, user.uid))
                  setUploading(false)
                }
              }} />
              <button onClick={submit} disabled={!text.trim() && !imageUrl} className="btn-primary rounded-full px-5 py-2 text-sm disabled:opacity-40">
                Post to sky
              </button>
            </div>
          </div>
        </div>
      )}

      {viewing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80" onClick={() => setViewing(null)}>
          <div className="w-full max-w-md panel rounded-2xl overflow-hidden rise" onClick={(e) => e.stopPropagation()}>
            {viewing.imageUrl && <img src={viewing.imageUrl} alt="" className="w-full max-h-[50vh] object-cover" />}
            <div className="p-5">
              <div className="flex items-center gap-3 mb-2">
                <Avatar src={viewing.authorAvatar} name={viewing.authorName} size={36} />
                <div>
                  <p className="font-semibold text-sm">{viewing.authorName}</p>
                  <p className="text-xs text-ink2">@{viewing.authorHandle}</p>
                </div>
                {user && user.uid === viewing.authorId && (
                  <button
                    onClick={async () => {
                      await deleteSky(viewing.id)
                      setViewing(null)
                    }}
                    className="ml-auto p-2 rounded-full text-red-400 hover:bg-red-400/10"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <p className="text-[15px] leading-relaxed">{viewing.text}</p>
              <p className="text-xs text-ink2 mt-2">Expires in 24h</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
