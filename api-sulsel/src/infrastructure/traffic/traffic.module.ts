import { Global, Injectable, Module } from '@nestjs/common';

export class RateLimitExceeded extends Error {
  readonly retryAfterSeconds: number;

  constructor(action: string, retryAfterSeconds: number) {
    super(`Rate limit exceeded: ${action}`);
    this.name = 'RateLimitExceeded';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class InvalidIdempotencyKey extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidIdempotencyKey';
  }
}

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

@Injectable()
export class RateLimitService {
  private readonly entries = new Map<string, RateLimitEntry>();

  consume(key: string, limit: number, windowMs: number): void {
    const now = Date.now();
    const entry = this.entries.get(key);
    if (!entry || entry.resetAt <= now) {
      this.entries.set(key, { count: 1, resetAt: now + windowMs });
      return;
    }
    if (entry.count >= limit) {
      const retryAfterSeconds = Math.max(
        1,
        Math.ceil((entry.resetAt - now) / 1000),
      );
      throw new RateLimitExceeded(key, retryAfterSeconds);
    }
    entry.count += 1;
  }
}

type IdempotencyEntry = {
  value: unknown;
  expiresAt: number;
};

type HeaderValue = string | string[] | undefined;

@Injectable()
export class IdempotencyService {
  private readonly entries = new Map<string, IdempotencyEntry>();
  private readonly maxKeyLength = 200;

  normalizeKey(value: HeaderValue): string | null {
    if (!value) {
      return null;
    }
    const raw = Array.isArray(value) ? value[0] : value;
    if (!raw) {
      return null;
    }
    const key = raw.trim();
    if (!key) {
      return null;
    }
    if (key.length > this.maxKeyLength) {
      throw new InvalidIdempotencyKey('Idempotency key too long');
    }
    return key;
  }

  get<T>(key: string): T | null {
    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }
    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }
    return entry.value as T;
  }

  set(key: string, value: unknown, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.entries.set(key, { value, expiresAt });
  }
}

@Global()
@Module({
  providers: [RateLimitService, IdempotencyService],
  exports: [RateLimitService, IdempotencyService],
})
export class TrafficModule {}
