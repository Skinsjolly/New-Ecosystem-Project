'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import AuthProvider, { useAuth } from '@/components/AuthProvider'
import SlidePanel from '@/components/SlidePanel'
import SlideCanvas from '@/components/SlideCanvas'
import SlidesToolbar from '@/components/SlidesToolbar'
import PresentationMode from '@/components/PresentationMode'

export interface SlideElement {
  id: string
  type: 'text' | 'shape' | 'image'
  x: number
  y: number
  width: number
  height: number
  content: string
  fontSize?: number
  fontFamily?: string
  fontWeight?: string
  color?: string
  bgColor?: string
  borderRadius?: number
  shapeType?: 'rectangle' | 'circle' | 'triangle'
  textAlign?: 'left' | 'center' | 'right'
}

export interface Slide {
  id: string
  elements: SlideElement[]
  bgColor: string
}

export interface Presentation {
  id: string
  title: string
  slides: Slide[]
  theme: string
}

const DEFAULT_SLIDES: Slide[] = [
  {
    id: 'slide-1',
    bgColor: '#ffffff',
    elements: [
      { id: 'el-1', type: 'text', x: 10, y: 20, width: 80, height: 15, content: 'My Presentation', fontSize: 48, fontWeight: 'bold', color: '#202124', textAlign: 'center' },
      { id: 'el-2', type: 'text', x: 20, y: 45, width: 60, height: 8, content: 'Created with Smart Thinker Slides', fontSize: 20, color: '#5f6368', textAlign: 'center' },
      { id: 'el-3', type: 'shape', x: 35, y: 60, width: 30, height: 3, content: '', bgColor: '#4285F4', shapeType: 'rectangle', borderRadius: 2 },
    ],
  },
]

function LandingPage() {
  const { signInWithGoogle, loading } = useAuth()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg landing-gradient flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
          </div>
          <span className="text-lg font-medium text-gray-800">Smart Thinker Slides</span>
        </div>
        <button onClick={signInWithGoogle} className="btn-primary" disabled={loading}>
          Sign in to create
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="max-w-2xl text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
            Presentations that<br />
            <span className="text-transparent bg-clip-text landing-gradient">inspire action</span>
          </h1>
          <p className="text-lg text-gray-500 mb-8 leading-relaxed">
            Create professional presentations in your browser. Add text, shapes, and images with an intuitive drag-and-drop editor.
          </p>
          <button onClick={signInWithGoogle} className="btn-primary text-base px-8 py-3" disabled={loading}>
            <span className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Sign in with Google
            </span>
          </button>
        </div>

        <div className="max-w-4xl w-full">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="ml-4 flex gap-4 text-xs text-gray-400">
                <span>File</span><span>Edit</span><span>View</span><span>Insert</span>
              </div>
            </div>
            <div className="flex">
              <div className="w-48 border-r border-gray-200 bg-gray-50 p-2 space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`aspect-video rounded border-2 ${i === 1 ? 'border-blue-500' : 'border-gray-200'} bg-white p-2 flex items-center justify-center`}>
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-16 h-1 bg-gray-300 rounded" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex-1 bg-gray-200 p-6 flex items-center justify-center">
                <div className="aspect-video w-full max-w-2xl bg-white rounded shadow-lg flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-48 h-6 bg-gray-300 rounded mx-auto mb-3" />
                    <div className="w-32 h-3 bg-gray-200 rounded mx-auto" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-100">
        Smart Thinker Slides — Part of the Smart Thinker Ecosystem
      </footer>
    </div>
  )
}

