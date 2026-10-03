import type { NextConfig } from "next";
import { getShopifyStoreDomain } from "@/lib/commerce/providers/shopify/config";

const shopDomain = getShopifyStoreDomain();

const remotePatterns: Array<{ protocol: "https"; hostname: string }> = [
  { protocol: "https", hostname: "cdn.shopify.com" },
  { protocol: "https", hostname: "cdn.sanity.io" },
];

if (shopDomain && typeof shopDomain === "string") {
  remotePatterns.push({ protocol: "https", hostname: shopDomain });
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns,
  },
  async headers() {
    return [
      {
        source: "/((?!studio|_next/static|_next/image|favicon.ico).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
      {
        source: "/studio/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: "frame-ancestors 'self' https://*.sanity.io https://*.sanity.build;",
          },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
