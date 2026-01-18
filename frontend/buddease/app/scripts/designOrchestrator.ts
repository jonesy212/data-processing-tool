#!/usr/bin/env tsx
// scripts/designOrchestrator.ts
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateUXResearchWorkflow } from '@/core/generators/generateUXResearchWorkflow';
import { generateUIDesignWorkflow } from '@/core/generators/generateUIDesignWorkflow';
import { generateUXUIOrchestratorWorkflow } from '@/core/generators/generateUXUIOrchestrator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface DesignTrack {
  name: 'ux' | 'ui' | 'both';
  status: 'not-started' | 'in-progress' | 'completed' | 'synced';
  lastSynced: Date | null;
  files: string[];
}

class DesignOrchestrator {
  private tracks: Map<'ux' | 'ui', DesignTrack> = new Map();
  private syncHistory: Array<{
    timestamp: Date;
    from: 'ux' | 'ui';
    to: 'ux' | 'ui';
    data: any;
  }> = [];

  constructor() {
    // Initialize tracks
    this.tracks.set('ux', {
      name: 'ux',
      status: 'not-started',
      lastSynced: null,
      files: []
    });
    
    this.tracks.set('ui', {
      name: 'ui',
      status: 'not-started',
      lastSynced: null,
      files: []
    });
  }

  async startDesign(tracks: ('ux' | 'ui')[] = ['ux', 'ui']): Promise<void> {
    console.log('🎨 Starting Design Workflow');
    console.log('='.repeat(50));
    
    for (const track of tracks) {
      console.log(`\n🚀 Starting ${track.toUpperCase()} track...`);
      
      switch (track) {
        case 'ux':
          await this.startUXResearch();
          break;
        case 'ui':
          await this.startUIDesign();
          break;
      }
      
      this.tracks.get(track)!.status = 'in-progress';
      this.tracks.get(track)!.lastSynced = new Date();
      
      console.log(`✅ ${track.toUpperCase()} track started`);
    }
    
    // Generate orchestrator workflow if both tracks
    if (tracks.includes('ux') && tracks.includes('ui')) {
      await this.generateOrchestrator();
    }
    
    this.saveStatus();
    console.log('\n🎉 Design workflow started successfully!');
    console.log('📊 Run: pnpm workflow:status ux-research ui-design');
  }

  private async startUXResearch(): Promise<void> {
    const workflow = generateUXResearchWorkflow();
    const outputDir = './design-workflows/ux-research';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create workflow files
    fs.writeFileSync(
      path.join(outputDir, 'ux-workflow.mmd'),
      workflow,
      'utf8'
    );
    
    // Create research template
    const researchTemplate = this.createUXResearchTemplate();
    fs.writeFileSync(
      path.join(outputDir, 'research-plan.md'),
      researchTemplate,
      'utf8'
    );
    
    this.tracks.get('ux')!.files = [
      'ux-workflow.mmd',
      'research-plan.md',
      'interview-guide.md',
      'findings-report.md'
    ];
  }

  private async startUIDesign(): Promise<void> {
    const workflow = generateUIDesignWorkflow();
    const outputDir = './design-workflows/ui-design';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create workflow files
    fs.writeFileSync(
      path.join(outputDir, 'ui-workflow.mmd'),
      workflow,
      'utf8'
    );
    
    // Create design system template
    const designSystem = this.createDesignSystemTemplate();
    fs.writeFileSync(
      path.join(outputDir, 'design-system.md'),
      designSystem,
      'utf8'
    );
    
    this.tracks.get('ui')!.files = [
      'ui-workflow.mmd',
      'design-system.md',
      'components.md',
      'prototype-specs.md'
    ];
  }

