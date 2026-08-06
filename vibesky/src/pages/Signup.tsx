import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { createProfile, handleExists } from '../lib/db'

const HANDLE_RE = /^[a-z0-9_]{3,30}$/i

export default function Signup() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!HANDLE_RE.test(username.trim())) {
      setError('Username must be 3-30 characters (letters, numbers, underscore). It cannot be changed later.')
      return
    }
    if (!displayName.trim()) {
      setError('Please add a display name.')
      return
    }
    setBusy(true)
    setError('')
    try {
      if (await handleExists(username.trim())) {
        setError('That username is already taken.')
        setBusy(false)
        return
      }
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password)
      await createProfile(cred.user.uid, username.trim(), displayName.trim())
      navigate('/')
    } catch (err: any) {
      setError(err?.code === 'auth/email-already-in-use' ? 'That email is already registered.' : 'Could not create your account.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-30" style={{ background: 'linear-gradient(120deg,#ff7ac6,#8f5bff)' }} />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25" style={{ background: 'linear-gradient(120deg,#4dd0ff,#8f5bff)' }} />
      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl brand-gradient flex items-center justify-center mb-3">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight brand-text">Aurora</h1>
          <p className="text-ink2 text-sm mt-1">Find your light.</p>
        </div>
        <form onSubmit={submit} className="panel rounded-2xl p-6 space-y-4 rise">
          <h2 className="font-bold text-lg">Create your account</h2>
          <div>
            <label className="block text-xs text-ink2 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" style={{ borderColor: 'var(--stroke)' }} />
          </div>
          <div>
            <label className="block text-xs text-ink2 mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" style={{ borderColor: 'var(--stroke)' }} />
            <p className="text-[11px] text-ink2 mt-1">At least 6 characters.</p>
          </div>
          <div>
            <label className="block text-xs text-ink2 mb-1">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value.replace(/\s/g, '_'))}
              required
              placeholder="your_username"
              className="w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent"
              style={{ borderColor: 'var(--stroke)' }}
            />
            <p className="text-[11px] text-ink2 mt-1">Permanent — this is your handle (@{username}). It cannot be changed.</p>
          </div>
          <div>
            <label className="block text-xs text-ink2 mb-1">Display name</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required placeholder="Your name" className="w-full bg-transparent border rounded-xl px-4 py-2.5 text-sm outline-none focus:border-accent" style={{ borderColor: 'var(--stroke)' }} />
            <p className="text-[11px] text-ink2 mt-1">Shown on your profile and posts — you can edit this anytime.</p>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" disabled={busy} className="btn-primary w-full rounded-xl py-2.5 text-sm disabled:opacity-50">
            {busy ? 'Creating…' : 'Sign up'}
          </button>
          <p className="text-center text-sm text-ink2">
            Already have an account?{' '}
            <Link to="/login" className="text-accent font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
