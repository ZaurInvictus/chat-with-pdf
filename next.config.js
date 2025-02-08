/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Set this to your preferred limit
    },
  },
}

module.exports = nextConfig 