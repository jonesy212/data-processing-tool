// route.ts
// app/api/apiKey/[key]/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params;
    
    // Crypto exchange keys
    const cryptoKeys = {
      binance: process.env.BINANCE_API_KEY,
      coinbase: process.env.COINBASE_API_KEY,
      kraken: process.env.KRAKEN_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
    };
    
    // Project phase configuration keys
    const phaseKeys = {
      'ideation-phase': process.env.IDEATION_CONFIG_KEY,
      'team-creation-phase': process.env.TEAM_CREATION_CONFIG_KEY,
      'product-brainstorming-phase': process.env.BRAINSTORMING_CONFIG_KEY,
      'product-launch-phase': process.env.LAUNCH_CONFIG_KEY,
      'data-analysis-phase': process.env.DATA_ANALYSIS_CONFIG_KEY,
    };
    
    // Communication service keys
    const communicationKeys = {
      'audio-service': process.env.AUDIO_SERVICE_KEY,
      'video-service': process.env.VIDEO_SERVICE_KEY,
      'chat-service': process.env.CHAT_SERVICE_KEY,
      'collaboration-service': process.env.COLLABORATION_SERVICE_KEY,
    };
    
    // Combine all key types
    const allKeys = {
      ...cryptoKeys,
      ...phaseKeys,
      ...communicationKeys,
      // Add more categories as needed
    };
    
    if (!(key in allKeys)) {
      return NextResponse.json(
        { error: `API key type '${key}' not found` },
        { status: 404 }
      );
    }
    
    const value = allKeys[key as keyof typeof allKeys];
    
    if (!value) {
      return NextResponse.json(
        { error: `API key for '${key}' is not configured` },
        { status: 404 }
      );
    }
    
    // Return masked key for security (show only first few characters)
    const maskedKey = value.substring(0, 8) + '...';
    
    return NextResponse.json({ 
      keyType: key,
      value: maskedKey,
      configured: true,
      lastUpdated: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error reading API key:', error);
    return NextResponse.json(
      { error: 'Failed to read API key configuration' },
      { status: 500 }
    );
  }
}