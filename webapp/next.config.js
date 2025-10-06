/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow importing JSON files from the data directory
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@data': require('path').resolve(__dirname, '../data'),
    }
    return config
  },
}

module.exports = nextConfig