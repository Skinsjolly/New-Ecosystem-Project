'use client'

import { useRef, useState } from 'react'
import { Search, Mic, Camera } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  onSearch: (query: string) => void
  compact?: boolean
}

export default function SearchBar({ value, onChange, onSearch, compact }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [focused, setFocused] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(value)
  }

  return (
    <form onSubmit={handleSubmit} className={`w-full ${compact ? 'max-w-[600px]' : 'max-w-[584px]'} relative`}>
      <div
        className="flex items-center rounded-full border px-4 py-3 transition-all duration-200 search-container"
        style={{
          background: 'var(--bg-card)',
          borderColor: focused ? 'transparent' : 'var(--border)',
        }}
      >
        <Search className="w-5 h-5 mr-3 flex-shrink-0" style={{ color: 'var(--text-secondary)' }} />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 text-base bg-transparent outline-none"
          style={{ color: 'var(--text-primary)' }}
          placeholder="Search Smart Thinker or type a URL"
          autoComplete="off"
        />
        <div className="flex items-center gap-3 ml-3">
          <button
            type="button"
            className="p-1 rounded-full transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title="Search by voice"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            type="button"
            className="p-1 rounded-full transition-colors"
            style={{ color: 'var(--accent)' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            title="Search by image"
          >
            <Camera className="w-5 h-5" />
          </button>
        </div>
      </div>
      {!compact && (
        <div className="flex justify-center gap-3 mt-6">
          <button
            type="submit"
            className="btn-secondary text-sm"
          >
            Smart Thinker Search
          </button>
          <button
            type="button"
            className="btn-secondary text-sm"
            onClick={() => onSearch(value)}
          >
            I'm Feeling Lucky
          </button>
        </div>
      )}
    </form>
  )
}
