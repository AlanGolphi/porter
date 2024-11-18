'use client'

import { User } from '@prisma/client'
import { createContext, ReactNode, use, useContext, useEffect, useState } from 'react'

type UserContextType = {
  user: User | null
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | null>(null)

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) throw new Error('useUser must be used within a UserProvider')
  return context
}

export const UserProvider = ({
  children,
  userPromise,
}: {
  children: ReactNode
  userPromise: Promise<User | null>
}) => {
  const initUser = use(userPromise)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    setUser(initUser)
  }, [initUser])

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}
