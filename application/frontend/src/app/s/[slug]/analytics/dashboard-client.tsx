'use client';

import { useState } from 'react';
import {
  Eye,
  Users,
  Clock,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  MapPin,
  Activity,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface OverviewData {
  total_views: number;
  total_sessions: number;
  unique_pages: number;
  avg_duration_sec: number;
}

interface PageData {
  path: string;
  views: number;
  unique_sessions: number;
  avg_seconds: number;
}

interface DailyData {
  day: string;
  views: number;
  sessions: number;
}

interface DeviceData {
  device_type: string;
  browser: string;
  os: string;
  count: number;
}

interface GeoData {
  city: string;
  country: string;
  views: number;
  sessions: number;
}

interface SessionEvent {
  path: string;
  duration_ms: number;
  created_at: string;
  device_type: string;
  city: string;
  country: string;
}

interface SessionTimeline {
  id: string;
  events: SessionEvent[];
}

interface Props {
  overview: OverviewData;
  pages: PageData[];
  daily: DailyData[];
  devices: DeviceData[];
  geo: GeoData[];
  sessionTimelines: SessionTimeline[];
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="bg-[#1A1F35] border border-[#2A2F45] rounded-xl p-5">
      <div className="flex items-center gap-3 mb-2">
        <Icon className="w-4 h-4 text-[#C9A962]" />
        <span className="text-xs text-[#8B8FA3] uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-semibold text-[#F0F0F5]">{value}</p>
    </div>
  );
}

