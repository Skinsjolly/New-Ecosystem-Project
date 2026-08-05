'use client'

import { useState, useRef } from 'react'
import { Type, Square, Image, Trash2 } from 'lucide-react'
import { SlideElement } from '@/app/page'

interface SlidesToolbarProps {
  onAddElement: (type: SlideElement['type']) => void
  onDeleteElement: () => void
  hasSelection: boolean
  slideBgColor: string
  onChangeSlideBg: (color: string) => void
}

const BG_COLORS = [
  '#ffffff', '#f8f9fa', '#e8eaed', '#dadce0',
  '#4285F4', '#34A853', '#FBBC05', '#EA4335',
  '#1a237e', '#004d40', '#bf360c', '#263238',
]

export default function SlidesToolbar({ onAddElement, onDeleteElement, hasSelection, slideBgColor, onChangeSlideBg }: SlidesToolbarProps) {
  const [showBgPicker, setShowBgPicker] = useState(false)
  const bgPickerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="h-12 border-b border-gray-200 flex items-center px-4 gap-1 bg-white flex-shrink-0">
      <button
        onClick={() => onAddElement('text')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium"
        title="Add Text"
      >
        <Type className="w-4 h-4" /> Text
      </button>
      <button
        onClick={() => onAddElement('shape')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium"
        title="Add Shape"
      >
        <Square className="w-4 h-4" /> Shape
      </button>
      <button
        onClick={() => onAddElement('image')}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium"
        title="Add Image"
      >
        <Image className="w-4 h-4" /> Image
      </button>

      {hasSelection && (
        <>
          <div className="w-px h-5 bg-gray-200 mx-1" />
          <button
            onClick={onDeleteElement}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
            title="Delete Selected"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </>
      )}

      <div className="ml-auto relative" ref={bgPickerRef}>
        <button
          onClick={() => setShowBgPicker(!showBgPicker)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors font-medium"
          title="Slide Background"
        >
          <div className="w-4 h-4 rounded border border-gray-300 shadow-inner" style={{ backgroundColor: slideBgColor }} />
          Background
        </button>

        {showBgPicker && (
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-3 z-50 w-[180px] animate-fade-in">
            <p className="text-xs text-gray-500 mb-2 font-medium">Slide Background</p>
            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {BG_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => { onChangeSlideBg(color); setShowBgPicker(false) }}
                  className={`w-8 h-8 rounded border-2 transition-transform hover:scale-110 ${slideBgColor === color ? 'border-blue-500' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Custom:</label>
              <input
                type="color"
                value={slideBgColor}
                onChange={(e) => { onChangeSlideBg(e.target.value); setShowBgPicker(false) }}
                className="w-8 h-6 rounded border border-gray-200 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
