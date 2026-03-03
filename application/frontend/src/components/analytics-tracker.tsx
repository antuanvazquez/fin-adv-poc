'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

function getSessionId(): string {
  const key = '_sid';
  let sid = document.cookie.match(new RegExp(`${key}=([^;]+)`))?.[1];
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    document.cookie = `${key}=${sid};path=/;max-age=${60 * 60 * 24 * 365};SameSite=Strict`;
  }
  return sid;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad/i.test(ua)) return 'tablet';
  if (/mobile|iphone|android.*mobile/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
  return 'Other';
}

function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Linux')) return 'Linux';
  return 'Other';
}

function send(data: Record<string, unknown>) {
  const payload = JSON.stringify(data);
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/t', payload);
  } else {
    fetch('/api/t', { method: 'POST', body: payload, keepalive: true });
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const startRef = useRef(Date.now());
  const pathRef = useRef(pathname);

  useEffect(() => {
    const sid = getSessionId();
    const screen = `${window.screen.width}x${window.screen.height}`;

    send({
      t: 'pv',
      sid,
      p: pathname,
      r: document.referrer || null,
      dt: getDeviceType(),
      br: getBrowser(),
      os: getOS(),
      sc: screen,
    });

    startRef.current = Date.now();
    pathRef.current = pathname;

    const heartbeat = setInterval(() => {
      send({
        t: 'hb',
        sid,
        p: pathRef.current,
        d: Date.now() - startRef.current,
      });
    }, 15000);

    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        send({
          t: 'hb',
          sid,
          p: pathRef.current,
          d: Date.now() - startRef.current,
        });
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      send({
        t: 'hb',
        sid,
        p: pathRef.current,
        d: Date.now() - startRef.current,
      });
    };
  }, [pathname]);

  return null;
}
