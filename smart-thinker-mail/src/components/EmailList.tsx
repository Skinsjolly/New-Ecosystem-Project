'use client'

import { Star, Trash2, Archive } from 'lucide-react'
import { Email } from '@/app/page'

interface EmailListProps {
  emails: Email[]
  selectedEmail: Email | null
  onSelectEmail: (email: Email) => void
  onToggleStar: (id: string) => void
  onDelete: (ids: string[]) => void
  selectedEmails: Set<string>
  onToggleSelect: (id: string) => void
  folder: string
}

export default function EmailList({
  emails, selectedEmail, onSelectEmail, onToggleStar, onDelete,
  selectedEmails, onToggleSelect, folder
}: EmailListProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
    const diff = now.getTime() - date.getTime()
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString([], { weekday: 'short' })
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
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
    <div className="w-[400px] border-r border-st-border flex flex-col bg-white overflow-hidden flex-shrink-0">
      <div className="h-12 border-b border-st-border flex items-center px-4 gap-3 bg-white">
        <input
          type="checkbox"
          className="w-4 h-4 rounded border-st-border accent-st-blue cursor-pointer"
          checked={selectedEmails.size === emails.length && emails.length > 0}
          onChange={() => {
            if (selectedEmails.size === emails.length) {
              onToggleSelect('__clear__')
            } else {
              emails.forEach((e) => onToggleSelect(e.id))
            }
          }}
        />
        {selectedEmails.size > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onDelete(Array.from(selectedEmails))}
              className="toolbar-btn"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-st-gray" />
            </button>
            <button className="toolbar-btn" title="Archive">
              <Archive className="w-4 h-4 text-st-gray" />
            </button>
          </div>
        )}
        <span className="text-sm text-st-gray ml-auto">
          {emails.length} {folder === 'inbox' ? 'messages' : folder}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-st-gray">
            <svg className="w-16 h-16 mb-3 text-st-border" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            <p className="text-sm font-medium">No emails</p>
            <p className="text-xs text-st-gray/70 mt-1">This folder is empty</p>
          </div>
        )}
        {emails.map((email) => {
          const isSelected = selectedEmail?.id === email.id
          const isUnread = !email.read
          return (
            <div
              key={email.id}
              onClick={() => onSelectEmail(email)}
              className={`email-row flex items-start gap-3 px-4 py-3 border-b border-st-border/50 ${
                isSelected ? 'selected' : ''
              } ${isUnread ? 'unread' : ''}`}
            >
              <input
                type="checkbox"
                className="w-4 h-4 mt-1 rounded border-st-border accent-st-blue cursor-pointer flex-shrink-0"
                checked={selectedEmails.has(email.id)}
                onChange={(e) => {
                  e.stopPropagation()
                  onToggleSelect(email.id)
                }}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleStar(email.id)
                }}
                className="mt-0.5 flex-shrink-0"
              >
                <Star className={`w-4 h-4 transition-colors ${email.starred ? 'fill-st-yellow text-st-yellow' : 'text-gray-300 hover:text-st-yellow'}`} />
              </button>
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0 mt-0.5" style={{ background: getAvatarColor(email.from) }}>
                {email.from[0].toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`email-sender text-sm truncate ${isUnread ? 'font-semibold text-st-dark' : 'text-st-gray'}`}>
                    {email.from}
                  </span>
                  {email.labels.length > 0 && (
                    <div className="flex gap-1 flex-shrink-0">
                      {email.labels.slice(0, 2).map((label) => (
                        <span key={label} className="text-[10px] bg-st-light border border-st-border rounded px-1.5 py-0 text-st-gray">
                          {label}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-st-gray ml-auto flex-shrink-0">
                    {formatDate(email.date)}
                  </span>
                </div>
                <div className={`email-subject text-sm truncate mt-0.5 ${isUnread ? 'font-semibold text-st-dark' : 'text-st-dark'}`}>
                  {email.subject}
                </div>
                <div className="text-xs text-st-gray truncate mt-0.5">
                  {email.body.substring(0, 100).replace(/\n/g, ' ')}
                </div>
              </div>
              {isUnread && (
                <div className="w-2.5 h-2.5 bg-st-blue rounded-full mt-2 flex-shrink-0" />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
