// app/api/generate-cache/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateCacheLogic } from '@/app/utils/GenerateCacheLogic';

export async function POST(request: NextRequest) {
  try {
    // Extract any parameters from the request if needed
    const body = await request.json();
    
    // Call your existing GenerateCache logic
    const result = await generateCacheLogic(body);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Cache generated successfully',
      result 
    });
  } catch (error) {
    console.error('Error generating cache:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate cache' },
      { status: 500 }
    );
  }
}