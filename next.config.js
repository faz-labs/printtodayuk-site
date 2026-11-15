/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
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
        permanent: true,
      },
      // P0-1: Essential 301/308 redirects for high-bounce 404 paths identified in GA4
      {
        source: '/business-cards',
        destination: '/category/Business%20Cards',
        permanent: true,
      },
      {
        source: '/flyers',
        destination: '/category/Flyers%20%26%20Leaflets',
        permanent: true,
      },
      {
        source: '/leaflets',
        destination: '/category/Flyers%20%26%20Leaflets',
        permanent: true,
      },
      {
        source: '/banners',
        destination: '/category/Roller%20Banners',
        permanent: true,
      },
      {
        source: '/roller-banners',
        destination: '/category/Roller%20Banners',
        permanent: true,
      },
      {
        source: '/pull-up-banners',
        destination: '/category/Roller%20Banners',
        permanent: true,
      },
      {
        source: '/t-shirts',
        destination: '/clothing',
        permanent: true,
      },
      {
        source: '/hoodies',
        destination: '/clothing',
        permanent: true,
      },
      {
        source: '/clothing/t-shirts',
        destination: '/clothing',
        permanent: true,
      },
      {
        source: '/clothing/hoodies',
        destination: '/clothing',
        permanent: true,
      },
      {
        source: '/products',
        destination: '/all-products',
        permanent: true,
      },
      {
        source: '/printing',
        destination: '/category/Printing',
        permanent: true,
      },
      {
        source: '/same-day-printing-london',
        destination: '/same-day-printing',
        permanent: true,
      },
      {
        source: '/same-day-print',
        destination: '/same-day-printing',
        permanent: true,
      },
      {
        source: '/posters',
        destination: '/category/Posters%20%26%20Flexible%20Media',
        permanent: true,
      },
      {
        source: '/stickers',
        destination: '/category/Stickers%20%26%20Labels',
        permanent: true,
      },
      {
        source: '/labels',
        destination: '/category/Stickers%20%26%20Labels',
        permanent: true,
      },
      {
        source: '/booklets',
        destination: '/category/Books%20%26%20Booklets',
        permanent: true,
      },
      {
        source: '/books',
        destination: '/category/Books%20%26%20Booklets',
        permanent: true,
      },
      {
        source: '/stationery',
        destination: '/category/Stationery',
        permanent: true,
      },
      {
        source: '/calendars',
        destination: '/category/Seasonal',
        permanent: true,
      },
      {
        source: '/wall-planners',
        destination: '/product/flat-wall-planners',
        permanent: true,
      },
      {
        source: '/wrapping-paper',
        destination: '/product/flat-wrapping-paper',
        permanent: true,
      },
      {
        source: '/gift-tags',
        destination: '/product/gift-tags',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
