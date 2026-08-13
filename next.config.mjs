/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs', 'qrcode', 'jspdf'],
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
