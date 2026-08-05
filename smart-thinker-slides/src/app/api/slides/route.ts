import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

function getUser(req: NextRequest) {
  const token = req.cookies.get('st-token')?.value
  if (!token) return null
  return verifyToken(token)
}

const DEFAULT_SLIDES = JSON.stringify([
  {
    id: 'slide-1',
    bgColor: '#ffffff',
    elements: [
      { id: 'el-1', type: 'text', x: 10, y: 20, width: 80, height: 15, content: 'My Presentation', fontSize: 48, fontWeight: 'bold', color: '#202124', textAlign: 'center' },
      { id: 'el-2', type: 'text', x: 20, y: 45, width: 60, height: 8, content: 'Created with Smart Thinker Slides', fontSize: 20, color: '#5f6368', textAlign: 'center' },
      { id: 'el-3', type: 'shape', x: 35, y: 60, width: 30, height: 3, content: '', bgColor: '#4285F4', shapeType: 'rectangle', borderRadius: 2 },
    ],
  },
])

export async function GET(req: NextRequest) {
  try {
    const payload = getUser(req)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const presentations = await prisma.slidePresentation.findMany({
      where: { userId: payload.userId },
      select: { id: true, title: true, slides: true, theme: true, createdAt: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ presentations })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getUser(req)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { title } = await req.json()

    const presentation = await prisma.slidePresentation.create({
      data: {
        userId: payload.userId,
        title: title || 'Untitled Presentation',
        slides: DEFAULT_SLIDES,
      },
      select: { id: true, title: true, slides: true, theme: true, createdAt: true, updatedAt: true },
    })

    return NextResponse.json({ presentation })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
