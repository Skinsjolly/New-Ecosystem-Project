import { NextRequest, NextResponse } from 'next/server'
import { getUserFromReq } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const spreadsheets = await prisma.spreadsheet.findMany({ where: { userId: user.id }, orderBy: { updatedAt: 'desc' }, select: { id: true, title: true, createdAt: true, updatedAt: true } })
    return NextResponse.json({ spreadsheets })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromReq(req)
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const { title } = await req.json()
    const spreadsheet = await prisma.spreadsheet.create({ data: { userId: user.id, title: title || 'Untitled Spreadsheet' } })
    return NextResponse.json({ spreadsheet })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
