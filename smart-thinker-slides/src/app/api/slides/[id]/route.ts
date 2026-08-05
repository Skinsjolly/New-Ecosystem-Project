import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

function getUser(req: NextRequest) {
  const token = req.cookies.get('st-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getUser(req)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const presentation = await prisma.slidePresentation.findFirst({
      where: { id: params.id, userId: payload.userId },
      select: { id: true, title: true, slides: true, theme: true, createdAt: true, updatedAt: true },
    })

    if (!presentation) {
      return NextResponse.json({ error: 'Presentation not found' }, { status: 404 })
    }

    return NextResponse.json({ presentation })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getUser(req)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const existing = await prisma.slidePresentation.findFirst({
      where: { id: params.id, userId: payload.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Presentation not found' }, { status: 404 })
    }

    const body = await req.json()
    const updateData: any = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.slides !== undefined) updateData.slides = typeof body.slides === 'string' ? body.slides : JSON.stringify(body.slides)
    if (body.theme !== undefined) updateData.theme = body.theme

    const presentation = await prisma.slidePresentation.update({
      where: { id: params.id },
      data: updateData,
      select: { id: true, title: true, slides: true, theme: true, createdAt: true, updatedAt: true },
    })

    return NextResponse.json({ presentation })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const payload = getUser(req)
    if (!payload) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const existing = await prisma.slidePresentation.findFirst({
      where: { id: params.id, userId: payload.userId },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Presentation not found' }, { status: 404 })
    }

    await prisma.slidePresentation.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
