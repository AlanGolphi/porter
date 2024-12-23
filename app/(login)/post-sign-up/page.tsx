import { MailCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

export default function Page() {
  const t = useTranslations('PostSignUpPage')
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <MailCheck className="h-16 w-16" />
      <h1 className="text-3xl font-bold">{t('EmailSent')}</h1>
      <h3 className="text-lg font-medium underline decoration-dotted">{t('CheckYourEmail')}</h3>
    </div>
  )
}
