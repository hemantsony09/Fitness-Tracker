/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimize for production
  reactStrictMode: true,
  swcMinify: true,
  // PWA support
  output: 'standalone',
  // Allow external images (Google profile pictures)
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;

