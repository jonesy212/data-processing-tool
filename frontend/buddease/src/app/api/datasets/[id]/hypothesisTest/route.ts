
// src/app/api/datasets/[id]/hypothesis-test/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { runHypothesisTest } from '@/app/utils/hypothesisTesting'
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { testType, hypothesisParameters } = body;
    
    // Your hypothesis testing logic
    const testResult = await runHypothesisTest(params.id, testType, hypothesisParameters);
    
    return NextResponse.json({ 
      success: true, 
      testResult 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Hypothesis test failed' }, { status: 500 });
  }
}