export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  backoffMultiplier?: number;
  maxBackoffMs?: number;
}

export interface QueuedRequest<T> {
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: any) => void;
  timestamp: number;
}

export class RateLimiter {
  private configs: Map<string, RateLimitConfig>;
  private requestTimestamps: Map<string, number[]>;
  private queues: Map<string, QueuedRequest<any>[]>;
  private processing: Map<string, boolean>;
  private retryCount: Map<string, number>;

  constructor() {
    this.configs = new Map();
    this.requestTimestamps = new Map();
    this.queues = new Map();
    this.processing = new Map();
    this.retryCount = new Map();

    // Default configurations
    this.setConfig('gemini', { maxRequests: 15, windowMs: 60000 }); // 15 requests per minute
    this.setConfig('serpapi', { maxRequests: 10, windowMs: 60000 }); // 10 requests per minute
    this.setConfig('reddit', { maxRequests: 60, windowMs: 60000 }); // 60 requests per minute
  }

  /**
   * Configure rate limiting for a service
   */
  setConfig(service: string, config: RateLimitConfig): void {
    this.configs.set(service, config);
    
    if (!this.requestTimestamps.has(service)) {
      this.requestTimestamps.set(service, []);
    }
    
    if (!this.queues.has(service)) {
      this.queues.set(service, []);
    }

    if (!this.processing.has(service)) {
      this.processing.set(service, false);
    }
  }

  /**
   * Check if request can be made immediately
   */
  private canMakeRequest(service: string): boolean {
    const config = this.configs.get(service);
    if (!config) return true;

    const timestamps = this.requestTimestamps.get(service) || [];
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Remove timestamps outside the window
    const recentTimestamps = timestamps.filter(t => t > windowStart);
    this.requestTimestamps.set(service, recentTimestamps);

    return recentTimestamps.length < config.maxRequests;
  }

  /**
   * Add request timestamp
   */
  private addTimestamp(service: string): void {
    const timestamps = this.requestTimestamps.get(service) || [];
    timestamps.push(Date.now());
    this.requestTimestamps.set(service, timestamps);
  }

  /**
   * Calculate delay before next request
   */
  private calculateDelay(service: string): number {
    const config = this.configs.get(service);
    const timestamps = this.requestTimestamps.get(service) || [];
    
    if (timestamps.length === 0) return 0;
    
    const oldestTimestamp = Math.min(...timestamps);
    const elapsed = Date.now() - oldestTimestamp;
    const remaining = config.windowMs - elapsed;
    
    return Math.max(0, remaining);
  }

  /**
   * Get exponential backoff delay
   */
  private getBackoffDelay(service: string, attempt: number): number {
    const config = this.configs.get(service);
    const multiplier = config.backoffMultiplier || 2;
    const maxBackoff = config.maxBackoffMs || 16000;
    const baseDelay = 1000; // 1 second
    
    const delay = Math.min(baseDelay * Math.pow(multiplier, attempt), maxBackoff);
    
    // Add some jitter
    const jitter = Math.random() * 1000;
    
    return delay + jitter;
  }

  /**
   * Process queued requests for a service
   */
  private async processQueue(service: string): Promise<void> {
    if (this.processing.get(service)) return;
    
    this.processing.set(service, true);
    const queue = this.queues.get(service) || [];

    while (queue.length > 0) {
      // Check if we can make a request
      if (!this.canMakeRequest(service)) {
        const delay = this.calculateDelay(service);
        await this.sleep(delay);
      }

      const item = queue.shift();
      if (!item) continue;

      try {
        this.addTimestamp(service);
        const result = await item.fn();
        item.resolve(result);
        this.retryCount.delete(`${service}-${item.timestamp}`);
      } catch (error) {
        const retryKey = `${service}-${item.timestamp}`;
        const attempts = this.retryCount.get(retryKey) || 0;
        
        // Retry with exponential backoff for certain errors
        if (this.isRetryableError(error) && attempts < 5) {
          const delay = this.getBackoffDelay(service, attempts);
          this.retryCount.set(retryKey, attempts + 1);
          
          console.warn(`Retrying ${service} request (attempt ${attempts + 1}) after ${delay}ms`);
          
          setTimeout(async () => {
            queue.unshift(item);
            await this.processQueue(service);
          }, delay);
        } else {
          item.reject(error);
        }
      }
    }

    this.processing.set(service, false);
  }

  /**
   * Execute a function with rate limiting
   */
  async execute<T>(service: string, fn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const item: QueuedRequest<T> = {
        fn,
        resolve,
        reject,
        timestamp: Date.now()
      };

      const queue = this.queues.get(service) || [];
      queue.push(item);
      this.queues.set(service, queue);

      // Process queue if not already processing
      this.processQueue(service);
    });
  }

  /**
   * Check if error is retryable
   */
  private isRetryableError(error: any): boolean {
    if (!error) return false;

    const errorMessage = error.message?.toLowerCase() || '';
    const statusCode = error.response?.status || error.status;

    // Network errors
    if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      return true;
    }

    // Rate limit errors
    if (statusCode === 429 || errorMessage.includes('rate limit')) {
      return true;
    }

    // Server errors (500-599)
    if (statusCode >= 500 && statusCode < 600) {
      return true;
    }

    return false;
  }

  /**
   * Get current queue length for a service
   */
  getQueueLength(service: string): number {
    return (this.queues.get(service) || []).length;
  }

  /**
   * Clear queue for a service
   */
  clearQueue(service: string): void {
    this.queues.set(service, []);
  }

  /**
   * Get statistics for a service
   */
  getStats(service: string): {
    queueLength: number;
    recentRequests: number;
    canMakeRequest: boolean;
    delayUntilNextRequest: number;
  } {
    const config = this.configs.get(service);
    const timestamps = this.requestTimestamps.get(service) || [];
    const now = Date.now();
    const windowStart = now - (config?.windowMs || 60000);
    const recentRequests = timestamps.filter(t => t > windowStart).length;

    return {
      queueLength: this.getQueueLength(service),
      recentRequests,
      canMakeRequest: this.canMakeRequest(service),
      delayUntilNextRequest: this.canMakeRequest(service) ? 0 : this.calculateDelay(service)
    };
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default RateLimiter;
