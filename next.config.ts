import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['sqlite3', '@supabase/supabase-js'],
  output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,
  trailingSlash: process.env.NEXT_EXPORT === 'true',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
