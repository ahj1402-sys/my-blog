export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server';

export async function GET() {
  const requiredEnvVars = [
    'DATABASE_URL',
    'GEMINI_API_KEY', 
    'NEXT_PUBLIC_SITE_URL',
    'ADMIN_PASSWORD'
  ];

  const envStatus = requiredEnvVars.map(envVar => ({
    name: envVar,
    exists: !!process.env[envVar],
    value: process.env[envVar] ? '✅ Set' : '❌ Missing'
  }));

  const allSet = envStatus.every(env => env.exists);

  return NextResponse.json({
    status: allSet ? 'OK' : 'MISSING_ENV_VARS',
    environment: process.env.NODE_ENV,
    envVars: envStatus,
    buildTime: new Date().toISOString()
  });
}