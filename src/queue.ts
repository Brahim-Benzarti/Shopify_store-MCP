/**
 * Rate-limited queue for Shopify API calls
 * Respects Shopify's rate limits based on shop plan tier
 */

import PQueue from "p-queue";

// Shopify Admin API rate limit configurations
// https://shopify.dev/docs/api/usage/limits#rate-limits
export const SHOPIFY_TIER_CONFIGS = {
  STANDARD: {
    name: "Standard Shopify",
    // GraphQL Admin API: 100 points/second, bucket size 1000 points
    // Conservative settings: ~1 request/second
    concurrency: 1,
    interval: 1000,
    intervalCap: 1,
  },
  ADVANCED: {
    name: "Advanced Shopify",
    // GraphQL Admin API: 200 points/second
    concurrency: 1,
    interval: 1000,
    intervalCap: 2,
  },
  PLUS: {
    name: "Shopify Plus",
    // GraphQL Admin API: 1000 points/second
    concurrency: 2,
    interval: 1000,
    intervalCap: 5,
  },
  ENTERPRISE: {
    name: "Shopify for Enterprise (Commerce Components)",
    // GraphQL Admin API: 2000 points/second
    concurrency: 3,
    interval: 1000,
    intervalCap: 10,
  },
} as const;

export type ShopifyTier = keyof typeof SHOPIFY_TIER_CONFIGS;

// Global queue instance
let queue: PQueue = new PQueue(SHOPIFY_TIER_CONFIGS.STANDARD);
let currentTier: ShopifyTier = "STANDARD";

/**
 * Get the current queue configuration
 */
export function getCurrentTierInfo(): {
  tier: ShopifyTier;
  config: (typeof SHOPIFY_TIER_CONFIGS)[ShopifyTier];
} {
  return {
    tier: currentTier,
    config: SHOPIFY_TIER_CONFIGS[currentTier],
  };
}

/**
 * Update the queue to use a different tier's rate limits
 */
export function updateQueue(tier: ShopifyTier): void {
  const config = SHOPIFY_TIER_CONFIGS[tier];

  // Clear existing queue and create new one
  queue.clear();
  queue = new PQueue({
    concurrency: config.concurrency,
    interval: config.interval,
    intervalCap: config.intervalCap,
  });

  currentTier = tier;
  console.error(
    `[shopify-store-mcp] Queue updated to ${config.name} tier (${tier})`
  );
}

/**
 * Detect Shopify tier from shop plan information
 */
export function detectTierFromPlan(plan: {
  shopifyPlus?: boolean;
  displayName?: string;
}): ShopifyTier {
  // Check for Shopify Plus first (most specific)
  if (plan.shopifyPlus) {
    return "PLUS";
  }

  // Check display name for other tiers
  const displayName = (plan.displayName || "").toLowerCase();

  if (displayName.includes("advanced")) {
    return "ADVANCED";
  }

  if (
    displayName.includes("enterprise") ||
    displayName.includes("commerce components")
  ) {
    return "ENTERPRISE";
  }

  // Default to STANDARD for Basic, Development, Grow, Lite, etc.
  return "STANDARD";
}

/**
 * Enqueue a function to be executed with rate limiting
 */
export async function enqueue<T>(fn: () => Promise<T>): Promise<T> {
  return queue.add(fn) as Promise<T>;
}

/**
 * Get queue statistics
 */
export function getQueueStats(): {
  pending: number;
  size: number;
  isPaused: boolean;
} {
  return {
    pending: queue.pending,
    size: queue.size,
    isPaused: queue.isPaused,
  };
}

/**
 * Pause the queue (useful for graceful shutdown)
 */
export function pauseQueue(): void {
  queue.pause();
}

/**
 * Resume the queue
 */
export function resumeQueue(): void {
  queue.start();
}

/**
 * Clear all pending items from the queue
 */
export function clearQueue(): void {
  queue.clear();
}
