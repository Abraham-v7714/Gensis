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
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "on" },
        ],
      },
    ];
  },
};

export default nextConfig;
