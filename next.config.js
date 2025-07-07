/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['handlebars', 'genkit', 'genkitx-openai'],
  },
  experimental: {
    serverComponentsExternalPackages: ['handlebars', 'genkit', 'genkitx-openai'],
  },
};

module.exports = nextConfig;
