import { NextResponse } from 'next/server';
import { ensureFlapEnvLoaded, getApiConfig } from '@/lib/server/env';
import { runPlaygroundLocal, runPlaygroundRemote } from '@/lib/server/runtime';
import type { PlaygroundRequest } from '@/lib/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  ensureFlapEnvLoaded();

  let payload: PlaygroundRequest;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        mode: 'local',
        error: 'Invalid JSON body'
      },
      { status: 400 }
    );
  }

  if (!payload?.skillId) {
    return NextResponse.json(
      {
        success: false,
        mode: 'local',
        error: 'skillId is required'
      },
      { status: 400 }
    );
  }

  const config = getApiConfig();
  const remoteBase = String(payload.apiBase || config.apiBase || '').trim();

  if (remoteBase) {
    const result = await runPlaygroundRemote(payload, {
      apiBase: remoteBase,
      apiPath: String(payload.apiPath || config.apiPath || '/skills/run'),
      apiKey: String(payload.apiKey || config.apiKey || ''),
      model: config.model
    });

    return NextResponse.json(result, { status: 200 });
  }

  const local = await runPlaygroundLocal(payload);
  return NextResponse.json(local, { status: 200 });
}
