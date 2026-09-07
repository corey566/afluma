import { withPayload } from '@payloadcms/next/withPayload'

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: { optimizePackageImports: ['@payloadcms/ui'] },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.afluma.com' },
      { protocol: 'https', hostname: '**.r2.dev' }
    ]
  },
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' }
      ]
    }]
  }
}

export default withPayload(nextConfig)
