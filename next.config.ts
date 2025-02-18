import createBundleAnalyzePlugin from '@next/bundle-analyzer'
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')
const withBundleAnalyze = createBundleAnalyzePlugin({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
})

const compose =
  (...plugins: Array<(config?: NextConfig) => NextConfig>) =>
  (config: NextConfig) =>
    plugins.reduce((acc, plugin) => plugin(acc), config)

const nextConfig: NextConfig = {
  compiler: {
    removeConsole: process.env.NODE_ENV !== 'development' ? { exclude: ['error'] } : false,
  },
}

export default compose(withNextIntl, withBundleAnalyze)(nextConfig)
