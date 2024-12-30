'use client'

import { Check, Loader, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { verifyEmail } from '../actions'

export default function VerifyEmailForm({ token }: { token: string }) {
  const t = useTranslations('VerifyPage')
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyEmail(token).then((res) => {
      if (res.success) {
        setIsLoading(false)
        setSuccess(true)
        setMessage(res.data)
      } else {
        setIsLoading(false)
        setSuccess(false)
        setMessage(res.error)
      }
    })
  }, [token])

  useEffect(() => {
    if (success) {
      toast('Redirecting...', {
        duration: 3000,
      })
      setTimeout(() => {
        router.replace('/')
      }, 3000)
    }
  }, [success, router])

  return (
    <div className="flex w-full flex-col items-center">
      {isLoading ? (
        <>
          <h2>{t('Verifying')}</h2>
          <Loader className="mt-2 h-10 w-10 animate-spin" />
        </>
      ) : success ? (
        <>
          <h2>{message}</h2>
          <Check className="h-10 w-10" />
        </>
      ) : (
        <>
          <h2>{message}</h2>
          <X className="h-10 w-10" />
        </>
      )}
    </div>
  )
}
