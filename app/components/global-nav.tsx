'use client'

import Logo from '@/app/assets/images/logo.png'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useUser } from '@/lib/auth'
import { cn, getLocaleFromCookie } from '@/lib/utils'
import { Check, CircleUser, Languages, LogOut, Menu, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { signOut } from '../(login)/actions'

export default function GlobalNav() {
  const [locale, setLocale] = useState('en')
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const t = useTranslations('UploadPage')
  const { user, setUser } = useUser()
  const handleToggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const handleToggleLanguage = useCallback(
    (newLocale: string) => {
      if (newLocale === locale || typeof window === 'undefined') return
      document.cookie = `locale=${newLocale}; path=/`
      setLocale(newLocale)
      router.refresh()
    },
    [locale, router],
  )

  const handleSignOut = useCallback(async () => {
    await signOut()
    setUser(null)
    router.replace('/sign-in')
  }, [setUser, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const locale = getLocaleFromCookie(document.cookie)
    setLocale(locale)
  }, [])

  return (
    <>
      {/* mobile navbar */}
      <header className="fixed left-4 top-4 z-50 w-[calc(100%-2rem)] min-w-72 rounded-2xl bg-card-mud px-4 py-2 md:hidden">
        <div className="flex w-full items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image src={Logo} alt="Logo" width={48} height={48} className="h-12 w-12" />
            <span className="text-lg font-bold">porter</span>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Menu
                className="!size-6 cursor-pointer"
                role="button"
                aria-label={t('AriaLabel.Menu')}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                className="justify-start hover:bg-opacity-90"
                onClick={handleToggleTheme}
                aria-label={t('AriaLabel.ToggleTheme')}
              >
                <Moon className="hidden !size-4 dark:block" />
                <Sun className="block !size-4 dark:hidden" />
                <span>{t('AriaLabel.ToggleTheme')}</span>
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger aria-label={t('AriaLabel.ToggleLanguage')}>
                  <Languages className="!size-4" />
                  <span>{t('AriaLabel.ToggleLanguage')}</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    className="justify-between hover:bg-opacity-90"
                    onClick={() => handleToggleLanguage('en')}
                  >
                    <span>English</span>
                    <Check className={cn('hidden', locale === 'en' && 'block size-4')} />
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="justify-between hover:bg-opacity-90"
                    onClick={() => handleToggleLanguage('zh')}
                  >
                    <span>中文</span>
                    <Check className={cn('hidden', locale === 'zh' && 'block size-4')} />
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {user && (
                <DropdownMenuItem
                  className="justify-start hover:bg-opacity-90"
                  onClick={handleSignOut}
                  aria-label={t('AriaLabel.SignOut')}
                >
                  <LogOut className="size-4" />
                  <span>{t('AriaLabel.SignOut')}</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* desktop sidebar */}
      <header className="fixed left-4 top-4 z-50 hidden h-[calc(100dvh-2rem)] w-20 rounded-2xl bg-card-mud p-4 md:flex">
        <div className="flex h-full w-full flex-col items-center justify-between">
          <Link href="/" className="flex flex-col items-center space-y-2">
            <Image src={Logo} alt="Logo" width={48} height={48} className="h-12 w-12" />
            <span className="text-lg font-bold">porter</span>
          </Link>
          <nav className="flex flex-col items-center justify-end space-y-4">
            <Button
              size="icon"
              variant="outline"
              aria-label={t('AriaLabel.ToggleTheme')}
              onClick={handleToggleTheme}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950"
            >
              <Moon className="hidden !size-6 dark:block" />
              <Sun className="block !size-6 dark:hidden" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="outline"
                  aria-label={t('AriaLabel.ToggleLanguage')}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950"
                >
                  <Languages className="!size-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  className="justify-between hover:bg-opacity-90"
                  onClick={() => handleToggleLanguage('en')}
                >
                  <span>English</span>
                  <Check className={cn('hidden', locale === 'en' && 'block size-4')} />
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="justify-between hover:bg-opacity-90"
                  onClick={() => handleToggleLanguage('zh')}
                >
                  <span>中文</span>
                  <Check className={cn('hidden', locale === 'zh' && 'block size-4')} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    aria-label={t('AriaLabel.UserInfo')}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950"
                  >
                    <CircleUser className="!size-6" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    className="justify-between hover:bg-opacity-90"
                    onClick={handleSignOut}
                  >
                    <span>{t('AriaLabel.SignOut')}</span>
                    <LogOut className="size-4" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </header>
    </>
  )
}
