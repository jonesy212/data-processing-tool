import { NextRequest, NextResponse } from 'next/server';
import { processTradesServer } from '../exchangeIntegrationServer';

export async function POST(request: NextRequest) {
  try {
    const { trades, type, data } = await request.json();
    
    if (type === 'TRADES') {
      await processTradesServer(trades);
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