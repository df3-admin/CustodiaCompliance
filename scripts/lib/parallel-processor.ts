export interface ParallelTask<T> {
  id: string;
  fn: () => Promise<T>;
  priority?: number;
}

export interface ParallelResult<T> {
  id: string;
  success: boolean;
  data?: T;
  error?: any;
}

export class ParallelProcessor {
  private maxConcurrency: number;
  private running: number;
  private queue: ParallelTask<any>[];
  private processing: boolean;

  constructor(maxConcurrency: number = 3) {
    this.maxConcurrency = maxConcurrency;
    this.running = 0;
    this.queue = [];
    this.processing = false;
  }

  /**
   * Execute tasks in parallel with controlled concurrency
   */
  async executeParallel<T>(
    tasks: ParallelTask<T>[],
    continueOnError: boolean = false
  ): Promise<ParallelResult<T>[]> {
    const results: ParallelResult<T>[] = [];
    this.queue = [...tasks];

    // Sort by priority if provided
    this.queue.sort((a, b) => (b.priority || 0) - (a.priority || 0));

    const promises: Promise<void>[] = [];

    for (let i = 0; i < Math.min(this.maxConcurrency, this.queue.length); i++) {
      promises.push(this.processQueue(results, continueOnError));
    }

    await Promise.all(promises);

    return results;
  }

  /**
   * Process queue items
   */
  private async processQueue<T>(
    results: ParallelResult<T>[],
    continueOnError: boolean
  ): Promise<void> {
    while (this.queue.length > 0) {
      const task = this.queue.shift();
      if (!task) break;

      this.running++;

      try {
        const data = await task.fn();
        results.push({
          id: task.id,
          success: true,
          data
        });
      } catch (error) {
        results.push({
          id: task.id,
          success: false,
          error
        });

        if (!continueOnError) {
          throw error;
        }
      } finally {
        this.running--;
      }
    }
  }

  /**
   * Execute critical tasks in parallel (all must succeed)
   */
  async executeAll<T>(tasks: ParallelTask<T>[]): Promise<ParallelResult<T>[]> {
    const promises = tasks.map(task =>
      task.fn()
        .then(data => ({ id: task.id, success: true, data } as ParallelResult<T>))
        .catch(error => ({ id: task.id, success: false, error } as ParallelResult<T>))
    );

    const results = await Promise.all(promises);
    return results;
  }

  /**
   * Execute optional tasks in parallel (continue on any failure)
   */
  async executeAllSettled<T>(tasks: ParallelTask<T>[]): Promise<ParallelResult<T>[]> {
    const promises = tasks.map(task =>
      task.fn()
        .then(data => ({ id: task.id, success: true, data } as ParallelResult<T>))
        .catch(error => ({ id: task.id, success: false, error } as ParallelResult<T>))
    );

    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          id: tasks[index].id,
          success: false,
          error: result.reason
        };
      }
    });
  }

  /**
   * Execute tasks with a batching strategy
   */
  async executeInBatches<T>(
    tasks: ParallelTask<T>[],
    batchSize: number = 5,
    continueOnError: boolean = true
  ): Promise<ParallelResult<T>[]> {
    const allResults: ParallelResult<T>[] = [];

    for (let i = 0; i < tasks.length; i += batchSize) {
      const batch = tasks.slice(i, i + batchSize);
      const batchResults = await this.executeParallel(batch, continueOnError);
      allResults.push(...batchResults);

      // Small delay between batches
      if (i + batchSize < tasks.length) {
        await this.sleep(500);
      }
    }

    return allResults;
  }

  /**
   * Execute tasks with timeout
   */
  async executeWithTimeout<T>(
    tasks: ParallelTask<T>[],
    timeoutMs: number,
    continueOnError: boolean = true
  ): Promise<ParallelResult<T>[]> {
    const timeoutPromise = new Promise<void>((_, reject) =>
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    );

    const tasksPromise = this.executeParallel(tasks, continueOnError);

    try {
      const results = await Promise.race([tasksPromise, timeoutPromise]) as ParallelResult<T>[];
      return results;
    } catch (error) {
      if (continueOnError) {
        // Return partial results
        const tasksPromise = this.executeParallel(tasks, true);
        return tasksPromise;
      }
      throw error;
    }
  }

  /**
   * Filter successful results
   */
  getSuccessful<T>(results: ParallelResult<T>[]): T[] {
    return results
      .filter(r => r.success && r.data !== undefined)
      .map(r => r.data!);
  }

  /**
   * Get failed results
   */
  getFailed<T>(results: ParallelResult<T>[]): ParallelResult<T>[] {
    return results.filter(r => !r.success);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get current statistics
   */
  getStats(): {
    queueLength: number;
    running: number;
    maxConcurrency: number;
  } {
    return {
      queueLength: this.queue.length,
      running: this.running,
      maxConcurrency: this.maxConcurrency
    };
  }
}

export default ParallelProcessor;
