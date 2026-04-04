import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  typedRoutes: true,
  //  experimental: {
  //   serverComponentsExternalPackages: ["argon2"],
  // },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "yinfzs62id.ufs.sh",
        port: "",
        pathname: "/**"
      }
    ]
  }
};

export default nextConfig;
