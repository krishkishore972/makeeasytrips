import type { NextConfig } from "next";

const cloudinaryCloudName =
  process.env.CLOUDINARY_CLOUD_NAME?.trim() ||
  process.env.CLOUDINARY_URL?.match(/@([^/@]+)\/?$/)?.[1];

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    agentUpgrade: "security",
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    remotePatterns: cloudinaryCloudName
      ? [
          {
            protocol: "https",
            hostname: "res.cloudinary.com",
            pathname: `/${cloudinaryCloudName}/**`,
          },
        ]
      : [],
  },
  async redirects() {
    return [
      {
        source: "/cabs",
        destination: "/rent-a-car",
        permanent: true,
      },
      {
        source: "/cabs/:path*",
        destination: "/rent-a-car/:path*",
        permanent: true,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
