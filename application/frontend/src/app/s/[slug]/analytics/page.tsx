import {
  getOverviewStats,
  getPageViews,
  getDailyViews,
  getDeviceBreakdown,
  getGeoBreakdown,
  getSessionTimelines,
} from '@/lib/analytics-db';
import { AnalyticsDashboardClient } from './dashboard-client';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AnalyticsDashboardPage() {
  try {
    const [overview, pages, daily, devices, geo, sessions] = await Promise.all([
      getOverviewStats(30),
      getPageViews(30),
      getDailyViews(30),
      getDeviceBreakdown(30),
      getGeoBreakdown(30),
      getSessionTimelines(7),
    ]);

    const sessionMap = new Map<string, Array<{
      path: string;
      duration_ms: number;
      created_at: string;
      device_type: string;
      city: string;
      country: string;
    }>>();

    for (const row of sessions) {
      const sid = row.session_id as string;
      if (!sessionMap.has(sid)) sessionMap.set(sid, []);
      sessionMap.get(sid)!.push({
        path: row.path as string,
        duration_ms: row.duration_ms as number,
        created_at: row.created_at as string,
        device_type: row.device_type as string,
        city: row.city as string,
        country: row.country as string,
      });
    }

    const sessionTimelines = Array.from(sessionMap.entries())
      .map(([id, events]) => ({ id: id.slice(0, 8), events }))
      .slice(0, 50);

    return (
      <AnalyticsDashboardClient
        overview={{
          total_views: Number(overview?.total_views ?? 0),
          total_sessions: Number(overview?.total_sessions ?? 0),
          unique_pages: Number(overview?.unique_pages ?? 0),
          avg_duration_sec: Number(overview?.avg_duration_sec ?? 0),
        }}
        pages={(pages as Array<Record<string, unknown>>).map((r) => ({
          path: r.path as string,
          views: Number(r.views),
          unique_sessions: Number(r.unique_sessions),
          avg_seconds: Number(r.avg_seconds),
        }))}
        daily={(daily as Array<Record<string, unknown>>).map((r) => ({
          day: String(r.day).slice(0, 10),
          views: Number(r.views),
          sessions: Number(r.sessions),
        }))}
        devices={(devices as Array<Record<string, unknown>>).map((r) => ({
          device_type: (r.device_type as string) || 'Unknown',
          browser: (r.browser as string) || 'Unknown',
          os: (r.os as string) || 'Unknown',
          count: Number(r.count),
        }))}
        geo={(geo as Array<Record<string, unknown>>).map((r) => ({
          city: (r.city as string) || 'Unknown',
          country: (r.country as string) || 'Unknown',
          views: Number(r.views),
          sessions: Number(r.sessions),
        }))}
        sessionTimelines={sessionTimelines}
      />
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-2">
          <p className="text-[#8B8FA3]">No data yet or database not connected.</p>
          <p className="text-xs text-[#555]">{message}</p>
        </div>
      </div>
    );
  }
}
