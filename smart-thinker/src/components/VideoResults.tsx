'use client'

import { Play } from 'lucide-react'

interface VideoResult {
  title: string
  url: string
  source: string
  snippet: string
}

interface VideoResultsProps {
  results: VideoResult[]
  query: string
}

export default function VideoResults({ results, query }: VideoResultsProps) {
  if (!results || results.length === 0) return null

  return (
    <div>
      <p className="text-sm mb-4 animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
        {results.length} video results
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((result, index) => (
          <div key={index} className="result-card flex gap-4 animate-fade-in">
            <div className="w-[200px] h-[112px] flex-shrink-0 rounded-lg relative overflow-hidden"
              style={{ background: 'var(--bg-secondary)' }}>
              <div className="w-full h-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-light) 100%)',
                }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  <Play className="w-5 h-5 text-white ml-0.5" />
                </div>
              </div>
              <span
                className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded font-medium"
                style={{ background: 'rgba(0,0,0,0.7)', color: '#fff' }}
              >
                {result.source}
              </span>
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
              <p className="text-sm mt-1.5 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                {result.snippet}
              </p>
              <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>
                {result.source}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
