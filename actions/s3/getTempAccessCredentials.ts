'use server'

const bucket = process.env.CLOUDFLARE_R2_BUCKET!
const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID!
const token = process.env.CLOUDFLARE_R2_TOKEN!
const accessId = process.env.CLOUDFLARE_R2_ACCESS_ID!

export async function getTempAccessCredentials({
  prefix,
  objectKey,
  ttl,
}: {
  prefix?: string
  objectKey?: string
  ttl: number
}): Promise<TempAccessCredentialsResponse> {
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
