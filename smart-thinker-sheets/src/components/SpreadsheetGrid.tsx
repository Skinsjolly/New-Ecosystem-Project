'use client'

import { useRef, useEffect, useState } from 'react'
import { Sheet, getCellKey, getColLetter, getDisplayValue, NUM_ROWS, NUM_COLS } from '@/lib/spreadsheetEngine'

interface SpreadsheetGridProps {
  sheet: Sheet
  selectedCell: { row: number; col: number } | null
  editingCell: string | null
  editValue: string
  onSelect: (row: number, col: number) => void
  onDoubleClick: (row: number, col: number) => void
  onEditChange: (value: string) => void
}

export default function SpreadsheetGrid({ sheet, selectedCell, editingCell, editValue, onSelect, onDoubleClick, onEditChange }: SpreadsheetGridProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [scrollPos, setScrollPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (editingCell && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingCell])

  const getCellStyle = (key: string): React.CSSProperties => {
    const cell = sheet.data[key]
    if (!cell) return {}
    const style: React.CSSProperties = {}
    if (cell.bold) style.fontWeight = 'bold'
    if (cell.italic) style.fontStyle = 'italic'
    if (cell.underline) style.textDecoration = 'underline'
    if (cell.textColor) style.color = cell.textColor
    if (cell.bgColor) style.backgroundColor = cell.bgColor
    if (cell.align) style.textAlign = cell.align
    return style
  }

  return (
    <div ref={gridRef} className="flex-1 overflow-auto spreadsheet-container" onScroll={(e) => {
      setScrollPos({ top: (e.target as HTMLDivElement).scrollTop, left: (e.target as HTMLDivElement).scrollLeft })
    }}>
      <table className="spreadsheet-table">
        <thead>
          <tr>
            <th className="corner" style={{ width: 40, minWidth: 40 }}></th>
            {Array.from({ length: NUM_COLS }, (_, c) => (
              <th
                key={c}
                className="col-header"
                style={{ width: sheet.colWidths[c] || 100, minWidth: sheet.colWidths[c] || 100 }}
              >
                {getColLetter(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: NUM_ROWS }, (_, r) => (
            <tr key={r}>
              <th className="row-header">{r + 1}</th>
              {Array.from({ length: NUM_COLS }, (_, c) => {
                const key = getCellKey(r, c)
                const isSelected = selectedCell?.row === r && selectedCell?.col === c
                const isEditing = editingCell === key
                const displayValue = getDisplayValue(key, sheet)

                return (
                  <td
                    key={c}
                    className={`${isSelected ? 'selected' : ''}`}
                    style={getCellStyle(key)}
                    onClick={() => onSelect(r, c)}
                    onDoubleClick={() => onDoubleClick(r, c)}
                  >
                    {isEditing ? (
                      <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => onEditChange(e.target.value)}
                        className="cell-input"
                        style={getCellStyle(key)}
                      />
                    ) : (
                      <div className="px-1 py-0.5 truncate w-full h-full flex items-center" style={getCellStyle(key)}>
                        {displayValue}
                      </div>
                    )}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
