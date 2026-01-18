#!/usr/bin/env tsx
// scripts/workflowConnector.ts - Integrates with ProjectPhaseWorkflowManager
import fs from 'fs';
import path from 'path';
import { ProjectPhaseWorkflowManager, projectWorkflows } from './ProjectPhaseWorkflowManager';
import type { WorkflowContext } from './ProjectPhaseWorkflowManager';

interface WorkflowConnection {
  source: string;
  target: string;
  type: 'data-flow' | 'dependency' | 'handoff';
  status: 'active' | 'pending' | 'completed';
  lastUpdated: Date;
  data?: any;
}

class WorkflowConnector {
  private connections: WorkflowConnection[] = [];
  private readonly CONFIG_FILE = './workflow-connections.json';
  private projectPhaseManager: ProjectPhaseWorkflowManager | null = null;

  constructor() {
    this.loadConnections();
    this.initializeProjectPhaseManager();
  }

  private initializeProjectPhaseManager(): void {
    const context: WorkflowContext = {
      projectId: 'workflow-connector',
      phase: {
        id: 'connector-initialization',
        name: 'Workflow Connector Setup',
        status: 'completed',
        startDate: new Date(),
        endDate: new Date()
      },
      team: [],
      timeline: {
        start: new Date(),
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
        estimatedCompletion: new Date()
      }
    };
    
    this.projectPhaseManager = new ProjectPhaseWorkflowManager(context);
  }

  async connect(source: string, target: string, type: 'data-flow' | 'dependency' | 'handoff' = 'data-flow'): Promise<void> {
    console.log(`🔗 Connecting workflows: ${source} → ${target}`);
    
    // Check if both workflows exist
    if (!this.workflowExists(source)) {
      console.error(`❌ Source workflow "${source}" not found`);
      return;
    }
    
    if (!this.workflowExists(target)) {
      console.error(`❌ Target workflow "${target}" not found`);
      return;
    }
    
    // Create connection
    const connection: WorkflowConnection = {
      source,
      target,
      type,
      status: 'active',
      lastUpdated: new Date(),
      data: {
        connectedAt: new Date().toISOString(),
        connectorVersion: '1.0.0'
      }
    };
    
    // Check for existing connection
    const existingIndex = this.connections.findIndex(
      conn => conn.source === source && conn.target === target
    );
    
    if (existingIndex >= 0) {
      this.connections[existingIndex] = connection;
      console.log(`✅ Updated existing connection`);
    } else {
      this.connections.push(connection);
      console.log(`✅ Created new connection`);
    }
    
    this.saveConnections();
    
    // Generate connection visualization
    await this.generateConnectionVisualization();
    
    console.log(`📊 Total connections: ${this.connections.length}`);
  }

  async syncAll(): Promise<void> {
    console.log('🔄 Syncing all connected workflows');
    console.log('='.repeat(50));
    
    const activeConnections = this.connections.filter(conn => conn.status === 'active');
    
    if (activeConnections.length === 0) {
      console.log('ℹ️ No active connections to sync');
      return;
    }
    
    for (const connection of activeConnections) {
      console.log(`\n🔗 ${connection.source} → ${connection.target}`);
      
      try {
        await this.syncWorkflowPair(connection);
        connection.status = 'completed';
        connection.lastUpdated = new Date();
        console.log(`✅ Synced successfully`);
      } catch (error) {
        console.error(`❌ Sync failed: ${error}`);
        connection.status = 'pending';
      }
    }
    
    this.saveConnections();
    console.log(`\n🎉 Completed ${activeConnections.length} syncs`);
  }

