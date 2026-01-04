assign.ts
import DatabaseClient from '@/core/api/DatabaseClient';
import { databaseConnection } from '@/core/config/databaseConnection'; // Import the renamed config
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { teamId, projectId, assignedDate } = await request.json();
    
    const dbClient = new DatabaseClient(databaseConnection);  // Use databaseConnection
    await dbClient.connect();
    
    // Database logic for assigning project
    await dbClient.update("teams", teamId, { 
      $push: { projects: projectId } 
    });
    
    await dbClient.close();
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to assign project' }, { status: 500 });
  }
}


