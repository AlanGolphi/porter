'use server'

import { getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '.'
import { createErrorState, createSuccessState } from '../auth/middleware'
import { verifyToken } from '../auth/session'
import { deleteFileFromR2 } from '../r2/queries'

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
    where: { userId: user.id, hash },
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
  const t = await getTranslations('UploadPage.Upload')
  if (user.storageQuota < fileSize) throw new Error(t('StorageQuotaExceeded'))

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
      deletedAt: null,
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

export const deleteFileFromDb = async (id: string) => {
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  const t = await getTranslations('UploadPage.Delete')
  await db.$transaction(async (tx) => {
    const file = await tx.uploadedFile.findUnique({ where: { id, userId: user.id } })
    if (!file) return createErrorState(t('FileNotFound'))
    const fileUrlObject = new URL(file.url)
    const objectId = fileUrlObject.pathname.substring(1) // remove the leading '/'
    await deleteFileFromR2(objectId)
    await tx.uploadedFile.update({ where: { id }, data: { deletedAt: new Date(), hash: null } })
  })

  return createSuccessState(t('Success'))
}