  private workflowExists(workflow: string): boolean {
    // Check if it's a ProjectPhaseWorkflow
    if (projectWorkflows[workflow]) {
      return true;
    }
    
    // Also check for physical workflow files
    const workflowDirs = [
      './design-workflows',
      './workflow-diagrams',
      './src/core/generators'
    ];
    
    const workflowFiles = [
      `${workflow}.mmd`,
      `${workflow}.html`,
      `${workflow}.ts`
    ];
    
    // Check for workflow files in common directories
    for (const dir of workflowDirs) {
      if (!fs.existsSync(dir)) continue;
      
      for (const file of workflowFiles) {
        if (fs.existsSync(path.join(dir, file))) {
          return true;
        }
      }
    }
    
    return false;
  }

  private async syncWorkflowPair(connection: WorkflowConnection): Promise<void> {
    console.log(`🔄 Syncing ${connection.source} → ${connection.target}`);
    
    let sourceData: any = {};
    let targetData: any = {};
    
    // Get data from source workflow
    if (projectWorkflows[connection.source]) {
      // This is a ProjectPhaseWorkflow
      sourceData = {
        type: 'project-phase',
        workflow: projectWorkflows[connection.source],
        status: 'active'
      };
    } else {
      // Check for file-based workflow
      sourceData = this.readWorkflowFileData(connection.source);
    }
    
    // Get data from target workflow
    if (projectWorkflows[connection.target]) {
      // This is a ProjectPhaseWorkflow
      targetData = {
        type: 'project-phase',
        workflow: projectWorkflows[connection.target],
        status: 'awaiting-sync'
      };
    } else {
      // Check for file-based workflow
      targetData = this.readWorkflowFileData(connection.target);
    }
    
    // Create sync record
    const syncRecord = {
      timestamp: new Date().toISOString(),
      source: connection.source,
      target: connection.target,
      connectionType: connection.type,
      data: {
        sourceType: sourceData.type || 'unknown',
        targetType: targetData.type || 'unknown',
        itemsSynced: Object.keys(sourceData).length,
        syncStatus: 'completed'
      }
    };
    
    // Save sync log
    const syncDir = './workflow-sync-logs';
    if (!fs.existsSync(syncDir)) {
      fs.mkdirSync(syncDir, { recursive: true });
    }
    
    const syncFile = path.join(
      syncDir,
      `sync-${connection.source}-${connection.target}-${Date.now()}.json`
    );
    
    fs.writeFileSync(syncFile, JSON.stringify(syncRecord, null, 2), 'utf8');
    
    // Update workflow status
    this.updateWorkflowStatus(connection.source, 'synced');
    this.updateWorkflowStatus(connection.target, 'updated');
    
    // If both are project phase workflows, execute any dependencies
    if (sourceData.type === 'project-phase' && targetData.type === 'project-phase') {
      await this.syncProjectPhaseWorkflows(connection.source, connection.target);
    }
  }

  private async syncProjectPhaseWorkflows(sourceId: string, targetId: string): Promise<void> {
    console.log(`🎯 Syncing project phase workflows: ${sourceId} → ${targetId}`);
    
    // Get the workflows
    const sourceWorkflow = projectWorkflows[sourceId];
    const targetWorkflow = projectWorkflows[targetId];
    
    if (!sourceWorkflow || !targetWorkflow) {
      throw new Error('One or both workflows not found');
    }
    
    // Check if source is a dependency of target
    if (targetWorkflow.dependencies.includes(sourceId)) {
      console.log(`✓ ${sourceId} is a dependency of ${targetId}`);
      
      // Execute the source workflow if needed
      if (this.projectPhaseManager) {
        console.log(`🚀 Executing ${sourceId} to satisfy dependency...`);
        
        try {
          const result = await this.projectPhaseManager.executePhase(sourceId);
          if (result.success) {
            console.log(`✅ ${sourceId} executed successfully`);
            
            // Now check if target can be executed
            console.log(`🔄 Checking if ${targetId} can be executed...`);
            
            // In a real implementation, this would check the actual dependency chain
            const allDependenciesMet = targetWorkflow.dependencies.every(dep => 
              this.projectPhaseManager?.workflowHistory.includes(dep)
            );
            
            if (allDependenciesMet) {
              console.log(`✨ All dependencies met for ${targetId}`);
            } else {
              console.log(`⚠️ Other dependencies missing for ${targetId}`);
            }
          }
        } catch (error) {
          console.error(`❌ Failed to execute ${sourceId}:`, error);
        }
      }
    }
  }

