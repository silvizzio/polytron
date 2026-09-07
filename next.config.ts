import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  basePath: '/polytron',
  outputFileTracingIncludes: {
    "/api/pdf": ["./content/docs/**/*"],
  },
  serverExternalPackages: ["@sparticuz/chromium-min", "puppeteer-core", "pdf-lib"],
  async redirects() {
    return [
      {
        source: '/',
        destination: '/polytron',
        basePath: false,
        permanent: false,
      },
    ];
  },
};
export default nextConfig;
