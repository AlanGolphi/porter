import { signToken, verifyToken } from '@/lib/auth/session'
import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/sign-in', '/sign-up', '/post-sign-up', '/verify']

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const sessionCookie = request.cookies.get('session')
  const isProtectedRoute = !publicRoutes.some((route) => pathname.startsWith(route))

  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  const res = NextResponse.next()

  if (sessionCookie) {
    try {
      const parsedSessionData = await verifyToken(sessionCookie.value)
      const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000)

      res.cookies.set({
        name: 'session',
        value: await signToken({
          ...parsedSessionData,
          expires: expiresInOneDay.toISOString(),
        }),
        httpOnly: true,
        sameSite: 'lax',
        expires: expiresInOneDay,
        secure: process.env.NODE_ENV !== 'development',
      })
    } catch (error) {
      console.error('Invalid session!', error)
      res.cookies.delete('session')
      if (isProtectedRoute) {
        return NextResponse.redirect(new URL('sign-in', request.url))
      }
    }
  }

  return res
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.json).*)',
}
