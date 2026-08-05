import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromReq } from '@/lib/auth'

function buildMimeMessage(to: string, subject: string, body: string, from: string): string {
  const boundary = 'boundary_' + Date.now().toString(36)
  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset="UTF-8"',
    '',
    body,
    `--${boundary}--`,
  ].join('\r\n')
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromReq(req)
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { to, subject, body, from } = await req.json()
    if (!to || !subject || !body) {
      return NextResponse.json({ error: 'To, subject, and body are required' }, { status: 400 })
    }

    const googleAccount = await prisma.emailAccount.findFirst({
      where: { userId: user.id, provider: 'google' },
    })

    if (!googleAccount?.accessToken) {
      return NextResponse.json({ error: 'No linked Gmail account found. Link your Gmail first.' }, { status: 400 })
    }

    const mimeMessage = buildMimeMessage(to, subject, body, from || googleAccount.email)
    const encoded = base64UrlEncode(mimeMessage)

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${googleAccount.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encoded }),
    })

    if (!res.ok) {
      const errText = await res.text()
      return NextResponse.json(
        { error: `Failed to send: ${res.status} - ${errText}` },
        { status: res.status }
      )
    }

    const data = await res.json()
    return NextResponse.json({ id: data.id, success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}