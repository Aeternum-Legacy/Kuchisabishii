/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['shared'],
  experimental: {
    externalDir: true
  }
};

module.exports = nextConfig;
