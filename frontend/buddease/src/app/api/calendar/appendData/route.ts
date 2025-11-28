// route.ts
import { CalendarEvent } from '@/app/calendar/CalendarEvent';
import { NextRequest, NextResponse } from 'next/server';

// Define the event data type that matches your frontend

interface AppendDataRequest {
  event: CalendarEvent;
  // Add other fields if needed
  snapshotId?: string;
  userId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: AppendDataRequest = await request.json();
    const { event, snapshotId, userId } = body;

    // Validate required fields
    if (!event || !event.id || !event.title || !event.date) {
      return NextResponse.json(
        { error: 'Missing required event fields' },
        { status: 400 }
      );
    }

    // Validate date format
    if (isNaN(Date.parse(event.date))) {
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Save to your database
    // 2. Update your snapshot store
    // 3. Trigger any related business logic

    // Example database operation (replace with your actual DB logic)
    // const result = await prisma.calendarEvent.create({
    //   data: {
    //     id: event.id,
    //     title: event.title,
    //     date: new Date(event.date),
    //     description: event.description,
    //     category: event.category,
    //     priority: event.priority,
    //     metadata: event.metadata,
    //     snapshotId: snapshotId,
    //     userId: userId
    //   }
    // });

    // Example response with the created event
    const result = {
      id: event.id,
      title: event.title,
      date: event.date,
      // Include any server-generated fields
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Return success response
    return NextResponse.json(
      { 
        success: true, 
        message: 'Event appended successfully',
        data: result 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error in appendData API:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET method if you want to retrieve events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const snapshotId = searchParams.get('snapshotId');
    
    // Example: Fetch events from database
    // const events = await prisma.calendarEvent.findMany({
    //   where: snapshotId ? { snapshotId } : {},
    //   orderBy: { date: 'asc' }
    // });

    const events = []; // Replace with actual data fetch
    
    return NextResponse.json({ events });
    
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}