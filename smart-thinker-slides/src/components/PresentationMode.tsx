'use client'

import { useEffect, useState } from 'react'
import { Slide } from '@/app/page'

interface PresentationModeProps {
  slides: Slide[]
  currentSlide: number
  onNext: () => void
  onPrev: () => void
  onExit: () => void
}

export default function PresentationMode({ slides, currentSlide, onNext, onPrev, onExit }: PresentationModeProps) {
  const [showControls, setShowControls] = useState(true)
  const [controlsTimer, setControlsTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          onNext()
          break
        case 'ArrowLeft':
        case 'Backspace':
          onPrev()
          break
        case 'Escape':
          onExit()
          break
      }
      setShowControls(true)
      if (controlsTimer) clearTimeout(controlsTimer)
      const timer = setTimeout(() => setShowControls(false), 3000)
      setControlsTimer(timer)
    }

    const handleMouseMove = () => {
      setShowControls(true)
      if (controlsTimer) clearTimeout(controlsTimer)
      const timer = setTimeout(() => setShowControls(false), 3000)
      setControlsTimer(timer)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('mousemove', handleMouseMove)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('mousemove', handleMouseMove)
      if (controlsTimer) clearTimeout(controlsTimer)
    }
  }, [onNext, onPrev, onExit, controlsTimer])

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  const slide = slides[currentSlide]

  return (
    <div className="presentation-overlay" onClick={onNext}>
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ backgroundColor: slide.bgColor }}
      >
        {slide.elements.map((el) => (
          <div
            key={el.id}
            className="absolute"
            style={{
              left: `${el.x}%`,
              top: `${el.y}%`,
              width: `${el.width}%`,
              height: `${el.height}%`,
              fontSize: `${el.fontSize}px`,
              fontWeight: el.fontWeight,
              color: el.color,
              backgroundColor: el.type === 'shape' ? el.bgColor : 'transparent',
              borderRadius: el.borderRadius ? `${el.borderRadius}px` : undefined,
              display: 'flex',
              alignItems: 'center',
              justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
              textAlign: el.textAlign as any,
              lineHeight: 1.3,
            }}
          >
            {el.type === 'text' ? el.content : ''}
            {el.type === 'image' && el.content && (
              <img src={el.content} alt="" className="w-full h-full object-contain" />
            )}
          </div>
        ))}
      </div>

      <div
        className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/70 backdrop-blur-sm rounded-full px-5 py-2.5 transition-opacity duration-300"
        style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? 'auto' : 'none' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onPrev} disabled={currentSlide === 0} className="text-white disabled:opacity-30 hover:opacity-80 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <span className="text-white text-sm font-medium min-w-[60px] text-center">
          {currentSlide + 1} / {slides.length}
        </span>
        <button onClick={onNext} disabled={currentSlide === slides.length - 1} className="text-white disabled:opacity-30 hover:opacity-80 transition-opacity">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <div className="w-px h-5 bg-white/30" />
        <button onClick={onExit} className="text-white hover:opacity-80 transition-opacity" title="Exit presentation (Esc)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
