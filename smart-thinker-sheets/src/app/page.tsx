'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import SpreadsheetGrid from '@/components/SpreadsheetGrid'
import SheetsToolbar from '@/components/SheetsToolbar'
import SheetTabs from '@/components/SheetTabs'
import { Sheet, createEmptySheet, getCellKey, getDisplayValue, CellData, NUM_ROWS, NUM_COLS } from '@/lib/spreadsheetEngine'

const SAMPLE_SHEETS: Sheet[] = [
  {
    id: 'sheet-1',
    name: 'Sheet1',
    data: {
      'A1': { value: 'Item', bold: true, bgColor: '#e8f0fe' },
      'B1': { value: 'Price', bold: true, bgColor: '#e8f0fe' },
      'C1': { value: 'Qty', bold: true, bgColor: '#e8f0fe' },
      'D1': { value: 'Total', bold: true, bgColor: '#e8f0fe' },
      'A2': { value: 'Apple' },
      'B2': { value: '1.50' },
      'C2': { value: '10' },
      'D2': { value: '', formula: '=B2*C2' },
      'A3': { value: 'Banana' },
      'B3': { value: '0.75' },
      'C3': { value: '20' },
      'D3': { value: '', formula: '=B3*C3' },
      'A4': { value: 'Orange' },
      'B4': { value: '2.00' },
      'C4': { value: '15' },
      'D4': { value: '', formula: '=B4*C4' },
      'A5': { value: '' },
      'B5': { value: '' },
      'C5': { value: 'Total:', bold: true },
      'D5': { value: '', formula: '=SUM(D2:D4)' },
    },
    colWidths: { 0: 100, 1: 80, 2: 80, 3: 100 },
    rowHeights: {},
  },
]

const URLS = {
  search: process.env.NEXT_PUBLIC_SEARCH_URL || 'http://localhost:3000',
}

