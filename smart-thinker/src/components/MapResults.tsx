'use client'

import { MapPin } from 'lucide-react'

interface MapResult {
  title: string
  url: string
  source: string
  snippet: string
}

interface MapResultsProps {
  results: MapResult[]
  query: string
}

export default function MapResults({ results, query }: MapResultsProps) {
  if (!results || results.length === 0) return null

  return (
    <div>
      <p className="text-sm mb-4 animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
        {results.length} map results
      </p>

      <div
        className="mb-6 rounded-xl overflow-hidden border animate-fade-in"
        style={{ borderColor: 'var(--border-light)' }}
      >
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`}
          width="100%"
          height="400"
          style={{ border: 0, filter: 'grayscale(20%)' }}
          allowFullScreen
          loading="lazy"
        />
      </div>

      <div className="space-y-3">
        {results.map((result, index) => (
          <div key={index} className="result-card flex items-start gap-4 animate-slide-up">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium hover:underline"
                style={{ color: 'var(--text-link)' }}
              >
                {result.title}
              </a>
              <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {result.snippet}
              </p>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                {result.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
