// generateCommunityProjectWorkflow.ts
#!/usr/bin/env tsx

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateCommunityProjectWorkflow(): string {
  return `flowchart TD
    subgraph "🌱 Phase 1: Community Discovery"
        A[👥 Community Needs Assessment] --> B[📋 Idea Gathering & Voting]
        B --> C[🔍 Resource Availability Check]
    end
    
    subgraph "🤝 Phase 2: Team Formation"
        C --> D[👨‍💻 Recruit Community Members]
        D --> E[🎯 Define Roles & Responsibilities]
        E --> F[📋 Create Community Guidelines]
    end
    
    subgraph "🚀 Phase 3: Project Execution"
        F --> G[🔄 Agile Community Sprints]
        G --> H[📝 Collaborative Documentation]
        H --> I[🧪 Community Testing & Feedback]
    end
    
    subgraph "📈 Phase 4: Community Growth"
        I --> J[📊 Metrics & Impact Tracking]
        J --> K[🎯 Onboarding New Members]
        K --> L[🌐 Community Outreach & Promotion]
    end
    
    subgraph "🔄 Phase 5: Sustainability"
        L --> M[💡 Iterate & Improve]
        M --> N[🎉 Celebrate Successes]
        N --> O[🏗️ Plan Next Initiatives]
    end
    
    style A fill:#e8f5e9
    style B fill:#c8e6c9
    style C fill:#a5d6a7
    style D fill:#81c784
    style F fill:#4caf50
    style G fill:#388e3c
    style I fill:#2e7d32
    style L fill:#1b5e20
    style O fill:#33691e`;
}

export function generateCommunityProjectHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Community Project Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
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
            border-bottom: 2px solid #4caf50;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #4caf50 0%, #2e7d32 100%);
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
        .community-features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .feature-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #4caf50;
        }
        .feature-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .community-stats {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .stat-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: white;
            border-radius: 6px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🌱 Community Project Workflow</h1>
            <p class="subtitle">Open-source and community-driven project management</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="community-features">
            <div class="feature-card">
                <div class="feature-title">
                    <span>👥</span>
                    <span>Community Governance</span>
                </div>
                <p>Democratic decision-making with community voting</p>
                <div class="command">pnpm community:vote --proposal="new-feature"</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>🤝</span>
                    <span>Collaborative Development</span>
                </div>
                <p>Git-based workflow with community contributions</p>
                <div class="command">pnpm community:contribute --issue=#123</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>📈</span>
                    <span>Impact Tracking</span>
                </div>
                <p>Measure community engagement and project impact</p>
                <div class="command">pnpm community:metrics --period=monthly</div>
            </div>
            
            <div class="feature-card">
                <div class="feature-title">
                    <span>🎯</span>
                    <span>Mentorship Program</span>
                </div>
                <p>Onboarding and mentoring new community members</p>
                <div class="command">pnpm community:mentor --new-member=johndoe</div>
            </div>
        </div>
        
        <div class="community-stats">
            <h3>📊 Community Metrics</h3>
            <div class="stat-item">
                <div>Active Contributors</div>
                <div style="font-weight: bold; color: #4caf50;">245</div>
            </div>
            <div class="stat-item">
                <div>Open Issues</div>
                <div style="font-weight: bold; color: #ff9800;">47</div>
            </div>
            <div class="stat-item">
                <div>Pull Requests Merged</div>
                <div style="font-weight: bold; color: #2196f3;">156</div>
            </div>
            <div class="stat-item">
                <div>Community Growth (30 days)</div>
                <div style="font-weight: bold; color: #9c27b0;">+18%</div>
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
  
  const workflow = generateCommunityProjectWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'community-project.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateCommunityProjectHTML(workflow);
    const htmlPath = path.join(outputDir, 'community-project.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n🌱 Community Project Workflow Generated!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateCommunityProjectWorkflow, generateCommunityProjectHTML };