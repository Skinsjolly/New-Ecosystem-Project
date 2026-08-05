'use client'

import { useRef, useState, useEffect } from 'react'
import { Slide, SlideElement } from '@/app/page'

interface SlideCanvasProps {
  slide: Slide
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Partial<SlideElement>) => void
}

export default function SlideCanvas({ slide, selectedElementId, onSelectElement, onUpdateElement }: SlideCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState<{ id: string; startX: number; startY: number; origX: number; origY: number } | null>(null)
  const [resizing, setResizing] = useState<{ id: string; corner: string; startX: number; startY: number; origW: number; origH: number; origX: number; origY: number } | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (dragging && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const dx = ((e.clientX - dragging.startX) / rect.width) * 100
        const dy = ((e.clientY - dragging.startY) / rect.height) * 100
        onUpdateElement(dragging.id, { x: dragging.origX + dx, y: dragging.origY + dy })
      }
      if (resizing && canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect()
        const dx = ((e.clientX - resizing.startX) / rect.width) * 100
        const dy = ((e.clientY - resizing.startY) / rect.height) * 100
        const updates: Partial<SlideElement> = {}
        if (resizing.corner.includes('r')) updates.width = Math.max(5, resizing.origW + dx)
        if (resizing.corner.includes('b')) updates.height = Math.max(3, resizing.origH + dy)
        if (resizing.corner.includes('l')) {
          updates.width = Math.max(5, resizing.origW - dx)
          updates.x = resizing.origX + dx
        }
        if (resizing.corner.includes('t')) {
          updates.height = Math.max(3, resizing.origH - dy)
          updates.y = resizing.origY + dy
        }
        onUpdateElement(resizing.id, updates)
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
      setResizing(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, resizing, onUpdateElement])

  const handleElementMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation()
    if (editingId === element.id) return
    onSelectElement(element.id)
    setDragging({
      id: element.id,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
    })
  }

  const handleDoubleClick = (elementId: string) => {
    const element = slide.elements.find((el) => el.id === elementId)
    if (element?.type === 'text') {
      setEditingId(elementId)
    } else if (element?.type === 'image') {
      const url = prompt('Enter image URL:', element.content || 'https://')
      if (url !== null) {
        onUpdateElement(elementId, { content: url })
      }
    }
  }

  const renderResizeHandles = (element: SlideElement) => {
    if (selectedElementId !== element.id || editingId === element.id) return null
    return (
      <>
        <div className="resize-handle tl" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: element.id, corner: 'tl', startX: e.clientX, startY: e.clientY, origW: element.width, origH: element.height, origX: element.x, origY: element.y }) }} />
        <div className="resize-handle tr" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: element.id, corner: 'tr', startX: e.clientX, startY: e.clientY, origW: element.width, origH: element.height, origX: element.x, origY: element.y }) }} />
        <div className="resize-handle bl" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: element.id, corner: 'bl', startX: e.clientX, startY: e.clientY, origW: element.width, origH: element.height, origX: element.x, origY: element.y }) }} />
        <div className="resize-handle br" onMouseDown={(e) => { e.stopPropagation(); setResizing({ id: element.id, corner: 'br', startX: e.clientX, startY: e.clientY, origW: element.width, origH: element.height, origX: element.x, origY: element.y }) }} />
      </>
    )
  }

  const renderElement = (element: SlideElement) => {
    const isSelected = selectedElementId === element.id
    const isEditing = editingId === element.id

    const style: React.CSSProperties = {
      left: `${element.x}%`,
      top: `${element.y}%`,
      width: `${element.width}%`,
      height: `${element.height}%`,
      backgroundColor: element.type === 'shape' ? element.bgColor : 'transparent',
      borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
      fontSize: element.fontSize ? `${element.fontSize}px` : undefined,
      fontWeight: element.fontWeight,
      color: element.color,
      textAlign: element.textAlign as any,
      display: 'flex',
      alignItems: 'center',
      justifyContent: element.textAlign === 'center' ? 'center' : element.textAlign === 'right' ? 'flex-end' : 'flex-start',
      lineHeight: 1.3,
    }

    if (element.type === 'image') {
      return (
        <div
          key={element.id}
          className={`slide-element ${isSelected ? 'selected' : ''}`}
          style={style}
          onMouseDown={(e) => handleElementMouseDown(e, element)}
          onDoubleClick={() => handleDoubleClick(element.id)}
        >
          {element.content ? (
            <img src={element.content} alt="" className="w-full h-full object-contain" draggable={false} />
          ) : (
            <div className="w-full h-full border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-xs text-gray-400 bg-white/50">
              Double-click to add image
            </div>
          )}
          {renderResizeHandles(element)}
        </div>
      )
    }

    return (
      <div
        key={element.id}
        className={`slide-element ${isSelected ? 'selected' : ''}`}
        style={style}
        onMouseDown={(e) => handleElementMouseDown(e, element)}
        onDoubleClick={() => handleDoubleClick(element.id)}
      >
        {isEditing ? (
          <textarea
            autoFocus
            defaultValue={element.content}
            className="w-full h-full bg-transparent outline-none resize-none"
            style={{ fontSize: element.fontSize, fontWeight: element.fontWeight, color: element.color, textAlign: element.textAlign as any, lineHeight: 1.3 }}
            onBlur={(e) => {
              onUpdateElement(element.id, { content: e.target.value })
              setEditingId(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                onUpdateElement(element.id, { content: (e.target as HTMLTextAreaElement).value })
                setEditingId(null)
              }
              e.stopPropagation()
            }}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          element.type === 'text' ? (
            <span className="pointer-events-none">{element.content}</span>
          ) : null
        )}
        {renderResizeHandles(element)}
      </div>
    )
  }

  return (
    <div
      className="flex-1 overflow-auto p-6 md:p-10 flex items-center justify-center bg-gray-100"
      onClick={() => { onSelectElement(null); setEditingId(null) }}
    >
      <div
        ref={canvasRef}
        className="slide-canvas w-full max-w-[960px] bg-white shadow-lg rounded-sm"
        style={{ backgroundColor: slide.bgColor }}
      >
        {slide.elements.map(renderElement)}
      </div>
    </div>
  )
}
