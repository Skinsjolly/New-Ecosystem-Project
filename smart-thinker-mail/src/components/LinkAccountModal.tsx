'use client'

import { useState, useEffect } from 'react'
import { X, Mail, Link2, Check, AlertCircle, Trash2 } from 'lucide-react'
import { EmailAccount } from '@/app/page'

declare global {
  interface Window {
    firebase: any
  }
}

interface LinkAccountModalProps {
  onClose: () => void
  onLinked: (account: EmailAccount) => void
}

export default function LinkAccountModal({ onClose, onLinked }: LinkAccountModalProps) {
  const [step, setStep] = useState<'choose' | 'google' | 'configure' | 'success'>('choose')
  const [provider, setProvider] = useState('')
  const [email, setEmail] = useState('')
  const [label, setLabel] = useState('')
  const [imapHost, setImapHost] = useState('')
  const [imapPort, setImapPort] = useState('993')
  const [smtpHost, setSmtpHost] = useState('')
  const [smtpPort, setSmtpPort] = useState('587')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [fbReady, setFbReady] = useState(false)

  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.firebase?.auth) setFbReady(true)
    }
    const id = setInterval(check, 200)
    setTimeout(() => clearInterval(id), 10000)
    check()
    return () => clearInterval(id)
  }, [])

  const handleGoogleSignIn = async () => {
    if (!window.firebase) {
      setError('Firebase SDK not loaded. Refresh the page.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const auth = window.firebase.auth()
      const provider = new window.firebase.auth.GoogleAuthProvider()
      provider.addScope('https://www.googleapis.com/auth/gmail.readonly')
      provider.addScope('https://www.googleapis.com/auth/gmail.send')
      provider.addScope('https://www.googleapis.com/auth/gmail.modify')
      provider.addScope('https://www.googleapis.com/auth/userinfo.email')
      provider.addScope('https://www.googleapis.com/auth/userinfo.profile')
      provider.setCustomParameters({ prompt: 'consent', access_type: 'offline' })

      const result = await auth.signInWithPopup(provider)
      const credential = result.credential
      const accessToken = credential?.accessToken
      if (!accessToken) {
        setError('Failed to get Google access token.')
        setLoading(false)
        return
      }

      const userEmail = result.additionalUserInfo?.profile?.email || result.user?.email
      const userName = result.additionalUserInfo?.profile?.name || result.user?.displayName || 'Gmail'

      const linkRes = await fetch('/api/email/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'google',
          email: userEmail,
          accessToken,
          label: userName,
        }),
      })

      if (!linkRes.ok) {
        const data = await linkRes.json()
        setError(data.error || 'Failed to link Gmail account.')
        setLoading(false)
        return
      }

      const linkData = await linkRes.json()
      onLinked(linkData.account)
      setLoading(false)
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setError('')
      } else {
        setError(err.message || 'Google sign-in failed.')
      }
      setLoading(false)
    }
  }

  const handleManualLink = async () => {
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/email/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          email,
          label: label || provider,
          imapHost,
          imapPort: parseInt(imapPort),
          smtpHost,
          smtpPort: parseInt(smtpPort),
          password,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to link account')
        setLoading(false)
        return
      }
      const data = await res.json()
      onLinked(data.account)
    } catch (err: any) {
      setError(err.message || 'Failed to link account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 modal-backdrop" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[480px] max-h-[90vh] overflow-hidden modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-st-border">
          <h2 className="text-lg font-medium text-st-dark">Link Email Account</h2>
          <button onClick={onClose} className="toolbar-btn">
            <X className="w-5 h-5 text-st-gray" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {step === 'choose' && (
            <div className="space-y-3">
              <p className="text-sm text-st-gray mb-4">Choose your email provider to link:</p>

              <button
                onClick={() => { setProvider('google'); setImapHost('imap.gmail.com'); setSmtpHost('smtp.gmail.com'); setStep('google') }}
                className="w-full flex items-center gap-4 p-4 border border-st-border rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-st-dark">Gmail (Google)</p>
                  <p className="text-xs text-st-gray">Sign in with Google to link your Gmail inbox</p>
                </div>
                <div className="ml-auto">
                  <Link2 className="w-4 h-4 text-st-gray" />
                </div>
              </button>

              <button
                onClick={() => { setProvider('microsoft'); setImapHost('outlook.office365.com'); setSmtpHost('smtp.office365.com'); setStep('configure') }}
                className="w-full flex items-center gap-4 p-4 border border-st-border rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24">
                  <rect x="1" y="1" width="10" height="10" fill="#F25022"/>
                  <rect x="13" y="1" width="10" height="10" fill="#7FBA00"/>
                  <rect x="1" y="13" width="10" height="10" fill="#00A4EF"/>
                  <rect x="13" y="13" width="10" height="10" fill="#FFB900"/>
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-st-dark">Outlook (Microsoft)</p>
                  <p className="text-xs text-st-gray">Link your Outlook account via IMAP/SMTP</p>
                </div>
                <div className="ml-auto">
                  <Link2 className="w-4 h-4 text-st-gray" />
                </div>
              </button>

              <button
                onClick={() => { setProvider('custom'); setStep('configure') }}
                className="w-full flex items-center gap-4 p-4 border border-st-border rounded-lg hover:bg-gray-50 hover:shadow-sm transition-all"
              >
                <div className="w-8 h-8 bg-st-light rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-st-gray" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium text-st-dark">Other (IMAP/SMTP)</p>
                  <p className="text-xs text-st-gray">Configure any email account manually</p>
                </div>
                <div className="ml-auto">
                  <Link2 className="w-4 h-4 text-st-gray" />
                </div>
              </button>
            </div>
          )}

          {step === 'google' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <h3 className="text-lg font-medium text-st-dark mb-2">Link your Gmail</h3>
                <p className="text-sm text-st-gray mb-6">
                  Sign in with Google to connect your Gmail inbox. You'll be able to read and send emails.
                </p>
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="google-btn w-full flex items-center justify-center gap-3 h-12"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-st-gray border-t-transparent rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      Sign in with Google
                    </>
                  )}
                </button>
              </div>

              <button onClick={() => setStep('choose')} className="w-full text-sm text-st-gray hover:text-st-dark text-center py-2">
                Back to providers
              </button>
            </div>
          )}

          {step === 'configure' && (
            <div className="space-y-4">
              <p className="text-sm text-st-gray">
                Configure your {provider === 'microsoft' ? 'Outlook' : 'email'} account:
              </p>

              <div>
                <label className="block text-sm font-medium text-st-dark mb-1.5">Email Address</label>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="auth-input"
                  placeholder="your-email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-st-dark mb-1.5">Password / App Password</label>
                <input
                  type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="auth-input"
                  placeholder="Enter password or app-specific password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-st-dark mb-1.5">Label (optional)</label>
                <input
                  type="text" value={label} onChange={(e) => setLabel(e.target.value)}
                  className="auth-input"
                  placeholder="e.g., Work Email"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-st-gray mb-1">IMAP Host</label>
                  <input type="text" value={imapHost} onChange={(e) => setImapHost(e.target.value)}
                    className="auth-input" />
                </div>
                <div>
                  <label className="block text-xs text-st-gray mb-1">IMAP Port</label>
                  <input type="text" value={imapPort} onChange={(e) => setImapPort(e.target.value)}
                    className="auth-input" />
                </div>
                <div>
                  <label className="block text-xs text-st-gray mb-1">SMTP Host</label>
                  <input type="text" value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)}
                    className="auth-input" />
                </div>
                <div>
                  <label className="block text-xs text-st-gray mb-1">SMTP Port</label>
                  <input type="text" value={smtpPort} onChange={(e) => setSmtpPort(e.target.value)}
                    className="auth-input" />
                </div>
              </div>

              {provider === 'microsoft' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                  <p className="font-medium mb-1">Outlook Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Enable 2-Factor Authentication on your Microsoft account</li>
                    <li>Go to Account Security → App passwords</li>
                    <li>Generate an app password and use it above</li>
                  </ol>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button onClick={() => setStep('choose')} className="px-4 py-2.5 text-sm border border-st-border rounded-lg hover:bg-gray-50 transition-colors">
                  Back
                </button>
                <button
                  onClick={handleManualLink}
                  disabled={!email || !password || loading}
                  className="flex-1 bg-st-blue text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {loading ? 'Linking...' : 'Link Account'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}