import { NextRequest, NextResponse } from 'next/server'
import { getUserFromReq } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const spreadsheet = await prisma.spreadsheet.findFirst({ where: { id: params.id, userId: user.id } })
    if (!spreadsheet) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ spreadsheet })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { title, sheets } = await req.json()
    const spreadsheet = await prisma.spreadsheet.updateMany({ where: { id: params.id, userId: user.id }, data: { title, sheets: JSON.stringify(sheets) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    await prisma.spreadsheet.deleteMany({ where: { id: params.id, userId: user.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
