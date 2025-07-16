import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // ✅ for Netlify SSR, supports dynamic routes
};

export default nextConfig;
