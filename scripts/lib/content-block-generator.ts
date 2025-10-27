import { ArticleContent } from '../../src/types/article';

export class ContentBlockGenerator {
  
  static parseGeminiOutput(content: string): ArticleContent[] {
    try {
      // Try to parse as JSON first
      if (content.trim().startsWith('[')) {
        return JSON.parse(content);
      }
      
      // Parse as markdown-like content
      return this.parseMarkdownContent(content);
    } catch (error) {
      console.error('Error parsing Gemini output:', error);
      return this.parseBasicContent(content);
    }
  }

  private static parseMarkdownContent(content: string): ArticleContent[] {
    const blocks: ArticleContent[] = [];
    const lines = content.split('\n');
    
    let i = 0;
    while (i < lines.length) {
      const line = lines[i].trim();
      
      if (line.startsWith('#')) {
        // Heading
        const level = line.match(/^#+/)?.[0].length || 2;
        const text = line.replace(/^#+\s*/, '');
        blocks.push({
          type: 'heading',
          level: Math.min(level, 4),
          content: text
        });
      } else if (line.startsWith('-') || line.startsWith('*')) {
        // List
        const items: string[] = [];
        while (i < lines.length && (lines[i].startsWith('-') || lines[i].startsWith('*'))) {
          items.push(lines[i].replace(/^[-*]\s*/, ''));
          i++;
        }
        i--; // Adjust for the loop increment
        blocks.push({
          type: 'list',
          items: items
        });
      } else if (line.startsWith('>')) {
        // Quote or callout
        const text = line.replace(/^>\s*/, '');
        const variant = this.detectCalloutVariant(text);
        blocks.push({
          type: 'callout',
          variant: variant,
          content: text
        });
      } else if (line.startsWith('|')) {
        // Table
        const tableData = this.parseTable(lines, i);
        blocks.push({
          type: 'table',
          title: tableData.title,
          columns: tableData.columns,
          rows: tableData.rows
        });
        i = tableData.endIndex;
      } else if (line.length > 0) {
        // Paragraph
        blocks.push({
          type: 'paragraph',
          content: line
        });
      }
      
      i++;
    }
    
    return blocks;
  }

  private static parseBasicContent(content: string): ArticleContent[] {
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    
    return paragraphs.map(paragraph => {
      const trimmed = paragraph.trim();
      
      if (trimmed.startsWith('#')) {
        const level = trimmed.match(/^#+/)?.[0].length || 2;
        const text = trimmed.replace(/^#+\s*/, '');
        return {
          type: 'heading',
          level: Math.min(level, 4),
          content: text
        };
      } else {
        return {
          type: 'paragraph',
          content: trimmed
        };
      }
    });
  }

  private static detectCalloutVariant(text: string): 'info' | 'warning' | 'success' | 'error' | 'tip' | 'pro-tip' | 'note' {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('warning') || lowerText.includes('caution')) {
      return 'warning';
    } else if (lowerText.includes('success') || lowerText.includes('achieved')) {
      return 'success';
    } else if (lowerText.includes('error') || lowerText.includes('failed')) {
      return 'error';
    } else if (lowerText.includes('pro tip') || lowerText.includes('expert tip')) {
      return 'pro-tip';
    } else if (lowerText.includes('tip') || lowerText.includes('hint')) {
      return 'tip';
    } else if (lowerText.includes('note') || lowerText.includes('important')) {
      return 'note';
    } else {
      return 'info';
    }
  }

  private static parseTable(lines: string[], startIndex: number): {
    title?: string;
    columns: string[];
    rows: string[][];
    endIndex: number;
  } {
    const columns: string[] = [];
    const rows: string[][] = [];
    let title: string | undefined;
    
    // Check if there's a title above the table
    if (startIndex > 0 && !lines[startIndex - 1].startsWith('|')) {
      title = lines[startIndex - 1].trim();
    }
    
    // Parse header row
    const headerLine = lines[startIndex];
    const headerCells = headerLine.split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
    columns.push(...headerCells);
    
    // Skip separator row
    let i = startIndex + 2;
    
    // Parse data rows
    while (i < lines.length && lines[i].startsWith('|')) {
      const cells = lines[i].split('|').map(cell => cell.trim()).filter(cell => cell.length > 0);
      if (cells.length > 0) {
        rows.push(cells);
      }
      i++;
    }
    
    return {
      title,
      columns,
      rows,
      endIndex: i - 1
    };
  }

  static extractCitations(content: ArticleContent[]): Array<{
    text: string;
    url: string;
    source: string;
  }> {
    const citations: Array<{ text: string; url: string; source: string }> = [];
    
    content.forEach(block => {
      if (block.content) {
        const linkMatches = block.content.match(/\[([^\]]+)\]\(([^)]+)\)/g);
        if (linkMatches) {
          linkMatches.forEach(match => {
            const textMatch = match.match(/\[([^\]]+)\]/);
            const urlMatch = match.match(/\(([^)]+)\)/);
            
            if (textMatch && urlMatch) {
              citations.push({
                text: textMatch[1],
                url: urlMatch[1],
                source: this.extractSourceFromUrl(urlMatch[1])
              });
            }
          });
        }
      }
    });
    
