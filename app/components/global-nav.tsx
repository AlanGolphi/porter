'use client'

import Logo from '@/app/assets/images/logo.png'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn, getLocaleFromCookie } from '@/lib/utils'
import { Check, CircleUser, Languages, Menu, Moon, Sun } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

export default function GlobalNav() {
  const [locale, setLocale] = useState('en')
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const t = useTranslations('UploadPage')

  const handleToggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  const handleToggleLanguage = useCallback(
    (newLocale: string) => {
      if (newLocale === locale || typeof window === 'undefined') return
      document.cookie = `locale=${newLocale}; path=/`
      router.refresh()
    },
    [locale, router],
  )

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
          <Menu className="!size-6" />
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
            <Button
              size="icon"
              variant="outline"
              aria-label={t('AriaLabel.UserInfo')}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-slate-950"
            >
              <CircleUser className="!size-6" />
            </Button>
          </nav>
        </div>
      </header>
    </>
  )
}
