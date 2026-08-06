'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Search, Mail, FileText, Presentation, Sheet, MessageCircle, LogOut, ChevronDown, Sun, Moon, Menu, X, MessageSquare, ExternalLink, Rocket } from 'lucide-react'
import { useTheme } from '@/lib/ThemeContext'

declare global {
  interface Window {
    firebase: any
  }
}

interface UserData {
  id: string
  username: string
  email: string
  avatar?: string
}

const ECOSYSTEM_APPS = [
  { name: 'Search', href: '/', icon: Search },
  { name: 'Chat', href: process.env.NEXT_PUBLIC_CHAT_URL || 'http://localhost:3005', icon: MessageCircle },
  { name: 'Messenger', href: 'https://messenger-app-two-mu.vercel.app', icon: MessageSquare },
  { name: 'Mail', href: process.env.NEXT_PUBLIC_MAIL_URL || 'http://localhost:3001', icon: Mail },
  { name: 'Docs', href: process.env.NEXT_PUBLIC_DOCS_URL || 'http://localhost:3002', icon: FileText },
  { name: 'Slides', href: process.env.NEXT_PUBLIC_SLIDES_URL || 'http://localhost:3003', icon: Presentation },
  { name: 'Sheets', href: process.env.NEXT_PUBLIC_SHEETS_URL || 'http://localhost:3004', icon: Sheet },
  { name: 'VibeSky', href: 'https://vibesky-5pf.pages.dev', icon: Rocket, img: '/vibesky.png' },
]

const THIRD_PARTY_APPS = [
  { name: 'Porel Ai', href: 'https://porel.up.railway.app/porel', icon: ExternalLink, favicon: 'https://porel.up.railway.app/fav_icon.png' },
]

function getFirebaseAuth(): any {
  if (typeof window !== 'undefined' && window.firebase) {
    return window.firebase.auth()
  }
  return null
}

async function googleSignIn(): Promise<{ email: string; username: string; googleId: string; avatar: string }> {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase not initialized')

  const provider = new window.firebase.auth.GoogleAuthProvider()
  const result = await auth.signInWithPopup(provider)
  const u = result.user

  return {
    email: u.email || '',
    username: u.displayName || u.email?.split('@')[0] || '',
    googleId: u.uid,
    avatar: u.photoURL || '',
  }
}

export default function Navbar() {
  const { theme, toggleTheme } = useTheme()
  const [user, setUser] = useState<UserData | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showEcosystem, setShowEcosystem] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const ecoRef = useRef<HTMLDivElement>(null)
  const mobileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const token = document.cookie.split('; ').find(c => c.startsWith('st-token='))
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token.split('=')[1]}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.user) setUser(data.user)
        })
        .catch(() => {})
    }
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false)
      if (ecoRef.current && !ecoRef.current.contains(e.target as Node)) setShowEcosystem(false)
      if (mobileRef.current && !mobileRef.current.contains(e.target as Node)) setMobileOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleGoogleSignIn = async () => {
    try {
      const googleData = await googleSignIn()
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googleData),
      })
      const data = await res.json()
      if (res.ok && data.user) {
        setUser(data.user)
        window.location.reload()
      }
    } catch (err: any) {
      console.error('Google sign-in failed:', err.message)
    }
  }

  const logout = () => {
    const auth = getFirebaseAuth()
    if (auth) auth.signOut().catch(() => {})
    document.cookie = 'st-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    setUser(null)
    setShowMenu(false)
    window.location.href = '/'
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 h-14 z-50 glass border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex items-center justify-between h-full px-4 max-w-[1440px] mx-auto">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-1 shrink-0">
            <span className="text-xl font-normal text-transparent bg-clip-text bg-gradient-to-r from-st-blue via-st-green to-st-red select-none">
              Smart Thinker
            </span>
          </Link>

          <div className="relative hidden sm:block" ref={ecoRef}>
            <button
              onClick={() => setShowEcosystem(!showEcosystem)}
              className="flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-colors"
              style={{ color: 'var(--text-secondary)' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              Ecosystem
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showEcosystem ? 'rotate-180' : ''}`} />
            </button>
            {showEcosystem && (
              <div
                className="absolute top-full left-0 mt-1 border rounded-lg shadow-lg py-1.5 w-[200px] animate-scale-in"
                style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
              >
                {ECOSYSTEM_APPS.map(app => {
                  const Icon = app.icon
                  return (
                    <Link
                      key={app.name}
                      href={app.href}
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowEcosystem(false)}
                    >
                      {app.img ? (
                        <img src={app.img} alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
                      ) : (
                        <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      )}
                      {app.name}
                    </Link>
                  )
                })}
                <hr style={{ borderColor: 'var(--border)' }} className="my-1.5 mx-3" />
                <p className="px-4 py-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                  Third-Party
                </p>
                {THIRD_PARTY_APPS.map(app => {
                  const Icon = app.icon
                  return (
                    <a
                      key={app.name}
                      href={app.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-4 py-2 text-sm transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      onClick={() => setShowEcosystem(false)}
                    >
                      {app.favicon ? (
                        <img src={app.favicon} alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
                      ) : (
                        <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                      )}
                      {app.name}
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <div className="hidden sm:flex items-center gap-2" ref={menuRef}>
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium hover:shadow-md transition-shadow overflow-hidden"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                  ) : (
                    user.username[0].toUpperCase()
                  )}
                </button>
                {showMenu && (
                  <div
                    className="absolute top-full right-0 mt-1 border rounded-lg shadow-lg py-1.5 w-[240px] animate-scale-in"
                    style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
                  >
                    <div
                      className="px-4 py-2.5 border-b"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-3 px-4 py-2 text-sm w-full text-left transition-colors"
                      style={{ color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  onClick={handleGoogleSignIn}
                  className="flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors border"
                  style={{
                    color: 'var(--text-primary)',
                    borderColor: 'var(--border)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in
                </button>
                <Link
                  href="/auth/signup"
                  className="text-sm px-4 py-1.5 rounded-full transition-colors"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            className="sm:hidden w-9 h-9 flex items-center justify-center rounded-full transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          ref={mobileRef}
          className="sm:hidden border-t animate-slide-up"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
        >
          <div className="px-4 py-3 space-y-1">
            {ECOSYSTEM_APPS.map(app => {
              const Icon = app.icon
              return (
                <Link
                  key={app.name}
                  href={app.href}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setMobileOpen(false)}
                >
                  {app.img ? (
                    <img src={app.img} alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
                  ) : (
                    <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  )}
                  {app.name}
                </Link>
              )
            })}
            <p className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
              Third-Party
            </p>
            {THIRD_PARTY_APPS.map(app => {
              const Icon = app.icon
              return (
                <a
                  key={app.name}
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => setMobileOpen(false)}
                >
                  {app.favicon ? (
                    <img src={app.favicon} alt="" className="w-4 h-4 rounded-sm object-contain" loading="lazy" />
                  ) : (
                    <Icon className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                  )}
                  {app.name}
                </a>
              )
            })}
            <hr style={{ borderColor: 'var(--border)' }} className="my-2" />
            {user ? (
              <div className="px-3 py-2 space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
                    style={{ background: 'var(--accent)', color: '#fff' }}
                  >
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      user.username[0].toUpperCase()
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { logout(); setMobileOpen(false) }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="px-3 py-2 space-y-2">
                <button
                  onClick={() => { handleGoogleSignIn(); setMobileOpen(false) }}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm w-full text-left transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Sign in with Google
                </button>
                <Link
                  href="/auth/signup"
                  className="flex items-center justify-center px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: 'var(--accent)', color: '#fff' }}
                  onClick={() => setMobileOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
