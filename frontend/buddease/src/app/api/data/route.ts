import axios from 'axios';
import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.INTERNAL_API_URL || "/api/";

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

export async function GET() {
  try {
    const response = await axiosInstance.get('/data');
    return NextResponse.json(response.data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}