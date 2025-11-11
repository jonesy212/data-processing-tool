
// src/app/api/datasets/[id]/hypothesis-test/route.ts
import { runHypothesisTest } from '@/utils/hypothesisTesting';
import { NextRequest, NextResponse } from 'next/server';
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