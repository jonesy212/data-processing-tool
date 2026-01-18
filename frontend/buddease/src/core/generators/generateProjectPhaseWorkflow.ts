#!/usr/bin/env tsx
// generateProjectPhaseWorkflow.ts
// Generates project phase workflow diagrams

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateProjectPhaseWorkflow(): string {
  return `flowchart TD
    A[📋 Phase 0: Discovery<br>TypeScript Error Detected] --> B[📊 Run Initial Analysis<br>pnpm check:types:count]
    B --> C{🔍 Assessment: Error Volume}
    
    C -->|"✅ Phase 1: Quick Fix<br>1-5 errors"| D[🔄 Rapid Resolution<br>pnpm fix:types:quick]
    C -->|"🔧 Phase 2: Standard Project<br>6-20 errors"| E[📋 Planned Execution<br>pnpm fix:types]
    C -->|"🚀 Phase 3: Major Initiative<br>20+ errors"| F[📈 Comprehensive Program<br>pnpm fix:types:dry → review → pnpm fix:types]
    
    D --> G[✅ Quality Assurance]
    E --> G
    F --> G
    
    G -->|"📝 Deliverable Review"| H[✅ Verify: pnpm check:types:count]
    
    H -->|"🎯 Phase 4: Specialized Tasks<br>Remaining issues"| I[🎯 Targeted Resolution]
    I --> J{🔍 Issue Categorization}
    
    J -->|"📦 Namespace Imports"| K[🔧 pnpm fix:types:namespace]
    J -->|"🔄 Mixed Types/Values"| L[🔧 pnpm fix:types:mixed]
    J -->|"🎨 Complex Patterns"| M[🎯 Manual Code Review]
    
    H -->|"🚀 Phase 5: Deployment<br>0 errors"| N[🎉 Project Complete!<br>Commit & Deploy]
    
    style A fill:#e3f2fd
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#ffebee
    style G fill:#f3e5f5
    style H fill:#e8f5e8
    style N fill:#c8e6c9`;
}

export function generateProjectPhaseHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Project Phase Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e3f2fd;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
        .subtitle {
            color: #666;
            font-size: 1.2rem;
            margin-top: 10px;
        }
        .workflow-container {
            margin: 20px 0;
            min-height: 600px;
        }
        .legend {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            margin-top: 30px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 8px;
        }
        .legend-item {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .legend-color {
            width: 20px;
            height: 20px;
            border-radius: 4px;
        }
        .commands {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .command {
            background: white;
            padding: 10px 15px;
            margin: 5px 0;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            border-left: 4px solid #4CAF50;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Project Phase Workflow</h1>
            <p class="subtitle">Structured approach to managing type import issues</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="legend">
            <div class="legend-item">
                <div class="legend-color" style="background: #e3f2fd"></div>
                <span>Discovery Phase</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #e8f5e8"></div>
                <span>Quick Fix Phase</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #fff3e0"></div>
                <span>Standard Project Phase</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #ffebee"></div>
                <span>Major Initiative Phase</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #f3e5f5"></div>
                <span>Quality Assurance</span>
            </div>
            <div class="legend-item">
                <div class="legend-color" style="background: #c8e6c9"></div>
                <span>Completion</span>
            </div>
        </div>
        
        <div class="commands">
            <h3>📋 Available Commands</h3>
            <div class="command">pnpm workflow:analyze</div>
            <div class="command">pnpm workflow:execute phase-0-roadmap</div>
            <div class="command">pnpm workflow:metrics</div>
            <div class="command">pnpm workflow:list</div>
        </div>
    </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const outputDir = args[0] || './workflow-diagrams';
  const format = args[1] || 'html'; // 'html' or 'mermaid' or 'both'
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const workflow = generateProjectPhaseWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'project-phase-workflow.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateProjectPhaseHTML(workflow);
    const htmlPath = path.join(outputDir, 'project-phase-workflow.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n🌐 To view the workflow:');
  console.log(`   1. Open ${path.join(outputDir, 'project-phase-workflow.html')}`);
  console.log(`   2. Or copy the Mermaid code to https://mermaid.live`);
  console.log('\n📊 Generated workflow has been saved!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateProjectPhaseWorkflow, generateProjectPhaseHTML };