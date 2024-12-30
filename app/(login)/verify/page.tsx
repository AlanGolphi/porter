import { redirect } from 'next/navigation'
import VerifyEmailForm from './verify-email-form'

export default async function VerifyPage({ searchParams }: { searchParams: SearchParams }) {
  const { token } = await searchParams
  if (!token) {
    return redirect('/sign-in')
  }

  return <VerifyEmailForm token={token} />
}

type SearchParams = Promise<{ token?: string }>
