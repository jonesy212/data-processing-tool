#!/usr/bin/env tsx
// generateCollaborativeWorkflow.ts
// Generates collaborative workflow diagrams

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function generateCollaborativeWorkflow(): string {
  return `flowchart TD
    subgraph "🎯 Phase 1: Project Kickoff"
        A[📋 Discovery Meeting<br>TypeScript Errors Found] --> B[📊 Initial Assessment<br>pnpm check:types:count]
        B --> C[📈 Project Scoping<br>Error Analysis Report]
    end
    
    subgraph "🔧 Phase 2: Execution Planning"
        C --> D{🏗️ Project Complexity}
        D -->|"🔄 Quick Task"| E[📋 Sprint Planning: Quick Fix<br>pnpm fix:types:quick]
        D -->|"🔧 Standard Project"| F[📊 Resource Allocation: Standard<br>pnpm fix:types]
        D -->|"🚀 Major Initiative"| G[🏗️ Program Management: Comprehensive<br>pnpm fix:types:dry]
    end
    
    subgraph "🔄 Phase 3: Team Collaboration"
        E --> H[👥 Team Sync]
        F --> H
        G --> H
        H --> I[✅ Code Review Meeting<br>Review proposed changes]
    end
    
    subgraph "📊 Phase 4: Quality Assurance"
        I --> J[🧪 Testing Phase<br>pnpm check:types:count]
        J --> K{📈 Quality Metrics}
        K -->|"✅ Pass: All clear"| L[🎉 Project Delivery]
        K -->|"⚠️ Issues Found"| M[🎯 Bug Triage]
    end
    
    subgraph "🎯 Phase 5: Issue Resolution"
        M --> N{🔍 Bug Classification}
        N -->|"📦 Namespace Issues"| O[🔧 Specialist: Namespace Team<br>pnpm fix:types:namespace]
        N -->|"🔄 Mixed Type/Value"| P[🔧 Specialist: Import Team<br>pnpm fix:types:mixed]
        N -->|"🎨 Complex Architecture"| Q[👨‍💻 Senior Dev Review<br>Manual Intervention]
        O --> R[🔄 Re-test]
        P --> R
        Q --> R
    end
    
    R --> J
    L --> S[🚀 Production Deployment<br>Commit & Push]
    
    style A fill:#bbdefb
    style B fill:#90caf9
    style C fill:#64b5f6
    style E fill:#a5d6a7
    style F fill:#ffe082
    style G fill:#ef9a9a
    style H fill:#ce93d8
    style I fill:#80cbc4
    style J fill:#ffcc80
    style L fill:#c8e6c9
    style O fill:#ffccbc
    style P fill:#d1c4e9
    style Q fill:#b3e5fc
    style S fill:#81c784`;
}

function generateCollaborativeHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Collaborative Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
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
            border-bottom: 2px solid #bbdefb;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
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
        .collaboration-tools {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .tool-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid;
            transition: transform 0.3s ease;
        }
        .tool-card:hover {
            transform: translateY(-5px);
        }
        .tool-card.audio {
            border-left-color: #bbdefb;
        }
        .tool-card.video {
            border-left-color: #90caf9;
        }
        .tool-card.text {
            border-left-color: #64b5f6;
        }
        .tool-card.crypto {
            border-left-color: #a5d6a7;
        }
        .tool-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .meeting-schedule {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .meeting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            margin: 10px 0;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #64b5f6;
        }
        .meeting-time {
            font-weight: bold;
            color: #666;
        }
        .join-button {
            background: #64b5f6;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 4px;
            cursor: pointer;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🤝 Collaborative Workflow</h1>
            <p class="subtitle">Team collaboration with audio, video, and text communication</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="collaboration-tools">
            <div class="tool-card audio">
                <div class="tool-title">
                    <span>🎙️</span>
                    <span>Audio Collaboration</span>
                </div>
                <p>Real-time audio discussions for quick decision making</p>
                <div class="command">pnpm team:audio-standup</div>
            </div>
            
            <div class="tool-card video">
                <div class="tool-title">
                    <span>🎥</span>
                    <span>Video Meetings</span>
                </div>
                <p>Video conferences with screen sharing for code reviews</p>
                <div class="command">pnpm team:video-review</div>
            </div>
            
            <div class="tool-card text">
                <div class="tool-title">
                    <span>💬</span>
                    <span>Text Chat</span>
                </div>
                <p>Persistent text communication for async collaboration</p>
                <div class="command">pnpm team:chat --channel=#type-fixes</div>
            </div>
            
            <div class="tool-card crypto">
                <div class="tool-title">
                    <span>💎</span>
                    <span>Crypto Integration</span>
                </div>
                <p>Monitor crypto portfolio while collaborating on code</p>
                <div class="command">pnpm crypto:dashboard --embed</div>
            </div>
        </div>
        
        <div class="meeting-schedule">
            <h3>📅 Team Meeting Schedule</h3>
            <div class="meeting-item">
                <div>
                    <div style="font-weight: bold;">Daily Standup</div>
                    <div>Quick sync on type import progress</div>
                </div>
                <div class="meeting-time">9:00 AM</div>
                <button class="join-button">Join Audio</button>
            </div>
            <div class="meeting-item">
                <div>
                    <div style="font-weight: bold;">Code Review Session</div>
                    <div>Review type import fixes with video</div>
                </div>
                <div class="meeting-time">2:00 PM</div>
                <button class="join-button">Join Video</button>
            </div>
            <div class="meeting-item">
                <div>
                    <div style="font-weight: bold;">Crypto Portfolio Review</div>
                    <div>Discuss crypto investments & type fixes</div>
                </div>
                <div class="meeting-time">4:00 PM</div>
                <button class="join-button">Join Both</button>
            </div>
        </div>
    </div>
    
    <script>
        document.querySelectorAll('.join-button').forEach(button => {
            button.addEventListener('click', function() {
                const meeting = this.parentElement.querySelector('div div').textContent;
                alert(\`Joining \${meeting} meeting... 🎙️🎥\`);
            });
        });
    </script>
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
  
  const workflow = generateCollaborativeWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'collaborative-workflow.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateCollaborativeHTML(workflow);
    const htmlPath = path.join(outputDir, 'collaborative-workflow.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n🤝 Collaborative Workflow Generated!');
  console.log('💡 Perfect for your project management app with audio/video/text collaboration!');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateCollaborativeWorkflow, generateCollaborativeHTML };