'use client'

import { Input } from '@/components/ui/input'
import { getCurrentDateTag } from '@/lib/utils'
import { FilePlusIcon } from '@radix-ui/react-icons'
import { nanoid } from 'nanoid'
import { memo, useCallback, useRef, useState } from 'react'
import FileItem from './file-item'

export type FileItemInfo = {
  id: string
  file: File
  filename: string
  size: number
  mimeType: string
}

function UploadSection() {
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
    <section className="flex w-full flex-col gap-2">
      {files.map((file) => (
        <FileItem key={file.id} fileItem={file} handleRemoveFile={handleRemoveFile} />
      ))}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-lg bg-white p-4 transition-all ${isDraggingOver ? 'border-2 border-dashed border-blue-500 bg-blue-50' : 'hover:opacity-60'}`}
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
        <FilePlusIcon className="mb-2 h-6 w-6" />
        <p className="text-sm">Drag & Drop / Select Files</p>
      </div>
    </section>
  )
}

export default memo(UploadSection)
