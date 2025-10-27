import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class CacheManager {
  private cacheDir: string;
  private enabled: boolean;

  constructor(cacheDir: string = 'scripts/.cache') {
    this.cacheDir = cacheDir;
    this.enabled = true;
    
    // Ensure cache directory exists
    if (!fs.existsSync(this.cacheDir)) {
      fs.mkdirSync(this.cacheDir, { recursive: true });
    }
  }

  /**
   * Generate cache key from arbitrary data
   */
  private generateKey(prefix: string, data: string): string {
    const hash = crypto.createHash('md5').update(data).digest('hex');
    return `${prefix}-${hash}.json`;
  }

  /**
   * Get cache file path
   */
  private getCachePath(key: string): string {
    return path.join(this.cacheDir, key);
  }

  /**
   * Check if cache entry is valid (not expired)
   */
  private isValid(entry: CacheEntry<any>): boolean {
    const now = Date.now();
    const age = now - entry.timestamp;
    return age < entry.ttl;
  }

  /**
   * Get value from cache if it exists and is valid
   */
  get<T>(prefix: string, key: string): T | null {
    if (!this.enabled) return null;

    try {
      const cacheKey = this.generateKey(prefix, key);
      const cachePath = this.getCachePath(cacheKey);

      if (!fs.existsSync(cachePath)) {
        return null;
      }

      const content = fs.readFileSync(cachePath, 'utf-8');
      const entry: CacheEntry<T> = JSON.parse(content);

      if (!this.isValid(entry)) {
        // Cache expired, delete it
        fs.unlinkSync(cachePath);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Cache read error:', error);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  set<T>(prefix: string, key: string, data: T, ttl: number): void {
    if (!this.enabled) return;

    try {
      const cacheKey = this.generateKey(prefix, key);
      const cachePath = this.getCachePath(cacheKey);

      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl
      };

      fs.writeFileSync(cachePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.warn('Cache write error:', error);
    }
  }

  /**
   * Check if cache entry exists and is valid
   */
  has(prefix: string, key: string): boolean {
    return this.get(prefix, key) !== null;
  }

  /**
   * Delete specific cache entry
   */
  delete(prefix: string, key: string): void {
    try {
      const cacheKey = this.generateKey(prefix, key);
      const cachePath = this.getCachePath(cacheKey);

      if (fs.existsSync(cachePath)) {
        fs.unlinkSync(cachePath);
      }
    } catch (error) {
      console.warn('Cache delete error:', error);
    }
  }

  /**
   * Clear all cache entries for a specific prefix
   */
  clear(prefix: string): void {
    try {
      const files = fs.readdirSync(this.cacheDir);
      
      for (const file of files) {
        if (file.startsWith(prefix)) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.warn('Cache clear error:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    try {
      const files = fs.readdirSync(this.cacheDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          fs.unlinkSync(path.join(this.cacheDir, file));
        }
      }
    } catch (error) {
      console.warn('Cache clearAll error:', error);
    }
  }

  /**
   * Clean up expired cache entries
   */
  cleanup(): number {
    let cleaned = 0;

    try {
      const files = fs.readdirSync(this.cacheDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.cacheDir, file);
          
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const entry = JSON.parse(content);
            
            if (!this.isValid(entry)) {
              fs.unlinkSync(filePath);
              cleaned++;
            }
          } catch (error) {
            // Invalid file, delete it
            fs.unlinkSync(filePath);
            cleaned++;
          }
        }
      }
    } catch (error) {
      console.warn('Cache cleanup error:', error);
    }

    return cleaned;
  }

  /**
   * Get cache statistics
   */
  stats(): { total: number; expired: number; size: number } {
    const stats = {
      total: 0,
      expired: 0,
      size: 0
    };

    try {
      const files = fs.readdirSync(this.cacheDir);
      
      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.cacheDir, file);
          
          try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const entry = JSON.parse(content);
            
            stats.size += Buffer.byteLength(content, 'utf8');
            stats.total++;
            
            if (!this.isValid(entry)) {
              stats.expired++;
            }
          } catch {
            stats.total++;
          }
        }
      }
    } catch (error) {
      console.warn('Cache stats error:', error);
    }

    return stats;
  }

  /**
   * Enable/disable cache
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }
}

export default CacheManager;
