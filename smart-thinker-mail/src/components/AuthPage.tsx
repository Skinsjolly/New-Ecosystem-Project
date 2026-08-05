'use client'

import { useState } from 'react'
import { Mail, ArrowRight, Eye, EyeOff } from 'lucide-react'

declare global {
  interface Window {
    firebase: any
  }
}

interface AuthPageProps {
  onAuth: () => void
  searchUrl: string
}

export default function AuthPage({ onAuth, searchUrl }: AuthPageProps) {
  const [mode, setMode] = useState<'landing' | 'login' | 'signup'>('landing')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Login failed')
        setLoading(false)
        return
      }
      onAuth()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Signup failed')
        setLoading(false)
        return
      }
      onAuth()
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    if (!window.firebase) {
      setError('Firebase SDK not loaded. Refresh the page.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const auth = window.firebase.auth()
      const provider = new window.firebase.auth.GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const result = await auth.signInWithPopup(provider)
      const u = result.user
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: u.email || '',
          username: u.displayName || u.email?.split('@')[0] || 'user',
          googleId: u.uid,
          avatar: u.photoURL || '',
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Google auth failed')
        setLoading(false)
        return
      }
      onAuth()
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('')
      } else {
        setError(err.message || 'Google sign-in failed')
      }
      setLoading(false)
    }
  }

  if (mode === 'landing') {
    return (
      <div className="h-screen flex bg-white">
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-st-blue via-blue-500 to-blue-600 items-center justify-center p-12">
          <div className="text-center text-white max-w-md">
            <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8">
              <Mail className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Smart Thinker Mail</h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              A unified email client that links your Gmail and other accounts. Part of the Smart Thinker ecosystem.
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-md fade-in">
            <div className="lg:hidden flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-st-blue rounded-xl flex items-center justify-center">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-medium text-st-dark">Smart Thinker Mail</span>
            </div>

            <h2 className="text-3xl font-bold text-st-dark mb-3">Welcome to Mail</h2>
            <p className="text-st-gray mb-8 leading-relaxed">
              Sign in with your Smart Thinker account or create a new one to get started.
            </p>

            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 google-btn py-3.5 mb-4"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-st-gray border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-st-border" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs text-st-gray">or</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => setMode('login')}
                className="w-full flex items-center justify-center gap-3 bg-st-blue text-white py-3.5 rounded-xl text-sm font-medium hover:bg-blue-600 hover:shadow-lg hover:shadow-st-blue/25 transition-all active:scale-[0.98]"
              >
                Sign in with email
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMode('signup')}
                className="w-full flex items-center justify-center gap-3 border-2 border-st-border text-st-dark py-3.5 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-[0.98]"
              >
                Create new account
              </button>
            </div>

            <p className="text-xs text-st-gray text-center mt-8 leading-relaxed">
              By continuing, you agree to our Terms of Service.
              <br />
              Your credentials are shared across all Smart Thinker apps.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-white">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-st-blue via-blue-500 to-blue-600 items-center justify-center p-12">
        <div className="text-center text-white max-w-md">
          <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-8">
            <Mail className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Smart Thinker Mail</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            A unified email client that links your Gmail and other accounts. Part of the Smart Thinker ecosystem.
          </p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md fade-in">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-st-blue rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-medium text-st-dark">Smart Thinker Mail</span>
          </div>

          <button
            onClick={() => { setMode('landing'); setError(''); setEmail(''); setUsername(''); setPassword('') }}
            className="text-sm text-st-gray hover:text-st-dark mb-6 flex items-center gap-1"
          >
            &larr; Back
          </button>

          <h2 className="text-2xl font-bold text-st-dark mb-2">
            {mode === 'login' ? 'Sign in' : 'Create account'}
          </h2>
          <p className="text-st-gray mb-6">
            {mode === 'login'
              ? 'Sign in with your Smart Thinker credentials'
              : 'Create a Smart Thinker account to get started'}
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 google-btn py-3 mb-6"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-st-gray border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                {mode === 'login' ? 'Sign in with Google' : 'Sign up with Google'}
              </>
            )}
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-st-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-st-gray">or use email</span>
            </div>
          </div>

          <form onSubmit={mode === 'login' ? handleLogin : handleSignup} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-st-dark mb-1.5">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="auth-input"
                  placeholder="Choose a username"
                  required
                  minLength={3}
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-st-dark mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="auth-input"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-st-dark mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="auth-input pr-10"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-st-gray hover:text-st-dark"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-st-blue text-white py-3 rounded-xl text-sm font-medium hover:bg-blue-600 hover:shadow-lg hover:shadow-st-blue/25 disabled:opacity-50 transition-all active:scale-[0.98]"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </div>
              ) : (
                mode === 'login' ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-st-gray">
              {mode === 'login' ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button onClick={() => { setMode('signup'); setError('') }} className="text-st-blue hover:underline font-medium">Sign up</button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button onClick={() => { setMode('login'); setError('') }} className="text-st-blue hover:underline font-medium">Sign in</button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}