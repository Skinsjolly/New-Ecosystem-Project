'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { Sheet } from '@/lib/spreadsheetEngine'

interface SheetTabsProps {
  sheets: Sheet[]
  activeIndex: number
  onSelect: (index: number) => void
  onAdd: () => void
  onDelete: (index: number) => void
  onRename: (index: number, name: string) => void
}

export default function SheetTabs({ sheets, activeIndex, onSelect, onAdd, onDelete, onRename }: SheetTabsProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [menuIndex, setMenuIndex] = useState<number | null>(null)

  return (
    <div className="h-8 border-t border-st-border flex items-end bg-st-light px-2 flex-shrink-0">
      <div className="flex items-end gap-0.5 overflow-x-auto h-full">
        {sheets.map((sheet, index) => (
          <div
            key={sheet.id}
            onClick={() => onSelect(index)}
            className={`sheet-tab group flex items-center gap-1 cursor-pointer relative ${
              activeIndex === index ? 'active' : ''
            }`}
          >
            {editingId === sheet.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={() => {
                  onRename(index, editName || sheet.name)
                  setEditingId(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onRename(index, editName || sheet.name)
                    setEditingId(null)
                  }
                }}
                className="w-20 text-xs outline-none bg-transparent"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  setEditingId(sheet.id)
                  setEditName(sheet.name)
                }}
              >
                {sheet.name}
              </span>
            )}

            {sheets.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuIndex(menuIndex === index ? null : index)
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-gray-200 rounded transition-opacity"
              >
                <X className="w-3 h-3 text-st-gray" />
              </button>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={onAdd}
        className="ml-1 p-1 hover:bg-gray-200 rounded mb-0.5"
        title="Add sheet"
      >
        <Plus className="w-4 h-4 text-st-gray" />
      </button>
    </div>
  )
}
