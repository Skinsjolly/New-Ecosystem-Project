import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './db'

const JWT_SECRET = process.env.JWT_SECRET || 'smart-thinker-secret-key-change-in-production'

export interface TokenPayload {
  userId: string
  email: string
  username: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: { id: string; email: string; username: string }): string {
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email,
    username: user.username,
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload
  } catch {
    return null
  }
}

export async function createUser(data: {
  username: string
  email: string
  password?: string
  googleId?: string
  avatar?: string
}) {
  const hashedPassword = data.password ? await hashPassword(data.password) : null
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      googleId: data.googleId,
      avatar: data.avatar,
    },
  })
}

export async function authenticateUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.password) return null
  const valid = await verifyPassword(password, user.password)
  if (!valid) return null
  return user
}

export async function getUserFromToken(token: string) {
  const payload = verifyToken(token)
  if (!payload) return null
  return prisma.user.findUnique({ where: { id: payload.userId } })
}

export async function getUserFromReq(req: Request) {
  const cookieHeader = req.headers.get('cookie') || ''
  const tokenMatch = cookieHeader.match(/st-token=([^;]+)/)
  const token = tokenMatch ? tokenMatch[1] : null
  if (token) {
    const user = await getUserFromToken(token)
    if (user) return user
  }
  const authHeader = req.headers.get('authorization') || ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (bearerToken) return getUserFromToken(bearerToken)
  return null
}
