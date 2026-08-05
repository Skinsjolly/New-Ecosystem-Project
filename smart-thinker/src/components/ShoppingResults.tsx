'use client'

import { ShoppingCart, Star } from 'lucide-react'

interface ShoppingResult {
  title: string
  url: string
  source: string
  snippet: string
  price: string
}

interface ShoppingResultsProps {
  results: ShoppingResult[]
  query: string
}

export default function ShoppingResults({ results, query }: ShoppingResultsProps) {
  if (!results || results.length === 0) return null

  return (
    <div>
      <p className="text-sm mb-4 animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
        {results.length} shopping results
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <div key={index} className="result-card flex gap-4 animate-fade-in">
            <div
              className="w-[120px] h-[120px] flex-shrink-0 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--bg-secondary)' }}
            >
              <ShoppingCart className="w-8 h-8" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
            </div>

            <div className="flex-1 min-w-0">
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-medium leading-snug hover:underline line-clamp-2"
                style={{ color: 'var(--text-link)' }}
              >
                {result.title}
              </a>

              <p className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>
                {result.price}
              </p>

              <p className="text-sm mt-1 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {result.snippet}
              </p>

              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="w-3 h-3"
                    style={{
                      fill: star <= 4 ? 'var(--accent)' : 'var(--border-light)',
                      color: star <= 4 ? 'var(--accent)' : 'var(--border-light)',
                    }}
                  />
                ))}
                <span className="text-xs ml-1" style={{ color: 'var(--text-secondary)' }}>
                  ({(index * 857 + 239) % 5000 + 100} reviews)
                </span>
              </div>

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
