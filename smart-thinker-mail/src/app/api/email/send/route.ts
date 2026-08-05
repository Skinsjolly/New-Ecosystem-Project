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

async function refreshGoogleToken(account: { id: string; accessToken: string | null; refreshToken: string | null; expiresAt: Date | null }): Promise<string | null> {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  if (!account.refreshToken || !clientId || !clientSecret) {
    return null
  }

  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: account.refreshToken,
        grant_type: 'refresh_token',
      }),
    })

    if (!res.ok) return null

    const data = await res.json()
    if (!data.access_token) return null

    const expiresIn = data.expires_in || 3600
    await prisma.emailAccount.update({
      where: { id: account.id },
      data: {
        accessToken: data.access_token,
        expiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    })
    return data.access_token
  } catch {
    return null
  }
}

async function getUsableAccessToken(account: { id: string; accessToken: string | null; refreshToken: string | null; expiresAt: Date | null }): Promise<string | null> {
  if (account.accessToken && (!account.expiresAt || account.expiresAt.getTime() > Date.now() + 60_000)) {
    return account.accessToken
  }
  return refreshGoogleToken(account)
}

async function sendViaGmail(accessToken: string, mimeMessage: string): Promise<Response> {
  const encoded = base64UrlEncode(mimeMessage)
  return fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: encoded }),
  })
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

    let accessToken = await getUsableAccessToken(googleAccount)

    const mimeMessage = buildMimeMessage(to, subject, body, from || googleAccount.email)

    let res = await sendViaGmail(accessToken, mimeMessage)

    if (res.status === 401) {
      accessToken = await refreshGoogleToken(googleAccount)
      if (accessToken) {
        res = await sendViaGmail(accessToken, mimeMessage)
      }
    }

    if (!res.ok) {
      const errText = await res.text()
      if (res.status === 403 && errText.includes('SERVICE_DISABLED')) {
        return NextResponse.json(
          { error: 'Gmail API is not enabled for this Google project. Enable it at https://console.developers.google.com/apis/api/gmail.googleapis.com/overview then try again.' },
          { status: 403 }
        )
      }
      if (res.status === 401) {
        return NextResponse.json(
          { error: 'Gmail access token expired and could not be refreshed. Re-link your Gmail account.' },
          { status: 401 }
        )
      }
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