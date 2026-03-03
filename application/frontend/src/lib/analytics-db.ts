import { put, head, list } from '@vercel/blob';

const BLOB_PATH = 'analytics/events.json';

export interface PageEvent {
  event_type: string;
  session_id: string;
  path: string;
  referrer?: string;
  device_type?: string;
  browser?: string;
  os?: string;
  screen?: string;
  city?: string;
  country?: string;
  duration_ms: number;
  created_at: string;
}

async function readEvents(): Promise<PageEvent[]> {
  try {
    const blobs = await list({ prefix: 'analytics/' });
    const match = blobs.blobs.find((b) => b.pathname === BLOB_PATH);
    if (!match) return [];
    const res = await fetch(match.url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function writeEvents(events: PageEvent[]) {
  await put(BLOB_PATH, JSON.stringify(events), {
    access: 'public',
    addRandomSuffix: false,
  });
}

export async function insertEvent(event: PageEvent) {
  const events = await readEvents();
  events.push(event);
  await writeEvents(events);
}

export async function updateHeartbeat(sessionId: string, path: string, durationMs: number) {
  const events = await readEvents();
  for (let i = events.length - 1; i >= 0; i--) {
    if (events[i].session_id === sessionId && events[i].path === path && events[i].event_type === 'page_view') {
      events[i].duration_ms = durationMs;
      break;
    }
  }
  await writeEvents(events);
}

export async function ensureTable() {
  const existing = await head(BLOB_PATH).catch(() => null);
  if (!existing) {
    await writeEvents([]);
  }
}

// ── Dashboard queries ──

export async function getOverviewStats(days: number = 30) {
  const events = await readEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = events.filter((e) => e.event_type === 'page_view' && e.created_at > cutoff);

  const sessions = new Set(views.map((v) => v.session_id));
  const pages = new Set(views.map((v) => v.path));
  const avgDuration = views.length > 0 ? views.reduce((s, v) => s + (v.duration_ms || 0), 0) / views.length / 1000 : 0;

  return {
    total_views: views.length,
    total_sessions: sessions.size,
    unique_pages: pages.size,
    avg_duration_sec: Math.round(avgDuration * 10) / 10,
  };
}

export async function getPageViews(days: number = 30) {
  const events = await readEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = events.filter((e) => e.event_type === 'page_view' && e.created_at > cutoff);

  const byPath = new Map<string, { views: number; sessions: Set<string>; totalDuration: number }>();
  for (const v of views) {
    const entry = byPath.get(v.path) || { views: 0, sessions: new Set<string>(), totalDuration: 0 };
    entry.views++;
    entry.sessions.add(v.session_id);
    entry.totalDuration += v.duration_ms || 0;
    byPath.set(v.path, entry);
  }

  return Array.from(byPath.entries())
    .map(([path, d]) => ({
      path,
      views: d.views,
      unique_sessions: d.sessions.size,
      avg_seconds: Math.round((d.totalDuration / d.views / 1000) * 10) / 10,
    }))
    .sort((a, b) => b.views - a.views);
}

export async function getDailyViews(days: number = 30) {
  const events = await readEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = events.filter((e) => e.event_type === 'page_view' && e.created_at > cutoff);

  const byDay = new Map<string, { views: number; sessions: Set<string> }>();
  for (const v of views) {
    const day = v.created_at.slice(0, 10);
    const entry = byDay.get(day) || { views: 0, sessions: new Set<string>() };
    entry.views++;
    entry.sessions.add(v.session_id);
    byDay.set(day, entry);
  }

  return Array.from(byDay.entries())
    .map(([day, d]) => ({ day, views: d.views, sessions: d.sessions.size }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

export async function getDeviceBreakdown(days: number = 30) {
  const events = await readEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = events.filter((e) => e.event_type === 'page_view' && e.created_at > cutoff);

  const key = (v: PageEvent) => `${v.device_type || 'Unknown'}|${v.browser || 'Unknown'}|${v.os || 'Unknown'}`;
  const counts = new Map<string, number>();
  for (const v of views) {
    const k = key(v);
    counts.set(k, (counts.get(k) || 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([k, count]) => {
      const [device_type, browser, os] = k.split('|');
      return { device_type, browser, os, count };
    })
    .sort((a, b) => b.count - a.count);
}

export async function getGeoBreakdown(days: number = 30) {
  const events = await readEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = events.filter((e) => e.event_type === 'page_view' && e.created_at > cutoff);

  const byGeo = new Map<string, { views: number; sessions: Set<string> }>();
  for (const v of views) {
    const k = `${v.city || 'Unknown'}|${v.country || 'Unknown'}`;
    const entry = byGeo.get(k) || { views: 0, sessions: new Set<string>() };
    entry.views++;
    entry.sessions.add(v.session_id);
    byGeo.set(k, entry);
  }

  return Array.from(byGeo.entries())
    .map(([k, d]) => {
      const [city, country] = k.split('|');
      return { city, country, views: d.views, sessions: d.sessions.size };
    })
    .sort((a, b) => b.views - a.views);
}

export async function getSessionTimelines(days: number = 7) {
  const events = await readEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = events.filter((e) => e.event_type === 'page_view' && e.created_at > cutoff);

  return views
    .map((v) => ({
      session_id: v.session_id,
      path: v.path,
      duration_ms: v.duration_ms,
      created_at: v.created_at,
      device_type: v.device_type || 'Unknown',
      city: v.city || 'Unknown',
      country: v.country || 'Unknown',
    }))
    .sort((a, b) => {
      const cmp = a.session_id.localeCompare(b.session_id);
      return cmp !== 0 ? cmp : a.created_at.localeCompare(b.created_at);
    });
}
