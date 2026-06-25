/**
 * Client-side Security & Rate Limiting Utilities
 */

// XSS Prevention: Sanitize input by escaping HTML tags and special characters
export const sanitizeInput = (val: string): string => {
  if (typeof val !== 'string') return val;
  return val
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

interface RateLimitData {
  attempts: number[];
  lockoutUntil: number;
}

// Client-side Rate Limiting (using localStorage to persist across refreshes)
export const checkRateLimit = (
  key: string,
  maxAttempts: number,
  windowMs: number,
  lockoutDurationMs: number
): { allowed: boolean; remainingAttempts: number; retryAfterSeconds: number } => {
  if (typeof window === 'undefined') {
    return { allowed: true, remainingAttempts: maxAttempts, retryAfterSeconds: 0 };
  }

  const storageKey = `rate_limit_${key}`;
  const now = Date.now();
  
  let data: RateLimitData = { attempts: [], lockoutUntil: 0 };
  
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      data = JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to parse rate limit data', e);
  }

  // Check if locked out
  if (data.lockoutUntil > now) {
    const retryAfterSeconds = Math.ceil((data.lockoutUntil - now) / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Filter attempts to only keep those within the sliding window
  const windowStart = now - windowMs;
  data.attempts = data.attempts.filter(timestamp => timestamp > windowStart);

  if (data.attempts.length >= maxAttempts) {
    // Lock out the user
    data.lockoutUntil = now + lockoutDurationMs;
    localStorage.setItem(storageKey, JSON.stringify(data));
    const retryAfterSeconds = Math.ceil(lockoutDurationMs / 1000);
    return { allowed: false, remainingAttempts: 0, retryAfterSeconds };
  }

  // Record new attempt
  data.attempts.push(now);
  localStorage.setItem(storageKey, JSON.stringify(data));

  return { 
    allowed: true, 
    remainingAttempts: maxAttempts - data.attempts.length, 
    retryAfterSeconds: 0 
  };
};

// Reset rate limits for a key (e.g., after successful login or operation)
export const resetRateLimit = (key: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(`rate_limit_${key}`);
  }
};
