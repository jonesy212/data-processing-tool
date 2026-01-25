#!/usr/bin/env tsx
// generateCryptoWorkflow.ts
// Generates crypto-themed workflow diagrams

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function generateCryptoWorkflow(): string {
  return `flowchart TD
    subgraph "💰 Portfolio Discovery"
        A[📈 Market Scan<br>TypeScript Errors Detected] --> B[📊 Portfolio Analysis<br>pnpm check:types:count]
        B --> C[📉 Risk Assessment<br>Error Impact Report]
    end
    
    subgraph "📊 Investment Strategy"
        C --> D{📈 Portfolio Size}
        D -->|"💎 Small Position"| E[⚡ Quick Trade<br>pnpm fix:types:quick]
        D -->|"📊 Medium Portfolio"| F[📋 Planned Investment<br>pnpm fix:types]
        D -->|"🏦 Large Holdings"| G[🏛️ Comprehensive Strategy<br>pnpm fix:types:dry]
    end
    
    subgraph "🔄 Trading Execution"
        E --> H[🤝 Order Matching]
        F --> H
        G --> H
        H --> I[📝 Trade Confirmation<br>Review changes before execution]
    end
    
    subgraph "🔒 Security Audit"
        I --> J[🛡️ Portfolio Verification<br>pnpm check:types:count]
        J --> K{📊 Audit Results}
        K -->|"✅ Clean: No vulnerabilities"| L[🎉 Position Secured]
        K -->|"⚠️ Issues Identified"| M[🎯 Risk Mitigation]
    end
    
    subgraph "🎯 Risk Management"
        M --> N{🔍 Issue Classification}
        N -->|"📦 Namespace Contracts"| O[🛠️ Smart Contract Fix<br>pnpm fix:types:namespace]
        N -->|"🔄 Mixed Asset Types"| P[🔄 Portfolio Rebalancing<br>pnpm fix:types:mixed]
        N -->|"🎨 Complex Derivatives"| Q[👨‍💼 Risk Officer Review<br>Manual Analysis]
        O --> R[🔄 Re-audit]
        P --> R
        Q --> R
    end
    
    R --> J
    L --> S[🚀 Transaction Finalized<br>Commit & Deploy]
    
    style A fill:#fff3e0
    style B fill:#ffe0b2
    style C fill:#ffcc80
    style E fill:#c8e6c9
    style F fill:#b3e5fc
    style G fill:#ffcdd2
    style H fill:#d1c4e9
    style I fill:#bbdefb
    style J fill:#c8e6c9
    style L fill:#a5d6a7
    style O fill:#ffccbc
    style P fill:#f0f4c3
    style Q fill:#b2ebf2
    style S fill:#81c784`;
}

export function generateCryptoHTML(workflow: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Crypto Portfolio Workflow</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
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
            border-bottom: 2px solid #ffcc80;
        }
        h1 {
            color: #333;
            margin: 0;
            font-size: 2.5rem;
            background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
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
        .crypto-dashboard {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 30px;
        }
        .dashboard-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        .dashboard-title {
            font-weight: bold;
            font-size: 1.1rem;
            margin-bottom: 15px;
            color: #333;
        }
        .metric {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            padding: 8px;
            background: white;
            border-radius: 4px;
        }
        .metric-value {
            font-weight: bold;
            color: #4CAF50;
        }
        .metric.red {
            color: #F44336;
        }
        .trading-commands {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
        }
        .trading-command {
            background: white;
            padding: 12px 15px;
            margin: 8px 0;
            border-radius: 6px;
            font-family: 'Courier New', monospace;
            border-left: 4px solid #FF9800;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .crypto-icon {
            font-size: 1.2rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💎 Crypto Portfolio Workflow</h1>
            <p class="subtitle">Managing type imports like a crypto portfolio</p>
        </div>
        
        <div class="workflow-container">
            <div class="mermaid">
${workflow}
            </div>
        </div>
        
        <div class="crypto-dashboard">
            <div class="dashboard-card">
                <div class="dashboard-title">📊 Portfolio Metrics</div>
                <div class="metric">
                    <span>Total Errors</span>
                    <span class="metric-value" id="errorCount">0</span>
                </div>
                <div class="metric">
                    <span>Time Saved (min)</span>
                    <span class="metric-value" id="timeSaved">0</span>
                </div>
                <div class="metric">
                    <span>Automation Rate</span>
                    <span class="metric-value">95%</span>
                </div>
                <div class="metric">
                    <span>Crypto Value</span>
                    <span class="metric-value">$12,450</span>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="dashboard-title">⚡ Quick Actions</div>
                <div class="trading-command">
                    <span class="crypto-icon">💎</span>
                    <span>Small Position: pnpm fix:types:quick</span>
                </div>
                <div class="trading-command">
                    <span class="crypto-icon">📊</span>
                    <span>Medium Portfolio: pnpm fix:types</span>
                </div>
                <div class="trading-command">
                    <span class="crypto-icon">🏦</span>
                    <span>Large Holdings: pnpm fix:types:dry</span>
                </div>
                <div class="trading-command">
                    <span class="crypto-icon">🔒</span>
                    <span>Security Audit: pnpm check:types:count</span>
                </div>
            </div>
            
            <div class="dashboard-card">
                <div class="dashboard-title">🎯 Specialized Strategies</div>
                <div class="trading-command">
                    <span class="crypto-icon">📦</span>
                    <span>Smart Contracts: pnpm fix:types:namespace</span>
                </div>
                <div class="trading-command">
                    <span class="crypto-icon">🔄</span>
                    <span>Portfolio Rebalance: pnpm fix:types:mixed</span>
                </div>
                <div class="trading-command">
                    <span class="crypto-icon">🎨</span>
                    <span>Complex Derivatives: Manual review</span>
                </div>
            </div>
        </div>
        
        <div class="trading-commands">
            <h3>📈 Live Trading Dashboard</h3>
            <p>Monitor type fix progress alongside your crypto portfolio</p>
            <div style="text-align: center; margin-top: 20px;">
                <button onclick="simulateTrading()" style="
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    color: white;
                    border: none;
                    padding: 12px 30px;
                    border-radius: 25px;
                    font-size: 16px;
                    cursor: pointer;
                    font-weight: bold;
                ">
                    🚀 Execute All Trades
                </button>
            </div>
        </div>
    </div>
    
    <script>
        function simulateTrading() {
            document.getElementById('errorCount').textContent = Math.floor(Math.random() * 50);
            document.getElementById('timeSaved').textContent = Math.floor(Math.random() * 200);
            
            // Show success message
            alert('🎉 All trades executed successfully! Portfolio updated.');
        }
        
        // Initialize with random values
        document.getElementById('errorCount').textContent = Math.floor(Math.random() * 50);
        document.getElementById('timeSaved').textContent = Math.floor(Math.random() * 200);
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
  
  const workflow = generateCryptoWorkflow();
  
  if (format === 'mermaid' || format === 'both') {
    const mermaidPath = path.join(outputDir, 'crypto-workflow.mmd');
    fs.writeFileSync(mermaidPath, workflow, 'utf8');
    console.log(`✅ Mermaid file saved: ${mermaidPath}`);
  }
  
  if (format === 'html' || format === 'both') {
    const html = generateCryptoHTML(workflow);
    const htmlPath = path.join(outputDir, 'crypto-workflow.html');
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`✅ HTML file saved: ${htmlPath}`);
  }
  
  console.log('\n💎 Crypto Workflow Generated!');
  console.log('📈 Time saved on type fixes = More time for crypto analysis! 🚀');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { generateCryptoWorkflow, generateCryptoHTML };