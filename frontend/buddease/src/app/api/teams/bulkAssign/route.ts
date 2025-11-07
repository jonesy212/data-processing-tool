import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/api/DatabaseClient';

export async function POST(request: NextRequest) {
  try {
    const { assignments } = await request.json();
    
    // Validate input
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid input: assignments must be a non-empty array'
      }, { status: 400 });
    }

    // Validate each assignment
    for (const assignment of assignments) {
      if (!assignment.teamId || !assignment.projectIds || !Array.isArray(assignment.projectIds)) {
        return NextResponse.json({ 
          error: 'Invalid assignment structure: each assignment must have teamId and projectIds array'
        }, { status: 400 });
      }
    }

    const dbClient = new DatabaseClient();
    await dbClient.connect();
    
    // Process bulk assignments
    const results = await dbClient.bulkAssignProjects(assignments);
    
    return NextResponse.json({ 
      success: true,
      message: `Successfully processed ${assignments.length} assignment(s)`,
      results: results
    });
  } catch (error) {
    console.error('Error in bulk assignment:', error);
    return NextResponse.json({ 
      error: 'Failed to process bulk assignments',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}