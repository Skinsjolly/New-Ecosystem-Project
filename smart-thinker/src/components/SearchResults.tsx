'use client'

import { Globe, ExternalLink } from 'lucide-react'

interface SearchResult {
  title: string
  url: string
  source: string
  snippet: string
}

interface SearchResultsProps {
  results: SearchResult[]
  query: string
}

export default function SearchResults({ results, query }: SearchResultsProps) {
  if (!results || results.length === 0) return null

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
  }

  const getFavicon = (url: string) => {
    const domain = getDomain(url)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  }

  return (
    <div className="animate-fade-in">
      <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
        About {results.length} results for &ldquo;{query}&rdquo;
      </p>

      <div className="space-y-5">
        {results.map((result, index) => {
          const domain = getDomain(result.url)
          return (
            <div
              key={index}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 0.06}s`, animationFillMode: 'backwards' }}
            >
              <div className="flex items-center gap-2 mb-1">
                <img
                  src={getFavicon(result.url)}
                  alt=""
                  className="w-4 h-4 rounded"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {result.source || domain}
                </span>
              </div>

              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <h3 className="text-lg font-normal leading-tight hover:underline" style={{ color: 'var(--text-link)' }}>
                  {result.title}
                </h3>
              </a>

              <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#0d652d' }}>
                {result.url.length > 60 ? result.url.substring(0, 60) + '...' : result.url}
              </p>

              <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {result.snippet}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}