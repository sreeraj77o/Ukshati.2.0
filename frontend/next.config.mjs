/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    // This allows warnings but fails on errors during build
    ignoreDuringBuilds: false,
  },
  images: {
    domains: [
      'www.mishainfotech.com',
      'img.freepik.com',
      'miro.medium.com',
      'www.itarian.com',
      'aavenir.com',
      'everpro.id',
      'png.pngtree.com',
    ],
  },
};

export default nextConfig;
