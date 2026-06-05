interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  label?: string;
}

const RETRYABLE_PATTERN =
  /\b429\b|\b502\b|\b503\b|\b529\b|too many requests|rate.?limit|overloaded|unavailable|temporarily|timeout/i;

function isRetryableError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return RETRYABLE_PATTERN.test(message);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  { retries = 2, baseDelayMs = 400, maxDelayMs = 4000, label = "ai" }: RetryOptions = {},
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt === retries || !isRetryableError(error)) {
        throw error;
      }
      const backoff = Math.min(maxDelayMs, baseDelayMs * 2 ** attempt);
      const jitter = Math.floor(Math.random() * 200);
      console.warn(
        `[retry:${label}] attempt ${attempt + 1}/${retries + 1} failed (retryable), waiting ${backoff + jitter}ms`,
      );
      await delay(backoff + jitter);
    }
  }

  throw lastError;
}
