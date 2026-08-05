'use client'

import { useState } from 'react'
import { Plus, Copy, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { Slide } from '@/app/page'

interface SlidePanelProps {
  slides: Slide[]
  activeIndex: number
  onSelect: (index: number) => void
  onAdd: (afterIndex: number) => void
  onDuplicate: (index: number) => void
  onDelete: (index: number) => void
  onMove: (from: number, to: number) => void
}

export default function SlidePanel({ slides, activeIndex, onSelect, onAdd, onDuplicate, onDelete, onMove }: SlidePanelProps) {
  const [menuIndex, setMenuIndex] = useState<number | null>(null)

  const renderThumbnail = (slide: Slide) => {
    return (
      <div
        className="w-full h-full flex items-center justify-center p-2"
        style={{ backgroundColor: slide.bgColor }}
      >
        {slide.elements.map((el) => (
          <div
            key={el.id}
            className="absolute text-center flex items-center justify-center overflow-hidden"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              fontSize: `${(el.fontSize || 12) * 0.25}px`,
              fontWeight: el.fontWeight,
              color: el.color,
              backgroundColor: el.type === 'shape' ? el.bgColor : 'transparent',
              borderRadius: el.borderRadius ? `${el.borderRadius * 0.5}px` : undefined,
            }}
          >
            {el.type === 'text' ? el.content : ''}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="w-[220px] border-r border-gray-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
      <div className="p-3 border-b border-gray-200">
        <button
          onClick={() => onAdd(slides.length - 1)}
          className="flex items-center gap-2 w-full justify-center bg-blue-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            onClick={() => onSelect(index)}
            className={`group relative cursor-pointer rounded-lg overflow-hidden transition-all animate-slide-in ${
              activeIndex === index
                ? 'ring-2 ring-blue-500 shadow-sm'
                : 'hover:ring-1 hover:ring-gray-300'
            }`}
          >
            <div className="slide-thumbnail relative bg-white">
              <div className="text-[10px] text-gray-400 absolute top-1 left-1.5 z-10 bg-white/90 px-1.5 py-0.5 rounded font-medium">
                {index + 1}
              </div>
              <div className="relative w-full h-full scale-[0.15] origin-top-left" style={{ width: '667%', height: '667%' }}>
                {renderThumbnail(slide)}
              </div>
            </div>

            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex gap-0.5 z-20">
              <button
                onClick={(e) => { e.stopPropagation(); setMenuIndex(menuIndex === index ? null : index) }}
                className="bg-white/90 p-1 rounded shadow-sm text-xs hover:bg-white transition-colors"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="#5f6368">
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>

            {menuIndex === index && (
              <div className="absolute top-8 right-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-[130px] z-50">
                <button
                  onClick={(e) => { e.stopPropagation(); onDuplicate(index); setMenuIndex(null) }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); onAdd(index); setMenuIndex(null) }}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Add after
                </button>
                {index > 0 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMove(index, index - 1); setMenuIndex(null) }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5" /> Move up
                  </button>
                )}
                {index < slides.length - 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onMove(index, index + 1); setMenuIndex(null) }}
                    className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-gray-50 text-gray-700 transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5" /> Move down
                  </button>
                )}
                {slides.length > 1 && (
                  <>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={(e) => { e.stopPropagation(); onDelete(index); setMenuIndex(null) }}
                      className="flex items-center gap-2 w-full px-3 py-1.5 text-xs hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
