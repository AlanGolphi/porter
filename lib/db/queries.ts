import { cookies } from 'next/headers'
import { db } from '.'
import { verifyToken } from '../auth/session'

export const getUser = async () => {
  const sessionCookie = (await cookies()).get('session')
  if (!sessionCookie?.value) return null

  const sessionData = await verifyToken(sessionCookie.value)
  if (!sessionData || !sessionData?.user?.id) return null
  if (new Date(sessionData.expires) < new Date()) return null

  const user = await db.user.findUnique({
    where: { id: sessionData.user.id },
  })
  if (!user) return null
  return user
}
