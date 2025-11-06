import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: "healthy",
    message: "FarmOracle API is running",
    tagline: "Africa's Autonomous AI Farming Oracle on the Blockchain",
    version: "1.0.0",
    hackathon: "Africa Blockchain Festival 2025",
    timestamp: new Date().toISOString()
  });
}