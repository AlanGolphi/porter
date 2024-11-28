'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export default function useFileHash({ file }: { file: File }) {
  const [hash, setHash] = useState<string>()
  const [progress, setProgress] = useState(0)
  const [isCalculating, setIsCalculating] = useState(false)
  const [failed, setFailed] = useState(false)

  const workerRef = useRef<Worker>()

  useEffect(() => {
    if (typeof window === 'undefined' || !file) return

    try {
      workerRef.current = new Worker(new URL('../../lib/workers/file-hash.ts', import.meta.url))

      workerRef.current.onmessage = (e) => {
        switch (e.data.type) {
          case 'hash-start':
            setIsCalculating(true)
            break
          case 'hash-progress':
            setProgress(e.data.progress)
            break
          case 'hash-complete':
            setHash(e.data.hash)
            setIsCalculating(false)
            break
          default:
            setFailed(true)
        }
      }
    } catch {
      setFailed(true)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [file])

  const terminateHash = useCallback(() => {
    setProgress(0)
    setFailed(false)
    setHash(undefined)
    setIsCalculating(false)
    workerRef.current?.terminate()
  }, [])

  return { hash, progress, isCalculating, failed, terminateHash }
}
