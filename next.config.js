/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { 
    unoptimized: true,
    domains: ['images.pexels.com']
  },
  // Remove output: 'export' for Vercel deployment
  // Vercel handles the build process automatically
  experimental: {
    serverComponentsExternalPackages: ['@anthropic-ai/sdk']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};

module.exports = nextConfig;