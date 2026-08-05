'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, FileText, Trash2, Edit3, MoreHorizontal, Clock } from 'lucide-react'
import { Document } from '@/app/page'

interface DocumentListProps {
  documents: Document[]
  activeDoc: Document | null
  onSelect: (doc: Document) => void
  onCreate: () => void
  onDelete: (id: string) => void
  onRename: (id: string, title: string) => void
}

export default function DocumentList({
  documents,
  activeDoc,
  onSelect,
  onCreate,
  onDelete,
  onRename,
}: DocumentListProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = () => setContextMenu(null)
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(null)
    }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [])

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    const diffHr = Math.floor(diffMs / 3600000)

    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' })
  }

  const handleContextMenu = (e: React.MouseEvent, doc: Document) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ id: doc.id, x: e.clientX, y: e.clientY })
  }

  const startRename = (doc: Document) => {
    setEditingId(doc.id)
    setEditTitle(doc.title)
    setContextMenu(null)
  }

  const commitRename = (id: string) => {
    if (editTitle.trim()) {
      onRename(id, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <div className="flex flex-col h-full w-[280px]">
      {/* New document button */}
      <div className="p-3 flex-shrink-0">
        <button
          onClick={onCreate}
          className="flex items-center gap-2 w-full bg-white border border-st-border px-3 py-2 rounded-lg text-sm font-medium text-st-dark hover:bg-gray-50 hover:shadow-sm transition-all"
        >
          <Plus className="w-4 h-4 text-st-blue" />
          New Document
        </button>
      </div>

      {/* Document list */}
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {documents.length === 0 ? (
          <div className="text-center py-12 px-4">
            <FileText className="w-10 h-10 text-st-light-gray mx-auto mb-3" />
            <p className="text-sm text-st-gray font-medium">No documents yet</p>
            <p className="text-xs text-st-light-gray mt-1">Create your first document to get started</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelect(doc)}
              onContextMenu={(e) => handleContextMenu(e, doc)}
              className={`sidebar-item group ${
                activeDoc?.id === doc.id ? 'active' : ''
              }`}
            >
              <FileText className="w-4 h-4 text-st-blue mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                {editingId === doc.id ? (
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => commitRename(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(doc.id)
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="w-full text-sm font-medium outline-none border-b border-st-blue bg-transparent py-0"
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <p className="doc-title text-sm text-st-dark truncate leading-tight">{doc.title}</p>
                )}
                <div className="flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-st-light-gray" />
                  <p className="text-xs text-st-light-gray">{formatDate(doc.updatedAt)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setContextMenu(
                    contextMenu?.id === doc.id ? null : { id: doc.id, x: e.clientX, y: e.clientY }
                  )
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/5 rounded transition-opacity flex-shrink-0"
              >
                <MoreHorizontal className="w-4 h-4 text-st-gray" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          ref={menuRef}
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="context-menu-item"
            onClick={() => {
              const doc = documents.find((d) => d.id === contextMenu.id)
              if (doc) startRename(doc)
            }}
          >
            <Edit3 className="w-4 h-4" /> Rename
          </button>
          <div className="context-menu-separator" />
          <button
            className="context-menu-item danger"
            onClick={() => {
              onDelete(contextMenu.id)
              setContextMenu(null)
            }}
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}
