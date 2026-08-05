'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { initFirebase, signInWithGooglePopup, signOutFirebase } from '@/lib/firebase'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInWithGoogle: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
})

export function useAuth() {
  return useContext(AuthContext)
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
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
    }
  }, [])

  useEffect(() => {
    initFirebase()
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const signInWithGoogle = async () => {
    try {
      const { idToken } = await signInWithGooglePopup()
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      }
    } catch (err) {
      console.error('Google sign-in failed:', err)
    }
  }

  const logout = async () => {
    try {
      await signOutFirebase()
    } catch {}
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
