'use client'

import { Globe, BookOpen, Code, Newspaper, Music, MapPin } from 'lucide-react'
import Link from 'next/link'

interface QuickLink {
  label: string
  href: string
  icon: React.ElementType
}

const LINKS: QuickLink[] = [
  { label: 'Explore', href: '/search?q=explore', icon: Globe },
  { label: 'Books', href: '/search?q=books', icon: BookOpen },
  { label: 'Code', href: '/search?q=programming', icon: Code },
  { label: 'News', href: '/search?q=news', icon: Newspaper },
  { label: 'Music', href: '/search?q=music', icon: Music },
  { label: 'Maps', href: '/search?q=maps', icon: MapPin },
]

export default function QuickLinks() {
  return (
    <div
      className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-8 max-w-[480px] mx-auto"
    >
      {LINKS.map((link) => {
        const Icon = link.icon
        return (
          <Link
            key={link.label}
            href={link.href}
            className="flex flex-col items-center gap-1.5 p-3 rounded-xl transition-all duration-200"
            style={{ background: 'transparent' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            <div
              className="w-12 h-12 flex items-center justify-center rounded-full transition-colors"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <Icon className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
              {link.label}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
