'use client'

import { ArrowLeft, Reply, ReplyAll, Forward, Star, Trash2, MoreHorizontal, Printer } from 'lucide-react'
import { Email } from '@/app/page'

interface EmailViewProps {
  email: Email
  onBack: () => void
  onReply: () => void
  onForward: () => void
  onDelete: () => void
  onToggleStar: () => void
}

export default function EmailView({ email, onBack, onReply, onForward, onDelete, onToggleStar }: EmailViewProps) {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString([], {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    })
  }

  const getAvatarColor = (name: string) => {
    const colors = ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9C27B0', '#FF6D00', '#00BCD4', '#795548']
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      <div className="h-12 border-b border-st-border flex items-center px-2 gap-1 flex-shrink-0">
        <button onClick={onBack} className="toolbar-btn" title="Back">
          <ArrowLeft className="w-5 h-5 text-st-gray" />
        </button>
        <div className="w-px h-5 bg-st-border mx-1" />
        <button onClick={onReply} className="toolbar-btn" title="Reply">
          <Reply className="w-5 h-5 text-st-gray" />
        </button>
        <button className="toolbar-btn" title="Reply All">
          <ReplyAll className="w-5 h-5 text-st-gray" />
        </button>
        <button onClick={onForward} className="toolbar-btn" title="Forward">
          <Forward className="w-5 h-5 text-st-gray" />
        </button>
        <div className="w-px h-5 bg-st-border mx-1" />
        <button onClick={onDelete} className="toolbar-btn" title="Delete">
          <Trash2 className="w-5 h-5 text-st-gray" />
        </button>
        <button onClick={onToggleStar} className="toolbar-btn" title="Star">
          <Star className={`w-5 h-5 ${email.starred ? 'fill-st-yellow text-st-yellow' : 'text-st-gray'}`} />
        </button>
        <div className="flex-1" />
        <button className="toolbar-btn" title="Print">
          <Printer className="w-5 h-5 text-st-gray" />
        </button>
        <button className="toolbar-btn" title="More">
          <MoreHorizontal className="w-5 h-5 text-st-gray" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[800px] mx-auto">
          <h1 className="text-2xl font-normal text-st-dark mb-6">{email.subject}</h1>

          <div className="flex items-start gap-3 mb-6 pb-4 border-b border-st-border">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
              style={{ background: getAvatarColor(email.from) }}
            >
              {email.from[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-st-dark">{email.from}</span>
                <span className="text-xs text-st-gray">&lt;{email.fromEmail}&gt;</span>
              </div>
              <div className="text-xs text-st-gray mt-0.5">
                To: {email.to}
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {email.labels.length > 0 && (
                <div className="flex gap-1.5">
                  {email.labels.map((label) => (
                    <span key={label} className="text-xs bg-st-light border border-st-border rounded-full px-2.5 py-0.5 text-st-gray">
                      {label}
                    </span>
                  ))}
                </div>
              )}
              <span className="text-xs text-st-gray">{formatDate(email.date)}</span>
            </div>
          </div>

          <div className="text-[15px] text-st-dark leading-relaxed whitespace-pre-line min-h-[200px]">
            {email.body}
          </div>

          <div className="mt-8 flex gap-3 pb-8">
            <button
              onClick={onReply}
              className="flex items-center gap-2 bg-st-blue text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 hover:shadow-md transition-all active:scale-[0.98]"
            >
              <Reply className="w-4 h-4" />
              Reply
            </button>
            <button
              onClick={onForward}
              className="flex items-center gap-2 border border-st-border px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 hover:shadow-sm transition-all active:scale-[0.98]"
            >
              <Forward className="w-4 h-4" />
              Forward
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
