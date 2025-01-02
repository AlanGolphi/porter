'use server'

import { User } from '@prisma/client'
import { compare, hash } from 'bcryptjs'
import { jwtVerify, SignJWT } from 'jose'
import { cookies } from 'next/headers'

const alg = 'HS256'
const SALT_ROUNDS = 10
const authKey = new TextEncoder().encode(process.env.JWT_SECRET)

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS)
}

export async function comparePasswords(plainTextPassword: string, hashedPassword: string) {
  return compare(plainTextPassword, hashedPassword)
}

type SessionData = {
  user: {
    id: string
  }
  expires: string
}

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('1 day from now')
    .sign(authKey)
}

export async function verifyToken(session: string) {
  const { payload } = await jwtVerify(session, authKey, {
    algorithms: [alg],
  })
  return payload as SessionData
}

export async function getSession() {
  const session = (await cookies()).get('session')?.value
  if (!session) return null
  return verifyToken(session)
}

export async function setSession(user: User) {
  'use server'
  const expiresInOneDay = new Date(Date.now() + 1000 * 60 * 60 * 24)
  const session: SessionData = {
    user: {
      id: user.id,
    },
    expires: expiresInOneDay.toISOString(),
  }
  const cookieStore = await cookies()
  const encryptedSession = await signToken(session)

  cookieStore.set('session', encryptedSession, {
    expires: expiresInOneDay,
    // TODO: enable secure cookies
    // secure: true,
    httpOnly: true,
    sameSite: 'lax',
  })
}
