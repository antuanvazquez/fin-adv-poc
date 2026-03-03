import { NextRequest, NextResponse } from 'next/server';
import { insertEvent, updateHeartbeat } from '@/lib/analytics-db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const city = request.headers.get('x-vercel-ip-city') || null;
    const country = request.headers.get('x-vercel-ip-country') || null;

    if (body.t === 'pv') {
      await insertEvent({
        event_type: 'page_view',
        session_id: body.sid,
        path: body.p,
        referrer: body.r || undefined,
        device_type: body.dt || undefined,
        browser: body.br || undefined,
        os: body.os || undefined,
        screen: body.sc || undefined,
        city: city || undefined,
        country: country || undefined,
        duration_ms: 0,
        created_at: new Date().toISOString(),
      });
    } else if (body.t === 'hb') {
      await updateHeartbeat(body.sid, body.p, body.d || 0);
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
