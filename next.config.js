/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/all%20products',
        destination: '/all-products',
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/all%20products',
        destination: '/all-products',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
