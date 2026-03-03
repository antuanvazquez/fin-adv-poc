'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  UserPlus,
  AlertCircle,
  FileText,
  ClipboardCheck,
  MessageSquare,
  CalendarCheck,
  ChevronRight,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScoreRing } from '@/components/ui/score-ring';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { AppShell } from '@/components/layout/app-shell';
import { mockHouseholds, mockAdvisor, getAllSignals } from '@/lib/mock-data';
import { formatCurrency, timeAgo } from '@/lib/utils';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function getMeetingTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'annual-review': 'Annual Review',
    'quarterly-check-in': 'Quarterly Check-in',
    'initial-consultation': 'Initial Consultation',
    'ad-hoc': 'Ad Hoc',
  };
  return labels[type] ?? type;
}

function formatMeetingDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

const recentActivity = [
  {
    icon: FileText,
    text: 'Robert Martin uploaded a document',
    time: '2 hours ago',
    borderColor: 'border-l-blue-400',
    iconColor: 'text-blue-400',
  },
  {
    icon: ClipboardCheck,
    text: 'Marcus Chen completed intake form',
    time: '5 hours ago',
    borderColor: 'border-l-emerald-400',
    iconColor: 'text-emerald-400',
  },
  {
    icon: MessageSquare,
    text: 'Eleanor Voss sent a message',
    time: '1 day ago',
    borderColor: 'border-l-[#C9A962]',
    iconColor: 'text-[#C9A962]',
  },
  {
    icon: CalendarCheck,
    text: 'Annual review scheduled for The Martins',
    time: '2 days ago',
    borderColor: 'border-l-purple-400',
    iconColor: 'text-purple-400',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function DashboardPage() {
  const router = useRouter();
  const firstName = mockAdvisor.name.split(' ')[0];
  const topSignals = getAllSignals().slice(0, 5);

  const upcomingMeetings = mockHouseholds
    .flatMap((h) => h.meetings)
    .filter((m) => m.status === 'scheduled')
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px]"
      >
        {/* ── Header ── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-[#F0F0F5]">
            {getGreeting()},{' '}
            <span className="text-[#C9A962]">{firstName}</span>
          </h1>
          <p className="text-[#8B8FA3] mt-1">
            Here&apos;s what needs your attention today
          </p>

          <div className="flex items-center gap-8 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A962]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#C9A962]" />
              </div>
              <div>
                <p className="text-xs text-[#8B8FA3] uppercase tracking-wider">
                  Total AUM
                </p>
                <AnimatedNumber
                  value={mockAdvisor.totalAUM}
                  format={formatCurrency}
                  className="text-xl font-bold text-[#F0F0F5]"
                />
              </div>
            </div>

            <div className="w-px h-10 bg-[#1E2A45]" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-[#8B8FA3] uppercase tracking-wider">
                  Active Clients
                </p>
                <AnimatedNumber
                  value={mockAdvisor.clientCount}
                  className="text-xl font-bold text-[#F0F0F5]"
                />
              </div>
            </div>

            <div className="w-px h-10 bg-[#1E2A45]" />

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#C9A962]/10 flex items-center justify-center">
                <UserPlus className="w-5 h-5 text-[#C9A962]" />
              </div>
              <div>
                <p className="text-xs text-[#8B8FA3] uppercase tracking-wider">
                  Prospects
                </p>
                <AnimatedNumber
                  value={mockAdvisor.prospectCount}
                  className="text-xl font-bold text-[#C9A962]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column — 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Client Households */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#F0F0F5]">
                  Client Households
                </h2>
                <Link
                  href="/clients"
                  className="text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors flex items-center gap-1"
                >
                  View all <ChevronRight className="w-4 h-4" />
                </Link>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {mockHouseholds.map((h) => {
                  const pendingSignals = h.signals.filter(
                    (s) => s.status === 'active',
                  ).length;
                  const pendingTasks = h.tasks.filter(
                    (t) => t.status !== 'completed',
                  ).length;

                  return (
                    <motion.div
                      key={h.id}
                      variants={cardVariants}
                      whileHover={{
                        scale: 1.005,
                        borderColor: 'rgba(201,169,98,0.3)',
                      }}
                      onClick={() => router.push(`/clients/${h.id}`)}
                      className="rounded-2xl border border-[#1E2A45] bg-[#131A2E]/80 backdrop-blur-xl p-6 cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="text-lg font-semibold text-[#F0F0F5]">
                              {h.name}
                            </h3>
                            <Badge
                              variant={
                                h.status === 'active' ? 'success' : 'gold'
                              }
                            >
                              {h.status === 'active' ? 'Active' : 'Prospect'}
                            </Badge>
                          </div>
                          <p className="text-sm text-[#8B8FA3] mb-4">
                            {h.clients
                              .map((c) => `${c.firstName} ${c.lastName}`)
                              .join(' & ')}
                          </p>
                          <div className="flex items-end gap-8">
                            <div>
                              <p className="text-xs text-[#8B8FA3] uppercase tracking-wider mb-1">
                                Net Worth
                              </p>
                              <p className="text-2xl font-bold text-[#F0F0F5]">
                                {formatCurrency(
                                  h.financialPlan.netWorth.netWorth,
                                )}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 pb-1">
                              {pendingSignals > 0 && (
                                <div className="flex items-center gap-1.5 text-sm text-amber-400">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  {pendingSignals} signal
                                  {pendingSignals !== 1 && 's'}
                                </div>
                              )}
                              {pendingTasks > 0 && (
                                <div className="flex items-center gap-1.5 text-sm text-[#8B8FA3]">
                                  <Clock className="w-3.5 h-3.5" />
                                  {pendingTasks} task
                                  {pendingTasks !== 1 && 's'}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <ScoreRing
                          score={h.financialPlan.healthScore}
                          size={80}
                          strokeWidth={6}
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </section>

            {/* Recent Activity */}
            <section>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4">
                Recent Activity
              </h2>
              <Card>
                <div className="space-y-1">
                  {recentActivity.map((activity, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-4 border-l-2 ${activity.borderColor} pl-4 py-3`}
                    >
                      <div className="shrink-0 mt-0.5">
                        <activity.icon
                          className={`w-4 h-4 ${activity.iconColor}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-[#F0F0F5]">
                          {activity.text}
                        </p>
                        <p className="text-xs text-[#8B8FA3] mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </div>

          {/* Right Column — 1/3 */}
          <div className="space-y-6">
            {/* Life Signals */}
            <section>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4">
                Life Signals
              </h2>
              <Card>
                <div className="space-y-4">
                  {topSignals.map((signal) => (
                    <div
                      key={signal.id}
                      className="group cursor-pointer"
                      onClick={() =>
                        router.push(`/clients/${signal.householdId}`)
                      }
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={signal.type}
                          pulse={signal.type === 'critical'}
                        >
                          {signal.type}
                        </Badge>
                        <span className="text-xs text-[#8B8FA3]">
                          {timeAgo(signal.triggeredAt)}
                        </span>
                      </div>
                      <p className="text-sm text-[#F0F0F5] group-hover:text-[#C9A962] transition-colors line-clamp-1">
                        {signal.title}
                      </p>
                      <p className="text-xs text-[#8B8FA3] mt-0.5">
                        {signal.clientName}
                      </p>
                    </div>
                  ))}
                </div>
                <Link
                  href="/signals"
                  className="flex items-center gap-1 mt-5 pt-4 border-t border-[#1E2A45] text-sm text-[#C9A962] hover:text-[#D4B872] transition-colors"
                >
                  View all signals <ChevronRight className="w-4 h-4" />
                </Link>
              </Card>
            </section>

            {/* Upcoming Meetings */}
            <section>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4">
                Upcoming Meetings
              </h2>
              <Card>
                <div className="space-y-5">
                  {upcomingMeetings.map((meeting) => (
                    <div key={meeting.id} className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#1E2A45]/50 flex items-center justify-center shrink-0">
                        <Calendar className="w-4 h-4 text-[#C9A962]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#F0F0F5]">
                          {meeting.householdName}
                        </p>
                        <p className="text-xs text-[#8B8FA3]">
                          {getMeetingTypeLabel(meeting.type)}
                        </p>
                        <p className="text-xs text-[#8B8FA3] mt-0.5">
                          {formatMeetingDate(meeting.date)} &middot;{' '}
                          {meeting.time}
                        </p>
                        <Button variant="secondary" size="sm" className="mt-2">
                          <Sparkles className="w-3 h-3" />
                          Prep with AI
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </section>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
