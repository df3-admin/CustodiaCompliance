#!/usr/bin/env node

import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Enhanced Article Generator - Quick Start');
console.log('==========================================');

try {
  console.log('\n📊 Running Enhanced 20-Article Generator...');
  console.log('🎯 Target: 10K/month traffic in 12 months');
  console.log('⏱️ Estimated time: 120-180 minutes\n');

  // Run the enhanced generator
  execSync('tsx generate-enhanced-20-articles.ts', {
    cwd: path.join(__dirname),
    stdio: 'inherit'
  });

  console.log('\n🎉 Enhanced Article Generation Complete!');
  console.log('📈 Check your blog at: https://custodiacompliance.com/blog');
  console.log('📊 Monitor performance with the tracking system');
  console.log('🎯 Next: Follow the 10K Traffic Strategy for continued growth');

} catch (error) {
  console.error('❌ Error running enhanced generator:', error.message);
  process.exit(1);
}