function EditorPage() {
  const { user, logout } = useAuth()
  const [presentations, setPresentations] = useState<any[]>([])
  const [currentPresId, setCurrentPresId] = useState<string | null>(null)
  const [presentation, setPresentation] = useState<Presentation>({
    id: 'new',
    title: 'Untitled Presentation',
    slides: DEFAULT_SLIDES,
    theme: 'default',
  })
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [presenting, setPresenting] = useState(false)
  const [presentingSlide, setPresentingSlide] = useState(0)
  const [saving, setSaving] = useState(false)
  const [showPresList, setShowPresList] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeSlide = presentation.slides[activeSlideIndex]

  const loadPresentations = useCallback(async () => {
    try {
      const res = await fetch('/api/slides')
      if (res.ok) {
        const data = await res.json()
        setPresentations(data.presentations)
      }
    } catch {}
  }, [])

  const loadPresentation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/slides/${id}`)
      if (res.ok) {
        const data = await res.json()
        const pres = data.presentation
        let slides: Slide[]
        try {
          slides = JSON.parse(pres.slides)
        } catch {
          slides = DEFAULT_SLIDES
        }
        setPresentation({ id: pres.id, title: pres.title, slides, theme: pres.theme })
        setCurrentPresId(pres.id)
        setActiveSlideIndex(0)
        setSelectedElementId(null)
        setShowPresList(false)
      }
    } catch {}
  }, [])

  const saveToServer = useCallback(async (pres: Presentation) => {
    setSaving(true)
    try {
      if (currentPresId) {
        await fetch(`/api/slides/${currentPresId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: pres.title, slides: JSON.stringify(pres.slides) }),
        })
      } else {
        const res = await fetch('/api/slides', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: pres.title }),
        })
        if (res.ok) {
          const data = await res.json()
          setCurrentPresId(data.presentation.id)
          setPresentation((prev) => ({ ...prev, id: data.presentation.id }))

          const slidesRes = await fetch(`/api/slides/${data.presentation.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: pres.title, slides: JSON.stringify(pres.slides) }),
          })
        }
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
    setSaving(false)
  }, [currentPresId])

  const scheduleSave = useCallback((pres: Presentation) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => saveToServer(pres), 1500)
  }, [saveToServer])

  useEffect(() => {
    loadPresentations()
  }, [loadPresentations])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  const updatePresentation = (updates: Partial<Presentation>) => {
    const newPres = { ...presentation, ...updates }
    setPresentation(newPres)
    scheduleSave(newPres)
  }

  const addSlide = (afterIndex: number) => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      bgColor: '#ffffff',
      elements: [
        { id: `el-${Date.now()}`, type: 'text', x: 10, y: 30, width: 80, height: 15, content: 'New Slide', fontSize: 36, fontWeight: 'bold', color: '#202124', textAlign: 'center' },
      ],
    }
    const slides = [...presentation.slides]
    slides.splice(afterIndex + 1, 0, newSlide)
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    setActiveSlideIndex(afterIndex + 1)
    scheduleSave(newPres)
  }

  const duplicateSlide = (index: number) => {
    const original = presentation.slides[index]
    const duplicate: Slide = {
      ...original,
      id: `slide-${Date.now()}`,
      elements: original.elements.map((el) => ({ ...el, id: `el-${Date.now()}-${Math.random().toString(36).slice(2)}` })),
    }
    const slides = [...presentation.slides]
    slides.splice(index + 1, 0, duplicate)
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    setActiveSlideIndex(index + 1)
    scheduleSave(newPres)
  }

  const deleteSlide = (index: number) => {
    if (presentation.slides.length <= 1) return
    const slides = presentation.slides.filter((_, i) => i !== index)
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    setActiveSlideIndex(Math.min(index, slides.length - 1))
    scheduleSave(newPres)
  }

  const updateElement = (slideIndex: number, elementId: string, updates: Partial<SlideElement>) => {
    const slides = [...presentation.slides]
    const slide = { ...slides[slideIndex] }
    slide.elements = slide.elements.map((el) => (el.id === elementId ? { ...el, ...updates } : el))
    slides[slideIndex] = slide
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    scheduleSave(newPres)
  }

  const addElement = (type: SlideElement['type']) => {
    const newElement: SlideElement = {
      id: `el-${Date.now()}`,
      type,
      x: 20 + Math.random() * 20,
      y: 20 + Math.random() * 20,
      width: type === 'text' ? 40 : 20,
      height: type === 'text' ? 10 : 20,
      content: type === 'text' ? 'Click to edit' : '',
      fontSize: 18,
      color: '#202124',
      bgColor: type === 'shape' ? '#4285F4' : undefined,
      shapeType: type === 'shape' ? 'rectangle' : undefined,
      textAlign: type === 'text' ? 'left' : undefined,
    }
    const slides = [...presentation.slides]
    const slide = { ...slides[activeSlideIndex] }
    slide.elements = [...slide.elements, newElement]
    slides[activeSlideIndex] = slide
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    setSelectedElementId(newElement.id)
    scheduleSave(newPres)
  }

  const deleteElement = (elementId: string) => {
    const slides = [...presentation.slides]
    const slide = { ...slides[activeSlideIndex] }
    slide.elements = slide.elements.filter((el) => el.id !== elementId)
    slides[activeSlideIndex] = slide
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    setSelectedElementId(null)
    scheduleSave(newPres)
  }

  const moveSlide = (fromIndex: number, toIndex: number) => {
    const slides = [...presentation.slides]
    const [moved] = slides.splice(fromIndex, 1)
    slides.splice(toIndex, 0, moved)
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    setActiveSlideIndex(toIndex)
    scheduleSave(newPres)
  }

  const updateSlideBg = (color: string) => {
    const slides = [...presentation.slides]
    slides[activeSlideIndex] = { ...slides[activeSlideIndex], bgColor: color }
    const newPres = { ...presentation, slides }
    setPresentation(newPres)
    scheduleSave(newPres)
  }

  const startPresentation = () => {
    setPresentingSlide(0)
    setPresenting(true)
  }

  const createNewPresentation = async () => {
    const res = await fetch('/api/slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Untitled Presentation' }),
    })
    if (res.ok) {
      const data = await res.json()
      const pres = data.presentation
      let slides: Slide[]
      try { slides = JSON.parse(pres.slides) } catch { slides = DEFAULT_SLIDES }
      setPresentation({ id: pres.id, title: pres.title, slides, theme: pres.theme })
      setCurrentPresId(pres.id)
      setActiveSlideIndex(0)
      setSelectedElementId(null)
      setShowPresList(false)
      loadPresentations()
    }
  }

  const deletePresentation = async (id: string) => {
    await fetch(`/api/slides/${id}`, { method: 'DELETE' })
    if (currentPresId === id) {
      setCurrentPresId(null)
      setPresentation({ id: 'new', title: 'Untitled Presentation', slides: DEFAULT_SLIDES, theme: 'default' })
      setActiveSlideIndex(0)
      setSelectedElementId(null)
    }
    loadPresentations()
  }

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedElementId && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        deleteElement(selectedElementId)
      }
    }
  }, [selectedElementId])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="h-screen flex flex-col bg-white">
      <header className="h-12 border-b border-gray-200 flex items-center px-4 gap-3 flex-shrink-0 bg-white">
        <button onClick={() => setShowPresList(!showPresList)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="All presentations">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#5f6368" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
        </button>
        <div className="w-px h-6 bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded landing-gradient flex items-center justify-center flex-shrink-0">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
          </div>
          <input
            type="text"
            value={presentation.title}
            onChange={(e) => updatePresentation({ title: e.target.value })}
            className="text-sm font-medium text-gray-700 bg-transparent outline-none border-b border-transparent hover:border-gray-300 focus:border-blue-500 px-1 py-0.5 max-w-[300px] transition-colors"
          />
        </div>
        <span className="text-[11px] text-gray-400 ml-1">{saving ? 'Saving...' : 'Saved'}</span>
        <div className="flex items-center gap-2 ml-auto">
          <button onClick={startPresentation} className="btn-primary text-xs px-4 py-1.5">
            Present
          </button>
          <div className="relative">
            <button onClick={() => {}} className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-medium hover:bg-blue-600 transition-colors" title={user?.email}>
              {user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'}
            </button>
          </div>
        </div>
      </header>

      {showPresList && (
        <div className="absolute top-12 left-0 right-0 bottom-0 z-50 bg-white overflow-auto animate-fade-in">
          <div className="max-w-5xl mx-auto p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-medium text-gray-800">Your Presentations</h2>
              <div className="flex items-center gap-3">
                <button onClick={createNewPresentation} className="btn-primary text-sm">
                  + New Presentation
                </button>
                <button onClick={() => setShowPresList(false)} className="btn-secondary text-sm">
                  Back to Editor
                </button>
              </div>
            </div>
            {presentations.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <p className="text-lg">No presentations yet</p>
                <p className="text-sm mt-2">Create your first presentation to get started.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {presentations.map((pres) => (
                  <div
                    key={pres.id}
                    className={`group relative border-2 rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-lg ${currentPresId === pres.id ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'}`}
                    onClick={() => loadPresentation(pres.id)}
                  >
                    <div className="aspect-video bg-white p-3">
                      <div className="w-full h-full bg-gray-50 rounded flex items-center justify-center text-xs text-gray-400">
                        Slides
                      </div>
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-800 truncate">{pres.title}</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          {new Date(pres.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); deletePresentation(pres.id) }}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all"
                        title="Delete"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <SlidePanel
          slides={presentation.slides}
          activeIndex={activeSlideIndex}
          onSelect={setActiveSlideIndex}
          onAdd={addSlide}
          onDuplicate={duplicateSlide}
          onDelete={deleteSlide}
          onMove={moveSlide}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <SlidesToolbar
            onAddElement={addElement}
            onDeleteElement={() => selectedElementId && deleteElement(selectedElementId)}
            hasSelection={!!selectedElementId}
            slideBgColor={activeSlide?.bgColor || '#ffffff'}
            onChangeSlideBg={updateSlideBg}
          />
          <SlideCanvas
            slide={activeSlide}
            selectedElementId={selectedElementId}
            onSelectElement={setSelectedElementId}
            onUpdateElement={(elementId, updates) => updateElement(activeSlideIndex, elementId, updates)}
          />
        </div>
      </div>

      {presenting && (
        <PresentationMode
          slides={presentation.slides}
          currentSlide={presentingSlide}
          onNext={() => setPresentingSlide((prev) => Math.min(prev + 1, presentation.slides.length - 1))}
          onPrev={() => setPresentingSlide((prev) => Math.max(prev - 1, 0))}
          onExit={() => setPresenting(false)}
        />
      )}
    </div>
  )
}

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg landing-gradient flex items-center justify-center animate-pulse">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            </svg>
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return user ? <EditorPage /> : <LandingPage />
}

export default function SlidesPage() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
