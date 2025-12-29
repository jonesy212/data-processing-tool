// route.ts
// app/api/teams/route.ts
import { DatabaseClient } from '@/core/api/DatabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamId = searchParams.get('teamId');
    const action = searchParams.get('action');
    
    const dbClient = new DatabaseClient();
    await dbClient.connect();
    
    if (action === 'reassignment-history') {
      const projectId = searchParams.get('projectId');
      if (!projectId) {
        return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
      }
      
      const history = await dbClient.getReassignmentHistory(projectId);
      return NextResponse.json({ success: true, data: { history } });
    }
    
    if (action === 'progress') {
      if (!teamId) {
        return NextResponse.json({ error: 'Team ID is required' }, { status: 400 });
      }
      
      const progress = await dbClient.getTeamProgress(teamId);
      return NextResponse.json({ success: true, data: { progress } });
    }
    
    // Default: get team(s)
    if (teamId) {
      const team = await dbClient.getTeamById(teamId);
      return NextResponse.json({ success: true, data: { team } });
    } else {
      const teams = await dbClient.getAllTeams();
      return NextResponse.json({ success: true, data: { teams } });
    }
  } catch (error) {
    console.error('Error in teams API:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;
    
    const dbClient = new DatabaseClient();
    await dbClient.connect();
    
    switch (action) {
      case 'reassign-project':
        const { newTeamId, projectId, previousTeamId, reassignmentDate } = body;
        await dbClient.reassignProject(newTeamId, projectId, previousTeamId, new Date(reassignmentDate));
        return NextResponse.json({ 
          success: true, 
          message: `Project reassigned successfully` 
        });
        
      case 'assign-project':
        const { teamId, projectId: assignProjectId } = body;
        await dbClient.assignProjectToTeam(teamId, assignProjectId);
        return NextResponse.json({ 
          success: true, 
          message: `Project assigned to team successfully` 
        });
        
      case 'unassign-project':
        const { teamId: unassignTeamId, projectId: unassignProjectId } = body;
        await dbClient.unassignProjectFromTeam(unassignTeamId, unassignProjectId);
        return NextResponse.json({ 
          success: true, 
          message: `Project unassigned from team successfully` 
        });
        
      case 'update-progress':
        const { teamId: progressTeamId, projectUpdates } = body;
        const progress = await dbClient.updateTeamProgress(progressTeamId, projectUpdates);
        return NextResponse.json({ 
          success: true, 
          data: { progress } 
        });
        
      case 'bulk-assign':
        const { teamId: bulkTeamId, projectIds } = body;
        await dbClient.bulkAssignProjects(bulkTeamId, projectIds);
        return NextResponse.json({ 
          success: true, 
          message: `Projects bulk assigned successfully` 
        });
        
      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in teams API POST:', error);
    return NextResponse.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}