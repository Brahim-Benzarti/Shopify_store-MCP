import { config as loadDotenv } from "dotenv";
import { mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { createHash } from "crypto";
import { fileURLToPath } from "url";

// Get the directory of this file for relative .env loading
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ShopifyConfig {
  storeDomain: string;
  adminAccessToken: string;
  storefrontAccessToken?: string;
  customerAccessToken?: string;
  apiVersion: string;
  bugReportEnabled: boolean;
  bugReportDir?: string;
}

export function loadConfig(): ShopifyConfig {
  // Try to load .env files from the package root (one level up from dist/)
  // Priority: .env.local > .env (local overrides shared)
  const packageRoot = join(__dirname, "..");
  loadDotenv({ path: join(packageRoot, ".env.local") });
  loadDotenv({ path: join(packageRoot, ".env") });

  const storeDomain = process.env.SHOPIFY_STORE_URL;
  const adminAccessToken = process.env.SHOPIFY_ACCESS_TOKEN;
  const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;
  const customerAccessToken = process.env.SHOPIFY_CUSTOMER_ACCESS_TOKEN;
  const apiVersion = process.env.SHOPIFY_API_VERSION || "2025-01";
  const bugReportEnabled = process.env.SHOPIFY_MCP_BUG_REPORTS === "true";
  const bugReportBaseDir = process.env.SHOPIFY_MCP_BUG_REPORT_DIR;

  if (!storeDomain) {
    throw new Error(
      "SHOPIFY_STORE_URL is required. Set it to your store's myshopify.com domain (e.g. my-store.myshopify.com)."
    );
  }

  if (!adminAccessToken) {
    throw new Error(
      "SHOPIFY_ACCESS_TOKEN is required. Create a custom app in Shopify Admin > Settings > Apps and development channels to get one."
    );
  }

  // Normalize: strip protocol and trailing slash
  const normalized = storeDomain
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  // Create unique bug report directory per store
  let bugReportDir: string | undefined;
  if (bugReportEnabled) {
    // Create a unique identifier from store domain + session timestamp
    const sessionId = Date.now().toString(36);
    const storeHash = createHash("md5")
      .update(normalized)
      .digest("hex")
      .slice(0, 8);
    const dirName = `${normalized.replace(/\./g, "-")}_${storeHash}_${sessionId}`;

    bugReportDir = bugReportBaseDir
      ? join(bugReportBaseDir, dirName)
      : join(process.cwd(), ".bug-reports", dirName);

    // Create the directory if it doesn't exist
    if (!existsSync(bugReportDir)) {
      mkdirSync(bugReportDir, { recursive: true });
      console.error(`[shopify-store-mcp] Bug reports enabled: ${bugReportDir}`);
    }
  }

  // Debug logging for troubleshooting
  console.error(`[shopify-store-mcp] Store domain: ${normalized}`);
  console.error(`[shopify-store-mcp] Token prefix: ${adminAccessToken.substring(0, 8)}...`);
  console.error(`[shopify-store-mcp] Token length: ${adminAccessToken.length} chars`);

  return {
    storeDomain: normalized,
    adminAccessToken,
    storefrontAccessToken,
    customerAccessToken,
    apiVersion,
    bugReportEnabled,
    bugReportDir,
  };
}
