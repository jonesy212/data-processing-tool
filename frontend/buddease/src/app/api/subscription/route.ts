import { NextRequest, NextResponse } from 'next/server';
import { manageSubscriptionsServer } from '../exchangeIntegrationServer';

import { NextRequest, NextResponse } from 'next/server';
import { getSubscriberId, getSubscribersAPI } from '../subscriberApi';
import { manageSubscriptionsServer } from '../exchangeIntegrationServer';

export async function POST(request: NextRequest) {
  try {
    const { action, subscriberData, trades, type, data } = await request.json();
    
    switch (action) {
      case 'getSubscriberId':
        const subscriberId = getSubscriberId(subscriberData);
        return NextResponse.json({ success: true, subscriberId });
        
      case 'manageSubscription':
        const subscriptionResult = await manageSubscriptionsServer(subscriberData);
        return NextResponse.json({ success: true, data: subscriptionResult });
        
      case 'processTrades':
        if (type === 'TRADES') {
          await processTradesServer(trades);
          return NextResponse.json({ success: true, message: 'Trades processed' });
        }
        return NextResponse.json({ success: false, message: 'Unsupported operation' });
        
      default:
        return NextResponse.json({ success: false, message: 'Unknown action' });
    }
  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process subscription action' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const subscriberId = searchParams.get('subscriberId');
    
    switch (action) {
      case 'getSubscribers':
        const subscribers = await getSubscribersAPI();
        return NextResponse.json({ success: true, subscribers });
        
      case 'getSubscriber':
        // Implementation to get specific subscriber by ID
        const subscriber = await getSubscriberById(subscriberId);
        return NextResponse.json({ success: true, subscriber });
        
      default:
        const allSubscribers = await getSubscribersAPI();
        return NextResponse.json({ success: true, subscribers: allSubscribers });
    }
  } catch (error) {
    console.error('Subscription GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get subscription data' },
      { status: 500 }
    );
  }
}