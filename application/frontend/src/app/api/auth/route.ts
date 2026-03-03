import { NextRequest, NextResponse } from 'next/server';

interface Attempt {
  count: number;
  firstAt: number;
  blockedUntil?: number;
}

// In-memory store — resets on cold start, good enough for deterrence.
// With multiple serverless instances each has its own counter, which is acceptable.
const attempts = new Map<string, Attempt>();

const WINDOW_MS = 15 * 60 * 1000;  // 15 minutes
const MAX_ATTEMPTS = 8;             // 8 wrong guesses
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minute lockout

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
    // Lockout expired — reset
    attempts.delete(ip);
  }

  if (record && now - record.firstAt < WINDOW_MS) {
    if (record.count >= MAX_ATTEMPTS) {
      record.blockedUntil = now + LOCKOUT_MS;
      return { allowed: false, retryAfterSec: Math.ceil(LOCKOUT_MS / 1000) };
    }
  } else if (record && now - record.firstAt >= WINDOW_MS) {
    // Window expired — reset
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

function clearRecord(ip: string) {
  attempts.delete(ip);
}

export async function POST(request: NextRequest) {
  const ip = getIP(request);
  const { allowed, retryAfterSec } = checkRateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: `Too many attempts. Try again in ${Math.ceil((retryAfterSec || 1800) / 60)} minutes.` },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfterSec) },
      },
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { password } = body;

  const correctPassword = process.env.PARTNER_PASSWORD;
  if (!correctPassword) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
  }

  if (password !== correctPassword) {
    recordFailure(ip);
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Success — clear any failed attempts from this IP
  clearRecord(ip);

  const secret = process.env.COOKIE_SECRET || 'default-dev-secret';
  const token = Buffer.from(secret).toString('base64url');

  const response = NextResponse.json({ success: true });
  response.cookies.set('partner-auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}
