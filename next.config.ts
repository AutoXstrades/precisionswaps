import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/build",
        destination: "/builds/new",
        permanent: false,
      },
      {
        source: "/build/:id",
        destination: "/builds/:id",
        permanent: false,
      },
      {
        source: "/auth/login",
        destination: "/login",
        permanent: false,
      },
      {
        source: "/auth/register",
        destination: "/signup",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
