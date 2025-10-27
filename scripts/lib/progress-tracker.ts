import fs from 'fs';
import path from 'path';

export interface ArticleProgress {
  id: string;
  topic: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  startedAt?: number;
  completedAt?: number;
  error?: string;
  articleId?: number;
}

export interface BatchProgress {
  batchId: string;
  startedAt: number;
  updatedAt: number;
  totalArticles: number;
  articles: ArticleProgress[];
  config: {
    source: string;
    filters?: any;
  };
}

export class ProgressTracker {
  private progressDir: string;

  constructor(progressDir: string = 'scripts/.progress') {
    this.progressDir = progressDir;

    // Ensure progress directory exists
    if (!fs.existsSync(this.progressDir)) {
      fs.mkdirSync(this.progressDir, { recursive: true });
    }
  }

  /**
   * Generate batch ID from timestamp
   */
  generateBatchId(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `batch-${year}${month}${day}-${hours}${minutes}${seconds}`;
  }

  /**
   * Get progress file path
   */
  private getProgressPath(batchId: string): string {
    return path.join(this.progressDir, `${batchId}.json`);
  }

  /**
   * Create new batch progress
   */
  createBatch(topics: Array<{ id: string; topic: string }>, config: any): string {
    const batchId = this.generateBatchId();
    
    const progress: BatchProgress = {
      batchId,
      startedAt: Date.now(),
      updatedAt: Date.now(),
      totalArticles: topics.length,
      articles: topics.map(t => ({
        id: t.id,
        topic: t.topic,
        status: 'pending' as const
      })),
      config
    };

    this.save(batchId, progress);
    
    return batchId;
  }

  /**
   * Load batch progress
   */
  load(batchId: string): BatchProgress | null {
    try {
      const filePath = this.getProgressPath(batchId);
      
      if (!fs.existsSync(filePath)) {
        return null;
      }

      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      console.warn('Failed to load progress:', error);
      return null;
    }
  }

  /**
   * Save batch progress
   */
  save(batchId: string, progress: BatchProgress): void {
    try {
      progress.updatedAt = Date.now();
      const filePath = this.getProgressPath(batchId);
      fs.writeFileSync(filePath, JSON.stringify(progress, null, 2));
    } catch (error) {
      console.warn('Failed to save progress:', error);
    }
  }

  /**
   * Update article status
   */
  updateArticle(
    batchId: string,
    articleId: string,
    status: ArticleProgress['status'],
    error?: string,
    articleIdDb?: number
  ): void {
    const progress = this.load(batchId);
    if (!progress) return;

    const article = progress.articles.find(a => a.id === articleId);
    if (!article) return;

    article.status = status;

    if (status === 'processing') {
      article.startedAt = Date.now();
    }

    if (status === 'completed' || status === 'failed') {
      article.completedAt = Date.now();
    }

    if (error) {
      article.error = error;
    }

    if (articleIdDb) {
      article.articleId = articleIdDb;
    }

    this.save(batchId, progress);
  }

  /**
   * Get completion stats
   */
  getStats(batchId: string): {
    total: number;
    completed: number;
    failed: number;
    pending: number;
    processing: number;
    completionPercentage: number;
  } | null {
    const progress = this.load(batchId);
    if (!progress) return null;

    const completed = progress.articles.filter(a => a.status === 'completed').length;
    const failed = progress.articles.filter(a => a.status === 'failed').length;
    const pending = progress.articles.filter(a => a.status === 'pending').length;
    const processing = progress.articles.filter(a => a.status === 'processing').length;

    return {
      total: progress.totalArticles,
      completed,
      failed,
      pending,
      processing,
      completionPercentage: Math.round((completed / progress.totalArticles) * 100)
    };
  }

  /**
   * Get pending articles for retry
   */
  getPendingArticles(batchId: string): ArticleProgress[] {
    const progress = this.load(batchId);
    if (!progress) return [];

    return progress.articles.filter(a => 
      a.status === 'pending' || a.status === 'failed'
    );
  }

  /**
   * Get all batches
   */
  getAllBatches(): BatchProgress[] {
    try {
      const files = fs.readdirSync(this.progressDir);
      const batches: BatchProgress[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const batchId = file.replace('.json', '');
          const batch = this.load(batchId);
          if (batch) {
            batches.push(batch);
          }
        }
      }

      return batches.sort((a, b) => b.startedAt - a.startedAt);
    } catch (error) {
      console.warn('Failed to get batches:', error);
      return [];
    }
  }

  /**
   * Delete batch progress
   */
  delete(batchId: string): void {
    try {
      const filePath = this.getProgressPath(batchId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.warn('Failed to delete progress:', error);
    }
  }

  /**
   * Clean up old batches
   */
  cleanup(olderThanDays: number = 7): number {
    let cleaned = 0;
    const cutoff = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000);

    try {
      const files = fs.readdirSync(this.progressDir);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const filePath = path.join(this.progressDir, file);
          const stats = fs.statSync(filePath);

          if (stats.mtimeMs < cutoff) {
            fs.unlinkSync(filePath);
            cleaned++;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup progress:', error);
    }

    return cleaned;
  }

  /**
   * Check if batch exists
   */
  exists(batchId: string): boolean {
    const filePath = this.getProgressPath(batchId);
    return fs.existsSync(filePath);
  }

  /**
   * Get batch summary
   */
  getSummary(batchId: string): any {
    const progress = this.load(batchId);
    if (!progress) return null;

    const stats = this.getStats(batchId);
    if (!stats) return null;

    return {
      batchId: progress.batchId,
      startedAt: new Date(progress.startedAt).toISOString(),
      updatedAt: new Date(progress.updatedAt).toISOString(),
      config: progress.config,
      stats
    };
  }
}

export default ProgressTracker;
