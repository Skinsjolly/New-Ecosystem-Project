'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import SearchBar from '@/components/SearchBar'
import Navbar from '@/components/Navbar'
import AiOverview from '@/components/AiOverview'
import SearchResults from '@/components/SearchResults'
import VideoResults from '@/components/VideoResults'
import ImageResults from '@/components/ImageResults'
import ShoppingResults from '@/components/ShoppingResults'
import MapResults from '@/components/MapResults'

const TABS = ['All', 'Images', 'Videos', 'Shopping', 'News', 'Maps', 'More']

function SearchPageContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const query = searchParams.get('q') || ''
  const tabParam = searchParams.get('tab') || 'All'
  const [searchQuery, setSearchQuery] = useState(query)
  const [activeTab, setActiveTab] = useState<string>(tabParam)
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSearchQuery(query)
    setActiveTab(tabParam)
  }, [query, tabParam])

  useEffect(() => {
    if (query) {
      setLoading(true)
      setResults(null)
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((data) => {
          setResults(data)
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [query])

  const handleSearch = (q: string) => {
    if (q.trim()) {
      router.push(`/search?q=${encodeURIComponent(q.trim())}&tab=${activeTab}`)
    }
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    router.push(`/search?q=${encodeURIComponent(query)}&tab=${tab}`)
  }

  const renderResults = () => {
    if (!results) return null
    const r = results.results || {}

    switch (activeTab) {
      case 'Images':
        return <ImageResults results={r.imageResults || []} query={query} />
      case 'Videos':
        return <VideoResults results={r.videoResults || []} query={query} />
      case 'Shopping':
        return <ShoppingResults results={r.shoppingResults || []} query={query} />
      case 'Maps':
        return <MapResults results={r.mapResults || []} query={query} />
      case 'News':
        return <SearchResults results={r.newsResults || r.allResults || []} query={query} />
      case 'More':
        return <SearchResults results={r.allResults || []} query={query} />
      default:
        return (
          <>
            <AiOverview overview={results.aiOverview} sources={results.sources} query={results.query} />
            <div className="mt-6">
              <SearchResults results={r.allResults || []} query={query} />
            </div>
          </>
        )
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Navbar />
      <div className="fixed top-14 left-0 right-0 z-40" style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-[720px] mx-auto px-4 py-3">
          <SearchBar value={searchQuery} onChange={setSearchQuery} onSearch={handleSearch} compact />
        </div>
        <div className="max-w-[720px] mx-auto px-4 flex overflow-x-auto gap-1" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`tab-btn ${activeTab === tab ? 'active' : ''}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-[180px] max-w-[1100px] mx-auto px-4 pb-16">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <div className="typing-indicator flex">
              <span /><span /><span />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Generating results for "{query}"...</p>
          </div>
        )}

        {!loading && results && renderResults()}

        {!loading && !results && query && (
          <div className="text-center py-32">
            <p style={{ color: 'var(--text-secondary)' }}>No results found for "{query}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
        <div className="typing-indicator flex"><span /><span /><span /></div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  )
}