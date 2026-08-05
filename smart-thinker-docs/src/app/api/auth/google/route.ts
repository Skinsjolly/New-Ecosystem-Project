import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateToken, verifyToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json()

    if (!credential) {
      return NextResponse.json({ error: 'Google credential is required' }, { status: 400 })
    }

    let payload: any
    try {
      const parts = credential.split('.')
      if (parts.length !== 3) throw new Error('Invalid JWT')
      const decoded = JSON.parse(Buffer.from(parts[1], 'base64url').toString())
      payload = decoded
    } catch {
      return NextResponse.json({ error: 'Invalid Google credential' }, { status: 401 })
    }

    const { sub: googleId, email, name, picture } = payload
    if (!googleId || !email) {
      return NextResponse.json({ error: 'Invalid Google token payload' }, { status: 401 })
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
    })

    if (user) {
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId, avatar: user.avatar || picture },
        })
      }
      if (!user.avatar && picture) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { avatar: picture },
        })
      }
    } else {
      const baseUsername = name?.replace(/\s+/g, '').toLowerCase() || email.split('@')[0]
      let username = baseUsername
      let counter = 1
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `${baseUsername}${counter}`
        counter++
      }

      user = await prisma.user.create({
        data: {
          username,
          email,
          googleId,
          avatar: picture,
        },
      })
    }

    const token = generateToken(user)

    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
    })

    response.cookies.set('st-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
