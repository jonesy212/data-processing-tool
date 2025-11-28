// route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get('accessToken');

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Get sites/user info from Wix
    const response = await fetch('https://api.wix.com/v1/sites', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch sites');

    const sitesData = await response.json();

    return NextResponse.json({
      success: true,
      sites: sitesData.sites || [],
      user: sitesData.user
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to fetch sites: ' + error.message },
      { status: 500 }
    );
  }
}

// POST - Create new site
export async function POST(request: NextRequest) {
  try {
    const { accessToken, siteData } = await request.json();

    const response = await fetch('https://api.wix.com/v1/sites', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(siteData),
    });

    if (!response.ok) throw new Error('Failed to create site');

    const newSite = await response.json();

    return NextResponse.json({
      success: true,
      site: newSite,
      message: 'Site created successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Site creation failed: ' + error.message },
      { status: 500 }
    );
  }
}