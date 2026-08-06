import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // The client folder sits inside a larger repo; pin the root so Turbopack does
  // not walk up and pick a lockfile from outside the project.
  turbopack: { root: path.resolve(import.meta.dirname) },
  images: {
    // Photography is served from `public/imagens`, so no remote host is allowed.
    // The MSYS S3 bucket used to be listed here and no longer renders.
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
};

export default nextConfig;