export default function SheetsPage() {
  const [sheets, setSheets] = useState<Sheet[]>(SAMPLE_SHEETS)
  const [activeSheetIndex, setActiveSheetIndex] = useState(0)
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const [spreadsheetTitle, setSpreadsheetTitle] = useState('Untitled Spreadsheet')
  const formulaBarRef = useRef<HTMLInputElement>(null)

  const activeSheet = sheets[activeSheetIndex]

  const updateSheet = useCallback((index: number, updates: Partial<Sheet>) => {
    setSheets((prev) => {
      const next = [...prev]
      next[index] = { ...next[index], ...updates }
      return next
    })
  }, [])

  const updateCell = useCallback((key: string, updates: Partial<CellData>) => {
    updateSheet(activeSheetIndex, {
      data: { ...activeSheet.data, [key]: { ...activeSheet.data[key], value: '', ...updates } },
    })
  }, [activeSheetIndex, activeSheet, updateSheet])

  const save = useCallback(() => {
    setSaving(true)
    setTimeout(() => setSaving(false), 500)
  }, [])

  const handleCellSelect = (row: number, col: number) => {
    setSelectedCell({ row, col })
    setEditingCell(null)
  }

  const handleCellDoubleClick = (row: number, col: number) => {
    const key = getCellKey(row, col)
    const cell = activeSheet.data[key]
    setEditingCell(key)
    setEditValue(cell?.formula || cell?.value || '')
    setSelectedCell({ row, col })
  }

  const handleCellChange = (row: number, col: number, value: string) => {
    const key = getCellKey(row, col)
    if (value.startsWith('=')) {
      updateCell(key, { formula: value, value: '' })
    } else {
      updateCell(key, { value, formula: undefined })
    }
    save()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedCell) return

    if (editingCell) {
      if (e.key === 'Enter') {
        handleCellChange(selectedCell.row, selectedCell.col, editValue)
        setEditingCell(null)
        setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col })
      } else if (e.key === 'Escape') {
        setEditingCell(null)
      } else if (e.key === 'Tab') {
        e.preventDefault()
        handleCellChange(selectedCell.row, selectedCell.col, editValue)
        setEditingCell(null)
        setSelectedCell({ row: selectedCell.row, col: Math.min(selectedCell.col + 1, NUM_COLS - 1) })
      }
      return
    }

    switch (e.key) {
      case 'ArrowUp': setSelectedCell({ row: Math.max(0, selectedCell.row - 1), col: selectedCell.col }); break
      case 'ArrowDown': case 'Enter':
        setSelectedCell({ row: Math.min(NUM_ROWS - 1, selectedCell.row + 1), col: selectedCell.col }); break
      case 'ArrowLeft': setSelectedCell({ row: selectedCell.row, col: Math.max(0, selectedCell.col - 1) }); break
      case 'ArrowRight': case 'Tab':
        e.preventDefault()
        setSelectedCell({ row: selectedCell.row, col: Math.min(NUM_COLS - 1, selectedCell.col + 1) }); break
      case 'Delete': case 'Backspace':
        const key = getCellKey(selectedCell.row, selectedCell.col)
        updateCell(key, { value: '', formula: undefined })
        break
      case 'F2':
        handleCellDoubleClick(selectedCell.row, selectedCell.col)
        break
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          handleCellDoubleClick(selectedCell.row, selectedCell.col)
          setEditValue(e.key)
        }
    }
  }

  const addSheet = () => {
    const newSheet = createEmptySheet(`Sheet${sheets.length + 1}`)
    setSheets([...sheets, newSheet])
    setActiveSheetIndex(sheets.length)
  }

  const deleteSheet = (index: number) => {
    if (sheets.length <= 1) return
    const next = sheets.filter((_, i) => i !== index)
    setSheets(next)
    setActiveSheetIndex(Math.min(index, next.length - 1))
  }

  const renameSheet = (index: number, name: string) => {
    updateSheet(index, { name })
  }

  const applyFormat = (property: string) => {
    if (!selectedCell) return
    const key = getCellKey(selectedCell.row, selectedCell.col)
    const cell = activeSheet.data[key] || { value: '' }
    updateCell(key, { [property]: !cell[property as keyof CellData] })
    save()
  }

  const setTextColor = (color: string) => {
    if (!selectedCell) return
    const key = getCellKey(selectedCell.row, selectedCell.col)
    updateCell(key, { textColor: color })
    save()
  }

  const setCellAlign = (align: 'left' | 'center' | 'right') => {
    if (!selectedCell) return
    const key = getCellKey(selectedCell.row, selectedCell.col)
    updateCell(key, { align })
    save()
  }

  const importCSV = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (ev) => {
        const text = ev.target?.result as string
        const rows = text.split('\n').map((r) => r.split(','))
        const data: Record<string, CellData> = {}
        rows.forEach((row, ri) => {
          row.forEach((cell, ci) => {
            const key = getCellKey(ri, ci)
            data[key] = { value: cell.trim() }
          })
        })
        updateSheet(activeSheetIndex, { data })
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const exportCSV = () => {
    let csv = ''
    for (let r = 0; r < NUM_ROWS; r++) {
      const row: string[] = []
      let hasData = false
      for (let c = 0; c < NUM_COLS; c++) {
        const key = getCellKey(r, c)
        const val = getDisplayValue(key, activeSheet)
        if (val) hasData = true
        row.push(`"${val.replace(/"/g, '""')}"`)
      }
      if (hasData) csv += row.join(',') + '\n'
    }
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${spreadsheetTitle}.csv`
    a.click()
  }

  const selectedCellKey = selectedCell ? getCellKey(selectedCell.row, selectedCell.col) : null
  const selectedCellData = selectedCellKey ? activeSheet.data[selectedCellKey] : null
  const formulaBarValue = editingCell
    ? editValue
    : selectedCellData?.formula || selectedCellData?.value || ''

  return (
    <div className="h-screen flex flex-col bg-white" onKeyDown={handleKeyDown} tabIndex={0}>
      <header className="h-14 border-b border-st-border flex items-center px-4 gap-4 flex-shrink-0">
        <a href="/" className="text-lg font-normal text-transparent bg-clip-text bg-gradient-to-r from-st-blue via-st-green to-st-red">
          Smart Thinker Sheets
        </a>
        <input
          type="text"
          value={spreadsheetTitle}
          onChange={(e) => setSpreadsheetTitle(e.target.value)}
          className="text-xl font-normal text-st-dark bg-transparent outline-none border-b border-transparent hover:border-st-border focus:border-st-blue px-1"
        />
        <span className="text-xs text-st-gray">{saving ? 'Saving...' : 'Saved'}</span>
        <div className="flex items-center gap-2 ml-auto">
          <a href={URLS.search} className="text-xs text-st-gray hover:text-st-dark px-2 py-1 rounded hover:bg-gray-100">Search</a>
        </div>
      </header>

      <SheetsToolbar
        selectedCellData={selectedCellData}
        onToggleBold={() => applyFormat('bold')}
        onToggleItalic={() => applyFormat('italic')}
        onToggleUnderline={() => applyFormat('underline')}
        onSetColor={setTextColor}
        onSetAlign={setCellAlign}
        onImport={importCSV}
        onExport={exportCSV}
      />

      <div className="h-9 border-b border-st-border flex items-center px-2 gap-2 bg-white flex-shrink-0">
        <span className="text-xs text-st-gray w-8 text-center font-medium">
          {selectedCell ? `${String.fromCharCode(65 + selectedCell.col)}${selectedCell.row + 1}` : ''}
        </span>
        <div className="w-px h-5 bg-st-border" />
        <input
          ref={formulaBarRef}
          type="text"
          value={formulaBarValue}
          onChange={(e) => {
            setEditValue(e.target.value)
            if (!editingCell && selectedCellKey) setEditingCell(selectedCellKey)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && selectedCell && editingCell) {
              handleCellChange(selectedCell.row, selectedCell.col, editValue)
              setEditingCell(null)
            }
          }}
          className="flex-1 text-sm outline-none px-2 formula-bar"
          placeholder="Enter value or formula (=SUM, =AVERAGE, =IF, etc.)"
        />
      </div>

      <SpreadsheetGrid
        sheet={activeSheet}
        selectedCell={selectedCell}
        editingCell={editingCell}
        editValue={editValue}
        onSelect={handleCellSelect}
        onDoubleClick={handleCellDoubleClick}
        onEditChange={setEditValue}
      />

      <SheetTabs
        sheets={sheets}
        activeIndex={activeSheetIndex}
        onSelect={setActiveSheetIndex}
        onAdd={addSheet}
        onDelete={deleteSheet}
        onRename={renameSheet}
      />
    </div>
  )
}
