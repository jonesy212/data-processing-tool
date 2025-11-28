// route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { shopUrl, apiKey, apiSecret, accessToken } = await request.json();

    if (!shopUrl) {
      return NextResponse.json(
        { error: 'Shop URL is required' },
        { status: 400 }
      );
    }

    // Shopify OAuth or token-based auth
    let authResponse;
    if (apiKey && apiSecret) {
      // OAuth flow
      authResponse = await fetch(`https://${shopUrl}/admin/oauth/access_token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: apiKey,
          client_secret: apiSecret,
          grant_type: 'client_credentials'
        }),
      });
    } else if (accessToken) {
      // Validate existing token
      authResponse = await fetch(`https://${shopUrl}/admin/api/2023-10/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
        },
      });
    } else {
      return NextResponse.json(
        { error: 'Either API key/secret or access token is required' },
        { status: 400 }
      );
    }

    if (!authResponse.ok) {
      throw new Error('Shopify authentication failed');
    }

    const data = await authResponse.json();

    return NextResponse.json({
      success: true,
      accessToken: data.access_token || accessToken,
      shop: data.shop,
      scope: data.scope
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Shopify authentication failed: ' + error.message },
      { status: 500 }
    );
  }
}

// GET - Install URL for OAuth
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shopUrl = searchParams.get('shopUrl');
    const apiKey = process.env.SHOPIFY_API_KEY;

    if (!shopUrl || !apiKey) {
      return NextResponse.json(
        { error: 'Shop URL and API key are required' },
        { status: 400 }
      );
    }

    const scopes = 'read_products,write_products,read_orders';
    const redirectUri = `${process.env.NEXTAUTH_URL}/api/external/shopify/callback`;
    const installUrl = `https://${shopUrl}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}`;

    return NextResponse.json({
      success: true,
      installUrl,
      message: 'Use this URL to install the app'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate install URL: ' + error.message },
      { status: 500 }
    );
  }
}