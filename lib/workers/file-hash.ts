import crypto from 'crypto'

type WorkerMessage = {
  type: 'calculate'
  file: File
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { type, file } = event.data
  if (type !== 'calculate') return

  try {
    postMessage({
      type: 'hash-start',
      data: { file },
    })

    const hashHex = await calculateHash(file)

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

async function calculateHash(file: File): Promise<string> {
  const hash = crypto.createHash('sha256')
  const CHUNK_SIZE = 1024 * 1024 * 2 // 2MB
  let offset = 0

  while (offset < file.size) {
    const chunk = file.slice(offset, offset + CHUNK_SIZE)
    const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          resolve(reader.result as ArrayBuffer)
        } else {
          reject(new Error('Failed to read file'))
        }
      }
      reader.onerror = () => reject(new Error('File reading error'))
      reader.readAsArrayBuffer(chunk)
    })
    const uint8Array = new Uint8Array(arrayBuffer)
    hash.update(uint8Array)
    offset += CHUNK_SIZE

    postMessage({
      type: 'hash-progress',
      progress: Math.round((offset / file.size) * 100),
    })
  }

  return hash.digest('hex')
}
