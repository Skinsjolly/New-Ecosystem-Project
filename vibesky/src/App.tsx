import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Feed from './pages/Feed'
import PostDetail from './pages/PostDetail'
import Profile from './pages/Profile'
import Notifications from './pages/Notifications'
import Search from './pages/Search'

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

function Splash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl brand-gradient animate-pulse" />
      <p className="text-ink2 text-sm">Taking off…</p>
    </div>
  )
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return <Splash />
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" replace /> : <Signup />} />
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/" element={<Feed />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/:handle" element={<Profile />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/search" element={<Search />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
