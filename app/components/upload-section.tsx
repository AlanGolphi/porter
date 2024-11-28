'use client'

import { Input } from '@/components/ui/input'
import { getCurrentDateTag } from '@/lib/utils'
import { FilePlusIcon } from '@radix-ui/react-icons'
import { nanoid } from 'nanoid'
import { useCallback, useRef, useState } from 'react'
import FileItem from './file-item'

export type FileItemInfo = {
  id: string
  file: File
  filename: string
  size: number
  mimeType: string
}

export default function UploadSection() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileItemInfo[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const filename = file?.name ?? ''
    const size = file?.size ?? 0
    const mimeType = file?.type ?? ''

    if (file) {
      setFiles([
        ...files,
        {
          id: `${getCurrentDateTag()}-${nanoid(10)}`,
          file,
          filename,
          size,
          mimeType,
        },
      ])
    }
  }

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }, [])

  return (
    <section className="flex w-full flex-col gap-2">
      {files.map((file) => (
        <FileItem key={file.id} fileItem={file} handleRemoveFile={handleRemoveFile} />
      ))}

      <div
        onClick={() => {
          inputRef.current?.click()
        }}
        className="flex w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-4 transition-all hover:opacity-60"
      >
        <Input
          ref={inputRef}
          type="file"
          accept="*"
          onChange={handleFileChange}
          className="hidden"
        />
        <FilePlusIcon className="mb-2 h-6 w-6" />
        <p className="text-sm">Drag & Drop / Select Files</p>
      </div>
    </section>
  )
}
