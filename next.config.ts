import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable experimental features for better performance
  experimental: {
    // Enable server actions for form handling
    serverActions: {
      bodySizeLimit: '2mb'
    }
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        // Apply security headers to all routes except API routes
        source: '/((?!api).*)',
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
        ],
      },
      {
        // Special headers for admin routes (no-cache)
        source: '/admin/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
      {
        // Cache headers for public log pages
        source: '/log/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ];
  },

  // Redirect rules
  async redirects() {
    return [
      {
        // Redirect /feed to /log for backwards compatibility
        source: '/feed',
        destination: '/log',
        permanent: true,
      },
    ];
  },

  // Environment variables validation
  env: {
    TASKFEED_ADMIN_SECRET: process.env.TASKFEED_ADMIN_SECRET,
  },
};

export default nextConfig;
