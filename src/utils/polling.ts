/**
 * Polling utility for async Shopify operations
 * Used by smart tools to wait for bulk operations, file uploads, etc.
 */

export interface PollResult<T> {
  done: boolean;
  result?: T;
  error?: string;
}

export interface PollOptions {
  /** Time between checks in milliseconds */
  intervalMs: number;
  /** Maximum time to wait in milliseconds */
  timeoutMs: number;
  /** Optional callback on each poll iteration */
  onPoll?: (elapsed: number) => void;
}

/**
 * Poll until a condition is met or timeout
 *
 * @param checkFn Function that checks the condition and returns result
 * @param options Polling configuration
 * @returns The result when done
 * @throws Error if timeout or error returned from checkFn
 *
 * @example
 * const result = await pollUntil(
 *   async () => {
 *     const file = await getFile(id);
 *     if (file.status === 'READY') return { done: true, result: file };
 *     if (file.status === 'FAILED') return { done: true, error: 'Upload failed' };
 *     return { done: false };
 *   },
 *   { intervalMs: 2000, timeoutMs: 30000 }
 * );
 */
export async function pollUntil<T>(
  checkFn: () => Promise<PollResult<T>>,
  options: PollOptions
): Promise<T> {
  const start = Date.now();

  while (Date.now() - start < options.timeoutMs) {
    const { done, result, error } = await checkFn();

    if (error) {
      throw new Error(error);
    }

    if (done) {
      return result as T;
    }

    // Call optional progress callback
    if (options.onPoll) {
      options.onPoll(Date.now() - start);
    }

    // Wait before next check
    await sleep(options.intervalMs);
  }

  throw new Error(
    `Polling timeout after ${options.timeoutMs}ms`
  );
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn Function to retry
 * @param options Retry configuration
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    shouldRetry?: (error: unknown) => boolean;
  }
): Promise<T> {
  let lastError: unknown;
  let delay = options.initialDelayMs;

  for (let attempt = 0; attempt <= options.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (options.shouldRetry && !options.shouldRetry(error)) {
        throw error;
      }

      // Don't sleep after the last attempt
      if (attempt < options.maxRetries) {
        await sleep(delay);
        delay = Math.min(delay * 2, options.maxDelayMs);
      }
    }
  }

  throw lastError;
}
