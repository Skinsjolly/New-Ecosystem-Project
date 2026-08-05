'use client'

import { Sparkles, ExternalLink } from 'lucide-react'
import { ReactNode } from 'react'

interface Source {
  title: string
  url: string
  domain?: string
  content?: string
}

interface AiOverviewProps {
  overview: string
  sources: Source[]
  query: string
}

function renderBold(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>
    }
    return part
  })
}

export default function AiOverview({ overview, sources }: AiOverviewProps) {
  if (!overview) return null

  const getDomain = (url: string) => {
    try { return new URL(url).hostname.replace('www.', '') } catch { return url }
  }

  const getFavicon = (url: string) => {
    const domain = getDomain(url)
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`
  }

  return (
    <div className="animate-fade-in mb-8">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent)' }}>
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <h2 className="text-base font-medium" style={{ color: 'var(--text-primary)' }}>
          AI Answer
        </h2>
        <span className="text-[11px] px-2 py-0.5 rounded-full ml-1 font-medium" style={{ background: 'var(--accent)', color: '#ffffff' }}>
          Gemini 2.5 Flash
        </span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 min-w-0">
          <div className="rounded-xl p-5" style={{ background: 'var(--overview-bg)', border: '1px solid var(--border-light)' }}>
            <div className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
              {renderBold(overview)}
            </div>
          </div>
        </div>

        {sources.length > 0 && (
          <div className="w-full lg:w-[300px] flex-shrink-0">
            <div className="sticky top-[160px]">
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-secondary)' }}>
                Sources
              </h3>
              <div className="space-y-2">
                {sources.map((source, i) => {
                  const domain = source.domain || getDomain(source.url)
                  return (
                    <a
                      key={i}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="source-card block"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={getFavicon(source.url)}
                          alt=""
                          className="w-5 h-5 rounded flex-shrink-0 mt-0.5"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            {domain}
                          </p>
                          <p className="text-[13px] font-medium leading-snug line-clamp-2 mt-0.5" style={{ color: 'var(--text-primary)' }}>
                            {source.title}
                          </p>
                          {source.content && (
                            <p className="text-[11px] leading-relaxed line-clamp-2 mt-1" style={{ color: 'var(--text-secondary)' }}>
                              {source.content}
                            </p>
                          )}
                          <p className="text-[11px] truncate mt-1 flex items-center gap-1" style={{ color: 'var(--accent)' }}>
                            {source.url.length > 35 ? source.url.substring(0, 35) + '...' : source.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </p>
                        </div>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}