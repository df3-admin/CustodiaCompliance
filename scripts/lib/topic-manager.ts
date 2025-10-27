import fs from 'fs';
import path from 'path';

export interface Topic {
  id: string;
  topic: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchVolume: string;
  priority: number;
  category?: string;
  competitorUrls?: string[];
  [key: string]: any;
}

export interface TopicFilters {
  priority?: string | number[];
  category?: string | string[];
  maxCount?: number;
}

export class TopicManager {
  private defaultConfigPath: string;

  constructor(configPath: string = 'config/high-value-topics.json') {
    this.defaultConfigPath = configPath;
  }

  /**
   * Load topics from config file
   */
  loadFromConfig(filePath?: string): Topic[] {
    const configPath = filePath || this.defaultConfigPath;

    try {
      const content = fs.readFileSync(configPath, 'utf-8');
      const config = JSON.parse(content);
      const topics = config.highValueTopics || [];

      return this.addIds(topics);
    } catch (error) {
      throw new Error(`Failed to load topics from config: ${error}`);
    }
  }

  /**
   * Load topics from JSON file
   */
  loadFromFile(filePath: string): Topic[] {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      // Handle different formats
      const topics = data.highValueTopics || data.topics || (Array.isArray(data) ? data : []);
      
      return this.addIds(topics);
    } catch (error) {
      throw new Error(`Failed to load topics from file: ${error}`);
    }
  }

  /**
   * Load topics from CLI comma-separated list
   */
  loadFromCLI(topicList: string): Topic[] {
    const topics = topicList.split(',').map(t => t.trim()).filter(Boolean);
    
    return topics.map((topic, index) => ({
      id: `cli-${index}`,
      topic: topic,
      primaryKeyword: this.extractKeyword(topic),
      secondaryKeywords: [],
      searchVolume: 'N/A',
      priority: 999,
      category: 'Custom'
    }));
  }

  /**
   * Filter topics by various criteria
   */
  filterTopics(topics: Topic[], filters: TopicFilters): Topic[] {
    let filtered = [...topics];

    // Filter by priority
    if (filters.priority) {
      if (typeof filters.priority === 'string') {
        // Parse range like "1-5" or "1,2,3"
        const range = this.parsePriorityRange(filters.priority);
        filtered = filtered.filter(t => range.includes(t.priority));
      } else if (Array.isArray(filters.priority)) {
        filtered = filtered.filter(t => filters.priority!.includes(t.priority));
      }
    }

    // Filter by category
    if (filters.category) {
      const categories = Array.isArray(filters.category) 
        ? filters.category 
        : [filters.category];
      
      filtered = filtered.filter(t => 
        t.category && categories.some(c => 
          t.category!.toLowerCase().includes(c.toLowerCase())
        )
      );
    }

    // Sort by priority
    filtered.sort((a, b) => a.priority - b.priority);

    // Limit count
    if (filters.maxCount) {
      filtered = filtered.slice(0, filters.maxCount);
    }

    return filtered;
  }

  /**
   * Get topics by ID
   */
  getTopicsByIds(topics: Topic[], ids: string[]): Topic[] {
    return topics.filter(t => ids.includes(t.id));
  }

  /**
   * Get unique categories from topics
   */
  getCategories(topics: Topic[]): string[] {
    const categories = new Set<string>();
    
    topics.forEach(topic => {
      if (topic.category) {
        categories.add(topic.category);
      }
    });

    return Array.from(categories).sort();
  }

  /**
   * Get priority range from topics
   */
  getPriorityRange(topics: Topic[]): { min: number; max: number } {
    if (topics.length === 0) return { min: 0, max: 0 };

    const priorities = topics.map(t => t.priority);
    return {
      min: Math.min(...priorities),
      max: Math.max(...priorities)
    };
  }

  /**
   * Validate topics
   */
  validate(topics: Topic[]): { valid: Topic[]; invalid: Array<{ topic: Topic; errors: string[] }> } {
    const valid: Topic[] = [];
    const invalid: Array<{ topic: Topic; errors: string[] }> = [];

    topics.forEach(topic => {
      const errors: string[] = [];

      if (!topic.topic || typeof topic.topic !== 'string') {
        errors.push('Missing or invalid topic');
      }

      if (!topic.primaryKeyword || typeof topic.primaryKeyword !== 'string') {
        errors.push('Missing or invalid primaryKeyword');
      }

      if (!topic.priority || typeof topic.priority !== 'number') {
        errors.push('Missing or invalid priority');
      }

      if (errors.length > 0) {
        invalid.push({ topic, errors });
      } else {
        valid.push(topic);
      }
    });

    return { valid, invalid };
  }

  /**
   * Save topics to file
   */
  saveToFile(topics: Topic[], filePath: string): void {
    try {
      const content = JSON.stringify({ topics }, null, 2);
      fs.writeFileSync(filePath, content, 'utf-8');
    } catch (error) {
      throw new Error(`Failed to save topics: ${error}`);
    }
  }

  /**
   * Add unique IDs to topics if missing
   */
  private addIds(topics: any[]): Topic[] {
    return topics.map((topic, index) => ({
      id: topic.id || `topic-${index}`,
      ...topic
    }));
  }

  /**
   * Extract keyword from topic string
   */
  private extractKeyword(topic: string): string {
    // Simple keyword extraction - take first few words
    return topic.split(' ').slice(0, 5).join(' ');
  }

  /**
   * Parse priority range string like "1-5" or "1,2,3"
   */
  private parsePriorityRange(range: string): number[] {
    const priorities: number[] = [];

    if (range.includes('-')) {
      // Range like "1-5"
      const [start, end] = range.split('-').map(n => parseInt(n.trim()));
      if (!isNaN(start) && !isNaN(end)) {
        for (let i = start; i <= end; i++) {
          priorities.push(i);
        }
      }
    } else if (range.includes(',')) {
      // List like "1,2,3"
      priorities.push(...range.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n)));
    } else {
      // Single number
      const num = parseInt(range.trim());
      if (!isNaN(num)) {
        priorities.push(num);
      }
    }

    return priorities;
  }

  /**
   * Create sample topic template
   */
  static createSampleTopic(): Topic {
    return {
      id: 'sample',
      topic: 'Sample Article Topic',
      primaryKeyword: 'sample keyword',
      secondaryKeywords: ['secondary 1', 'secondary 2'],
      searchVolume: '1,000+',
      priority: 10,
      category: 'Compliance',
      competitorUrls: [],
      expectedTraffic: '100-500/month'
    };
  }
}

export default TopicManager;
