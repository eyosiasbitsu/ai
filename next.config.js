/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true
  },
  images: {
    domains: [
      'res.cloudinary.com',
      'img.clerk.com',
      'uploadthing.com',
      'utfs.io'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Allow all hostnames
        port: '',
        pathname: '/**',
      }
    ],
  },
};

module.exports = nextConfig
