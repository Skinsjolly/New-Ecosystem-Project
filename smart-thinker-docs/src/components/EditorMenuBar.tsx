'use client'

import { useState, useCallback } from 'react'
import { Editor } from '@tiptap/react'
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code,
  Heading1, Heading2, Heading3, Pilcrow,
  List, ListOrdered, ListChecks,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Minus, Undo, Redo, Link2, Image as ImageIcon,
  Highlighter, Table as TableIcon, Palette, RemoveFormatting
} from 'lucide-react'

interface EditorMenuBarProps {
  editor: Editor
}

export default function EditorMenuBar({ editor }: EditorMenuBarProps) {
  const [showColorPicker, setShowColorPicker] = useState(false)

  const addImage = useCallback(() => {
    const url = prompt('Enter image URL:')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }, [editor])

  const addTable = useCallback(() => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()
  }, [editor])

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href
    const url = prompt('Enter URL:', previousUrl)
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  const setTextStyle = useCallback((level: string) => {
    if (level === '0') editor.chain().focus().setParagraph().run()
    else editor.chain().focus().toggleHeading({ level: parseInt(level) as 1 | 2 | 3 }).run()
  }, [editor])

  const currentStyle = editor.isActive('heading', { level: 1 }) ? '1'
    : editor.isActive('heading', { level: 2 }) ? '2'
    : editor.isActive('heading', { level: 3 }) ? '3' : '0'

  return (
    <div className="border-b border-st-border bg-white px-3 py-1.5 flex items-center gap-0.5 flex-shrink-0 flex-wrap sticky top-0 z-10">
      {/* Undo / Redo */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        className="toolbar-btn"
        title="Undo (Ctrl+Z)"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        className="toolbar-btn"
        title="Redo (Ctrl+Shift+Z)"
      >
        <Redo className="w-4 h-4" />
      </button>

      <div className="toolbar-separator" />

      {/* Text style dropdown */}
      <select
        onChange={(e) => setTextStyle(e.target.value)}
        className="toolbar-select"
        value={currentStyle}
      >
        <option value="0">Normal text</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
      </select>

      <div className="toolbar-separator" />

      {/* Inline formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`toolbar-btn ${editor.isActive('underline') ? 'active' : ''}`}
        title="Underline (Ctrl+U)"
      >
        <UnderlineIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`toolbar-btn ${editor.isActive('code') ? 'active' : ''}`}
        title="Inline Code"
      >
        <Code className="w-4 h-4" />
      </button>

      <div className="toolbar-separator" />

      {/* Color & highlight */}
      <div className="relative">
        <button
          onClick={() => setShowColorPicker(!showColorPicker)}
          className={`toolbar-btn ${editor.isActive('textStyle', { color: editor.getAttributes('textStyle').color }) ? 'active' : ''}`}
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
        </button>
        {showColorPicker && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-white border border-st-border rounded-lg shadow-lg z-50">
            <div className="grid grid-cols-6 gap-1 mb-2">
              {[
                '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc',
                '#ea4335', '#fa7b17', '#fbbc04', '#34a853', '#4285f4', '#a142f4',
                '#ff6d01', '#1a73e8', '#188038', '#c5221f', '#1967d2', '#7627bb',
              ].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    editor.chain().focus().setColor(color).run()
                    setShowColorPicker(false)
                  }}
                  className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
            <button
              onClick={() => {
                editor.chain().focus().unsetColor().run()
                setShowColorPicker(false)
              }}
              className="w-full text-xs text-center py-1 hover:bg-gray-100 rounded"
            >
              Reset color
            </button>
          </div>
        )}
      </div>
      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`toolbar-btn ${editor.isActive('highlight') ? 'active' : ''}`}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </button>

      <div className="toolbar-separator" />

      {/* Alignment */}
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: 'left' }) ? 'active' : ''}`}
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: 'center' }) ? 'active' : ''}`}
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: 'right' }) ? 'active' : ''}`}
        title="Align Right"
      >
        <AlignRight className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('justify').run()}
        className={`toolbar-btn ${editor.isActive({ textAlign: 'justify' }) ? 'active' : ''}`}
        title="Justify"
      >
        <AlignJustify className="w-4 h-4" />
      </button>

      <div className="toolbar-separator" />

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        <List className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleTaskList().run()}
        className={`toolbar-btn ${editor.isActive('taskList') ? 'active' : ''}`}
        title="Task List"
      >
        <ListChecks className="w-4 h-4" />
      </button>

      <div className="toolbar-separator" />

      {/* Block elements */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn ${editor.isActive('blockquote') ? 'active' : ''}`}
        title="Quote"
      >
        <Quote className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="toolbar-btn"
        title="Horizontal Rule"
      >
        <Minus className="w-4 h-4" />
      </button>

      <div className="toolbar-separator" />

      {/* Insert */}
      <button
        onClick={setLink}
        className={`toolbar-btn ${editor.isActive('link') ? 'active' : ''}`}
        title="Insert Link"
      >
        <Link2 className="w-4 h-4" />
      </button>
      <button
        onClick={addImage}
        className="toolbar-btn"
        title="Insert Image"
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <button
        onClick={addTable}
        className="toolbar-btn"
        title="Insert Table"
      >
        <TableIcon className="w-4 h-4" />
      </button>

      <div className="toolbar-separator" />

      {/* Clear formatting */}
      <button
        onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        className="toolbar-btn"
        title="Clear Formatting"
      >
        <RemoveFormatting className="w-4 h-4" />
      </button>
    </div>
  )
}
