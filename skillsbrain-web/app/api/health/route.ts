import { NextResponse } from 'next/server';
import { ensureFlapEnvLoaded, getApiConfig, getEnvLoadStatus } from '@/lib/server/env';

export const runtime = 'nodejs';

export async function GET() {
  ensureFlapEnvLoaded();
  const env = getEnvLoadStatus();
  const api = getApiConfig();

  return NextResponse.json({
    status: 'ok',
    version: '0.2.0',
    envLoaded: env.loaded,
    envPath: env.path,
    apiConfigured: Boolean(api.apiBase),
    timestamp: new Date().toISOString(),
    warning: env.error || null
  });
}
