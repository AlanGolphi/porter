import crypto from 'crypto'

type WorkerMessage = {
  type: 'calculate'
  file: File
  userId: string
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, file, userId } = event.data
  if (type !== 'calculate') return

  try {
    postMessage({
      type: 'hash-start',
    })

    const hashHex = await calculateHash(file, userId)

    postMessage({
      type: 'hash-complete',
      hash: hashHex,
    })
  } catch (err) {
    postMessage({
      type: 'hash-error',
      error: (err as Error).message,
    })
  }
}

async function calculateHash(file: File, userId: string): Promise<string> {
  const hash = crypto.createHash('sha256')
  const THRESHOLD_FILE_SIZE = 1024 * 1024 * 5 // 5MB
  const userIdUint8Array = new TextEncoder().encode(userId)

  hash.update(userIdUint8Array)

  if (file.size < THRESHOLD_FILE_SIZE) {
    const uint8Array = await getChunkUint8Array(file)
    hash.update(uint8Array)
    postMessage({
      type: 'hash-progress',
      progress: 100,
    })
    return hash.digest('hex')
  }

  const CHUNK_SIZE = 1024 * 1024 * 2 // 2MB
  let offset = 0

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE)
    const uint8Array = await getChunkUint8Array(chunk)
    hash.update(uint8Array)
    offset += CHUNK_SIZE

    postMessage({
      type: 'hash-progress',
      progress: Math.round((offset / file.size) * 100),
    })
  }

  return hash.digest('hex')
}

async function getChunkUint8Array(chunk: Blob): Promise<Uint8Array> {
  return new Promise<Uint8Array>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (reader.result) {
        const arrayBuffer = reader.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)
        resolve(uint8Array)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(new Error('File reading error'))
    reader.readAsArrayBuffer(chunk)
  })
}
