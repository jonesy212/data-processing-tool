#!/usr/bin/env tsx
// generateTeamCollaborationWorkflow.ts
// Generates team collaboration workflow diagrams

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateTeamCollaborationWorkflow(): string {
  return `flowchart TD
    subgraph "👥 Cross-Functional Team Setup"
        A[📢 Daily Standup<br>Type Import Issues Reported] --> B[👨‍💻 Dev Team: Initial Triage<br>pnpm check:types:count]
        B --> C[📋 QA Team: Impact Analysis<br>Categorize error severity]
        C --> D[👨‍💼 PM: Resource Planning<br>Assign team members]
    end
    
    subgraph "🔄 Agile Sprint Execution"
        D --> E{📊 Sprint Backlog Size}
        E -->|"🐛 Bug Fix Sprint"| F[⚡ Quick Resolution<br>pnpm fix:types:quick]
        E -->|"🔧 Feature Sprint"| G[📋 Planned Development<br>pnpm fix:types]
        E -->|"🚀 Epic Sprint"| H[🏗️ Major Refactor<br>pnpm fix:types:dry]
    end
    
    subgraph "🤝 Team Collaboration"
        F --> I[👥 Pair Programming]
        G --> I
        H --> I
        I --> J[📝 Code Review Session<br>Team review of changes]
    end
    
    subgraph "✅ Quality Gates"
        J --> K[🧪 QA Testing Phase<br>pnpm check:types:count]
        K --> L{📈 Quality Metrics}
        L -->|"✅ All Tests Pass"| M[🎉 Sprint Complete]
        L -->|"⚠️ Blockers Found"| N[🔄 Backlog Grooming]
    end
    
    subgraph "🎯 Specialized Team Resolution"
        N --> O{🔍 Issue Assignment}
        O -->|"📦 Infrastructure Team"| P[🔧 Namespace Architecture<br>pnpm fix:types:namespace]
        O -->|"🔄 Frontend Team"| Q[🔄 Component Imports<br>pnpm fix:types:mixed]
        O -->|"🎨 Architecture Team"| R[👨‍💻 Senior Code Review<br>Complex pattern analysis]
        P --> S[🔄 Re-test Cycle]
        Q --> S
        R --> S
    end
    
    S --> K
    M --> T[🚀 Production Release<br>Deploy to all environments]
    
    style A fill:#e3f2fd
    style B fill:#bbdefb
    style C fill:#90caf9
    style D fill:#64b5f6
    style F fill:#c8e6c9
    style G fill:#fff3e0
    style H fill:#ffebee
    style I fill:#f3e5f5
    style J fill:#e1bee7
    style K fill:#d1c4e9
    style M fill:#c8e6c9
    style P fill:#ffccbc
    style Q fill:#dcedc8
    style R fill:#b3e5fc
    style T fill:#81c784`;
}

export function generateTeamCollaborationHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Team Collaboration Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            min-height: 100vh;
        }
        .container {
            max-width: 1400px;
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
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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
            min-height: 800px;
        }
        .team-roles {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .role-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid;
        }
        .role-card.infrastructure {
            border-left-color: #ffccbc;
        }
        .role-card.frontend {
            border-left-color: #dcedc8;
        }
        .role-card.architecture {
            border-left-color: #b3e5fc;
        }
        .role-card.qa {
            border-left-color: #e1bee7;
        }
        .role-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
        }
        .timeline {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .timeline-item {
            display: flex;
            align-items: center;
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 6px;
        }
        .timeline-day {
            font-weight: bold;
            color: #666;
            min-width: 80px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤝 Team Collaboration Workflow</h1>
            <p class="subtitle">Cross-functional collaboration for type import resolution</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="team-roles">
            <div class="role-card infrastructure">
                <div class="role-title">📦 Infrastructure Team</div>
                <p>Responsible for namespace imports and module architecture</p>
                <div class="command">pnpm fix:types:namespace</div>
            </div>
            <div class="role-card frontend">
                <div class="role-title">🔄 Frontend Team</div>
                <p>Handles mixed imports and component architecture</p>
                <div class="command">pnpm fix:types:mixed</div>
            </div>
            <div class="role-card architecture">
                <div class="role-title">🎨 Architecture Team</div>
                <p>Reviews complex patterns and provides guidance</p>
                <div class="command">Manual code review</div>
            </div>
            <div class="role-card qa">
                <div class="role-title">🧪 QA Team</div>
                <p>Validates fixes and ensures quality gates</p>
                <div class="command">pnpm check:types:count</div>
            </div>
        </div>
        
        <div class="timeline">
            <h3>📅 Weekly Timeline</h3>
            <div class="timeline-item">
                <div class="timeline-day">Monday</div>
                <div>Daily standup & issue triage</div>
            </div>
            <div class="timeline-item">
                <div class="timeline-day">Tuesday-Wed</div>
                <div>Sprint execution & pair programming</div>
            </div>
            <div class="timeline-item">
                <div class="timeline-day">Thursday</div>
                <div>Code review sessions</div>
            </div>
            <div class="timeline-item">
                <div class="timeline-day">Friday</div>
                <div>QA testing & sprint completion</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}

async function main() {
  const args = process.argv.slice(2);
  const outputDir = args[0] || './workflow-diagrams';
  const format = args[1] || 'html';
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const workflow = generateTeamCollaborationWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'team-collaboration-workflow.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateTeamCollaborationHTML(workflow);
    const htmlPath = path.join(outputDir, 'team-collaboration-workflow.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n👥 Team Collaboration Workflow Generated!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateTeamCollaborationWorkflow, generateTeamCollaborationHTML };