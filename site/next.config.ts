import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The client folder sits inside a larger repo; pin the root so Turbopack does
  // not walk up and pick a lockfile from outside the project.
  turbopack: { root: path.resolve(import.meta.dirname) },
  images: {
    // Listing photography is served straight from the MSYS S3 bucket.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com',
        pathname: '/msys-imob-imobiliariaconceitto/**',
      },
      {
        protocol: 'https',
        hostname: 'msys-imob-imobiliariaconceitto.s3.amazonaws.com',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
};

export default nextConfig;
