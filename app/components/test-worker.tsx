'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUser } from '@/lib/auth'
import { useEffect, useRef, useState } from 'react'
import { CircleProgress } from '../(upload)/components/circle-progress'

export default function TestWorker() {
  const { user } = useUser()
  const workerRef = useRef<Worker>()
  const [file, setFile] = useState<File>()
  const [hash, setHash] = useState<string>()
  const [isCalculating, setIsCalculating] = useState(false)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      workerRef.current = new Worker(new URL('../../lib/workers/file-hash.ts', import.meta.url))
      console.log('Worker created successfully')

      workerRef.current.onmessage = (e) => {
        console.log('Received message from worker:', e.data)
        if (e.data.type === 'hash-complete') {
          setHash(e.data.hash)
          setIsCalculating(false)
        } else if (e.data.type === 'hash-progress') {
          setProgress(e.data.progress)
        }
      }
    } catch (err) {
      console.error('Worker creation failed:', err)
    }

    return () => {
      workerRef.current?.terminate()
    }
  }, [])

  const handleCalculate = async () => {
    if (!file || !user) {
      return
    }

    try {
      setIsCalculating(true)
      console.log('Sending file to worker:', file)
      workerRef.current?.postMessage({ type: 'calculate', file, userId: user.id })
    } catch (err) {
      console.error('Error sending message to worker:', err)
      setIsCalculating(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <Input type="file" onChange={(e) => setFile(e.target.files?.[0])} />
      <Button onClick={handleCalculate} disabled={isCalculating || !file}>
        {isCalculating ? 'Calculating...' : 'Calculate'}
      </Button>
      <CircleProgress progress={progress} />
      {hash && <p className="text-green-600">Hash: {hash}</p>}
    </div>
  )
}
