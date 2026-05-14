import type { NextConfig } from 'next'
const { PrismaPlugin } = require('@prisma/nextjs-monorepo-workaround-plugin')

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    // Ignore all libSQL related files that cause webpack issues
    config.module.rules.push({
      test: /\.(md|LICENSE|\.node)$/,
      use: 'null-loader'
    })

    // Ignore specific libSQL directories and files
    config.resolve.alias = {
      ...config.resolve.alias,
      '@libsql/linux-x64-gnu': false,
      '@libsql/linux-x64-musl': false,
      '@libsql/darwin-arm64': false,
      '@libsql/win32-x64': false,
    }

    // Add more comprehensive externals
    const libsqlExternals = [
      '@libsql/linux-x64-gnu',
      '@libsql/linux-x64-musl',
      '@libsql/darwin-arm64',
      '@libsql/win32-x64',
      'libsql',
      /^@libsql\//
    ]

    if (isServer) {
      config.externals = config.externals || []
      config.externals.push(...libsqlExternals)
    }

    return config
  },
  // Target modern browsers only to reduce polyfills
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  experimental: {
    optimizeCss: false, // Disable to avoid critters error
    optimizePackageImports: [
      '@prisma/client', 
      'react-markdown', 
      'prismjs',
      'date-fns',
      'lodash-es',
      'zod',
      'rehype-raw',
      'remark-gfm'
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // 자체 도메인 이미지 (NEXT_PUBLIC_SITE_URL 환경변수에서 추출)
      ...(process.env.NEXT_PUBLIC_SITE_URL ? [{
        protocol: 'https' as const,
        hostname: new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname,
      }] : []),
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: '*.ytimg.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.prod.website-files.com',
      },
      {
        protocol: 'https',
        hostname: '*.website-files.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year
  },
  serverExternalPackages: [
    'sharp',
    '@libsql/client',
    '@libsql/core',
    '@libsql/hrana-client',
    '@libsql/isomorphic-fetch',
    '@libsql/isomorphic-ws',
    'libsql'
  ],
  compress: true,
  poweredByHeader: false,
  headers: async () => [
    {
      source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/:all*(css|js)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/:all*(woff|woff2|ttf|otf|eot)',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
    {
      source: '/:path*',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY',
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff',
        },
        {
          key: 'Referrer-Policy',
          value: 'strict-origin-when-cross-origin',
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=()',
        },
        {
          key: 'Content-Security-Policy',
          value: "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com https://*.doubleclick.net https://*.google.com https://*.googlesyndication.com https://*.adtrafficquality.google https://*.coupang.com https://coupa.ng https://*.coupa.ng https://*.coupangcdn.com https://partners.coupangcdn.com https://ads-partners.coupang.com;",
        },
      ],
    },
  ],
}

export default nextConfig