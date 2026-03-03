import { put, list } from '@vercel/blob';

// Each event is stored as its own blob: analytics/events/<timestamp>-<random>.json
// This is fully append-only — no read-modify-write, no race conditions.
const EVENT_PREFIX = 'analytics/events/';

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

// Write a single event as its own file
export async function insertEvent(event: PageEvent) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  await put(`${EVENT_PREFIX}${id}.json`, JSON.stringify(event), {
    access: 'public',
    addRandomSuffix: false,
  });
}

// Update heartbeat: write a tombstone-style update file that overrides duration
// Dashboard will pick the latest duration for a given session+path pair
export async function updateHeartbeat(sessionId: string, path: string, durationMs: number) {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const update = {
    event_type: 'heartbeat',
    session_id: sessionId,
    path,
    duration_ms: durationMs,
    created_at: new Date().toISOString(),
  };
  await put(`${EVENT_PREFIX}${id}.json`, JSON.stringify(update), {
    access: 'public',
    addRandomSuffix: false,
  });
}

// Read all events by listing blobs — paginated to handle many files
async function readAllEvents(): Promise<PageEvent[]> {
  const events: PageEvent[] = [];
  let cursor: string | undefined;

  do {
    const result = await list({
      prefix: EVENT_PREFIX,
      limit: 1000,
      cursor,
    });

    await Promise.all(
      result.blobs.map(async (blob) => {
        try {
          const res = await fetch(blob.url, { cache: 'no-store' });
          if (!res.ok) return;
          const evt = await res.json();
          events.push(evt);
        } catch {
          // skip corrupt blobs
        }
      }),
    );

    cursor = result.cursor;
  } while (cursor);

  return events;
}

// Merge heartbeat durations into page_view events for accurate time-on-page
function mergeHeartbeats(events: PageEvent[]): PageEvent[] {
  // Build a map of latest duration per session+path from heartbeats
  const durations = new Map<string, number>();
  for (const e of events) {
    if (e.event_type === 'heartbeat') {
      const key = `${e.session_id}|${e.path}`;
      const existing = durations.get(key) ?? 0;
      if (e.duration_ms > existing) durations.set(key, e.duration_ms);
    }
  }

  // Apply to page_view events
  return events
    .filter((e) => e.event_type === 'page_view')
    .map((e) => {
      const key = `${e.session_id}|${e.path}`;
      return { ...e, duration_ms: durations.get(key) ?? e.duration_ms };
    });
}

// ── Dashboard queries ──

export async function getOverviewStats(days: number = 30) {
  const all = await readAllEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = mergeHeartbeats(all).filter((e) => e.created_at > cutoff);

  const sessions = new Set(views.map((v) => v.session_id));
  const pages = new Set(views.map((v) => v.path));
  const avgDuration =
    views.length > 0
      ? views.reduce((s, v) => s + (v.duration_ms || 0), 0) / views.length / 1000
      : 0;

  return {
    total_views: views.length,
    total_sessions: sessions.size,
    unique_pages: pages.size,
    avg_duration_sec: Math.round(avgDuration * 10) / 10,
  };
}

export async function getPageViews(days: number = 30) {
  const all = await readAllEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = mergeHeartbeats(all).filter((e) => e.created_at > cutoff);

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
  const all = await readAllEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = mergeHeartbeats(all).filter((e) => e.created_at > cutoff);

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
  const all = await readAllEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = mergeHeartbeats(all).filter((e) => e.created_at > cutoff);

  const key = (v: PageEvent) =>
    `${v.device_type || 'Unknown'}|${v.browser || 'Unknown'}|${v.os || 'Unknown'}`;
  const counts = new Map<string, number>();
  for (const v of views) counts.set(key(v), (counts.get(key(v)) || 0) + 1);

  return Array.from(counts.entries())
    .map(([k, count]) => {
      const [device_type, browser, os] = k.split('|');
      return { device_type, browser, os, count };
    })
    .sort((a, b) => b.count - a.count);
}

export async function getGeoBreakdown(days: number = 30) {
  const all = await readAllEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = mergeHeartbeats(all).filter((e) => e.created_at > cutoff);

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
  const all = await readAllEvents();
  const cutoff = new Date(Date.now() - days * 86400000).toISOString();
  const views = mergeHeartbeats(all).filter((e) => e.created_at > cutoff);

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

// Legacy — no longer needed but kept for compatibility
export async function ensureTable() {}
