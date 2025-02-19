'use client'

import { Button } from '@/components/ui/button'
import { getFileByHash, storeFile } from '@/lib/db/queries'
import { getTempAccessCredentials } from '@/lib/r2/queries'
import { calculateRequiredTTL, truncateFilename } from '@/lib/utils'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import { UploadedFile } from '@prisma/client'
import { ArrowBigDown, LoaderCircle, QrCode, RefreshCcw, TrashIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CopyableFileUrl } from '../copyable-file-url'
import RenderFileIcon from '../render-file-icon'
import { FileItemInfo } from '../upload-section'
import { CircleProgress } from './circle-progress'

const QrCodePopover = dynamic(() => import('../qrcode-popover').then((mod) => mod.QRCodePopover), {
  loading: () => (
    <Button variant="outline" className="border-none" aria-label="QR Code" size="icon">
      <QrCode className="h-6 w-6" />
    </Button>
  ),
})

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
  handleRetry,
}: {
  fileItem: FileItemInfo
  handleRemoveFile: (id: string) => void
  handleRetry: (id: string, file: FileItemInfo) => void
}) {
  const THRESHOLD_FILE_SIZE = 1024 * 1024 * 5 // 5MB

  const workerRef = useRef<Worker>(null)
  const hashedRef = useRef<boolean>(false)

  const [status, setStatus] = useState<FileItemStatus>('init')
  const [hashProgress, setHashProgress] = useState(0)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [findedFile, setFindedFile] = useState<UploadedFile>()
  const [storedFile, setStoredFile] = useState<UploadedFile>()

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
        setStoredFile(storedFile)
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
        setStoredFile(storedFile)
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

  const renderStatus = () => {
    console.log(findedFile?.filename)
    switch (status) {
      case 'init':
        return <LoaderCircle className="h-6 w-6 animate-spin" />
      case 'hashing':
      case 'finding':
      case 'uploading':
        return <CircleProgress innerProgress={hashProgress} outerProgress={uploadProgress} />
      case 'finded':
      case 'done':
        return <ArrowBigDown className="mt-3 h-6 w-6 animate-bounce" strokeWidth={1.5} />
      case 'error':
        return (
          <Button
            size="icon"
            variant="ghost"
            aria-label="retry"
            onClick={() => handleRetry(id, fileItem)}
          >
            <RefreshCcw className="h-6 w-6 text-red-700 dark:text-red-400" strokeWidth={1.5} />
          </Button>
        )
    }
  }

  const renderFilePreview = () => {
    const url = status === 'finded' ? findedFile?.url : storedFile?.url
    const fileSize = status === 'finded' ? findedFile?.size : storedFile?.size

    if (!url || !fileSize) return null

    return (
      <>
        <CopyableFileUrl url={url} fileSize={fileSize} />
        <QrCodePopover str={url} />
      </>
    )
  }

  useEffect(() => {
    if (typeof window === 'undefined' || hashedRef.current || !uploadFile) return
    try {
      workerRef.current = new Worker(
        new URL('../../../../lib/workers/file-hash.ts', import.meta.url),
      )
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
    <div className="relative flex h-auto w-full flex-col items-center rounded-lg bg-card-mud p-4 transition-all">
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center justify-start gap-2">
          <RenderFileIcon mimeType={fileItem.mimeType} />
          <p className="text-sm">{truncateFilename(fileItem.filename)}</p>
        </div>
        <div className="flex items-center justify-end">
          {renderStatus()}
          <Button
            size="icon"
            variant="ghost"
            aria-label="remove file"
            onClick={() => handleRemoveFile(fileItem.id)}
          >
            <TrashIcon className="h-6 w-6" />
          </Button>
        </div>
      </div>
      {['done', 'finded'].includes(status) && (
        <div className="flex w-full items-center justify-between rounded-lg bg-background p-1 px-2">
          {renderFilePreview()}
        </div>
      )}
    </div>
  )
}

type FileItemStatus = 'init' | 'hashing' | 'uploading' | 'finding' | 'finded' | 'done' | 'error'

type TempCredentials = {
  accessKeyId: string
  secretAccessKey: string
  sessionToken: string
}
