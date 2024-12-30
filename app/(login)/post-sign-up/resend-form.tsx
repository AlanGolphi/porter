'use client'

import { Button } from '@/components/ui/button'
import { Loader, MailCheck, MailX, Send } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { resendEmail } from '../actions'

export function ResendForm({ email }: { email: string }) {
  const t = useTranslations('PostSignUpPage')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState<boolean | undefined>(undefined)

  const renderIcon = useCallback(() => {
    if (isLoading) return <Loader className="h-4 w-4 animate-spin" />
    if (isSuccess === undefined) {
      return <Send className="h-4 w-4" />
    } else if (isSuccess) {
      return <MailCheck className="h-4 w-4" />
    } else {
      return <MailX className="h-4 w-4" />
    }
  }, [isLoading, isSuccess])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setIsLoading(true)
    try {
      const resendResult = await resendEmail(formData)
      const { success, error } = resendResult
      if (success) {
        setIsSuccess(true)
        toast.success(t('EmailResent'), {
          description: t('CheckYourInbox'),
          duration: 3000,
        })
      } else {
        setIsSuccess(false)
        toast.error(t('EmailResendFailed'), {
          description: error,
          duration: 3000,
        })
      }
    } catch {
      setIsSuccess(false)
      toast.error(t('EmailResendFailed'), {
        description: t('EmailResendFailedDescription'),
        duration: 300000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="email" value={email} />
      <Button
        variant="link"
        className="flex items-center underline decoration-dotted hover:decoration-solid"
        type="submit"
      >
        {t('ResendEmail')}
        {renderIcon()}
      </Button>
    </form>
  )
}
