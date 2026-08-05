'use client'

import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Upload, Download, PaintBucket, Type } from 'lucide-react'
import { CellData } from '@/lib/spreadsheetEngine'

interface SheetsToolbarProps {
  selectedCellData: CellData | null
  onToggleBold: () => void
  onToggleItalic: () => void
  onToggleUnderline: () => void
  onSetColor: (color: string) => void
  onSetAlign: (align: 'left' | 'center' | 'right') => void
  onImport: () => void
  onExport: () => void
}

export default function SheetsToolbar({
  selectedCellData, onToggleBold, onToggleItalic, onToggleUnderline,
  onSetColor, onSetAlign, onImport, onExport
}: SheetsToolbarProps) {
  return (
    <div className="h-10 border-b border-st-border flex items-center px-2 gap-1 bg-white flex-shrink-0">
      <button onClick={onToggleBold}
        className={`toolbar-btn ${selectedCellData?.bold ? 'active' : ''}`} title="Bold">
        <Bold className="w-4 h-4" />
      </button>
      <button onClick={onToggleItalic}
        className={`toolbar-btn ${selectedCellData?.italic ? 'active' : ''}`} title="Italic">
        <Italic className="w-4 h-4" />
      </button>
      <button onClick={onToggleUnderline}
        className={`toolbar-btn ${selectedCellData?.underline ? 'active' : ''}`} title="Underline">
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-st-border mx-1" />

      <div className="relative group">
        <button className="toolbar-btn flex items-center gap-1" title="Text Color">
          <Type className="w-4 h-4" />
        </button>
        <div className="absolute top-full left-0 mt-1 bg-white border border-st-border rounded-lg shadow-lg p-2 hidden group-hover:block z-50">
          <div className="grid grid-cols-6 gap-1">
            {['#000000', '#4285F4', '#EA4335', '#34A853', '#FBBC05', '#FF6D01',
              '#46BDC6', '#7B1FA2', '#E91E63', '#795548', '#607D8B', '#9E9E9E',
              '#F44336', '#2196F3', '#4CAF50', '#FFC107', '#FF9800', '#9C27B0'].map((color) => (
              <button
                key={color}
                onClick={() => onSetColor(color)}
                className="w-5 h-5 rounded border border-gray-200"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="w-px h-5 bg-st-border mx-1" />

      <button onClick={() => onSetAlign('left')}
        className={`toolbar-btn ${selectedCellData?.align === 'left' ? 'active' : ''}`} title="Align Left">
        <AlignLeft className="w-4 h-4" />
      </button>
      <button onClick={() => onSetAlign('center')}
        className={`toolbar-btn ${selectedCellData?.align === 'center' ? 'active' : ''}`} title="Align Center">
        <AlignCenter className="w-4 h-4" />
      </button>
      <button onClick={() => onSetAlign('right')}
        className={`toolbar-btn ${selectedCellData?.align === 'right' ? 'active' : ''}`} title="Align Right">
        <AlignRight className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-st-border mx-1" />

      <button onClick={onImport} className="toolbar-btn flex items-center gap-1 text-sm text-st-gray" title="Import CSV">
        <Upload className="w-4 h-4" /> Import
      </button>
      <button onClick={onExport} className="toolbar-btn flex items-center gap-1 text-sm text-st-gray" title="Export CSV">
        <Download className="w-4 h-4" /> Export
      </button>

      <div className="w-px h-5 bg-st-border mx-1" />

      <div className="flex items-center gap-2 text-xs text-st-gray ml-2">
        <span>Formulas:</span>
        <code className="bg-st-light px-1.5 py-0.5 rounded">=SUM(A1:A10)</code>
        <code className="bg-st-light px-1.5 py-0.5 rounded">=AVERAGE(B1:B5)</code>
        <code className="bg-st-light px-1.5 py-0.5 rounded">{"=IF(A1>5,\"Yes\",\"No\")"}</code>
        <code className="bg-st-light px-1.5 py-0.5 rounded">=COUNT(A1:A10)</code>
        <code className="bg-st-light px-1.5 py-0.5 rounded">=MAX(C1:C5)</code>
      </div>
    </div>
  )
}
