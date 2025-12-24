// convertAnalysisToDoc.js
import fs from 'fs';
import path from 'path';

/**
 * Convert analysis.json into a human-readable markdown document
 * @param {string} inputFile - path to analysis.json
 * @param {string} outputFile - path to output .md file
 */
export function convertAnalysisToDoc(inputFile = './analysis.json', outputFile = './analysis.md') {
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(inputFile, 'utf8');
  const analysis = JSON.parse(rawData);

  const lines = [];
  lines.push(`# Project Analysis Report`);
  lines.push(`📋 Source JSON: ${inputFile}`);
  lines.push(`🕒 Generated: ${new Date().toISOString()}\n`);

  if (analysis.userPrompt) lines.push(`**User Prompt:** ${analysis.userPrompt}\n`);
  if (analysis.totalFiles) lines.push(`**Total Files Analyzed:** ${analysis.totalFiles}\n`);

  // Convert interfaces
  if (analysis.interfaces && analysis.interfaces.length) {
    lines.push(`## Interfaces`);
    analysis.interfaces.forEach((iface, i) => {
      lines.push(`\n### ${i + 1}. ${iface.name}`);
      lines.push(`- Type: ${iface.type}`);
      if (iface.properties) {
        lines.push(`- Properties:`);
        iface.properties.forEach(p => lines.push(`  - ${p.name}${p.optional ? '?' : ''}: ${p.type}`));
      }
      if (iface.definition) lines.push(`- Definition: \`${iface.definition}\``);
      if (iface.file) lines.push(`- File: ${iface.file}`);
    });
  }

  // Convert components
  if (analysis.components && analysis.components.length) {
    lines.push(`\n## Components`);
    analysis.components.forEach((comp, i) => {
      lines.push(`\n### ${i + 1}. ${comp.name}`);
      if (comp.propsType) lines.push(`- Props Type: ${comp.propsType}`);
      if (comp.exports) lines.push(`- Exports: ${comp.exports.join(', ')}`);
      if (comp.file) lines.push(`- File: ${comp.file}`);
    });
  }

  // Convert APIs
  if (analysis.apis && analysis.apis.length) {
    lines.push(`\n## APIs / Services`);
    analysis.apis.forEach((api, i) => {
      lines.push(`\n### ${i + 1}. ${api.file}`);
      if (api.methods && api.methods.length) {
        lines.push(`- Methods:`);
        api.methods.forEach(m => {
          lines.push(`  - ${m.name}(${m.params}): ${m.returnType}`);
        });
      }
      if (api.exports) lines.push(`- Exports: ${api.exports.join(', ')}`);
    });
  }

  // Optional: Add other top-level properties if needed
  if (analysis.potentialIntegrations && analysis.potentialIntegrations.length) {
    lines.push(`\n## Potential Integrations`);
    analysis.potentialIntegrations.forEach(pi => lines.push(`- ${pi}`));
  }

  fs.writeFileSync(outputFile, lines.join('\n'), 'utf8');
  console.log(`✅ Converted analysis.md saved at: ${outputFile}`);
}

// CLI support
if (process.argv[1].endsWith('convertAnalysisToDoc.js')) {
  const inputFileIndex = process.argv.indexOf('--input');
  const outputFileIndex = process.argv.indexOf('--output');

  const inputFile = inputFileIndex !== -1 ? process.argv[inputFileIndex + 1] : './analysis.json';
  const outputFile = outputFileIndex !== -1 ? process.argv[outputFileIndex + 1] : './analysis.md';

  convertAnalysisToDoc(inputFile, outputFile);
}
