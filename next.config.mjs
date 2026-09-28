import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    // Cloudflare Pages serves static files; responsive variants are produced
    // at build time by scripts/generate-image-variants.mjs instead.
    unoptimized: true,
  },
  trailingSlash: true,
  reactStrictMode: true,
  // Other lockfiles exist further up the tree; pin the root to this project.
  turbopack: { root: here },
};

export default nextConfig;