function DailyChart({ data }: { data: DailyData[] }) {
  if (data.length === 0) return <p className="text-[#555] text-sm">No data yet</p>;
  const maxViews = Math.max(...data.map((d) => d.views), 1);

  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d) => (
        <div key={d.day} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#0A0F1C] border border-[#2A2F45] rounded px-2 py-1 text-xs text-[#F0F0F5] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
            {d.day}: {d.views} views, {d.sessions} sessions
          </div>
          <div
            className="w-full bg-[#C9A962]/60 rounded-t hover:bg-[#C9A962] transition-colors min-h-[2px]"
            style={{ height: `${(d.views / maxViews) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function DeviceIcon({ type }: { type: string }) {
  if (type === 'mobile') return <Smartphone className="w-4 h-4" />;
  if (type === 'tablet') return <Tablet className="w-4 h-4" />;
  return <Monitor className="w-4 h-4" />;
}

function formatDuration(ms: number): string {
  const sec = Math.round(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  const rem = sec % 60;
  return `${min}m ${rem}s`;
}

function SessionRow({ session }: { session: SessionTimeline }) {
  const [open, setOpen] = useState(false);
  const first = session.events[0];
  const totalMs = session.events.reduce((sum, e) => sum + (e.duration_ms || 0), 0);
  const startTime = new Date(first.created_at);

  return (
    <div className="border-b border-[#2A2F45] last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-left hover:bg-[#1A1F35]/50 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <DeviceIcon type={first.device_type} />
          <span className="text-sm text-[#F0F0F5] font-mono">{session.id}</span>
          <span className="text-xs text-[#8B8FA3]">
            {first.city && first.country ? `${first.city}, ${first.country}` : first.country || '—'}
          </span>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <span className="text-xs text-[#8B8FA3]">{session.events.length} pages</span>
          <span className="text-xs text-[#C9A962]">{formatDuration(totalMs)}</span>
          <span className="text-xs text-[#555]">{startTime.toLocaleDateString()} {startTime.toLocaleTimeString()}</span>
          {open ? <ChevronUp className="w-3 h-3 text-[#555]" /> : <ChevronDown className="w-3 h-3 text-[#555]" />}
        </div>
      </button>
      {open && (
        <div className="pl-10 pb-3 space-y-1">
          {session.events.map((e, i) => (
            <div key={i} className="flex items-center gap-4 text-xs">
              <span className="text-[#8B8FA3] w-16 shrink-0">{formatDuration(e.duration_ms)}</span>
              <span className="text-[#F0F0F5] font-mono truncate">{e.path}</span>
              <span className="text-[#555] shrink-0">{new Date(e.created_at).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AnalyticsDashboardClient({ overview, pages, daily, devices, geo, sessionTimelines }: Props) {
  const deviceTotals = new Map<string, number>();
  const browserTotals = new Map<string, number>();
  const osTotals = new Map<string, number>();

  for (const d of devices) {
    deviceTotals.set(d.device_type, (deviceTotals.get(d.device_type) || 0) + d.count);
    browserTotals.set(d.browser, (browserTotals.get(d.browser) || 0) + d.count);
    osTotals.set(d.os, (osTotals.get(d.os) || 0) + d.count);
  }

  const totalDeviceCount = Array.from(deviceTotals.values()).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="min-h-screen p-4 sm:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#F0F0F5]">Analytics</h1>
        <span className="text-xs text-[#555]">Last 30 days</span>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Page Views" value={overview.total_views.toLocaleString()} />
        <StatCard icon={Users} label="Sessions" value={overview.total_sessions.toLocaleString()} />
        <StatCard icon={FileText} label="Pages" value={overview.unique_pages} />
        <StatCard icon={Clock} label="Avg Duration" value={`${overview.avg_duration_sec}s`} />
      </div>

      {/* Daily chart */}
      <div className="bg-[#1A1F35] border border-[#2A2F45] rounded-xl p-5">
        <h2 className="text-sm font-medium text-[#F0F0F5] mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#C9A962]" /> Daily Views
        </h2>
        <DailyChart data={daily} />
        {daily.length > 0 && (
          <div className="flex justify-between mt-2 text-[10px] text-[#555]">
            <span>{daily[0].day}</span>
            <span>{daily[daily.length - 1].day}</span>
          </div>
        )}
      </div>

      {/* Two-column: Pages + Geo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top pages */}
        <div className="bg-[#1A1F35] border border-[#2A2F45] rounded-xl p-5">
          <h2 className="text-sm font-medium text-[#F0F0F5] mb-4">Top Pages</h2>
          <div className="space-y-2">
            {pages.length === 0 && <p className="text-[#555] text-sm">No data yet</p>}
            {pages.map((p) => (
              <div key={p.path} className="flex items-center justify-between text-sm">
                <span className="text-[#F0F0F5] font-mono text-xs truncate max-w-[60%]">{p.path}</span>
                <div className="flex items-center gap-4 text-xs text-[#8B8FA3]">
                  <span>{p.views} views</span>
                  <span>{p.unique_sessions} uniq</span>
                  <span className="text-[#C9A962]">{p.avg_seconds}s avg</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Geo */}
        <div className="bg-[#1A1F35] border border-[#2A2F45] rounded-xl p-5">
          <h2 className="text-sm font-medium text-[#F0F0F5] mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#C9A962]" /> Locations
          </h2>
          <div className="space-y-2">
            {geo.length === 0 && <p className="text-[#555] text-sm">No data yet</p>}
            {geo.map((g, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-[#F0F0F5] text-xs">
                  {g.city && g.city !== 'Unknown' ? `${g.city}, ` : ''}{g.country}
                </span>
                <div className="flex items-center gap-4 text-xs text-[#8B8FA3]">
                  <span>{g.views} views</span>
                  <span>{g.sessions} sessions</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Devices */}
      <div className="bg-[#1A1F35] border border-[#2A2F45] rounded-xl p-5">
        <h2 className="text-sm font-medium text-[#F0F0F5] mb-4">Devices</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Device type */}
          <div>
            <p className="text-xs text-[#8B8FA3] mb-2 uppercase tracking-wider">Type</p>
            <div className="space-y-2">
              {Array.from(deviceTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => (
                  <div key={type} className="flex items-center gap-2">
                    <DeviceIcon type={type} />
                    <div className="flex-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[#F0F0F5] capitalize">{type}</span>
                        <span className="text-[#8B8FA3]">{Math.round((count / totalDeviceCount) * 100)}%</span>
                      </div>
                      <div className="h-1.5 bg-[#0A0F1C] rounded-full overflow-hidden">
                        <div className="h-full bg-[#C9A962] rounded-full" style={{ width: `${(count / totalDeviceCount) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Browser */}
          <div>
            <p className="text-xs text-[#8B8FA3] mb-2 uppercase tracking-wider">Browser</p>
            <div className="space-y-1">
              {Array.from(browserTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([browser, count]) => (
                  <div key={browser} className="flex justify-between text-xs">
                    <span className="text-[#F0F0F5]">{browser}</span>
                    <span className="text-[#8B8FA3]">{count}</span>
                  </div>
                ))}
            </div>
          </div>

          {/* OS */}
          <div>
            <p className="text-xs text-[#8B8FA3] mb-2 uppercase tracking-wider">OS</p>
            <div className="space-y-1">
              {Array.from(osTotals.entries())
                .sort((a, b) => b[1] - a[1])
                .map(([os, count]) => (
                  <div key={os} className="flex justify-between text-xs">
                    <span className="text-[#F0F0F5]">{os}</span>
                    <span className="text-[#8B8FA3]">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Session timelines */}
      <div className="bg-[#1A1F35] border border-[#2A2F45] rounded-xl p-5">
        <h2 className="text-sm font-medium text-[#F0F0F5] mb-4">Recent Sessions (7 days)</h2>
        {sessionTimelines.length === 0 && <p className="text-[#555] text-sm">No sessions yet</p>}
        <div className="divide-y divide-[#2A2F45]">
          {sessionTimelines.map((s) => (
            <SessionRow key={s.id} session={s} />
          ))}
        </div>
      </div>

      <p className="text-center text-[10px] text-[#333]">Internal use only</p>
    </div>
  );
}
