// route.ts
// /src/app/api/snapshots/[snapshotId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import DatabaseClient from '@/app/lib/server/DatabaseClient';
import databaseConfig from '@/app/lib/server/database/config';

export async function PUT(
  request: NextRequest,
  { params }: { params: { snapshotId: string } }
) {
  try {
    const { snapshotId } = params;
    const { snapshotData, events, snapshotStore, dataItems, newData, updatedPayload } = await request.json();
    
    const dbClient = new DatabaseClient(databaseConfig);
    await dbClient.connect();
    
    // Update snapshot in database
    await dbClient.update("snapshots", snapshotId, {
      data: snapshotData,
      events,
      ...updatedPayload,
      updatedAt: new Date()
    });
    
    await dbClient.close();
    
    return NextResponse.json({ 
      success: true, 
      snapshotId,
      message: 'Snapshot updated successfully',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Snapshot update error:', error);
    return NextResponse.json({ 
      error: 'Failed to update snapshot',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Also support POST for create/update
export async function POST(
  request: NextRequest,
  { params }: { params: { snapshotId: string } }
) {
  // Similar logic but for POST requests
  return PUT(request, { params });
}