// debug-babel.ts
 import { DebugBabelAnalyzer } from '@/core/generators/corrections/analyzers/react-native/config/DebugBabelAnalyzer';
 
async function debugBabelConfigs() {
  console.log('🔧 DEBUG: Analyzing Babel Configuration Files\n');
  
  const analyzer = new DebugBabelAnalyzer();
  const issues = await analyzer.analyze();
  
  console.log('\n📋 SUMMARY:');
  console.log(`Total issues found: ${issues.length}`);
  issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.title}`);
    console.log(`   File: ${issue.file}`);
    console.log(`   Severity: ${issue.severity}`);
    console.log(`   Description: ${issue.message}`);
    console.log(`   Suggestion: ${issue.suggestion}`);
  });
}

debugBabelConfigs();