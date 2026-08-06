import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { ensureProfile, subscribeUser } from '../lib/db'
import type { Profile } from '../types'

type AuthCtx = {
  user: User | null
  profile: Profile | null
  loading: boolean
}

const Ctx = createContext<AuthCtx>({ user: null, profile: null, loading: true })

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        await ensureProfile(u.uid, u.email ?? '')
        const unsubProfile = subscribeUser(u.uid, setProfile)
        setLoading(false)
        return () => {
          unsubProfile()
        }
      }
      setProfile(null)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  return <Ctx.Provider value={{ user, profile, loading }}>{children}</Ctx.Provider>
}

export function useAuth() {
  return useContext(Ctx)
}
