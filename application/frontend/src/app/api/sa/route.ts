import { NextRequest, NextResponse } from 'next/server';

interface Attempt {
  count: number;
  firstAt: number;
  blockedUntil?: number;
}

const attempts = new Map<string, Attempt>();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 60 * 60 * 1000; // 1 hour lockout for analytics (stricter)

function getIP(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec?: number } {
  const now = Date.now();
  const record = attempts.get(ip);

  if (record?.blockedUntil) {
    if (now < record.blockedUntil) {
      return { allowed: false, retryAfterSec: Math.ceil((record.blockedUntil - now) / 1000) };
    }
    attempts.delete(ip);
  }

  if (record && now - record.firstAt < WINDOW_MS) {
    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = now + LOCKOUT_MS;
      return { allowed: false, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
    }
  } else if (record && now - record.firstAt >= WINDOW_MS) {
    attempts.delete(ip);
  }

  return { allowed: true };
}

function recordFailure(ip: string) {
  const now = Date.now();
  const record = attempts.get(ip);
  if (!record || now - record.firstAt >= WINDOW_MS) {
    attempts.set(ip, { count: 1, firstAt: now });
  } else {
    record.count++;
  }
}

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  const { allowed, retryAfterSec } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil((retryAfterSec || 3600) / 60)} minutes.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSec) } },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { password } = body;

  const correctPassword = process.env.ANALYTICS_PASSWORD;
  if (!correctPassword) {
    return NextResponse.json({ error: 'Not configured' }, { status: 500 });
  }

  if (password !== correctPassword) {
    recordFailure(ip);
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  attempts.delete(ip);

  const secret = process.env.COOKIE_SECRET || 'default-dev-secret';
  const token = Buffer.from(`analytics-${secret}`).toString('base64url');

  const response = NextResponse.json({ success: true });
  response.cookies.set('analytics-auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
