import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');


/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow dev origin for HMR when accessing the app via the local network
  allowedDevOrigins: ['192.168.41.254'],
};

export default withNextIntl(nextConfig);
// next config.js CORS error fix for development when accessing the app via the local network
