import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    GithubApp__InstallationUrl: process.env.GithubApp__InstallationUrl,
  },
  experimental: {
    authInterrupts: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
};

export default nextConfig;
