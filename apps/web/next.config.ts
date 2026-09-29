import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The browser never talks to the API directly; Next.js server code does.
  // So there is no CORS config anywhere, and the admin key never ships to the browser.
  poweredByHeader: false,
};

export default nextConfig;
