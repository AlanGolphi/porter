'use server'

import { createErrorState, validatedAction } from '@/lib/auth/middleware'
import { comparePasswords, hashPassword, setSession } from '@/lib/auth/session'
import { db } from '@/lib/db'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signInSchema = z.object({
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
    return createErrorState('User not found')
  }
  const passwordsMatch = await comparePasswords(password, user.passwordHash)
  if (!passwordsMatch) {
    return createErrorState('Invalid password')
  }

  await setSession(user)

  const redirectTo = formData.get('redirect') as string | null

  redirect(`/${redirectTo ?? ''}`)
})

export const signUp = validatedAction(signInSchema, async (data, formData) => {
  const { email, password } = data

  const user = await db.user.findFirst({
    where: {
      email,
    },
  })
  if (user) {
    return createErrorState('User already exists')
  }

  const passwordHash = await hashPassword(password)

  const newUser = await db.user.create({
    data: {
      email,
      passwordHash,
    },
  })

  await setSession(newUser)

  const redirectTo = formData.get('redirect') as string | null

  redirect(`/${redirectTo ?? ''}`)
})
