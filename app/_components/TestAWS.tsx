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

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_R2_SECRET_ACCESS_KEY!,
  },
})

type TempCredentials = {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
}

const generateS3Client = (credentials: TempCredentials) =>
  new S3Client({
    region: 'auto',
    endpoint: process.env.NEXT_PUBLIC_R2_ENDPOINT!,
    credentials: {
      accessKeyId: credentials.accessKeyId,
      secretAccessKey: credentials.secretAccessKey,
    },
  })

async function uploadFileToR2(
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

    const response = await s3Client.send(command)
    return response
  } catch (error) {
    console.error('上传文件失败:', error)
    throw error
  }
}

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
    console.error('上传文件失败:', error)
    throw error
  }
}

export default function TestAWS() {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const prefix = 'images/'
  const fileKey = `${prefix}${getCurrentDateTag()}-${nanoid(10)}.${file?.name.split('.').pop()}`
  const handleUpload = async () => {
    if (!file) return
    console.log(file)
    const buffer = await file.arrayBuffer()
    const response = await uploadFileToR2(
      'pandora',
      fileKey,
      Buffer.from(buffer),
      file.type || 'application/octet-stream',
    )
    console.log(response)
  }

  const handleMultipartUpload = async () => {
    if (!file) return
    console.log(file)
    try {
      const buffer = await file.arrayBuffer()
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: 'pandora',
          Key: fileKey,
          Body: Buffer.from(buffer),
        },
      })
      upload.on('httpUploadProgress', (progress) => {
        console.log(progress)
        if (!progress.loaded || !progress.total) return
        setProgress((progress.loaded / progress.total) * 100)
      })

      await upload.done()
    } catch (error) {
      console.error('上传文件失败:', error)
    }
  }

  const tempCredentialsUpload = async () => {
    if (!file) return
    console.log(file)
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
  }

  const tempCredentialsMultipartUpload = async () => {
    if (!file) {
      console.error('未选择文件')
      return
    }

    try {
      // 获取临时凭证
      const response = await getTempAccessCredentials({ ttl: 3600 })
      console.log(response)
      if (!response?.result) {
        throw new Error('获取临时凭证失败')
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

      // 监听上传进度
      upload.on('httpUploadProgress', (progress) => {
        if (progress.loaded && progress.total) {
          const percentProgress = (progress.loaded / progress.total) * 100
          setProgress(Math.round(percentProgress))
        }
      })

      await upload.done()
      console.log('文件上传成功')
    } catch (error) {
      console.error('上传文件失败:', error)
      setProgress(0)
      throw error
    }
  }

  async function cleanupIncompleteUploads(bucketName: string) {
    const response = await getTempAccessCredentials({ ttl: 3600 })
    const s3Client = generateS3Client(response.result)

    try {
      // 列出所有未完成的分片上传
      const listCommand = new ListMultipartUploadsCommand({
        Bucket: bucketName,
      })

      const { Uploads } = await s3Client.send(listCommand)

      // 如果存在未完成的上传,则逐个终止
      if (Uploads && Uploads.length > 0) {
        for (const upload of Uploads) {
          if (upload.Key && upload.UploadId) {
            const abortCommand = new AbortMultipartUploadCommand({
              Bucket: bucketName,
              Key: upload.Key,
              UploadId: upload.UploadId,
            })

            await s3Client.send(abortCommand)
            console.log(`已终止未完成的上传: ${upload.Key}`)
          }
        }
      }
    } catch (error) {
      console.error('清理失败:', error)
      throw error
    }
  }

  return (
    <div>
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <Button onClick={handleUpload}>上传</Button>
      <Button onClick={handleMultipartUpload}>分段上传</Button>
      <Button onClick={tempCredentialsUpload}>临时凭证上传</Button>
      <Button onClick={tempCredentialsMultipartUpload}>临时凭证分段上传</Button>
      <Button onClick={() => cleanupIncompleteUploads('pandora')}>清理未完成的上传</Button>

      <Progress value={progress} className="w-full" />
    </div>
  )
}
