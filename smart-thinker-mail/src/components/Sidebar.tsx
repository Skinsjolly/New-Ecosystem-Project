'use client'

import { useState } from 'react'
import {
  Inbox, Star, Send, FileText, AlertTriangle, Trash2,
  Plus, Link2, ChevronDown, ChevronRight, Mail, LogOut,
  Settings, HelpCircle
} from 'lucide-react'
import { EmailAccount, User } from '@/app/page'

interface SidebarProps {
  selectedFolder: string
  onSelectFolder: (folder: string) => void
  onCompose: () => void
  folderCounts: Record<string, number>
  linkedAccounts: EmailAccount[]
  onLinkAccount: () => void
  onSelectAccount: (account: EmailAccount | null) => void
  activeAccount: EmailAccount | null
  user: User
}

const FOLDERS = [
  { id: 'inbox', label: 'Inbox', icon: Inbox },
  { id: 'starred', label: 'Starred', icon: Star },
  { id: 'sent', label: 'Sent', icon: Send },
  { id: 'drafts', label: 'Drafts', icon: FileText },
  { id: 'spam', label: 'Spam', icon: AlertTriangle },
  { id: 'trash', label: 'Trash', icon: Trash2 },
]

export default function Sidebar({
  selectedFolder, onSelectFolder, onCompose, folderCounts,
  linkedAccounts, onLinkAccount, onSelectAccount, activeAccount, user
}: SidebarProps) {
  const [showAccounts, setShowAccounts] = useState(true)

  return (
    <div className="w-[256px] border-r border-st-border flex flex-col bg-white flex-shrink-0">
      <div className="p-4">
        <button
          onClick={onCompose}
          className="flex items-center gap-3 bg-st-blue text-white px-6 py-3 rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-st-blue/25 transition-all w-full active:scale-[0.98]"
        >
          <Plus className="w-5 h-5" />
          Compose
        </button>
      </div>

      <nav className="flex-1 px-3">
        {FOLDERS.map((folder) => {
          const Icon = folder.icon
          const count = folderCounts[folder.id] || 0
          const isActive = selectedFolder === folder.id
          return (
            <button
              key={folder.id}
              onClick={() => onSelectFolder(folder.id)}
              className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-r-full text-sm transition-all mb-0.5 ${
                isActive
                  ? 'mail-folder-active'
                  : 'mail-folder hover:bg-gray-100'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] ${isActive ? 'text-st-blue' : 'text-st-gray'}`} />
              <span className="flex-1 text-left">{folder.label}</span>
              {count > 0 && (
                <span className={`text-xs font-medium ${
                  isActive ? 'text-st-blue' : 'text-st-gray'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-st-border p-3">
        <button
          onClick={() => setShowAccounts(!showAccounts)}
          className="flex items-center gap-2 text-sm text-st-dark w-full px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {showAccounts ? <ChevronDown className="w-4 h-4 text-st-gray" /> : <ChevronRight className="w-4 h-4 text-st-gray" />}
          <Mail className="w-4 h-4 text-st-gray" />
          <span className="flex-1 text-left font-medium text-[13px]">Linked Accounts</span>
        </button>
        {showAccounts && (
          <div className="mt-1 ml-2 space-y-0.5">
            <button
              onClick={() => onSelectAccount(null)}
              className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors ${
                !activeAccount ? 'bg-st-blue/10 text-st-blue font-medium' : 'hover:bg-gray-100 text-st-gray'
              }`}
            >
              All accounts
            </button>
            {linkedAccounts.map((account) => (
              <button
                key={account.id}
                onClick={() => onSelectAccount(account)}
                className={`w-full text-left text-xs px-3 py-2 rounded-lg transition-colors truncate ${
                  activeAccount?.id === account.id ? 'bg-st-blue/10 text-st-blue font-medium' : 'hover:bg-gray-100 text-st-gray'
                }`}
              >
                {account.label || account.email}
              </button>
            ))}
            <button
              onClick={onLinkAccount}
              className="flex items-center gap-2 text-xs text-st-blue hover:bg-st-blue/5 px-3 py-2 rounded-lg transition-colors w-full"
            >
              <Link2 className="w-3 h-3" />
              Link Gmail account
            </button>
          </div>
        )}
      </div>

      <div className="border-t border-st-border p-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-st-blue rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
            {user.username[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-st-dark truncate">{user.username}</p>
            <p className="text-xs text-st-gray truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
