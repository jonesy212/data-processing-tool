import { NextRequest, NextResponse } from 'next/server';
import { processTradesServerAPI } from '@/app/exchangeIntegrationServer';

export async function POST(request: NextRequest) {
  try {
    const { trades, type, data } = await request.json();
    
    if (type === 'TRADES') {
      await processTradesServerAPI(trades);
      return NextResponse.json({ success: true, message: 'Trades processed' });
    }
    
    return NextResponse.json({ success: false, message: 'Unsupported operation' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}