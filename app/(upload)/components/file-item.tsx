'use client'

import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getFileByHash, storeFile } from '@/lib/db/queries'
import { getTempAccessCredentials } from '@/lib/r2/queries'
import { calculateRequiredTTL } from '@/lib/utils'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { UploadedFile } from '@prisma/client'
import { FileIcon, TrashIcon } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CircleProgress } from './circle-progress'
import { FileItemInfo } from './upload-section'

const BUCKET = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_BUCKET!
const DOMAIN = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_DOMAIN!

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

export default function FileItem({
  fileItem,
  handleRemoveFile,
}: {
  fileItem: FileItemInfo
  handleRemoveFile: (id: string) => void
}) {
  const THRESHOLD_FILE_SIZE = 1024 * 1024 * 5 // 5MB

  const workerRef = useRef<Worker>()
  const hashedRef = useRef<boolean>(false)

  const [status, setStatus] = useState<FileItemStatus>('init')
  const [hashProgress, setHashProgress] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [findedFile, setFindedFile] = useState<UploadedFile>()

  const { id, file: uploadFile } = fileItem

  const oneTimeUpload = useCallback(
    async (file: File, prefix: string, objectKey: string, hash?: string) => {
      try {
        const credentialsResponse = await getTempAccessCredentials({
          prefix,
          objectKey,
          ttl: 3600,
          fileSize: file.size,
        })
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const client = generateS3Client(credentialsResponse.result)
        const command = new PutObjectCommand({
          Bucket: BUCKET,
          Key: objectKey,
          Body: fileBuffer,
          ContentType: file.type || 'application/octet-stream',
        })
        const result = await client.send(command)
        const url = `${DOMAIN}/${objectKey}`
        console.log('oneTime hash: ', hash)
        const storedFile = await storeFile({
          filename: uploadFile.name,
          fileSize: uploadFile.size,
          mimeType: uploadFile.type,
          url,
          hash,
        })
        setUploadProgress(100)
        console.log('upload result: ', result)
        console.log('storedFile: ', storedFile)
        setStatus('done')
      } catch (error) {
        setStatus('error')
        console.error('Failed to upload file:', error)
      }
    },
    [uploadFile, setUploadProgress, setStatus],
  )

  const multipartUpload = useCallback(
    async (file: File, prefix: string, objectKey: string, hash?: string) => {
      try {
        const requiredTTL = calculateRequiredTTL(file.size)
        const fileBuffer = Buffer.from(await file.arrayBuffer())
        const credentialsResponse = await getTempAccessCredentials({
          ttl: requiredTTL,
          fileSize: file.size,
          objectKey,
          prefix,
        })
        const client = generateS3Client(credentialsResponse.result)
        const upload = new Upload({
          client,
          params: {
            Bucket: BUCKET,
            Key: objectKey,
            Body: fileBuffer,
            ContentType: file.type,
          },
        })

        upload.on('httpUploadProgress', (progress) => {
          if (progress.loaded && progress.total) {
            const percentProgress = (progress.loaded / progress.total) * 100
            setUploadProgress(Math.round(percentProgress))
          }
        })

        await upload.done()
        console.log('multipart hash: ', hash)
        const url = `${DOMAIN}/${objectKey}`
        const storedFile = await storeFile({
          filename: uploadFile.name,
          fileSize: uploadFile.size,
          mimeType: uploadFile.type,
          url,
          hash,
        })
        console.log('storedFile: ', storedFile)
        setStatus('done')
      } catch (error) {
        setStatus('error')
        console.error('Failed to upload file:', error)
      }
    },
    [uploadFile, setUploadProgress, setStatus],
  )

  const startUpload = useCallback(
    async (hash?: string) => {
      if (hash) {
        setStatus('finding')
        console.log('finding file by hash: ', hash)
        const findedFile = await getFileByHash(hash)
        if (findedFile) {
          setStatus('finded')
          setFindedFile(findedFile)
          return
        }
      }
      setStatus('uploading')
      const fileType = uploadFile.type
      const fileName = uploadFile.name
      const prefix = fileType.includes('image')
        ? 'images/'
        : fileType.includes('video')
          ? 'videos/'
          : 'others/'
      const suffix = fileName.split('.').pop()
      const objectKey = `${prefix}${id}.${suffix}`
      const isBigFile = uploadFile.size > THRESHOLD_FILE_SIZE
      if (isBigFile) {
        await multipartUpload(uploadFile, prefix, objectKey, hash)
      } else {
        await oneTimeUpload(uploadFile, prefix, objectKey, hash)
      }
    },
    [id, uploadFile, THRESHOLD_FILE_SIZE, oneTimeUpload, multipartUpload],
  )

  useEffect(() => {
    if (typeof window === 'undefined' || hashedRef.current || !uploadFile) return
    try {
      workerRef.current = new Worker(new URL('../../../lib/workers/file-hash.ts', import.meta.url))
    } catch (err) {
      startUpload()
      console.error('Worker creation failed:', err)
    }

    if (workerRef.current) {
      workerRef.current.onmessage = (e) => {
        if (e.data?.type === 'hash-start') {
          setHashProgress(0)
          setStatus('hashing')
          console.log('hash-start')
        } else if (e.data.type === 'hash-progress') {
          console.log('hash-progress', e.data.progress)
          setHashProgress(e.data.progress)
        } else if (e.data.type === 'hash-complete') {
          console.log('hash-complete', e.data.hash)
          hashedRef.current = true
          startUpload(e.data.hash)
        } else if (e.data.type === 'hash-error') {
          console.error('hash-error', e.data.error)
          startUpload()
        }
      }
    }

    workerRef.current?.postMessage({
      type: 'calculate',
      file: uploadFile,
    })

    return () => {
      workerRef.current?.terminate()
    }
  }, [uploadFile, startUpload])

  return (
    <div className="relative flex w-full items-center justify-between rounded-lg bg-white p-4 transition-all hover:opacity-60">
      <div className="flex items-center gap-2">
        <FileIcon className="h-6 w-6" />
        <p className="text-sm">{fileItem.filename}</p>
      </div>

      {status === 'hashing' && <CircleProgress innerProgress={hashProgress} outerProgress={uploadProgress} />}
      {status}

      {status === 'uploading' && <Progress value={uploadProgress} className="w-full" />}

      {status === 'finded' && <p>File already exists {findedFile?.filename}</p>}

      <Button variant="ghost" size="icon" onClick={() => handleRemoveFile(fileItem.id)}>
        <TrashIcon className="h-6 w-6" />
      </Button>
    </div>
  )
}

type FileItemStatus = 'init' | 'hashing' | 'uploading' | 'finding' | 'finded' | 'done' | 'error'

type TempCredentials = {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
}
