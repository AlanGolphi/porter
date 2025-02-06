'use server'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { redirect } from 'next/navigation'
import { getUser } from '../db/queries'

const bucket = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET!
const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID!
const token = process.env.CLOUDFLARE_R2_TOKEN!
const accessId = process.env.CLOUDFLARE_R2_ACCESS_ID!
const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_KEY!
const endpoint = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ENDPOINT!

export async function getTempAccessCredentials({
  fileSize,
  prefix,
  objectKey,
  ttl,
}: {
  fileSize: number
  prefix?: string
  objectKey?: string
  ttl: number
}): Promise<TempAccessCredentialsResponse> {
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  if (user.storageQuota < fileSize) throw new Error('Storage quota exceeded')

  const cloudflareUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/r2/temp-access-credentials`

  const response = await fetch(cloudflareUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      bucket,
      objects: objectKey ? [objectKey] : undefined,
      parentAccessKeyId: accessId,
      permission: 'object-read-write',
      prefixes: prefix ? [prefix] : undefined,
      ttlSeconds: ttl,
    }),
  })
  return response.json()
}

type ErrorItem = {
  code: number
  message: string
}

type TempAccessCredentials = {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
}

type TempAccessCredentialsResponse = {
  errors: ErrorItem[]
  messages: string[]
  result: TempAccessCredentials
  success: boolean
}

export async function deleteFileFromR2(objectKey: string) {
  const client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: {
      accessKeyId: accessId,
      secretAccessKey,
    },
    forcePathStyle: true,
  })
  const deleteCommand = new DeleteObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  })
  await client.send(deleteCommand)
}
