import type { NextConfig } from 'next';
import { execSync } from 'node:child_process';

// Build stamp for the footer: date and short commit hash (empty when not in a git repo).
const buildSha = (() => {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return '';
  }
})();

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_DATE: new Date().toISOString().slice(0, 10),
    NEXT_PUBLIC_BUILD_SHA: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? buildSha
  },
  // Basic security headers on every response.
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000' }
        ]
      }
    ];
  },
  // Single-page site: the old standalone pages now live as sections on the home page.
  async redirects() {
    return [
      { source: '/work', destination: '/#work', permanent: true },
      { source: '/stack', destination: '/#stack', permanent: true },
      { source: '/contact', destination: '/#contact', permanent: true },
      { source: '/log', destination: '/#blog', permanent: true },
      { source: '/blog', destination: '/#blog', permanent: true },
      { source: '/log/category/:category', destination: '/#blog', permanent: true },
      { source: '/log/rss.xml', destination: '/blog/rss.xml', permanent: true },
      { source: '/log/:slug', destination: '/blog/:slug', permanent: true }
    ];
  }
};

export default nextConfig;
