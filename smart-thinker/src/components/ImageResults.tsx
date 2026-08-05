'use client'

import { useState } from 'react'
import { ImageIcon, X, ExternalLink } from 'lucide-react'

interface ImageResult {
  title: string
  url: string
  source: string
  snippet: string
}

interface ImageResultsProps {
  results: ImageResult[]
  query: string
}

function ImageCard({ result, onSelect }: { result: ImageResult; onSelect: () => void }) {
  return (
    <div
      onClick={onSelect}
      className="result-card cursor-pointer group animate-fade-in overflow-hidden"
    >
      <div
        className="aspect-square rounded-lg flex items-center justify-center overflow-hidden mb-2"
        style={{ background: 'var(--bg-secondary)' }}
      >
        <div
          className="w-full h-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-light) 100%)',
          }}
        >
          <ImageIcon className="w-12 h-12" style={{ color: 'var(--text-secondary)', opacity: 0.4 }} />
        </div>
      </div>
      <h3
        className="text-sm truncate group-hover:underline"
        style={{ color: 'var(--text-link)' }}
      >
        {result.title}
      </h3>
      <p className="text-xs truncate mt-0.5" style={{ color: 'var(--text-secondary)' }}>
        {result.source}
      </p>
    </div>
  )
}

export default function ImageResults({ results, query }: ImageResultsProps) {
  const [selected, setSelected] = useState<ImageResult | null>(null)

  if (!results || results.length === 0) return null

  return (
    <div>
      <p className="text-sm mb-4 animate-fade-in" style={{ color: 'var(--text-secondary)' }}>
        {results.length} image results
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((result, index) => (
          <ImageCard key={index} result={result} onSelect={() => setSelected(result)} />
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl modal-content"
            style={{ background: 'var(--bg-card)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
              style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
            >
              <X className="w-4 h-4" />
            </button>

            <div
              className="w-full aspect-video rounded-t-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-light) 100%)',
              }}
            >
              <ImageIcon className="w-20 h-20" style={{ color: 'var(--text-secondary)', opacity: 0.3 }} />
            </div>

            <div className="p-6 space-y-4">
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                {selected.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {selected.snippet}
              </p>
              <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                <span>Source:</span>
                <a
                  href={selected.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                  style={{ color: 'var(--text-link)' }}
                >
                  {selected.source}
                </a>
              </div>
              <a
                href={selected.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-90"
                style={{ background: 'var(--accent)', color: '#fff' }}
              >
                <ExternalLink className="w-4 h-4" />
                Open Original
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
