'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText, Plus, PanelLeftClose, PanelLeft, Download, FileCode, LogOut,
  ChevronDown, Loader2, AlertCircle
} from 'lucide-react'
import DocumentList from '@/components/DocumentList'
import DocEditor from '@/components/DocEditor'

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export interface Document {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

const URLS = {
  search: process.env.NEXT_PUBLIC_SEARCH_URL || 'http://localhost:3000',
  mail: process.env.NEXT_PUBLIC_MAIL_URL || 'http://localhost:3001',
  main: process.env.NEXT_PUBLIC_MAIN_URL || 'http://localhost:3000',
}

export default function DocsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState<Document[]>([])
  const [activeDoc, setActiveDoc] = useState<Document | null>(null)
  const [showSidebar, setShowSidebar] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<string>('')
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login')
  const [authForm, setAuthForm] = useState({ email: '', password: '', username: '' })
  const [authError, setAuthError] = useState('')
  const [authLoading, setAuthLoading] = useState(false)
  const [exportMenuOpen, setExportMenuOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkAuth()
  }, [])

  useEffect(() => {
    if (user) {
      fetchDocuments()
    }
  }, [user])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch {}
    setLoading(false)
  }

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/docs')
      if (res.ok) {
        const data = await res.json()
        const docs = data.documents.map((d: any) => ({
          ...d,
          content: d.content || '<p></p>',
        }))
        setDocuments(docs)
        if (docs.length > 0 && !activeDoc) {
          const fullRes = await fetch(`/api/docs/${docs[0].id}`)
          if (fullRes.ok) {
            const fullData = await fullRes.json()
            setActiveDoc({
              ...fullData.document,
              content: fullData.document.content || '<p></p>',
            })
          }
        }
      }
    } catch {}
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const body = authMode === 'signup'
        ? { email: authForm.email, password: authForm.password, username: authForm.username }
        : { email: authForm.email, password: authForm.password }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed')
        return
      }

      setUser(data.user)
      setAuthForm({ email: '', password: '', username: '' })
    } catch {
      setAuthError('Network error. Please try again.')
    }
    setAuthLoading(false)
  }

  const handleGoogleLogin = async () => {
    try {
      const google = (window as any).google
      if (!google) {
        setAuthError('Google Sign-in is loading. Please try again.')
        return
      }

      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
        callback: async (response: any) => {
          try {
            const res = await fetch('/api/auth/google', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ credential: response.credential }),
            })

            const data = await res.json()
            if (!res.ok) {
              setAuthError(data.error || 'Google sign-in failed')
              return
            }

            setUser(data.user)
          } catch {
            setAuthError('Network error during Google sign-in')
          }
        },
      })

      google.accounts.id.prompt()
    } catch {
      setAuthError('Google Sign-in is not available')
    }
  }

  const handleLogout = async () => {
    document.cookie = 'st-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    setUser(null)
    setDocuments([])
    setActiveDoc(null)
  }

  const saveDoc = useCallback((doc: Document) => {
    setSaving(true)
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch(`/api/docs/${doc.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: doc.title, content: doc.content }),
        })
        setSaving(false)
        setLastSaved(new Date().toLocaleTimeString())
      } catch {
        setSaving(false)
      }
    }, 1000)
  }, [])

  const createDoc = async () => {
    try {
      const res = await fetch('/api/docs', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        const newDoc: Document = {
          ...data.document,
          content: data.document.content || '<p></p>',
        }
        setDocuments((prev) => [newDoc, ...prev])
        setActiveDoc(newDoc)
      }
    } catch {}
  }

  const deleteDoc = async (id: string) => {
    try {
      await fetch(`/api/docs/${id}`, { method: 'DELETE' })
      setDocuments((prev) => prev.filter((d) => d.id !== id))
      if (activeDoc?.id === id) {
        const remaining = documents.filter((d) => d.id !== id)
        if (remaining.length > 0) {
          const fullRes = await fetch(`/api/docs/${remaining[0].id}`)
          if (fullRes.ok) {
            const fullData = await fullRes.json()
            setActiveDoc({
              ...fullData.document,
              content: fullData.document.content || '<p></p>',
            })
          }
        } else {
          setActiveDoc(null)
        }
      }
    } catch {}
  }

  const renameDoc = async (id: string, title: string) => {
    setDocuments((prev) => prev.map((d) => (d.id === id ? { ...d, title } : d)))
    if (activeDoc?.id === id) {
      setActiveDoc((prev) => (prev ? { ...prev, title } : prev))
    }
    try {
      await fetch(`/api/docs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      })
    } catch {}
  }

  const selectDoc = async (doc: Document) => {
    if (activeDoc?.id === doc.id) return
    try {
      const res = await fetch(`/api/docs/${doc.id}`)
      if (res.ok) {
        const data = await res.json()
        setActiveDoc({
          ...data.document,
          content: data.document.content || '<p></p>',
        })
      }
    } catch {
      setActiveDoc(doc)
    }
    setLastSaved('')
  }

  const exportDoc = (format: 'html' | 'text') => {
    if (!activeDoc) return
    setExportMenuOpen(false)
    if (format === 'html') {
      const fullHtml = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${activeDoc.title}</title>
<style>body{font-family:Arial,sans-serif;max-width:816px;margin:40px auto;padding:0 24px;line-height:1.75;color:#202124}
h1{font-size:2em;margin:0.5em 0}h2{font-size:1.5em;margin:0.5em 0}h3{font-size:1.25em;margin:0.5em 0}
blockquote{border-left:3px solid #4285F4;padding-left:16px;color:#5f6368;font-style:italic}
pre{background:#f1f3f4;padding:12px 16px;border-radius:8px;overflow-x:auto}
code{background:#f1f3f4;padding:2px 4px;border-radius:3px;font-size:0.9em}
table{border-collapse:collapse;width:100%}td,th{border:1px solid #dadce0;padding:8px 12px}
img{max-width:100%;height:auto}</style></head>
<body>${activeDoc.content}</body></html>`
      const blob = new Blob([fullHtml], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeDoc.title}.html`
      a.click()
      URL.revokeObjectURL(url)
    } else {
      const temp = document.createElement('div')
      temp.innerHTML = activeDoc.content
      const text = temp.textContent || temp.innerText
      const blob = new Blob([text], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeDoc.title}.txt`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // ========== LOADING STATE ==========
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-st-light">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-st-blue animate-spin" />
          <p className="text-sm text-st-gray">Loading Smart Thinker Docs...</p>
        </div>
      </div>
    )
  }

  // ========== LANDING / AUTH PAGE ==========
  if (!user) {
    return (
      <div className="min-h-screen landing-bg flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm mb-4">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Smart Thinker Docs</h1>
            <p className="text-white/70 text-sm">Professional document editing, powered by Smart Thinker</p>
          </div>

          <div className="glass-card p-8">
            <h2 className="text-xl font-semibold text-white mb-6 text-center">
              {authMode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>

            {authError && (
              <div className="flex items-center gap-2 p-3 mb-4 bg-red-500/20 border border-red-300/30 rounded-lg text-red-100 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {authError}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              className="google-btn mb-4"
            >
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-white/50 text-xs">or</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <form onSubmit={handleLogin} className="space-y-3">
              {authMode === 'signup' && (
                <input
                  type="text"
                  placeholder="Username"
                  value={authForm.username}
                  onChange={(e) => setAuthForm({ ...authForm, username: e.target.value })}
                  className="auth-input"
                  required
                />
              )}
              <input
                type="email"
                placeholder="Email address"
                value={authForm.email}
                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                className="auth-input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={authForm.password}
                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                className="auth-input"
                required
                minLength={6}
              />
              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-2.5 bg-st-blue text-white rounded-lg font-medium text-sm hover:bg-st-blue-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : authMode === 'login' ? (
                  'Sign in'
                ) : (
                  'Create account'
                )}
              </button>
            </form>

            <p className="text-center mt-4 text-sm text-white/60">
              {authMode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login')
                  setAuthError('')
                }}
                className="text-white font-medium hover:underline"
              >
                {authMode === 'login' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>

          <p className="text-center text-white/40 text-xs mt-6">
            Part of the Smart Thinker Ecosystem
          </p>
        </div>
      </div>
    )
  }

  // ========== MAIN APP ==========
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Top bar */}
      <header className="h-12 border-b border-st-border flex items-center px-3 gap-3 flex-shrink-0 bg-white z-20">
        <a href={URLS.main} className="flex items-center gap-2 text-st-gray hover:text-st-dark transition-colors">
          <FileText className="w-5 h-5 text-st-blue" />
          <span className="text-sm font-medium hidden sm:inline">Docs</span>
        </a>

        <div className="w-px h-5 bg-st-border mx-1" />

        {activeDoc && (
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <input
              type="text"
              value={activeDoc.title}
              onChange={(e) => {
                const title = e.target.value
                setActiveDoc((prev) => (prev ? { ...prev, title } : prev))
                if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
                saveTimerRef.current = setTimeout(() => renameDoc(activeDoc.id, title), 800)
              }}
              className="text-base font-normal text-st-dark bg-transparent outline-none border-b border-transparent hover:border-st-border focus:border-st-blue px-1 py-0.5 truncate max-w-[300px] transition-colors"
            />
            <span className="text-xs text-st-light-gray whitespace-nowrap flex-shrink-0">
              {saving ? (
                <span className="flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              ) : lastSaved ? (
                `Saved ${lastSaved}`
              ) : null}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <a href={URLS.search} className="text-xs text-st-gray hover:text-st-dark px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">Search</a>
          <a href={URLS.mail} className="text-xs text-st-gray hover:text-st-dark px-2 py-1.5 rounded-md hover:bg-gray-100 transition-colors">Mail</a>

          <div className="w-px h-5 bg-st-border mx-1" />

          {/* Export */}
          {activeDoc && (
            <div ref={exportRef} className="relative">
              <button
                onClick={() => setExportMenuOpen(!exportMenuOpen)}
                className="toolbar-btn flex items-center gap-1 text-xs"
                title="Export"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
              {exportMenuOpen && (
                <div className="context-menu top-full right-0 mt-1">
                  <button onClick={() => exportDoc('html')} className="context-menu-item">
                    <FileCode className="w-4 h-4" /> Export as HTML
                  </button>
                  <button onClick={() => exportDoc('text')} className="context-menu-item">
                    <FileText className="w-4 h-4" /> Export as Text
                  </button>
                </div>
              )}
            </div>
          )}

          {/* User menu */}
          <div className="flex items-center gap-2 ml-1">
            {user.avatar ? (
              <img src={user.avatar} alt="" className="w-7 h-7 rounded-full" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-st-blue text-white flex items-center justify-center text-xs font-medium">
                {user.username[0].toUpperCase()}
              </div>
            )}
            <button
              onClick={handleLogout}
              className="toolbar-btn"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`sidebar ${!showSidebar ? 'collapsed' : ''}`}>
          <DocumentList
            documents={documents}
            activeDoc={activeDoc}
            onSelect={selectDoc}
            onCreate={createDoc}
            onDelete={deleteDoc}
            onRename={renameDoc}
          />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-toolbar with sidebar toggle */}
          <div className="h-10 border-b border-st-border flex items-center px-2 gap-1 flex-shrink-0 bg-white">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="toolbar-btn"
              title={showSidebar ? 'Hide sidebar' : 'Show sidebar'}
            >
              {showSidebar ? (
                <PanelLeftClose className="w-4 h-4" />
              ) : (
                <PanelLeft className="w-4 h-4" />
              )}
            </button>
            {activeDoc && (
              <span className="text-xs text-st-light-gray ml-2">
                {documents.find((d) => d.id === activeDoc.id) ? '' : ''}
              </span>
            )}
          </div>

          {activeDoc ? (
            <DocEditor
              document={activeDoc}
              onUpdate={(content) => {
                const updated = { ...activeDoc, content }
                setActiveDoc(updated)
                saveDoc(updated)
              }}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-st-light">
              <div className="text-center animate-fade-in">
                <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                  <FileText className="w-10 h-10 text-st-blue" />
                </div>
                <p className="text-lg font-medium text-st-dark mb-1">No document selected</p>
                <p className="text-sm text-st-gray mb-4">Select a document from the sidebar or create a new one</p>
                <button
                  onClick={createDoc}
                  className="inline-flex items-center gap-2 bg-st-blue text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-st-blue-hover transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
