import { NextResponse } from 'next/server';
import { loadCatalogPayload } from '@/lib/server/catalog';
import { ensureFlapEnvLoaded } from '@/lib/server/env';

export const runtime = 'nodejs';

export async function GET() {
  ensureFlapEnvLoaded();
  return NextResponse.json(loadCatalogPayload());
}
