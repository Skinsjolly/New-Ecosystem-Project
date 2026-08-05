import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cookieToken = req.cookies.get('st-token')?.value
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : cookieToken

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { provider, email, accessToken, refreshToken, label, imapHost, imapPort, smtpHost, smtpPort } = await req.json()

    if (!provider || !email) {
      return NextResponse.json({ error: 'Provider and email are required' }, { status: 400 })
    }

    const existing = await prisma.emailAccount.findFirst({
      where: { userId: payload.userId, email, provider },
    })

    let account
    if (existing) {
      account = await prisma.emailAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: accessToken || existing.accessToken,
          refreshToken: refreshToken || existing.refreshToken,
          label: label || existing.label,
          imapHost: imapHost || existing.imapHost,
          imapPort: imapPort || existing.imapPort,
          smtpHost: smtpHost || existing.smtpHost,
          smtpPort: smtpPort || existing.smtpPort,
        },
      })
    } else {
      account = await prisma.emailAccount.create({
        data: {
          userId: payload.userId,
          provider,
          email,
          accessToken,
          refreshToken,
          label,
          imapHost,
          imapPort,
          smtpHost,
          smtpPort,
        },
      })
    }

    return NextResponse.json({
      account: {
        id: account.id,
        provider: account.provider,
        email: account.email,
        label: account.label,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cookieToken = req.cookies.get('st-token')?.value
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : cookieToken

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const accounts = await prisma.emailAccount.findMany({
      where: { userId: payload.userId },
      select: { id: true, provider: true, email: true, label: true, createdAt: true },
    })

    return NextResponse.json({ accounts })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization')
    const cookieToken = req.cookies.get('st-token')?.value
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : cookieToken

    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const accountId = searchParams.get('id')

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 })
    }

    await prisma.emailAccount.deleteMany({
      where: { id: accountId, userId: payload.userId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
