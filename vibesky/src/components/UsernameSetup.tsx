import { useState, type FormEvent } from 'react'
import { Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { claimUsername, handleExists } from '../lib/db'

const HANDLE_RE = /^[a-z0-9_]{3,30}$/i

export default function UsernameSetup() {
  const { user } = useAuth()
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!HANDLE_RE.test(username.trim())) {
      setError('Username must be 3-30 characters (letters, numbers, underscore).')
      return
    }
    setBusy(true)
    setError('')
    if (await handleExists(username.trim())) {
      setError('That username is already taken.')
      setBusy(false)
      return
    }
    await claimUsername(user.uid, username.trim())
    setBusy(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}>
      <div className="panel rounded-2xl w-full max-w-sm p-6 rise relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl opacity-30" style={{ background: 'linear-gradient(120deg,#ff7ac6,#8f5bff)' }} />
        <div className="relative">
          <div className="flex flex-col items-center mb-5">
            <div className="w-12 h-12 rounded-2xl brand-gradient flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold">Claim your username</h1>
            <p className="text-sm text-ink2 text-center mt-1">
              This was an early account. Pick a permanent username so you get your own profile page.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <label className="block text-xs text-ink2 mb-1">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
                required
                placeholder="your_username"
                autoFocus
                className="w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
                style={{ borderColor: 'var(--stroke)' }}
              />
              <p className="text-[11px] text-ink2 mt-1">Permanent — this will be your handle (@{username}) and profile URL.</p>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button type="submit" disabled={busy} className="btn-primary w-full rounded-xl py-2.5 text-sm disabled:opacity-50">
              {busy ? 'Saving…' : 'Claim username'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
