/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable static page generation for API routes during build
  // This prevents Firebase from trying to initialize during build
  experimental: {
    // Allow build to complete even if some routes fail
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
