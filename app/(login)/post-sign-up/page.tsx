import { getUser } from '@/lib/db/queries'
import { MailCheck } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import dynamic from 'next/dynamic'
import { redirect } from 'next/navigation'

const ResendForm = dynamic(() => import('./resend-form').then((mod) => mod.ResendForm))

export default async function Page() {
  const user = await getUser()
  if (!user) {
    redirect('/sign-in')
  }
  if (user.emailVerified || !user.verificationToken) {
    redirect('/')
  }

  const t = await getTranslations('PostSignUpPage')
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-4">
      <MailCheck className="h-16 w-16" />
      <h1 className="text-3xl font-bold">{t('EmailSent')}</h1>
      <h3 className="text-lg font-medium">{t('CheckYourEmail')}</h3>
      <ResendForm email={user.email} />
    </div>
  )
}
