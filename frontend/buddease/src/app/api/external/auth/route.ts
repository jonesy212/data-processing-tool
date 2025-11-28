// route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const credentials = await request.json();
    const { clientId, clientSecret } = credentials;

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'Client ID and Client Secret are required' },
        { status: 400 }
      );
    }

    // Wix OAuth authentication
    const authUrl = 'https://www.wix.com/oauth/access';
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!response.ok) {
      throw new Error('Wix authentication failed');
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      accessToken: data.access_token,
      expiresIn: data.expires_in,
      tokenType: data.token_type
    });
  } catch (error: any) {
    console.error('Wix auth error:', error);
    return NextResponse.json(
      { error: 'Wix authentication failed: ' + error.message },
      { status: 500 }
    );
  }
}

// GET - Verify token or get auth status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Verify token with Wix
    const verifyResponse = await fetch('https://www.wix.com/oauth/verify', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const isValid = verifyResponse.ok;

    return NextResponse.json({
      success: true,
      isValid,
      message: isValid ? 'Token is valid' : 'Token is invalid'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Token verification failed: ' + error.message },
      { status: 500 }
    );
  }
}