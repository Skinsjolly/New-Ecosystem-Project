import { useEffect, useState } from 'react'
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom'
import { Home, Compass, Bell, LogOut, Sparkles } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'
import { subscribeNotifications } from '../lib/db'
import Avatar from './Avatar'
import UsernameSetup from './UsernameSetup'

const nav = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/search', label: 'Explore', icon: Compass },
  { to: '/notifications', label: 'Alerts', icon: Bell, badge: true }
]

export default function Layout() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!profile) return
    const unsub = subscribeNotifications(profile.uid, (items) => {
      setUnread(items.filter((i) => !i.read).length)
    })
    return unsub
  }, [profile])

  async function logout() {
    await signOut(auth)
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl border-b" style={{ background: 'rgba(13,11,20,0.8)', borderColor: 'var(--stroke)' }}>
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
            <span className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </span>
            <span className="brand-text">Aurora</span>
          </Link>

          <nav className="hidden sm:flex items-center gap-1">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className="relative flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-colors"
                style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--ink-2)' })}
              >
                <item.icon className="w-[18px] h-[18px]" />
                <span className="hidden md:inline">{item.label}</span>
                {item.badge && unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">
                    {unread}
                  </span>
                )}
              </NavLink>
            ))}
            {profile && (
              <NavLink
                to={`/${profile.handle}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
                style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--ink-2)' })}
              >
                <Avatar src={profile.avatarUrl} name={profile.name} size={28} />
                <span className="hidden md:inline">Profile</span>
              </NavLink>
            )}
          </nav>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 rounded-full text-sm text-ink2 hover:text-ink transition-colors"
            title="Sign out"
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6">
        <Outlet />
      </main>

      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t backdrop-blur-xl" style={{ background: 'rgba(22,18,31,0.92)', borderColor: 'var(--stroke)' }}>
        <div className="flex items-center justify-around h-16">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className="relative flex flex-col items-center gap-0.5 text-xs"
              style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--ink-2)' })}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
              {item.badge && unread > 0 && (
                <span className="absolute -top-1 right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">
                  {unread}
                </span>
              )}
            </NavLink>
          ))}
          {profile && (
            <NavLink
              to={`/${profile.handle}`}
              className="relative flex flex-col items-center gap-0.5 text-xs"
              style={({ isActive }) => ({ color: isActive ? 'var(--accent)' : 'var(--ink-2)' })}
            >
              <Avatar src={profile.avatarUrl} name={profile.name} size={20} />
              Me
            </NavLink>
          )}
        </div>
      </nav>

      {profile && !profile.usernameSet && <UsernameSetup />}
    </div>
  )
}
