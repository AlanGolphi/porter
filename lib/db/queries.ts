'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
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

export const getFileByHash = async (hash: string) => {
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }

  const file = await db.uploadedFile.findFirst({
    where: { userId: user.id, OR: [{ hash }, { hash: null }] },
  })
  return file
}

interface StoreFileProps {
  filename: string
  fileSize: number
  mimeType: string
  url: string
  hash?: string
}

export const storeFile = async ({ filename, fileSize, mimeType, hash, url }: StoreFileProps) => {
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  if (user.storageQuota < fileSize) throw new Error('Storage quota exceeded')

  const transactionStoredFile = await db.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: { storageQuota: { decrement: fileSize } },
    })

    const storedFile = await tx.uploadedFile.create({
      data: {
        filename,
        size: fileSize,
        mimeType,
        hash,
        url,
        userId: user.id,
      },
    })
    return storedFile
  })

  return transactionStoredFile
}

export const getUserUploadedFiles = async (page = 1, limit = 15, q?: string, mimeType?: string) => {
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  const files = await db.uploadedFile.findMany({
    where: {
      userId: user.id,
      ...(q && {
        filename: {
          contains: q,
          mode: 'insensitive',
        },
      }),
      ...(mimeType && { mimeType: { contains: mimeType, mode: 'insensitive' } }),
    },
    orderBy: { createdAt: 'desc' },
    skip: (page - 1) * limit,
    take: limit,
  })
  return files
}
