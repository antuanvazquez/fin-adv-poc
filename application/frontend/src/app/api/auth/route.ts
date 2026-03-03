import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password } = body;

  const correctPassword = process.env.PARTNER_PASSWORD;
  if (!correctPassword) {
    return NextResponse.json(
      { error: 'Server misconfigured' },
      { status: 500 },
    );
  }

  if (password !== correctPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  const secret = process.env.COOKIE_SECRET || 'default-dev-secret';
  const token = Buffer.from(secret).toString('base64url');

  const response = NextResponse.json({ success: true });
  response.cookies.set('partner-auth', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  return response;
}