  private async generateOrchestrator(): Promise<void> {
    const workflow = generateUXUIOrchestratorWorkflow();
    const outputDir = './design-workflows/orchestrator';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'orchestrator-workflow.mmd'),
      workflow,
      'utf8'
    );
    
    // Create sync config
    const syncConfig = {
      tracks: ['ux', 'ui'],
      syncPoints: [
        {
          name: 'Research Findings',
          from: 'ux',
          to: 'ui',
          trigger: 'research-complete'
        },
        {
          name: 'Design Review',
          from: 'ui',
          to: 'ux',
          trigger: 'prototype-ready'
        }
      ],
      meetings: [
        {
          type: 'alignment',
          frequency: 'weekly',
          duration: '1hr'
        }
      ]
    };
    
    fs.writeFileSync(
      path.join(outputDir, 'sync-config.json'),
      JSON.stringify(syncConfig, null, 2),
      'utf8'
    );
  }

  async syncUXToUI(data: string = 'research-findings'): Promise<void> {
    console.log('🔄 Syncing UX Research to UI Design');
    console.log('='.repeat(50));
    
    const uxTrack = this.tracks.get('ux');
    const uiTrack = this.tracks.get('ui');
    
    if (!uxTrack || uxTrack.status === 'not-started') {
      console.error('❌ UX Research track not started');
      return;
    }
    
    if (!uiTrack || uiTrack.status === 'not-started') {
      console.error('❌ UI Design track not started');
      return;
    }
    
    // Create sync record
    const syncRecord = {
      timestamp: new Date(),
      from: 'ux' as const,
      to: 'ui' as const,
      data,
      files: uxTrack.files
    };
    
    this.syncHistory.push(syncRecord);
    
    // Update track status
    uxTrack.status = 'synced';
    uiTrack.lastSynced = new Date();
    
    // Generate sync report
    const syncReport = this.generateSyncReport(syncRecord);
    const outputDir = './design-workflows/sync-reports';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    const reportPath = path.join(
      outputDir,
      `sync-${new Date().toISOString().split('T')[0]}.md`
    );
    
    fs.writeFileSync(reportPath, syncReport, 'utf8');
    
    console.log(`✅ UX Research synced to UI Design`);
    console.log(`📁 Sync report saved: ${reportPath}`);
    console.log(`📊 Data transferred: ${data}`);
    
    this.saveStatus();
  }

  async generateDesignReport(includes: ('ux' | 'ui')[] = ['ux', 'ui'], format: 'pdf' | 'html' | 'md' = 'pdf'): Promise<void> {
    console.log('📊 Generating Design Report');
    console.log('='.repeat(50));
    
    const reportData = {
      generatedAt: new Date().toISOString(),
      tracks: includes,
      format,
      uxStatus: this.tracks.get('ux'),
      uiStatus: this.tracks.get('ui'),
      syncHistory: this.syncHistory,
      summary: this.generateReportSummary()
    };
    
    const outputDir = './design-workflows/reports';
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    let reportContent = '';
    let fileExtension = '';
    
    switch (format) {
      case 'md':
        reportContent = this.generateMarkdownReport(reportData);
        fileExtension = 'md';
        break;
      case 'html':
        reportContent = this.generateHTMLReport(reportData);
        fileExtension = 'html';
        break;
      case 'pdf':
        // For PDF, we'd typically use a library like puppeteer
        // For now, generate HTML that can be converted to PDF
        reportContent = this.generateHTMLReport(reportData);
        fileExtension = 'html';
        console.log('ℹ️  HTML generated. Use browser print to PDF');
        break;
    }
    
    const reportPath = path.join(
      outputDir,
      `design-report-${new Date().toISOString().split('T')[0]}.${fileExtension}`
    );
    
    fs.writeFileSync(reportPath, reportContent, 'utf8');
    
    console.log(`✅ Design report generated: ${reportPath}`);
    console.log(`📁 Format: ${format}`);
    console.log(`📈 Includes: ${includes.join(', ')}`);
  }

  async checkStatus(track1?: 'ux' | 'ui', track2?: 'ux' | 'ui'): Promise<void> {
    console.log('📊 Design Workflow Status');
    console.log('='.repeat(50));
    
    const tracksToCheck = [];
    
    if (track1) tracksToCheck.push(track1);
    if (track2) tracksToCheck.push(track2);
    
    if (tracksToCheck.length === 0) {
      tracksToCheck.push('ux', 'ui');
    }
    
    for (const track of tracksToCheck) {
      const trackData = this.tracks.get(track);
      
      if (!trackData) {
        console.log(`❌ Track "${track}" not found`);
        continue;
      }
      
      console.log(`\n${track.toUpperCase()} Track:`);
      console.log(`  Status: ${trackData.status}`);
      console.log(`  Last Synced: ${trackData.lastSynced ? trackData.lastSynced.toLocaleString() : 'Never'}`);
      console.log(`  Files: ${trackData.files.length}`);
      
      if (trackData.files.length > 0) {
        console.log(`  Latest Files:`);
        trackData.files.slice(0, 3).forEach(file => {
          console.log(`    • ${file}`);
        });
      }
    }
    
    console.log(`\n🔄 Sync History: ${this.syncHistory.length} syncs`);
    
    if (this.syncHistory.length > 0) {
      const latestSync = this.syncHistory[this.syncHistory.length - 1];
      console.log(`  Latest: ${latestSync.from} → ${latestSync.to} at ${latestSync.timestamp.toLocaleString()}`);
    }
    
    console.log('\n💡 Commands:');
    console.log('  pnpm design:sync --from=ux --to=ui');
    console.log('  pnpm design:report --include=ux,ui --format=pdf');
    console.log('  pnpm design:meeting --type=alignment');
  }

  private createUXResearchTemplate(): string {
    return `# UX Research Plan

## Project: [Project Name]
## Date: ${new Date().toISOString().split('T')[0]}

## Research Goals
1. [Goal 1]
2. [Goal 2]
3. [Goal 3]

## Methodology
- User Interviews: [Number] participants
- Usability Testing: [Number] sessions
- Surveys: [Number] responses

## Timeline
- Preparation: [Date]
- Research: [Date]
- Analysis: [Date]
- Reporting: [Date]

## Success Metrics
- User satisfaction score: Target [Score]
- Task completion rate: Target [Rate]%
- Error rate reduction: Target [Reduction]%

## Team
- Lead Researcher: [Name]
- Note Taker: [Name]
- Stakeholders: [Names]

---
*Generated by Design Orchestrator*`;
  }

  private createDesignSystemTemplate(): string {
    return `# Design System

## Project: [Project Name]
## Version: 1.0.0
## Date: ${new Date().toISOString().split('T')[0]}

## Colors
### Primary
- Primary: #2196F3
- Secondary: #E91E63
- Accent: #FF9800

### Neutrals
- Background: #FFFFFF
- Surface: #F5F5F5
- Text: #212121
- Text Secondary: #757575

## Typography
### Headings
- H1: 32px, 700
- H2: 24px, 600
- H3: 18px, 600

### Body
- Large: 16px, 400
- Medium: 14px, 400
- Small: 12px, 400

## Components
### Buttons
- Primary Button
- Secondary Button
- Icon Button

### Forms
- Text Input
- Select Dropdown
- Checkbox
- Radio Button

## Spacing
- Unit: 8px
- Small: 8px
- Medium: 16px
- Large: 24px
- X-Large: 32px

---
*Generated by Design Orchestrator*`;
  }

  private generateSyncReport(syncRecord: any): string {
    return `# Design Workflow Sync Report

## Sync Details
- **From:** ${syncRecord.from.toUpperCase()}
- **To:** ${syncRecord.to.toUpperCase()}
- **Timestamp:** ${syncRecord.timestamp.toISOString()}
- **Data:** ${syncRecord.data}

## Files Transferred
${syncRecord.files.map((file: string) => `- ${file}`).join('\n')}

## Status Update
- ${syncRecord.from.toUpperCase()} Status: Synced
- ${syncRecord.to.toUpperCase()} Status: Updated

## Next Steps
1. Review transferred data
2. Update ${syncRecord.to.toUpperCase()} workflow
3. Schedule alignment meeting
4. Update project documentation

---
*Generated by Design Orchestrator*`;
  }

  private generateReportSummary(): string {
    const ux = this.tracks.get('ux');
    const ui = this.tracks.get('ui');
    
    return {
      totalTracks: 2,
      activeTracks: [ux, ui].filter(t => t?.status === 'in-progress').length,
      completedSyncs: this.syncHistory.length,
      lastActivity: ux?.lastSynced || ui?.lastSynced || new Date(),
      recommendations: this.generateRecommendations()
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    const ux = this.tracks.get('ux');
    const ui = this.tracks.get('ui');
    
    if (ux?.status === 'in-progress' && ui?.status === 'in-progress') {
      recommendations.push('Schedule weekly alignment meeting');
      recommendations.push('Sync research findings with design team');
    }
    
    if (this.syncHistory.length === 0 && ux?.status === 'in-progress') {
      recommendations.push('Initial UX research ready for sync');
    }
    
    return recommendations;
  }

  private generateMarkdownReport(data: any): string {
    return `# Design Workflow Report

## Report Details
- **Generated:** ${data.generatedAt}
- **Format:** ${data.format}
- **Tracks:** ${data.tracks.join(', ')}

## Track Status
### UX Research
- Status: ${data.uxStatus?.status || 'N/A'}
- Last Synced: ${data.uxStatus?.lastSynced?.toISOString() || 'Never'}
- Files: ${data.uxStatus?.files?.length || 0}

### UI Design
- Status: ${data.uiStatus?.status || 'N/A'}
- Last Synced: ${data.uiStatus?.lastSynced?.toISOString() || 'Never'}
- Files: ${data.uiStatus?.files?.length || 0}

## Sync History
Total Syncs: ${data.syncHistory.length}

${data.syncHistory.map((sync: any, index: number) => `
### Sync ${index + 1}
- From: ${sync.from} → To: ${sync.to}
- Time: ${sync.timestamp.toISOString()}
- Data: ${sync.data}
`).join('\n')}

## Summary
- Active Tracks: ${data.summary.activeTracks}
- Recommendations:
${data.summary.recommendations.map((rec: string) => `  - ${rec}`).join('\n')}

---
*Generated by Design Orchestrator*`;
  }

  private generateHTMLReport(data: any): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Design Workflow Report</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 40px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            padding: 40px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid #2196F3;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin: 30px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #2196F3;
        }
        .track-status {
            display: flex;
            gap: 20px;
            margin: 30px 0;
        }
        .track {
            flex: 1;
            padding: 20px;
            border-radius: 8px;
        }
        .track.ux {
            background: #e3f2fd;
            border: 1px solid #2196F3;
        }
        .track.ui {
            background: #fce4ec;
            border: 1px solid #E91E63;
        }
        .sync-history {
            margin: 30px 0;
        }
        .sync-item {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #4CAF50;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Design Workflow Report</h1>
            <p>Generated: ${new Date(data.generatedAt).toLocaleString()}</p>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Total Tracks</h3>
                <p style="font-size: 2rem; font-weight: bold;">${data.summary.totalTracks}</p>
            </div>
            <div class="stat-card">
                <h3>Active Tracks</h3>
                <p style="font-size: 2rem; font-weight: bold; color: #4CAF50;">${data.summary.activeTracks}</p>
            </div>
            <div class="stat-card">
                <h3>Syncs Completed</h3>
                <p style="font-size: 2rem; font-weight: bold; color: #2196F3;">${data.syncHistory.length}</p>
            </div>
        </div>
        
        <div class="track-status">
            <div class="track ux">
                <h2>🔍 UX Research</h2>
                <p><strong>Status:</strong> ${data.uxStatus?.status || 'N/A'}</p>
                <p><strong>Last Synced:</strong> ${data.uxStatus?.lastSynced ? new Date(data.uxStatus.lastSynced).toLocaleString() : 'Never'}</p>
                <p><strong>Files:</strong> ${data.uxStatus?.files?.length || 0}</p>
            </div>
            <div class="track ui">
                <h2>🎨 UI Design</h2>
                <p><strong>Status:</strong> ${data.uiStatus?.status || 'N/A'}</p>
                <p><strong>Last Synced:</strong> ${data.uiStatus?.lastSynced ? new Date(data.uiStatus.lastSynced).toLocaleString() : 'Never'}</p>
                <p><strong>Files:</strong> ${data.uiStatus?.files?.length || 0}</p>
            </div>
        </div>
        
        ${data.syncHistory.length > 0 ? `
        <div class="sync-history">
            <h2>🔄 Sync History</h2>
            ${data.syncHistory.map((sync: any) => `
            <div class="sync-item">
                <p><strong>${sync.from.toUpperCase()} → ${sync.to.toUpperCase()}</strong></p>
                <p>Time: ${new Date(sync.timestamp).toLocaleString()}</p>
                <p>Data: ${sync.data}</p>
            </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <h2>💡 Recommendations</h2>
            <ul>
                ${data.summary.recommendations.map((rec: string) => `<li>${rec}</li>`).join('')}
            </ul>
        </div>
    </div>
</body>
</html>`;
  }

  private saveStatus(): void {
    const status = {
      tracks: Object.fromEntries(this.tracks),
      syncHistory: this.syncHistory,
      lastUpdated: new Date().toISOString()
    };
    
    const statusDir = './design-workflows/.status';
    
    if (!fs.existsSync(statusDir)) {
      fs.mkdirSync(statusDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(statusDir, 'status.json'),
      JSON.stringify(status, null, 2),
      'utf8'
    );
  }

  loadStatus(): void {
    const statusFile = './design-workflows/.status/status.json';
    
    if (fs.existsSync(statusFile)) {
      try {
        const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
        
        // Load tracks
        if (status.tracks) {
          Object.entries(status.tracks).forEach(([key, value]: [string, any]) => {
            if (key === 'ux' || key === 'ui') {
              this.tracks.set(key, {
                ...value,
                lastSynced: value.lastSynced ? new Date(value.lastSynced) : null
              });
            }
          });
        }
        
        // Load sync history
        if (status.syncHistory) {
          this.syncHistory = status.syncHistory.map((sync: any) => ({
            ...sync,
            timestamp: new Date(sync.timestamp)
          }));
        }
        
        console.log('✅ Loaded previous workflow status');
      } catch (error) {
        console.error('❌ Error loading status:', error);
      }
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const orchestrator = new DesignOrchestrator();
  orchestrator.loadStatus();
  
  switch (command) {
    case 'start':
      const tracksArg = args.find(arg => arg.startsWith('--tracks='));
      const tracks = tracksArg 
        ? tracksArg.split('=')[1].split(',') as ('ux' | 'ui')[]
        : ['ux', 'ui'];
      await orchestrator.startDesign(tracks);
      break;
      
    case 'sync':
      const from = args.find(arg => arg.startsWith('--from='))?.split('=')[1] as 'ux' | 'ui';
      const to = args.find(arg => arg.startsWith('--to='))?.split('=')[1] as 'ux' | 'ui';
      const data = args.find(arg => arg.startsWith('--data='))?.split('=')[1] || 'research-findings';
      
      if (from === 'ux' && to === 'ui') {
        await orchestrator.syncUXToUI(data);
      } else {
        console.error('❌ Only ux→ui sync is implemented in this example');
      }
      break;
      
    case 'report':
      const includeArg = args.find(arg => arg.startsWith('--include='));
      const includes = includeArg 
        ? includeArg.split('=')[1].split(',') as ('ux' | 'ui')[]
        : ['ux', 'ui'];
      
      const formatArg = args.find(arg => arg.startsWith('--format='));
      const format = (formatArg?.split('=')[1] as 'pdf' | 'html' | 'md') || 'pdf';
      
      await orchestrator.generateDesignReport(includes, format);
      break;
      
    case 'status':
      const track1 = args[1] as 'ux' | 'ui' | undefined;
      const track2 = args[2] as 'ux' | 'ui' | undefined;
      await orchestrator.checkStatus(track1, track2);
      break;
      
    default:
      console.log(`
🎨 Design Workflow Orchestrator

Available Commands:
  pnpm design:start [--tracks=ux,ui]
  pnpm design:sync --from=ux --to=ui [--data=research-findings]
  pnpm design:report [--include=ux,ui] [--format=pdf|html|md]
  pnpm design:status [ux] [ui]

Examples:
  pnpm design:start --tracks=ux,ui
  pnpm design:sync --from=ux --to=ui --data=usability-test-results
  pnpm design:report --include=ux --format=html
  pnpm design:status ux ui
      `);
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DesignOrchestrator };