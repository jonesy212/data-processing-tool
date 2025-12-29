// app/api/generate-cache/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generateCacheLogic, generateBatchCache } from '@/utils/GenerateCacheLogic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { operation, items, ...options } = body;

    let result;

    if (operation === 'batch' && Array.isArray(items)) {
      // Generate cache for multiple items
      result = await generateBatchCache(items, options);
    } else if (operation === 'single') {
      // Generate cache for single item
      result = await generateCacheLogic({
        data: body.data,
        cacheKey: body.cacheKey,
        config: body.config,
        metadata: body.metadata,
        forceRefresh: body.forceRefresh
      });
    } else {
      // Default single cache generation
      result = await generateCacheLogic(body);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Cache generated successfully',
      result 
    });
  } catch (error: any) {
    console.error('Error generating cache:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to generate cache',
        details: error.stack
      },
      { status: 500 }
    );
  }
}

// Additional endpoints for cache management
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cacheKey = searchParams.get('key');

    if (!cacheKey) {
      return NextResponse.json(
        { success: false, error: 'Cache key is required' },
        { status: 400 }
      );
    }

    // Call your invalidation logic
    // await invalidateCache(cacheKey);

    return NextResponse.json({ 
      success: true, 
      message: `Cache invalidated for key: ${cacheKey}` 
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}