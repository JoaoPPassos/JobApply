import { Injectable } from '@nestjs/common';

type CacheEntry = { userId: string; expiresAt: number };

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class UserCacheService {
  private readonly cache = new Map<string, CacheEntry>();

  set(userId: string, ttlMs = DEFAULT_TTL_MS): void {
    this.cache.set(userId, { userId, expiresAt: Date.now() + ttlMs });
  }

  get(userId: string): string | null {
    const entry = this.cache.get(userId);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(userId);
      return null;
    }
    return entry.userId;
  }

  has(userId: string): boolean {
    return this.get(userId) !== null;
  }
}
