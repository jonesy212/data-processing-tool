// analyzer-demo.js
const { generateEnhancedTreeReport } = require('./generateTree');

// Example 1: Analyze for a task management feature
async function analyzeTaskManagement() {
  console.log('🔍 Analyzing for Task Management Features...\n');
  await generateEnhancedTreeReport(
    'I want to build a task management system with real-time collaboration and notifications'
  );
}

// Example 2: Analyze for crypto trading features
async function analyzeCryptoTrading() {
  console.log('🔍 Analyzing for Crypto Trading Features...\n');
  await generateEnhancedTreeReport(
    'Need to implement crypto portfolio management with real-time price tracking and trading'
  );
}

// Example 3: Analyze for content management
async function analyzeContentManagement() {
  console.log('🔍 Analyzing for Content Management Features...\n');
  await generateEnhancedTreeReport(
    'Building a content management system with document editing and version control'
  );
}

// Run specific analysis
// analyzeTaskManagement();
// analyzeCryptoTrading();
// analyzeContentManagement();