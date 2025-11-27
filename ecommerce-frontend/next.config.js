/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: [
      "images.unsplash.com",
      "plus.unsplash.com",
      "product.hstatic.net",
      "img.ltwebstatic.com",
      "cdn.shopify.com",
      "localhost",
    ],
  },
};

module.exports = nextConfig;
