'use client'

import { useState, useEffect, useCallback } from 'react'
import Sidebar from '@/components/Sidebar'
import EmailList from '@/components/EmailList'
import EmailView from '@/components/EmailView'
import ComposeWindow from '@/components/ComposeWindow'
import LinkAccountModal from '@/components/LinkAccountModal'
import AuthPage from '@/components/AuthPage'

export interface EmailAccount {
  id: string
  provider: string
  email: string
  label?: string
}

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

export interface Email {
  id: string
  from: string
  fromEmail: string
  to: string
  subject: string
  body: string
  date: string
  read: boolean
  starred: boolean
  folder: string
  labels: string[]
}

const SEARCH_URL = process.env.NEXT_PUBLIC_SEARCH_URL || 'https://smart-thinker.vercel.app'
const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL || 'https://smart-thinker-docs.vercel.app'

export default function MailPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedFolder, setSelectedFolder] = useState('inbox')
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [emails, setEmails] = useState<Email[]>([])
  const [showCompose, setShowCompose] = useState(false)
  const [showLinkAccount, setShowLinkAccount] = useState(false)
  const [linkedAccounts, setLinkedAccounts] = useState<EmailAccount[]>([])
  const [activeAccount, setActiveAccount] = useState<EmailAccount | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEmails, setSelectedEmails] = useState<Set<string>>(new Set())
  const [composingTo, setComposingTo] = useState<string>('')
  const [composingSubject, setComposingSubject] = useState<string>('')

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me')
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const loadLinkedAccounts = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch('/api/email/link')
      if (res.ok) {
        const data = await res.json()
        setLinkedAccounts(data.accounts || [])
      }
    } catch {
      // ignore
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadLinkedAccounts()
    }
  }, [user, loadLinkedAccounts])

  const loadEmails = useCallback(async (folder?: string) => {
    if (!user) return
    try {
      const url = folder ? `/api/email/list?folder=${folder}` : '/api/email/list'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setEmails(data.emails || [])
      }
    } catch {
      setEmails([])
    }
  }, [user])

  useEffect(() => {
    if (user) {
      loadEmails(selectedFolder)
    }
  }, [user, selectedFolder, loadEmails])

  const filteredEmails = emails.filter((e) => {
    const matchesSearch = !searchQuery ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.body.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const toggleStar = (id: string) => {
    setEmails(emails.map((e) => e.id === id ? { ...e, starred: !e.starred } : e))
  }

  const toggleRead = (id: string) => {
    setEmails(emails.map((e) => e.id === id ? { ...e, read: true } : e))
    if (selectedEmail?.id === id) {
      setSelectedEmail({ ...selectedEmail, read: true })
    }
  }

  const deleteEmails = (ids: string[]) => {
    setEmails(emails.map((e) => ids.includes(e.id) ? { ...e, folder: 'trash' } : e))
    setSelectedEmails(new Set())
    if (selectedEmail && ids.includes(selectedEmail.id)) setSelectedEmail(null)
  }

  const handleCompose = (to?: string, subject?: string) => {
    setComposingTo(to || '')
    setComposingSubject(subject || '')
    setShowCompose(true)
  }

  const folderCounts = {
    inbox: emails.filter((e) => e.folder === 'inbox' && !e.read).length,
    starred: emails.filter((e) => e.starred).length,
    sent: emails.filter((e) => e.folder === 'sent').length,
    drafts: emails.filter((e) => e.folder === 'drafts').length,
    spam: emails.filter((e) => e.folder === 'spam').length,
    trash: emails.filter((e) => e.folder === 'trash').length,
  }

  const handleLogout = async () => {
    document.cookie = 'st-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    setUser(null)
    setLinkedAccounts([])
    setEmails([])
    setSelectedEmail(null)
  }

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-st-blue border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-st-gray">Loading Smart Thinker Mail...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <AuthPage onAuth={checkAuth} searchUrl={SEARCH_URL} />
  }

  return (
    <div className="h-screen flex flex-col bg-mail-bg">
      <header className="h-14 border-b border-st-border flex items-center px-4 gap-4 bg-white flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-3 w-[256px] flex-shrink-0">
          <div className="w-8 h-8 bg-st-blue rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
          </div>
          <span className="text-lg font-medium text-st-dark">Mail</span>
        </div>

        <div className="flex-1 max-w-[680px]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-st-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mail"
              className="w-full bg-st-light border border-st-border rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:border-st-blue focus:bg-white focus:shadow-sm transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <a href={SEARCH_URL} className="text-xs text-st-gray hover:text-st-dark px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Search
          </a>
          <a href={DOCS_URL} className="text-xs text-st-gray hover:text-st-dark px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors font-medium">
            Docs
          </a>
          <div className="w-px h-5 bg-st-border mx-2" />
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            title="Sign out"
          >
            <div className="w-8 h-8 bg-st-blue rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.username[0].toUpperCase()}
            </div>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedFolder={selectedFolder}
          onSelectFolder={(folder) => {
            setSelectedFolder(folder)
            setSelectedEmail(null)
          }}
          onCompose={() => handleCompose()}
          folderCounts={folderCounts}
          linkedAccounts={linkedAccounts}
          onLinkAccount={() => setShowLinkAccount(true)}
          onSelectAccount={setActiveAccount}
          activeAccount={activeAccount}
          user={user}
        />

        <div className="flex flex-1 overflow-hidden">
          <EmailList
            emails={filteredEmails}
            selectedEmail={selectedEmail}
            onSelectEmail={(email) => {
              setSelectedEmail(email)
              toggleRead(email.id)
            }}
            onToggleStar={toggleStar}
            onDelete={deleteEmails}
            selectedEmails={selectedEmails}
            onToggleSelect={(id) => {
              if (id === '__clear__') {
                setSelectedEmails(new Set())
              } else {
                const next = new Set(selectedEmails)
                next.has(id) ? next.delete(id) : next.add(id)
                setSelectedEmails(next)
              }
            }}
            folder={selectedFolder}
          />

          {selectedEmail ? (
            <EmailView
              email={selectedEmail}
              onBack={() => setSelectedEmail(null)}
              onReply={() => handleCompose(selectedEmail.fromEmail, `Re: ${selectedEmail.subject}`)}
              onForward={() => handleCompose('', `Fwd: ${selectedEmail.subject}`)}
              onDelete={() => deleteEmails([selectedEmail.id])}
              onToggleStar={() => toggleStar(selectedEmail.id)}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center bg-white">
              <div className="text-center fade-in">
                <svg className="w-24 h-24 mx-auto text-st-border mb-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <p className="text-lg text-st-gray font-medium">Select an email to read</p>
                <p className="text-sm text-st-gray/70 mt-1">or compose a new one</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCompose && (
        <ComposeWindow
          onClose={() => {
            setShowCompose(false)
            setComposingTo('')
            setComposingSubject('')
          }}
          accounts={linkedAccounts}
          activeAccount={activeAccount}
          initialTo={composingTo}
          initialSubject={composingSubject}
        />
      )}

      {showLinkAccount && (
        <LinkAccountModal
          onClose={() => setShowLinkAccount(false)}
          onLinked={(account) => {
            setLinkedAccounts([...linkedAccounts, account])
            setShowLinkAccount(false)
          }}
        />
      )}
    </div>
  )
}
