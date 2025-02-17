import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development' ? { exclude: ['error'] } : false,
  },
}

export default withNextIntl(nextConfig)
