'use server'

import { CNEmailTemplate, EnEmailTemplate } from '@/app/components/email-template'
import {
  ActionState,
  createErrorState,
  createSuccessState,
  validatedAction,
} from '@/lib/auth/middleware'
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { randomBytes } from 'crypto'
import { getLocale, getTranslations } from 'next-intl/server'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import React from 'react'
import { Resend } from 'resend'
import { z } from 'zod'

const porterUrl = process.env.NEXT_PUBLIC_SITE_URL!
const resend = new Resend(process.env.RESEND_PRIVATE_KEY!)

const signInSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

const signUpSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
})

export const signIn = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data
  const user = await db.user.findFirst({
    where: {
      email,
    },
  })
  if (!user) {
    redirect('/sign-up')
  }
  const passwordsMatch = await comparePasswords(password, user.passwordHash)
  if (!passwordsMatch) {
    return createErrorState('Invalid password')
  }

  await setSession(user)

  const redirectTo = formData.get('redirect') as string | null

  redirect(`/${redirectTo ?? ''}`)
})

export const signUp = validatedAction(signUpSchema, async (data, formData) => {
  const { name, email, password } = data
  const redirectTo = formData.get('redirect') as string | null

  const user = await db.user.findFirst({
    where: {
      email,
    },
  })
  if (user) {
    return createErrorState('User already exists')
  }

  const passwordHash = await hashPassword(password)
  const verificationToken = randomBytes(32).toString('hex')

  const newUser = await db.user.create({
    data: {
      name,
      email,
      passwordHash,
      verificationToken,
      emailVerified: false,
    },
  })

  await setSession(newUser)
  const locale = await getLocale()

  const Template = locale === 'zh' ? CNEmailTemplate : EnEmailTemplate

  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email',
      react: Template({
        userName: name,
        magicLink: `${porterUrl}/verify?token=${verificationToken}&redirectTo=${redirectTo}`,
      }) as React.ReactNode,
    })
    await db.user.update({
      where: { id: newUser.id },
      data: { emailSentAt: new Date(), verificationToken },
    })
  } catch (error) {
    console.error(error)
  }

  redirect('/post-sign-up')
})

export const signOut = async () => {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

export const resendEmail = async (formData: FormData) => {
  const t = await getTranslations('PostSignUpPage')
  const email = formData.get('email') as string
  const user = await db.user.findFirst({
    where: {
      email,
    },
  })

  if (!user) {
    redirect('/sign-up')
  }
  const lastEmailSentAt = user.emailSentAt
  if (lastEmailSentAt && new Date(lastEmailSentAt).getTime() + 1000 * 60 * 60 * 24 > Date.now()) {
    return createErrorState(t('TooFrequent'))
  }

  const verificationToken = randomBytes(32).toString('hex')

  const locale = await getLocale()

  const Template = locale === 'zh' ? CNEmailTemplate : EnEmailTemplate

  try {
    await resend.emails.send({
      from: 'Acme <onboarding@resend.dev>',
      to: email,
      subject: 'Verify your email',
      react: Template({
        userName: user?.name || '',
        magicLink: `${porterUrl}/verify?token=${verificationToken}`,
      }) as React.ReactNode,
    })

    await db.user.update({
      where: { id: user.id },
      data: { verificationToken, emailSentAt: new Date() },
    })
    return createSuccessState(t('EmailResent'))
  } catch {
    return createErrorState(t('EmailResendFailedDescription'))
  }
}

export const verifyEmail = async (token: string): Promise<ActionState> => {
  const t = await getTranslations('VerifyPage')
  const user = await db.user.findFirst({ where: { verificationToken: token } })

  if (!user) {
    redirect('/sign-in')
  }

  if (user.emailVerified) {
    redirect('/')
  }

  try {
    await db.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: true,
          verificationToken: null,
        },
      })
      await setSession(updatedUser)
    })
    return createSuccessState(t('Verified'))
  } catch {
    return createErrorState(t('VerifyFailed'))
  }
}