    return citations;
  }

  private static extractSourceFromUrl(url: string): string {
    try {
      const domain = new URL(url).hostname;
      return domain.replace('www.', '');
    } catch {
      return 'Unknown';
    }
  }

  static extractStatistics(content: ArticleContent[]): Array<{
    value: string;
    context: string;
    source?: string;
  }> {
    const statistics: Array<{ value: string; context: string; source?: string }> = [];
    
    content.forEach(block => {
      if (block.content) {
        // Look for percentage patterns
        const percentageMatches = block.content.match(/(\d+(?:\.\d+)?%)/g);
        if (percentageMatches) {
          percentageMatches.forEach(match => {
            statistics.push({
              value: match,
              context: block.content.substring(0, 100) + '...',
              source: this.extractSourceFromContent(block.content)
            });
          });
        }
        
        // Look for number patterns
        const numberMatches = block.content.match(/(\$?\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|thousand|k|M|B))?)/g);
        if (numberMatches) {
          numberMatches.forEach(match => {
            statistics.push({
              value: match,
              context: block.content.substring(0, 100) + '...',
              source: this.extractSourceFromContent(block.content)
            });
          });
        }
      }
    });
    
    return statistics;
  }

  private static extractSourceFromContent(content: string): string | undefined {
    const sourceMatch = content.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (sourceMatch) {
      return sourceMatch[1];
    }
    return undefined;
  }

  static addStrategicCTAs(content: ArticleContent[]): ArticleContent[] {
    const enhancedContent: ArticleContent[] = [];
    
    content.forEach((block, index) => {
      enhancedContent.push(block);
      
      // Add CTA after key sections
      if (block.type === 'heading' && block.level === 2) {
        const headingText = block.content.toLowerCase();
        
        if (headingText.includes('implementation') || 
            headingText.includes('checklist') || 
            headingText.includes('cost') ||
            headingText.includes('timeline')) {
          
          enhancedContent.push({
            type: 'cta',
            title: 'Need Help with Implementation?',
            content: 'Custodia provides fixed-price compliance services to help you achieve certification faster and more cost-effectively.',
            buttonText: 'Get Free Consultation',
            buttonUrl: '/contact'
          });
        }
      }
    });
    
    return enhancedContent;
  }

  static optimizeForSEO(content: ArticleContent[], focusKeyword: string): ArticleContent[] {
    return content.map(block => {
      if (block.type === 'paragraph' && block.content) {
        // Add focus keyword naturally to some paragraphs
        if (Math.random() < 0.3 && !block.content.toLowerCase().includes(focusKeyword.toLowerCase())) {
          const sentences = block.content.split('. ');
          if (sentences.length > 1) {
            const randomIndex = Math.floor(Math.random() * sentences.length);
            sentences[randomIndex] += ` ${focusKeyword} is essential for`;
            block.content = sentences.join('. ');
          }
        }
      }
      
      return block;
    });
  }

  static validateContentBlocks(content: ArticleContent[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    content.forEach((block, index) => {
      // Validate required fields
      if (!block.type) {
        errors.push(`Block ${index}: Missing type`);
      }
      
      if (block.type === 'heading' && !block.content) {
        errors.push(`Block ${index}: Heading missing content`);
      }
      
      if (block.type === 'paragraph' && !block.content) {
        errors.push(`Block ${index}: Paragraph missing content`);
      }
      
      if (block.type === 'list' && (!block.items || block.items.length === 0)) {
        errors.push(`Block ${index}: List missing items`);
      }
      
      if (block.type === 'table' && (!block.columns || block.columns.length === 0)) {
        errors.push(`Block ${index}: Table missing columns`);
      }
      
      // Check for empty content
      if (block.content && block.content.trim().length === 0) {
        warnings.push(`Block ${index}: Empty content`);
      }
      
      // Check for very long paragraphs
      if (block.type === 'paragraph' && block.content && block.content.length > 500) {
        warnings.push(`Block ${index}: Very long paragraph (${block.content.length} chars)`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default ContentBlockGenerator;
