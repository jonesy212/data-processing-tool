// complete/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { serverConfigService } from '@/app/server/ServerConfigurationService';

export async function GET(request: NextRequest) {
  try {
    const completeConfig = serverConfigService.getCompleteConfiguration();
    return NextResponse.json(completeConfig);
  } catch (error) {
    console.error('Error getting complete config:', error);
    return NextResponse.json(
      { error: 'Failed to get complete configuration' },
      { status: 500 }
    );
  }
}