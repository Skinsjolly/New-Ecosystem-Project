import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, username, googleId, avatar } = await req.json()

    if (!email || !googleId) {
      return NextResponse.json({ error: 'Invalid Google data' }, { status: 400 })
    }

    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] }
    })

    if (!user) {
      const baseUsername = username || email.split('@')[0]
      let finalUsername = baseUsername
      let counter = 1
      while (await prisma.user.findUnique({ where: { username: finalUsername } })) {
        finalUsername = `${baseUsername}${counter}`
        counter++
      }
      user = await prisma.user.create({
        data: {
          email,
          username: finalUsername,
          googleId,
          avatar,
        }
      })
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId, avatar: avatar || user.avatar }
      })
    }

    const token = generateToken(user)
    const response = NextResponse.json({
      user: { id: user.id, username: user.username, email: user.email, avatar: user.avatar },
      token,
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
    console.error('Google auth error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}