// config.ts
route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const configPath = path.join(process.cwd(), 'config.json');
    
    if (!fs.existsSync(configPath)) {
      return NextResponse.json(
        { error: 'Config file not found' },
        { status: 404 }
      );
    }

    const rawData = fs.readFileSync(configPath, 'utf-8');
    const config = JSON.parse(rawData);
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error reading config:', error);
    return NextResponse.json(
      { error: 'Failed to read configuration' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const configData = await request.json();
    const configPath = path.join(process.cwd(), 'config.json');
    
    // Ensure directory exists
    await fs.promises.mkdir(path.dirname(configPath), { recursive: true });
    
    // Write config file
    await fs.promises.writeFile(configPath, JSON.stringify(configData, null, 2), 'utf-8');
    
    return NextResponse.json({ success: true, message: 'Config updated successfully' });
  } catch (error) {
    console.error('Error writing config:', error);
    return NextResponse.json(
      { error: 'Failed to update configuration' },
      { status: 500 }
    );
  }
}