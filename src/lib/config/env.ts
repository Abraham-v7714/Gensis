/**
 * Server-Side Environment & Secrets Validation — Stage 4.16
 *
 * Provider-neutral environment validation and classification.
 *
 * Variable Classifications:
 * 1. PUBLIC (Browser-safe):
 *    - NEXT_PUBLIC_SITE_URL: Canonical storefront URL
 *    - NEXT_PUBLIC_SANITY_PROJECT_ID: Sanity Project ID for Studio SPA
 *    - NEXT_PUBLIC_SANITY_DATASET: Sanity dataset for Studio SPA
 *    - NEXT_PUBLIC_SANITY_API_VERSION: Sanity API version for Studio SPA
 *
 * 2. SERVER (Private secrets & server config):
 *    - SHOPIFY_STORE_DOMAIN: Myshopify domain
 *    - SHOPIFY_STOREFRONT_PRIVATE_TOKEN: Private Storefront API token
 *    - SHOPIFY_STOREFRONT_API_VERSION: API version (2026-07)
 *    - SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID: OAuth Client ID
 *    - SANITY_PROJECT_ID: Server-side Sanity Project ID
 *    - SANITY_DATASET: Server-side Sanity dataset
 *    - SANITY_API_VERSION: Server-side Sanity API version
 *    - SANITY_API_READ_TOKEN: Server-side draft/preview read token
 *    - SANITY_REVALIDATE_SECRET: Webhook ISR cache revalidation secret
 *    - AUTH_SECRET: Session AES-256-GCM encryption key (min 32 chars in production)
 *
 * 3. DEVELOPMENT / SCRIPT ONLY:
 *    - SANITY_API_WRITE_TOKEN: Content seeding script only (never in app)
 */

export interface EnvValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ValidateEnvOptions {
  isProduction?: boolean;
  throwOnError?: boolean;
}

/**
 * Validates server environment variables.
 * Does NOT perform network requests or print sensitive secret values.
 */
export function validateEnv(options: ValidateEnvOptions = {}): EnvValidationResult {
  const isProd = options.isProduction ?? process.env.NODE_ENV === "production";
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for accidentally leaked server secrets with NEXT_PUBLIC_ prefix
  const leakedPrefixes = [
    "NEXT_PUBLIC_SHOPIFY_STOREFRONT_PRIVATE_TOKEN",
    "NEXT_PUBLIC_SANITY_API_READ_TOKEN",
    "NEXT_PUBLIC_SANITY_API_WRITE_TOKEN",
    "NEXT_PUBLIC_SANITY_REVALIDATE_SECRET",
    "NEXT_PUBLIC_AUTH_SECRET",
  ];

  for (const varName of leakedPrefixes) {
    if (process.env[varName]) {
      errors.push(
        `[SECURITY ERROR] Sensitive secret "${varName}" must NOT be exposed with NEXT_PUBLIC_ prefix.`
      );
    }
  }

  // 1. Session Secret Validation (AUTH_SECRET)
  const authSecret = process.env.AUTH_SECRET;
  if (isProd) {
    if (!authSecret) {
      errors.push(
        "AUTH_SECRET is required in production for AES-256-GCM session encryption."
      );
    } else if (authSecret.length < 32) {
      errors.push(
        "AUTH_SECRET must be at least 32 characters in production for cryptographic safety."
      );
    } else if (authSecret.includes("gensis_auth_secret_must_be_32_bytes_min")) {
      errors.push(
        "AUTH_SECRET is using the default development placeholder. A unique secret is required in production."
      );
    }
  } else if (!authSecret) {
    warnings.push("AUTH_SECRET not set; using development fallback secret.");
  }

  // 2. Shopify Configuration Validation
  const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN;
  const shopifyToken = process.env.SHOPIFY_STOREFRONT_PRIVATE_TOKEN;

  if (shopifyDomain) {
    if (shopifyDomain.startsWith("http://") || shopifyDomain.startsWith("https://")) {
      warnings.push(
        "SHOPIFY_STORE_DOMAIN should be a bare domain or hostname without http:// or https://."
      );
    }
  }

  if (isProd && (!shopifyDomain || !shopifyToken)) {
    warnings.push(
      "Shopify production credentials (SHOPIFY_STORE_DOMAIN, SHOPIFY_STOREFRONT_PRIVATE_TOKEN) are unconfigured. Commerce routes will run in graceful fallback mode."
    );
  }

  // 3. Sanity Configuration Validation
  const sanityProjectId = process.env.SANITY_PROJECT_ID || process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  if (isProd && !sanityProjectId) {
    warnings.push(
      "SANITY_PROJECT_ID is unconfigured. Editorial CMS routes will run in graceful fallback mode."
    );
  }

  // 4. Sanity Revalidation Secret
  const revalidateSecret = process.env.SANITY_REVALIDATE_SECRET;
  if (isProd && !revalidateSecret) {
    warnings.push(
      "SANITY_REVALIDATE_SECRET is unconfigured. CMS cache webhook revalidation endpoint (/api/revalidate/sanity) will reject requests."
    );
  }

  // 5. Site URL Validation
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    try {
      const parsed = new URL(siteUrl);
      if (isProd && parsed.protocol !== "https:") {
        warnings.push(
          `NEXT_PUBLIC_SITE_URL should use https:// protocol in production (found: ${parsed.protocol}).`
        );
      }
    } catch {
      errors.push(`NEXT_PUBLIC_SITE_URL is not a valid URL: ${siteUrl}`);
    }
  }

  const result: EnvValidationResult = {
    valid: errors.length === 0,
    errors,
    warnings,
  };

  if (!result.valid && options.throwOnError) {
    throw new Error(
      `[GENSIS Environment Validation Failed]\n${errors.map((e) => `  - ${e}`).join("\n")}`
    );
  }

  return result;
}
