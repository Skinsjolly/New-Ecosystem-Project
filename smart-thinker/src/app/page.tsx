'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import QuickLinks from '@/components/QuickLinks'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (query: string) => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-primary)' }}>
      <Navbar />
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-16 animate-fade-in">
        <div className="animate-slide-up">
          <h1 className="text-[48px] sm:text-[72px] md:text-[92px] font-normal mb-6 text-transparent bg-clip-text bg-gradient-to-r from-st-blue via-st-green to-st-red select-none leading-tight text-center">
            Smart Thinker
          </h1>
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.15s' }}>
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={handleSearch}
          />
        </div>
        <div className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <QuickLinks />
        </div>
        <div className="mt-16 text-sm animate-fade-in text-center px-4" style={{ color: 'var(--text-secondary)', animationDelay: '0.4s' }}>
          <p>Smart Thinker Ecosystem — Search, Chat, Email, Docs, Slides, Sheets</p>
        </div>
      </main>
    </div>
  )
}
