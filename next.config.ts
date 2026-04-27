import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Autoriser les appels API depuis le front public (CORS)
  async headers() {
    return [
      {
        // Appliquer les headers CORS a toutes les routes /api/public/*
        source: "/api/public/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: process.env.ALLOWED_ORIGINS ?? "https://ong-chadia.com",
          },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET, POST, OPTIONS",
          },
          {
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
          {
            key: "Access-Control-Max-Age",
            value: "86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
