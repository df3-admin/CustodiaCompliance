import { useState } from 'react';
import { Button } from '../ui/button';

export interface ContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'callout' | 'cta' | 'quote' | 'table' | 'stats' | 'chart' | 'steps' | 'toolRecommendation';
  content?: string;
  level?: number;
  items?: string[];
  variant?: 'info' | 'warning' | 'success' | 'error' | 'tip' | 'pro-tip' | 'note';
  ctaType?: 'package-builder' | 'consultation' | 'contact' | 'trial';
  title?: string;
  intro?: string;
  author?: string;
  // Table-specific fields
  columns?: string[];
  rows?: string[][];
  // Stats-specific fields
  stats?: Array<{
    label: string;
    value: string;
    description?: string;
  }>;
}

interface ContentBlockEditorProps {
  blocks: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

const ContentBlockEditor = ({ blocks, onChange }: ContentBlockEditorProps) => {
  const [newBlockType, setNewBlockType] = useState<ContentBlock['type']>('paragraph');

  const addBlock = () => {
    const newBlock: ContentBlock = {
      type: newBlockType,
      content: '',
    };
    onChange([...blocks, newBlock]);
  };

  const updateBlock = (index: number, updatedBlock: ContentBlock) => {
    const newBlocks = [...blocks];
    newBlocks[index] = updatedBlock;
    onChange(newBlocks);
  };

  const removeBlock = (index: number) => {
    onChange(blocks.filter((_, i) => i !== index));
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newBlocks = [...blocks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    onChange(newBlocks);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 mb-4">
        <select
          value={newBlockType}
          onChange={(e) => setNewBlockType(e.target.value as ContentBlock['type'])}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="paragraph">Paragraph</option>
          <option value="heading">Heading</option>
          <option value="list">List</option>
          <option value="callout">Callout</option>
          <option value="cta">CTA</option>
          <option value="quote">Quote</option>
          <option value="table">Table</option>
          <option value="stats">Stats</option>
          <option value="chart">Chart</option>
          <option value="steps">Steps</option>
          <option value="toolRecommendation">Tool Recommendation</option>
        </select>
        <Button onClick={addBlock}>Add Block</Button>
      </div>

      {blocks.map((block, index) => (
        <div key={index} className="border border-gray-300 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 capitalize">{block.type}</span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveBlock(index, 'up')}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => moveBlock(index, 'down')}
                disabled={index === blocks.length - 1}
              >
                ↓
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeBlock(index)}
              >
                Remove
              </Button>
            </div>
          </div>

          {block.type === 'paragraph' && (
            <textarea
              value={block.content || ''}
              onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={4}
              placeholder="Enter paragraph content..."
            />
          )}

          {block.type === 'heading' && (
            <>
              <select
                value={block.level || 1}
                onChange={(e) => updateBlock(index, { ...block, level: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
              <input
                type="text"
                value={block.content || ''}
                onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter heading text..."
              />
            </>
          )}

          {block.type === 'list' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">List Items (one per line)</label>
              <textarea
                value={(block.items || []).join('\n')}
                onChange={(e) => updateBlock(index, { ...block, items: e.target.value.split('\n').filter(Boolean) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Enter list items..."
              />
            </div>
          )}

          {block.type === 'callout' && (
            <>
              <select
                value={block.variant || 'info'}
                onChange={(e) => updateBlock(index, { ...block, variant: e.target.value as ContentBlock['variant'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              >
                <option value="info">Info</option>
                <option value="success">Success</option>
                <option value="warning">Warning</option>
                <option value="error">Error</option>
                <option value="tip">Tip</option>
                <option value="pro-tip">Pro Tip</option>
                <option value="note">Note</option>
              </select>
              <textarea
                value={block.content || ''}
                onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="Enter callout content..."
              />
            </>
          )}

          {block.type === 'cta' && (
            <div className="space-y-2">
              <input
                type="text"
                value={block.title || ''}
                onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="CTA Title"
              />
              <input
                type="text"
                value={block.content || ''}
                onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="CTA Text"
              />
              <select
                value={block.ctaType || 'consultation'}
                onChange={(e) => updateBlock(index, { ...block, ctaType: e.target.value as ContentBlock['ctaType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="consultation">Consultation</option>
                <option value="contact">Contact</option>
                <option value="package-builder">Package Builder</option>
                <option value="trial">Trial</option>
              </select>
            </div>
          )}

          {block.type === 'quote' && (
            <>
              <textarea
                value={block.content || ''}
                onChange={(e) => updateBlock(index, { ...block, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={2}
                placeholder="Enter quote..."
              />
              <input
                type="text"
                value={block.author || ''}
                onChange={(e) => updateBlock(index, { ...block, author: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Author (optional)"
              />
            </>
          )}

          {block.type === 'table' && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Table Title</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Table title (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Columns (comma-separated)</label>
                <input
                  type="text"
                  value={(block.columns || []).join(', ')}
                  onChange={(e) => updateBlock(index, { ...block, columns: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Column 1, Column 2, Column 3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rows (one row per line, comma-separated values)</label>
                <textarea
                  value={(block.rows || []).map(row => row.join(', ')).join('\n')}
                  onChange={(e) => updateBlock(index, { 
                    ...block, 
                    rows: e.target.value.split('\n').map(line => 
                      line.split(',').map(s => s.trim()).filter(Boolean)
                    ).filter(row => row.length > 0)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Row 1 Col 1, Row 1 Col 2, Row 1 Col 3&#10;Row 2 Col 1, Row 2 Col 2, Row 2 Col 3"
                />
              </div>
            </div>
          )}

          {block.type === 'stats' && (
            <div className="space-y-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Stats Title</label>
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={(e) => updateBlock(index, { ...block, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Stats section title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statistics (one per line, format: Label|Value|Description)</label>
                <textarea
                  value={(block.stats || []).map(stat => `${stat.label}|${stat.value}${stat.description ? '|' + stat.description : ''}`).join('\n')}
                  onChange={(e) => updateBlock(index, { 
                    ...block, 
                    stats: e.target.value.split('\n').map(line => {
                      const parts = line.split('|');
                      return {
                        label: parts[0] || '',
                        value: parts[1] || '',
                        description: parts[2] || ''
                      };
                    }).filter(stat => stat.label && stat.value)
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                  placeholder="Companies with SOC 2|85%|of SaaS companies&#10;Average Cost|$15,000|for Type II audit&#10;Timeline|6-12 months|for full compliance"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {blocks.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No content blocks yet. Add one to get started.
        </div>
      )}
    </div>
  );
};

export default ContentBlockEditor;
