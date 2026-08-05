import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyToken } from '@/lib/auth'

function getToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization')
  const cookieToken = req.cookies.get('st-token')?.value
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : cookieToken
  return token || null
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      const redirectUrl = new URL('/', req.url)
      redirectUrl.searchParams.set('link', 'error')
      return NextResponse.redirect(redirectUrl)
    }

    if (!code) {
      return NextResponse.json({ error: 'Missing authorization code' }, { status: 400 })
    }

    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Google OAuth is not configured. Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET.' },
        { status: 500 }
      )
    }

    const base = req.headers.get('x-forwarded-proto') || 'https'
    const host = req.headers.get('host')
    const redirectUri = `${base}://${host}/api/email/google/callback`

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenRes.ok) {
      const errText = await tokenRes.text()
      console.error('Google token exchange failed:', tokenRes.status, errText)
      return NextResponse.json({ error: 'Token exchange failed' }, { status: 500 })
    }

    const tokens = await tokenRes.json()
    const accessToken: string = tokens.access_token
    const refreshToken: string | undefined = tokens.refresh_token
    const expiresIn: number = tokens.expires_in || 3600
    const expiresAt = new Date(Date.now() + expiresIn * 1000)

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    let email = ''
    let label = ''
    if (userRes.ok) {
      const profile = await userRes.json()
      email = profile.email || ''
      label = profile.name || ''
    }

    const token = getToken(req)
    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    if (!email) {
      return NextResponse.json({ error: 'Could not determine Gmail address' }, { status: 500 })
    }

    const existing = await prisma.emailAccount.findFirst({
      where: { userId: payload.userId, provider: 'google', email },
    })

    if (existing) {
      await prisma.emailAccount.update({
        where: { id: existing.id },
        data: {
          accessToken,
          refreshToken: refreshToken || existing.refreshToken,
          expiresAt,
          label: label || existing.label,
        },
      })
    } else {
      await prisma.emailAccount.create({
        data: {
          userId: payload.userId,
          provider: 'google',
          email,
          label,
          accessToken,
          refreshToken,
          expiresAt,
        },
      })
    }

    const redirectUrl = new URL('/', req.url)
    redirectUrl.searchParams.set('link', 'success')
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error('Google OAuth callback error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
