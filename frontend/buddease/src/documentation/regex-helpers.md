<!-- regex-helpers.md -->
# RegexHelpers Documentation
## A comprehensive utility for detecting and analyzing code patterns using regular expressions.

Installation
```typescript
import RegexHelpers from '@/app/generators/corrections/analyzers/utils/RegexHelpers'
```

**Available Patterns**

# The helper detects the following code patterns:

## Performance Issues

- - inlineStylesheetCreate - Inline StyleSheet.create calls (should be moved to styles file)

- inlineStyleObject - Inline style objects in JSX (causes re-renders)

- zeroTimeout - setTimeout with zero delay (can cause performance issues)

- scrollViewDirectView - ScrollView with direct View child (should use FlatList for performance)

- inlineArrowFunction - Inline arrow functions in props (causes unnecessary re-renders)

- listMapWithoutKey - Array.map without key prop (React performance warning)

- memoryExhaustion - JavaScript heap memory exhaustion

- Maintainability Issues

- consoleStatement - Console statements (should be removed in production)

- deepRelativeImport - Deep relative imports (hard to maintain)

- renderMethodComplex - Complex nested render method (hard to maintain)

# Security Issues

- unsafeJsonParse - Unsafe JSON.parse without error handling

- Runtime Issues

- unsafeOptionalChaining - Potentially unsafe optional chaining usage

# Compilation Issues

- versionConflict - Version conflict detected in build logs

Basic Usage
Testing for Patterns
``` typescript
const content = `console.log("test");
StyleSheet.create({ container: { flex: 1 } });`;

// Test for specific patterns
if (RegexHelpers.test('consoleStatement', content)) {
  console.log('Found console statements');
}

// Test for multiple patterns
if (RegexHelpers.testAny(['consoleStatement', 'inlineStylesheetCreate'], content)) {
  console.log('Found console or stylesheet issues');
}
```
Counting Occurrences

```typescript
// Count specific pattern occurrences
const consoleCount = RegexHelpers.count('consoleStatement', content);
console.log(`Found ${consoleCount} console statements`);

// Get all matching patterns
const matchingPatterns = RegexHelpers.getMatchingPatterns(content);
console.log('Matching patterns:', matchingPatterns);
Getting Matches
typescript
// Get all matches for a pattern
const matches = RegexHelpers.match('inlineStylesheetCreate', content);
matches.forEach(match => {
  console.log('Found match:', match[0]);
});

// Extract capture groups
const groups = RegexHelpers.extractGroups('versionConflict', content);
groups.forEach(groupSet => {
  console.log('Found version:', groupSet[0], 'required:', groupSet[1]);
});
Advanced Analysis
Complete Content Analysis
typescript
// Analyze entire content for all patterns
const analysis = RegexHelpers.analyzeContent(content);

analysis.forEach(item => {
  console.log(`${item.pattern}: ${item.count} occurrences`);
  console.log(`  Description: ${item.description}`);
  console.log(`  Category: ${item.category}`);
  console.log(`  Lines: ${item.lines.join(', ')}`);
});
Issue Summary
typescript
// Get comprehensive issue summary
const summary = RegexHelpers.getIssueSummary(content);

console.log(`Total issues: ${summary.totalIssues}`);
console.log('By category:', summary.byCategory);
console.log('Critical issues:', summary.criticalIssues);

// Check if content has any issues
if (RegexHelpers.hasIssues(content)) {
  console.log('Content contains problematic patterns');
}
Line Number Detection
typescript
// Find exact line numbers where patterns occur
const lineInfo = RegexHelpers.findLineNumbers('consoleStatement', content);

lineInfo.forEach(({ line, match }) => {
  console.log(`Line ${line}: ${match}`);
});
Pattern Information
Getting Pattern Details
typescript
// Get information about a specific pattern
const patternInfo = RegexHelpers.getPatternInfo('consoleStatement');

console.log('Pattern:', patternInfo.pattern);
console.log('Description:', patternInfo.description);
console.log('Category:', patternInfo.category);
Available Patterns
typescript
// List all available patterns
const availablePatterns = RegexHelpers.getAvailablePatterns();
console.log('Available patterns:', availablePatterns);
Content Replacement
typescript
// Replace problematic patterns
const cleanedContent = RegexHelpers.replace(
  'consoleStatement',
  content,
  '// console.log removed'
);

// Use function replacement for dynamic changes
const improvedContent = RegexHelpers.replace(
  'inlineArrowFunction',
  content,
  (match) => `onPress={this.handlePress}` // Example replacement
);
Real-world Example
typescript
import RegexHelpers from '@/app/generators/corrections/analyzers/utils/RegexHelpers'

function analyzeCodeFile(fileContent: string) {
  const analysis = RegexHelpers.analyzeContent(fileContent);
  const summary = RegexHelpers.getIssueSummary(fileContent);
  
  console.log('=== CODE ANALYSIS REPORT ===');
  console.log(`Total Issues Found: ${summary.totalIssues}`);
  
  // Report by category
  Object.entries(summary.byCategory).forEach(([category, count]) => {
    console.log(`- ${category}: ${count} issues`);
  });
  
  // Detailed findings
  analysis.forEach(({ pattern, count, lines, description }) => {
    if (count > 0) {
      console.log(`\n🔍 ${pattern.toUpperCase()}`);
      console.log(`   ${description}`);
      console.log(`   Occurrences: ${count}`);
      console.log(`   Lines: ${lines.join(', ')}`);
    }
  });
  
  // Critical issues
  if (summary.criticalIssues.length > 0) {
    console.log('\n🚨 CRITICAL ISSUES:');
    summary.criticalIssues.forEach(issue => {
      console.log(`   - ${issue}`);
    });
  }
  
  return {
    hasIssues: summary.totalIssues > 0,
    analysis,
    summary
  };
}
```

// Usage
```ts
const fileContent = `
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MyComponent = () => {
  console.log('Rendering component');
  
  return (
    <View style={StyleSheet.create({ container: { flex: 1 } })}>
      <Text>Hello World</Text>
    </View>
  );
};

export default MyComponent;
```;


const results = analyzeCodeFile(fileContent);
```

# Functional API
For those who prefer functional style:

``` typescript
import { 
  testPattern, 
  matchPattern, 
  countPattern, 
  analyzeContent, 
  hasIssues 
} from '@/app/generators/corrections/analyzers/utils/RegexHelpers'

// Functional usage
if (testPattern('consoleStatement', content)) {
  console.log('Found console statements');
}

const issueCount = countPattern('inlineStylesheetCreate', content);
const contentAnalysis = analyzeContent(content);
```

# Best Practices

- Use analyzeContent() for comprehensive code reviews

- Use getIssueSummary() for quick health checks

- Use findLineNumbers() when you need to report specific locations

- Use the category information to prioritize fixes

- Consider security and performance issues as high priority

This utility helps maintain code quality by automatically detecting common anti-patterns and issues in your codebase.