  private readWorkflowFileData(workflow: string): any {
    // Try to read workflow data from files
    const possibleFiles = [
      `./design-workflows/${workflow}/status.json`,
      `./workflow-diagrams/${workflow}.json`,
      `./workflow-sync-logs/latest-${workflow}.json`
    ];
    
    for (const filePath of possibleFiles) {
      if (fs.existsSync(filePath)) {
        try {
          return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch {
          continue;
        }
      }
    }
    
    return { name: workflow, lastUpdated: new Date().toISOString() };
  }

  private updateWorkflowStatus(workflow: string, status: string): void {
    // For project phase workflows, update their last sync time
    if (projectWorkflows[workflow]) {
      // Update the workflow's updatedAt timestamp
      projectWorkflows[workflow].updatedAt = new Date();
    }
    
    // Also update file-based status if it exists
    const statusDir = `./design-workflows/${workflow}`;
    if (fs.existsSync(statusDir)) {
      const statusFile = path.join(statusDir, 'status.json');
      const currentStatus = this.readWorkflowFileData(workflow);
      
      fs.writeFileSync(
        statusFile,
        JSON.stringify({
          ...currentStatus,
          status,
          lastSync: new Date().toISOString(),
          connectorSync: true
        }, null, 2),
        'utf8'
      );
    }
  }

  async listProjectPhaseWorkflows(): Promise<void> {
    console.log('📋 Project Phase Workflows:\n');
    
    Object.entries(projectWorkflows).forEach(([id, workflow]) => {
      console.log(`${id}:`);
      console.log(`  Name: ${workflow.name}`);
      console.log(`  Description: ${workflow.description}`);
      console.log(`  Category: ${workflow.phaseCategory}`);
      console.log(`  Estimated Time: ${workflow.roadmapRequirements.estimatedTime} minutes`);
      console.log(`  Dependencies: ${workflow.dependencies.length > 0 ? workflow.dependencies.join(', ') : 'None'}`);
      console.log(`  Priority: ${workflow.priority}`);
      console.log();
    });
  }

  async executeConnectedWorkflows(startPhase: string): Promise<void> {
    console.log(`🚀 Executing connected workflows starting from: ${startPhase}`);
    
    if (!projectWorkflows[startPhase]) {
      console.error(`❌ Workflow ${startPhase} not found`);
      return;
    }
    
    // Find all workflows connected to this one
    const connectedWorkflows = this.findConnectedWorkflows(startPhase);
    
    if (connectedWorkflows.length === 0) {
      console.log(`ℹ️ No connections found for ${startPhase}`);
      await this.executeWorkflowPhase(startPhase);
      return;
    }
    
    console.log(`🔗 Found ${connectedWorkflows.length} connected workflows:`);
    connectedWorkflows.forEach(wf => console.log(`  - ${wf}`));
    
    // Execute in dependency order
    const executionOrder = this.calculateExecutionOrder(startPhase, connectedWorkflows);
    
    console.log(`\n📋 Execution Order:`);
    executionOrder.forEach((phase, index) => {
      console.log(`  ${index + 1}. ${phase}`);
    });
    
    // Execute in order
    console.log('\n🚀 Starting execution...');
    for (const phaseId of executionOrder) {
      await this.executeWorkflowPhase(phaseId);
    }
  }

  private findConnectedWorkflows(startPhase: string): string[] {
    const connected = new Set<string>();
    
    // Find all workflows that are connected to startPhase
    this.connections.forEach(conn => {
      if (conn.source === startPhase) {
        connected.add(conn.target);
      }
      if (conn.target === startPhase) {
        connected.add(conn.source);
      }
    });
    
    // Add dependencies from projectWorkflows
    if (projectWorkflows[startPhase]) {
      projectWorkflows[startPhase].dependencies.forEach(dep => {
        connected.add(dep);
      });
    }
    
    return Array.from(connected);
  }

  private calculateExecutionOrder(startPhase: string, connectedWorkflows: string[]): string[] {
    const order: string[] = [startPhase];
    
    // Simple topological sort (simplified)
    const visited = new Set<string>();
    visited.add(startPhase);
    
    const remaining = [...connectedWorkflows];
    
    while (remaining.length > 0) {
      for (let i = 0; i < remaining.length; i++) {
        const workflow = remaining[i];
        
        // Check if dependencies are satisfied
        const dependencies = projectWorkflows[workflow]?.dependencies || [];
        const depsSatisfied = dependencies.every(dep => visited.has(dep));
        
        if (depsSatisfied || dependencies.length === 0) {
          order.push(workflow);
          visited.add(workflow);
          remaining.splice(i, 1);
          i--; // Adjust index after removal
        }
      }
    }
    
    return order;
  }

  private async executeWorkflowPhase(phaseId: string): Promise<void> {
    console.log(`\n🎯 Executing: ${phaseId}`);
    
    if (!this.projectPhaseManager) {
      throw new Error('ProjectPhaseManager not initialized');
    }
    
    try {
      const result = await this.projectPhaseManager.executePhase(phaseId);
      
      if (result.success) {
        console.log(`✅ ${phaseId} completed successfully`);
        console.log(`   Duration: ${result.duration} minutes`);
        
        if (result.nextPhase) {
          console.log(`   Next Phase: ${result.nextPhase}`);
        }
      } else {
        console.error(`❌ ${phaseId} failed: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ Failed to execute ${phaseId}:`, error);
    }
  }

  private async generateConnectionVisualization(): Promise<void> {
    if (this.connections.length === 0) return;
    
    const mermaidFlow = this.generateMermaidFlow();
    const html = this.generateConnectionHTML(mermaidFlow);
    
    const outputDir = './workflow-connections';
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    fs.writeFileSync(
      path.join(outputDir, 'connections.html'),
      html,
      'utf8'
    );
    
    console.log(`📊 Connection visualization generated: ${path.join(outputDir, 'connections.html')}`);
  }

  private generateMermaidFlow(): string {
    const nodes = new Set<string>();
    const links = this.connections.map(conn => {
      nodes.add(conn.source);
      nodes.add(conn.target);
      return { source: conn.source, target: conn.target, type: conn.type };
    });
    
    // Add project phase workflows
    Object.keys(projectWorkflows).forEach(workflow => {
      nodes.add(workflow);
    });
    
    let mermaid = 'flowchart TD\n';
    
    // Add nodes with styling
    Array.from(nodes).forEach(node => {
      const isProjectPhase = projectWorkflows[node];
      const style = isProjectPhase ? 'fill:#e3f2fd,stroke:#2196F3,stroke-width:2px' : 'fill:#f5f5f5,stroke:#9e9e9e';
      mermaid += `    ${node.replace(/-/g, '_')}[${node}]\n`;
      mermaid += `    style ${node.replace(/-/g, '_')} ${style}\n`;
    });
    
    // Add connections
    links.forEach(link => {
      const lineStyle = link.type === 'dependency' ? '-.->' : '-->';
      mermaid += `    ${link.source.replace(/-/g, '_')} ${lineStyle} ${link.target.replace(/-/g, '_')}\n`;
    });
    
    return mermaid;
  }

  private generateConnectionHTML(mermaidFlow: string): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Workflow Connections</title>
    <script type="module">
        import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.esm.min.mjs';
        mermaid.initialize({ startOnLoad: true });
    </script>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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
        }
        .mermaid-container {
            min-height: 600px;
            margin: 20px 0;
        }
        .connection-list {
            margin-top: 30px;
        }
        .connection-item {
            background: #f8f9fa;
            padding: 15px;
            margin: 10px 0;
            border-radius: 8px;
            border-left: 4px solid #2196F3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔗 Workflow Connections</h1>
            <p>Total: ${this.connections.length} connections | Project Phase Workflows: ${Object.keys(projectWorkflows).length}</p>
        </div>
        
        <div class="mermaid-container">
            <div class="mermaid">
${mermaidFlow}
            </div>
        </div>
        
        <div class="connection-list">
            <h2>Active Connections</h2>
            ${this.connections.filter(c => c.status === 'active').map(conn => `
            <div class="connection-item">
                <strong>${conn.source} → ${conn.target}</strong>
                <p>Type: ${conn.type} | Status: ${conn.status}</p>
                <p>Last Updated: ${new Date(conn.lastUpdated).toLocaleString()}</p>
            </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  private loadConnections(): void {
    if (fs.existsSync(this.CONFIG_FILE)) {
      try {
        const data = JSON.parse(fs.readFileSync(this.CONFIG_FILE, 'utf8'));
        this.connections = data.connections.map((conn: any) => ({
          ...conn,
          lastUpdated: new Date(conn.lastUpdated)
        }));
      } catch (error) {
        console.error('Error loading connections:', error);
      }
    }
  }

  private saveConnections(): void {
    const data = {
      connections: this.connections,
      lastUpdated: new Date().toISOString(),
      projectPhaseWorkflows: Object.keys(projectWorkflows)
    };
    
    fs.writeFileSync(
      this.CONFIG_FILE,
      JSON.stringify(data, null, 2),
      'utf8'
    );
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  const connector = new WorkflowConnector();
  
  switch (command) {
    case 'connect':
      const source = args[1];
      const target = args[2];
      const type = args[3] as 'data-flow' | 'dependency' | 'handoff' || 'data-flow';
      
      if (!source || !target) {
        console.error('Usage: pnpm workflow:connect <source> <target> [type]');
        console.error('Type: data-flow (default), dependency, handoff');
        process.exit(1);
      }
      
      await connector.connect(source, target, type);
      break;
      
    case 'sync':
      await connector.syncAll();
      break;
      
    case 'list':
      console.log('📋 Connected Workflows:');
      connector['connections'].forEach((conn: WorkflowConnection, index: number) => {
        console.log(`${index + 1}. ${conn.source} → ${conn.target} [${conn.status}]`);
      });
      break;
      
    case 'list-phases':
      await connector.listProjectPhaseWorkflows();
      break;
      
    case 'execute-chain':
      const startPhase = args[1];
      if (!startPhase) {
        console.error('Usage: pnpm workflow:execute-chain <phase-id>');
        process.exit(1);
      }
      await connector.executeConnectedWorkflows(startPhase);
      break;
      
    default:
      console.log(`
🔗 Workflow Connector - Integrated with ProjectPhaseWorkflowManager

Available Commands:
  pnpm workflow:connect <source> <target> [type]   - Connect two workflows
  pnpm workflow:sync                              - Sync all connected workflows
  pnpm workflow:list                              - List connections
  pnpm workflow:list-phases                       - List project phase workflows
  pnpm workflow:execute-chain <phase-id>          - Execute connected workflows

Connection Types:
  data-flow   - Data flows from source to target
  dependency  - Target depends on source
  handoff     - Work is handed off from source to target

Project Phase Workflows:
  These are managed by ProjectPhaseWorkflowManager and include:
  phase-0-roadmap, phase-1-discovery, phase-2-planning,
  phase-3-execution, phase-4-qa, phase-5-deployment

Examples:
  pnpm workflow:connect phase-0-roadmap phase-1-discovery dependency
  pnpm workflow:connect phase-3-execution phase-4-qa handoff
  pnpm workflow:execute-chain phase-0-roadmap
  pnpm workflow:list-phases
      `);
      break;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { WorkflowConnector };