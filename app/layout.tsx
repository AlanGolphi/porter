import { Toaster } from '@/components/ui/sonner'
import { UserProvider } from '@/lib/auth'
import { getUser } from '@/lib/db/queries'
import type { Metadata, Viewport } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages, getTranslations } from 'next-intl/server'
import { ThemeProvider } from 'next-themes'
import localFont from 'next/font/local'
import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const viewport: Viewport = {
  themeColor: '#fcfaf8',
  width: 'device-width',
  height: 'device-height',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 2,
  userScalable: true,
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Meta')
  return {
    title: t('Title'),
    description: t('Description'),
    authors: {
      name: 'Alan Golphi',
      url: 'https://github.com/AlanGolphi',
    },
    generator: 'Next.js',
    keywords: [
      'next.js',
      'react',
      'server components',
      'app router',
      'porter',
      'upload',
      'file',
      'uploader',
    ],
    robots: 'index, follow',
    referrer: 'strict-origin-when-cross-origin',
    creator: 'Alan Golphi',
    publisher: 'Alan Golphi',
    manifest: '/manifest.json',
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`min-h-dvh bg-backgroundMud text-black antialiased dark:text-white ${geistSans.variable} ${geistMono.variable}`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <UserProvider userPromise={getUser()}>
              <main className="relative min-h-dvh w-full">{children}</main>
            </UserProvider>
            <Toaster />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
