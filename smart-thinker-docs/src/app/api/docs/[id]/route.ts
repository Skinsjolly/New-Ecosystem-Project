import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromReq } from '@/lib/auth'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromReq(req)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const document = await prisma.document.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    return NextResponse.json({ document })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromReq(req)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const existing = await prisma.document.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    const body = await req.json()
    const updateData: { title?: string; content?: string } = {}

    if (body.title !== undefined) updateData.title = body.title
    if (body.content !== undefined) updateData.content = body.content

    const document = await prisma.document.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({ document })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromReq(req)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const existing = await prisma.document.findFirst({
      where: { id: params.id, userId: user.id },
    })

    if (!existing) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 })
    }

    await prisma.document.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
