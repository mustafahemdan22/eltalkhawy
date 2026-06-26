import type { NextConfig } from 'next';

const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? 'dfq1xxerr';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Redirect legacy shop page to categories to avoid dead links
      {
        source: '/shop',
        destination: '/en/categories',
        permanent: false,
      },
      {
        source: '/en/shop',
        destination: '/en/categories',
        permanent: false,
      },
      {
        source: '/ar/shop',
        destination: '/ar/categories',
        permanent: false,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: `/${cloudinaryCloudName}/**`,
      },
      // Clerk CDN — provider logos (Google, Apple, etc.) and user avatars
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '*.clerk.com',
      },
      // Google OAuth user profile images
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

export default nextConfig;
