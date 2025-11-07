// app/api/teams/reassignProject/route.ts
import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/api/DatabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { teamId, projectId, previousTeamId, reassignmentDate } = await request.json();
    
    const dbClient = new DatabaseClient();
    await dbClient.connect();
    
    // Persist the reassignment to database
    await dbClient.reassignProject(teamId, projectId, previousTeamId, reassignmentDate);
    
    return NextResponse.json({ 
      success: true,
      message: `Project ${projectId} reassigned from team ${previousTeamId} to team ${teamId}`
    });
  } catch (error) {
    console.error('Error reassigning project:', error);
    return NextResponse.json({ 
      error: 'Failed to reassign project',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}