'use client'

import { getTempAccessCredentials } from '@/actions/s3/getTempAccessCredentials'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { getCurrentDateTag } from '@/lib/utils'
import {
  AbortMultipartUploadCommand,
  ListMultipartUploadsCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { nanoid } from 'nanoid'
import { useState } from 'react'

type TempCredentials = {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
}

const generateS3Client = (credentials: TempCredentials) =>
  new S3Client({
    region: 'auto',
    endpoint: process.env.NEXT_PUBLIC_CLOUDFLARE_R2_ENDPOINT!,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
      sessionToken: credentials.sessionToken,
    },
    forcePathStyle: true,
  })

async function uploadFileToR2InClient(
  client: S3Client,
  bucketName: string,
  fileKey: string,
  fileBuffer: Buffer,
  contentType: string,
) {
  try {
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: contentType,
    })

    const response = await client.send(command)
    return response
  } catch (error) {
    console.error('Failed to upload file:', error)
    throw error
  }
}

const calculateRequiredTTL = (fileSize: number): number => {
  const estimatedSeconds = Math.ceil(fileSize / (1024 * 1024)) + 30
  return Math.min(Math.max(estimatedSeconds, 900), 3600)
}

export default function TestAWS() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const prefix = 'images/'
  const fileKey = `${prefix}${getCurrentDateTag()}-${nanoid(10)}.${file?.name.split('.').pop()}`

  const tempCredentialsUpload = async () => {
    if (!file) return
    console.log(file)
    console.time('tempCredentialsUpload')
    const buffer = await file.arrayBuffer()
    const response = await getTempAccessCredentials({ prefix, objectKey: fileKey, ttl: 3600 })
    console.log(response)
    const client = generateS3Client(response.result)
    const result = await uploadFileToR2InClient(
      client,
      'pandora',
      fileKey,
      Buffer.from(buffer),
      file.type || 'application/octet-stream',
    )
    console.log(result)
    console.timeEnd('tempCredentialsUpload')
  }

  const tempCredentialsMultipartUpload = async () => {
    if (!file) {
      console.error('No file selected')
      return
    }

    try {
      // Calculate required TTL based on file size
      const requiredTTL = calculateRequiredTTL(file.size)
      
      // Get temporary credentials
      const response = await getTempAccessCredentials({ ttl: requiredTTL })
      console.log(response)
      if (!response?.result) {
        throw new Error('Failed to get temporary credentials')
      }

      const buffer = await file.arrayBuffer()
      const client = generateS3Client(response.result)

      const upload = new Upload({
        client,
        params: {
          Bucket: 'pandora',
          Key: fileKey,
          Body: Buffer.from(buffer),
          ContentType: file.type,
        },
      })

      // Listen for upload progress
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentProgress = (progress.loaded / progress.total) * 100
          setProgress(Math.round(percentProgress))
        }
      })

      await upload.done()
      console.log('File uploaded successfully')
    } catch (error) {
      console.error('Failed to upload file:', error)
      setProgress(0)
      throw error
    }
  }

  async function cleanupIncompleteUploads(bucketName: string) {
    const response = await getTempAccessCredentials({ ttl: 3600 })
    const s3Client = generateS3Client(response.result)

    try {
      // List all incomplete multipart uploads
      const listCommand = new ListMultipartUploadsCommand({
        Bucket: bucketName,
      })

      const { Uploads } = await s3Client.send(listCommand)

      // If there are incomplete uploads, abort them one by one
      if (Uploads && Uploads.length > 0) {
        for (const upload of Uploads) {
          if (upload.Key && upload.UploadId) {
            const abortCommand = new AbortMultipartUploadCommand({
              Bucket: bucketName,
              Key: upload.Key,
              UploadId: upload.UploadId,
            })

            await s3Client.send(abortCommand)
            console.log(`Aborted incomplete upload: ${upload.Key}`)
          }
        }
      }
    } catch (error) {
      console.error('Cleanup failed:', error)
      throw error
    }
  }

  return (
    <div>
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={tempCredentialsUpload}>Upload with Temporary Credentials</Button>
      <Button onClick={tempCredentialsMultipartUpload}>Multipart Upload with Temporary Credentials</Button>
      <Button onClick={() => cleanupIncompleteUploads('pandora')}>Clean Incomplete Uploads</Button>

      <Progress value={progress} className="w-full" />
    </div>
  )
}
