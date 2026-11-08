import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Per-session app: all routes are personalised, so dynamic rendering is expected. */
  cacheComponents: false,
  devIndicators: false,
  turbopack: {
    rules: {
      "globals.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
