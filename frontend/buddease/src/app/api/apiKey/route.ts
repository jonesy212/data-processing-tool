// app/api/config/[key]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  try {
    const { key } = params;
    const configPath = path.join(process.cwd(), 'config.json');
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { error: 'Config file not found' },
        { status: 404 }
      );
    }

    const rawData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(rawData);
    
    if (!(key in config)) {
      return NextResponse.json(
        { error: `Config key '${key}' not found` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ [key]: config[key] });
  } catch (error) {
    console.error('Error reading config key:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}