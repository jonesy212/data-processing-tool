#!/usr/bin/env tsx
// generateUXUIOrchestrator.ts - For coordinating both workflows

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateUXUIOrchestratorWorkflow(): string {
  return `flowchart TD
    subgraph "🔗 Phase 0: Project Initiation"
        A[🚀 Project Kickoff] --> B[👥 Cross-functional Team Setup]
        B --> C[📋 Dual-track Discovery Planning]
    end
    
    subgraph "🔄 Parallel Tracks"
        C --> D[🔍 UX Research Track]
        C --> E[🎨 UI Design Track]
        
        D --> F[👥 User Research]
        F --> G[📊 Data Analysis]
        G --> H[🗺️ Strategy Development]
        H --> I[✏️ UX Deliverables]
        
        E --> J[🎨 Design System]
        J --> K[🌈 Visual Exploration]
        K --> L[🎭 Component Design]
        L --> M[🔄 UI Deliverables]
    end
    
    subgraph "🤝 Phase 2: Integration & Sync"
        I --> N[🔄 Weekly Sync Meetings]
        M --> N
        N --> O[🎯 Alignment Workshops]
        O --> P[📋 Combined Review]
        P --> Q[✅ Joint Sign-off]
    end
    
    subgraph "🚀 Phase 3: Implementation"
        Q --> R[💻 Development Handoff]
        R --> S[🎯 Design QA]
        S --> T[🧪 Usability Testing]
        T --> U[📈 Performance Tracking]
    end
    
    subgraph "📊 Phase 4: Measurement & Iteration"
        U --> V[📊 Analytics Review]
        V --> W[💡 Insights Generation]
        W --> X[🔄 Design Iteration]
        X --> Y[🌱 Continuous Improvement]
    end
    
    style A fill:#ff9800
    style C fill:#ff9800
    style D fill:#2196f3
    style E fill:#e91e63
    style F fill:#bbdefb
    style G fill:#90caf9
    style H fill:#64b5f6
    style I fill:#2196f3
    style J fill:#f8bbd9
    style K fill:#f48fb1
    style L fill:#f06292
    style M fill:#e91e63
    style N fill:#ff9800
    style O fill:#ff9800
    style Q fill:#4caf50
    style R fill:#4caf50
    style U fill:#4caf50
    style Y fill:#9c27b0`;
}

export function generateUXUIOrchestratorHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UX/UI Orchestrator Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
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
            border-bottom: 2px solid #ff9800;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #ff9800 0%, #ff5722 100%);
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
        .orchestrator-dashboard {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 30px;
            margin-top: 30px;
        }
        .track-column {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        .track-column.ux {
            border-left: 4px solid #2196f3;
        }
        .track-column.ui {
            border-left: 4px solid #e91e63;
        }
        .track-header {
            font-weight: bold;
            font-size: 1.2rem;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .sync-controls {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
        }
        .command {
            font-family: 'Courier New', monospace;
            background: #fff3e0;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 0.9rem;
            margin-top: 10px;
            border-left: 3px solid #ff9800;
        }
        .sync-status {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 10px;
            margin-top: 20px;
        }
        .status-item {
            padding: 15px;
            background: white;
            border-radius: 8px;
            text-align: center;
        }
        .status-good {
            color: #4caf50;
            font-weight: bold;
        }
        .status-warning {
            color: #ff9800;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔄 UX/UI Orchestrator Workflow</h1>
            <p class="subtitle">Coordinated design process for optimal collaboration</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="orchestrator-dashboard">
            <div class="track-column ux">
                <div class="track-header">
                    <span style="color: #2196f3;">🔍</span>
                    <span>UX Research Track</span>
                </div>
                <div class="command">pnpm ux:start --project="ecommerce-app"</div>
                <div class="command">pnpm ux:interviews --count=15</div>
                <div class="command">pnpm ux:analysis --method=affinity</div>
                <div class="command">pnpm ux:deliver --type=personas</div>
                <div style="margin-top: 15px;">
                    <div style="font-weight: bold;">Next Sync:</div>
                    <div class="command">pnpm ux:sync --with=ui --data=research-findings</div>
                </div>
            </div>
            
            <div class="track-column ui">
                <div class="track-header">
                    <span style="color: #e91e63;">🎨</span>
                    <span>UI Design Track</span>
                </div>
                <div class="command">pnpm ui:start --project="ecommerce-app"</div>
                <div class="command">pnpm ui:design-system --update=all</div>
                <div class="command">pnpm ui:prototype --fidelity=high</div>
                <div class="command">pnpm ui:handoff --format=react</div>
                <div style="margin-top: 15px;">
                    <div style="font-weight: bold;">Next Sync:</div>
                    <div class="command">pnpm ui:sync --with=ux --data=design-specs</div>
                </div>
            </div>
        </div>
        
        <div class="sync-controls">
            <h3>🔄 Synchronization Controls</h3>
            <div class="sync-status">
                <div class="status-item">
                    <div>UX Research</div>
                    <div class="status-good">✅ Complete</div>
                </div>
                <div class="status-item">
                    <div>UI Design</div>
                    <div class="status-warning">🔄 In Progress</div>
                </div>
                <div class="status-item">
                    <div>Sync Status</div>
                    <div class="status-good">✅ Synced</div>
                </div>
                <div class="status-item">
                    <div>Next Review</div>
                    <div>📅 Tomorrow 10AM</div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <div class="command">pnpm orchestrator:sync --tracks=ux,ui --force=true</div>
                <div class="command">pnpm orchestrator:meeting --type=alignment --duration=1hr</div>
                <div class="command">pnpm orchestrator:report --period=weekly --format=pdf</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}