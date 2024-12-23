'use client'

import { Input } from '@/components/ui/input'
import { getCurrentDateTag } from '@/lib/utils'
import { FilePlusIcon } from '@radix-ui/react-icons'
import { nanoid } from 'nanoid'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useCallback, useRef, useState } from 'react'

const FileItem = dynamic(() => import('./file-item'))

export type FileItemInfo = {
  id: string
  file: File
  filename: string
  size: number
  mimeType: string
}

export default function UploadSection() {
  const t = useTranslations('UploadPage')
  const inputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileItemInfo[]>([])
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const processFiles = useCallback((fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return

    try {
      const newFiles = Array.from(fileList).map((file) => ({
        id: `${getCurrentDateTag()}-${nanoid(10)}`,
        file,
        filename: file.name,
        size: file.size,
        mimeType: file.type,
      }))
      setFiles((prev) => [...prev, ...newFiles])

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(e.target.files)
    },
    [processFiles],
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDraggingOver(false)
      processFiles(e.dataTransfer.files)
    },
    [processFiles],
  )

  const handleRemoveFile = useCallback((id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }, [])

  return (
    <section
      className={`relative flex w-full basis-1/3 flex-col gap-2 overflow-hidden ${files.length > 0 ? 'pb-20' : ''} lg:h-full lg:w-auto lg:min-w-0`}
    >
      {files.map((file) => (
        <FileItem key={file.id} fileItem={file} handleRemoveFile={handleRemoveFile} />
      ))}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-card-mud p-4 transition-all duration-300 ${isDraggingOver ? 'border-2 border-dashed border-blue-500 bg-blue-200' : 'hover:opacity-60'} ${files.length > 0 ? 'absolute bottom-0' : 'basis-full'}`}
      >
        <Input
          ref={inputRef}
          type="file"
          accept="*"
          multiple={true}
          onChange={handleFileChange}
          onClick={(e) => e.stopPropagation()}
          className="hidden"
        />
        <FilePlusIcon className={`h-6 w-6 ${files.length > 0 ? '' : 'mb-2'}`} />
        <p className={`text-sm ${files.length > 0 ? 'hidden' : 'block'}`}>
          Drag & Drop / Select Files
          {t('Upload.DragDrop')}
        </p>
      </div>
    </section>
  )
}
