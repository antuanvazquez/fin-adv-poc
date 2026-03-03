'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  DollarSign,
  PiggyBank,
  TrendingUp,
  Shield,
  Heart,
  Activity,
  Target,
  ScrollText,
  Building2,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  FileText,
  Eye,
  BellOff,
  X,
  MessageSquare,
  ChevronRight,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScoreRing } from '@/components/ui/score-ring';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { AppShell } from '@/components/layout/app-shell';
import { getHousehold } from '@/lib/mock-data';
import type { FinancialPlan } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  timeAgo,
  cn,
} from '@/lib/utils';

/* ─── Checkpoint score computation (mirrors logic in utils.ts) ────────────── */

interface Checkpoint {
  key: string;
  label: string;
  score: number;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
}

function computeCheckpoints(plan: FinancialPlan): Checkpoint[] {
  const {
    netWorth: nw,
    cashReserve,
    discretionaryIncome,
    disabilityInsurance,
    lifeInsurance,
    longTermCare,
    retirementAssets,
    estatePlanning,
  } = plan;

  const growing =
    nw.history.length >= 2 &&
    nw.history[nw.history.length - 1].value > nw.history[0].value;
  const nwBase = Math.min(nw.netWorth / 2_000_000, 1) * 80;
  const netWorthScore =
    nw.netWorth <= 0 ? 10 : Math.min(100, nwBase + (growing ? 20 : 0));

  const cashScore =
    cashReserve.goal <= 0
      ? 100
      : Math.min(100, (cashReserve.currentReserve / cashReserve.goal) * 100);

  const { savingsRate } = discretionaryIncome;
  const incomeScore =
    savingsRate >= 25 ? 100 : savingsRate >= 15 ? 80 : savingsRate >= 10 ? 60 : savingsRate >= 5 ? 40 : 20;

  const insScore = (ins: typeof disabilityInsurance) => {
    const shortage = ins.shortage.reduce((s, c) => s + c.amount, 0);
    const suggested = ins.suggestedCoverage.reduce((s, c) => s + c.amount, 0);
    if (suggested === 0) return 100;
    return Math.max(0, Math.min(100, Math.round((1 - shortage / suggested) * 100)));
  };

  const disabilityScore = insScore(disabilityInsurance);
  const lifeScore = insScore(lifeInsurance);
  const ltcScore = insScore(longTermCare);
  const retirementScore = Math.round(Math.min(100, retirementAssets.percentFunded));
  const docs = estatePlanning.documents;
  const completedDocs = docs.filter((d) => d.completed).length;
  const estateScore = docs.length === 0 ? 0 : Math.round((completedDocs / docs.length) * 100);

  const coverageMonths =
    cashReserve.monthlyExpenses > 0
      ? cashReserve.currentReserve / cashReserve.monthlyExpenses
      : 0;

  const insMetric = (score: number) =>
    score === 100 ? 'Covered' : score === 0 ? 'No coverage' : 'Gap exists';

  return [
    { key: 'netWorth', label: 'Net Worth', score: Math.round(netWorthScore), metric: formatCurrency(nw.netWorth), icon: DollarSign },
    { key: 'cashReserve', label: 'Cash Reserve', score: Math.round(cashScore), metric: `${coverageMonths.toFixed(1)} mo`, icon: PiggyBank },
    { key: 'income', label: 'Discretionary', score: incomeScore, metric: `${savingsRate}% savings`, icon: TrendingUp },
    { key: 'disability', label: 'Disability Ins.', score: disabilityScore, metric: insMetric(disabilityScore), icon: Shield },
    { key: 'life', label: 'Life Insurance', score: lifeScore, metric: insMetric(lifeScore), icon: Heart },
    { key: 'ltc', label: 'Long-Term Care', score: ltcScore, metric: insMetric(ltcScore), icon: Activity },
    { key: 'retirement', label: 'Retirement', score: retirementScore, metric: `${retirementAssets.percentFunded}% funded`, icon: Target },
    { key: 'estate', label: 'Estate Planning', score: estateScore, metric: `${completedDocs}/${docs.length} docs`, icon: ScrollText },
  ];
}

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function checkpointBarColor(score: number) {
  if (score >= 80) return 'bg-emerald-400';
  if (score >= 60) return 'bg-[#C9A962]';
  return 'bg-red-400';
}

function checkpointDotColor(score: number) {
  if (score >= 80) return 'bg-emerald-400';
  if (score >= 60) return 'bg-[#C9A962]';
  return 'bg-red-400';
}

function formatChartValue(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

const ACCOUNT_BADGE: Record<string, { variant: 'default' | 'success' | 'warning' | 'critical' | 'info' | 'gold'; label: string; custom?: string }> = {
  checking: { variant: 'info', label: 'Checking' },
  savings: { variant: 'success', label: 'Savings' },
  brokerage: { variant: 'default', label: 'Brokerage', custom: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  retirement: { variant: 'gold', label: 'Retirement' },
  'credit-card': { variant: 'critical', label: 'Credit Card' },
  mortgage: { variant: 'warning', label: 'Mortgage' },
  loan: { variant: 'warning', label: 'Loan' },
};

function AccountBadge({ type }: { type: string }) {
  const cfg = ACCOUNT_BADGE[type] ?? { variant: 'default' as const, label: type };
  if (cfg.custom) {
    return (
      <span className={cn('inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border', cfg.custom)}>
        {cfg.label}
      </span>
    );
  }
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

const SIGNAL_CFG: Record<string, { variant: 'critical' | 'warning' | 'info'; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  critical: { variant: 'critical', icon: AlertTriangle, color: 'text-red-400' },
  warning: { variant: 'warning', icon: AlertCircle, color: 'text-amber-400' },
  info: { variant: 'info', icon: Info, color: 'text-blue-400' },
};

/* eslint-disable @typescript-eslint/no-explicit-any */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-[#1E2A45] bg-[#131A2E] px-4 py-3 shadow-xl">
      <p className="text-xs text-[#8B8FA3] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#C9A962]">
        {formatCurrency(payload[0].value)}
      </p>
    </div>
  );
}

/* ─── Page Component ──────────────────────────────────────────────────────── */

export default function HouseholdProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const household = getHousehold(id);
  const [dismissedSignals, setDismissedSignals] = useState<Set<string>>(
    new Set(),
  );

  if (!household) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <AlertTriangle className="w-16 h-16 text-[#8B8FA3]" />
          <h1 className="text-2xl font-bold text-[#F0F0F5]">
            Household not found
          </h1>
          <p className="text-[#8B8FA3]">
            No household with id &ldquo;{id}&rdquo; exists.
          </p>
          <Link href="/clients">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const {
    financialPlan: plan,
    accounts,
    communications,
    documents,
    signals,
    tasks,
  } = household;

  const checkpoints = computeCheckpoints(plan);
  const activeSignals = signals.filter(
    (s) => s.status === 'active' && !dismissedSignals.has(s.id),
  );
  const recentComms = communications.slice(-3).reverse();

  const totalAssets = plan.netWorth.totalAssets;
  const totalLiabilities = plan.netWorth.totalLiabilities;
  const total = totalAssets + totalLiabilities;
  const assetPct = total > 0 ? (totalAssets / total) * 100 : 100;
  const liabPct = total > 0 ? (totalLiabilities / total) * 100 : 0;

  const dismiss = (signalId: string) =>
    setDismissedSignals((prev) => new Set([...prev, signalId]));

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] space-y-6"
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/clients"
              className="rounded-xl border border-[#1E2A45] p-2 text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-[#F0F0F5]">
                  {household.name}
                </h1>
                <Badge
                  variant={
                    household.status === 'active'
                      ? 'success'
                      : household.status === 'prospect'
                        ? 'gold'
                        : 'default'
                  }
                >
                  {household.status.charAt(0).toUpperCase() +
                    household.status.slice(1)}
                </Badge>
              </div>
              <p className="text-[#8B8FA3] text-sm mt-1">
                {household.clients
                  .map((c) => `${c.firstName} ${c.lastName}`)
                  .join(' & ')}{' '}
                &middot; Client since {formatDate(household.createdAt)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/clients/${id}/plan`}>
              <Button variant="secondary" size="md">
                <FileText className="w-4 h-4" /> View Financial Plan
              </Button>
            </Link>
            <Link href={`/clients/${id}/comms`}>
              <Button variant="primary" size="md">
                <MessageSquare className="w-4 h-4" /> Communication Hub
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Great 8 Quick Stats ────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {checkpoints.map((cp, i) => {
            const Icon = cp.icon;
            return (
              <motion.div
                key={cp.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className="rounded-xl border border-[#1E2A45] bg-[#131A2E]/60 p-4 flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-[#8B8FA3]" />
                    <span className="text-xs text-[#8B8FA3] font-medium">
                      {cp.label}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'w-2.5 h-2.5 rounded-full',
                      checkpointDotColor(cp.score),
                    )}
                  />
                </div>
                <p className="text-sm font-semibold text-[#F0F0F5]">
                  {cp.metric}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* ── Main Content — 2-column layout ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3) */}
          <div className="lg:col-span-2 space-y-6">
            {/* A. Financial Snapshot */}
            <Card>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-1">
                Financial Snapshot
              </h2>
              <p className="text-sm text-[#8B8FA3] mb-4">
                Net worth:{' '}
                <AnimatedNumber
                  value={plan.netWorth.netWorth}
                  format={formatCurrency}
                  className="text-[#C9A962] font-semibold"
                />
              </p>

              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={plan.netWorth.history}
                    margin={{ top: 5, right: 5, bottom: 5, left: 10 }}
                  >
                    <defs>
                      <linearGradient
                        id="goldGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#C9A962"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="100%"
                          stopColor="#C9A962"
                          stopOpacity={0.02}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="year"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8B8FA3', fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#8B8FA3', fontSize: 12 }}
                      tickFormatter={formatChartValue}
                      width={60}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#C9A962"
                      fill="url(#goldGradient)"
                      strokeWidth={2}
                      animationDuration={1000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Assets vs Liabilities bar */}
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-xs text-[#8B8FA3]">
                  <span>Assets: {formatCurrency(totalAssets)}</span>
                  {totalLiabilities > 0 && (
                    <span>Liabilities: {formatCurrency(totalLiabilities)}</span>
                  )}
                </div>
                <div className="h-3 rounded-full overflow-hidden flex bg-[#1E2A45]">
                  <motion.div
                    className="bg-emerald-400/70 h-full"
                    style={{
                      borderRadius:
                        liabPct > 0 ? '9999px 0 0 9999px' : '9999px',
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${assetPct}%` }}
                    transition={{ duration: 0.8 }}
                  />
                  {liabPct > 0 && (
                    <motion.div
                      className="bg-red-400/70 h-full rounded-r-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${liabPct}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.3,
                      }}
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-[#8B8FA3]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400/70" />
                    Assets
                  </span>
                  {totalLiabilities > 0 && (
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-red-400/70" />
                      Liabilities
                    </span>
                  )}
                </div>
              </div>
            </Card>

            {/* B. Linked Accounts */}
            <Card>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4">
                Linked Accounts
              </h2>
              <div className="space-y-0 divide-y divide-[#1E2A45]">
                {accounts.map((acct) => (
                  <div
                    key={acct.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Building2 className="w-4 h-4 text-[#8B8FA3] flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[#F0F0F5] truncate">
                          {acct.name}
                        </p>
                        <p className="text-xs text-[#8B8FA3]">
                          {acct.institution}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <AccountBadge type={acct.type} />
                      <p className="text-sm font-semibold text-[#F0F0F5] w-28 text-right">
                        {formatCurrency(acct.balance)}
                      </p>
                      <p className="text-xs text-[#8B8FA3] w-20 text-right hidden sm:block">
                        {timeAgo(acct.lastRefreshed)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* C. Recent Communications */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[#F0F0F5]">
                  Recent Communications
                </h2>
                <Link
                  href={`/clients/${id}/comms`}
                  className="text-xs text-[#C9A962] hover:text-[#D4B872] flex items-center gap-1 transition-colors"
                >
                  View all in Communication Hub
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              <div className="space-y-0 divide-y divide-[#1E2A45]">
                {recentComms.map((msg) => (
                  <div key={msg.id} className="flex items-start gap-3 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#1E2A45] flex items-center justify-center text-xs font-semibold text-[#F0F0F5] flex-shrink-0">
                      {msg.senderName
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-[#F0F0F5]">
                          {msg.senderName}
                        </p>
                        {msg.senderType === 'ai-draft' && (
                          <Badge variant="info">AI Draft</Badge>
                        )}
                        <span className="text-xs text-[#8B8FA3] ml-auto flex-shrink-0">
                          {timeAgo(msg.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-[#8B8FA3] truncate">
                        {msg.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Column (1/3) */}
          <div className="space-y-6">
            {/* D. Health Score */}
            <Card>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4 text-center">
                Health Score
              </h2>
              <div className="flex justify-center mb-6">
                <ScoreRing score={plan.healthScore} size={160} strokeWidth={10} />
              </div>
              <div className="space-y-3">
                {checkpoints.map((cp) => {
                  const Icon = cp.icon;
                  return (
                    <div key={cp.key} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-[#8B8FA3] flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-[#8B8FA3]">
                            {cp.label}
                          </span>
                          <span className="text-xs font-medium text-[#F0F0F5]">
                            {cp.score}
                          </span>
                        </div>
                        <Progress
                          value={cp.score}
                          color={checkpointBarColor(cp.score)}
                          size="sm"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* E. Life Signals */}
            <Card>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4">
                Life Signals
              </h2>
              {activeSignals.length === 0 ? (
                <p className="text-sm text-[#8B8FA3] text-center py-4">
                  No active signals
                </p>
              ) : (
                <div className="space-y-3">
                  {activeSignals.map((signal) => {
                    const cfg = SIGNAL_CFG[signal.type] ?? SIGNAL_CFG.info;
                    const SigIcon = cfg.icon;
                    return (
                      <div
                        key={signal.id}
                        className="p-3 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/50"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <SigIcon
                            className={cn(
                              'w-4 h-4 mt-0.5 flex-shrink-0',
                              cfg.color,
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={cfg.variant}
                                pulse={signal.type === 'critical'}
                              >
                                {signal.type}
                              </Badge>
                              <span className="text-xs text-[#8B8FA3]">
                                {timeAgo(signal.triggeredAt)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-[#F0F0F5]">
                              {signal.title}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-6">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismiss(signal.id)}
                          >
                            <X className="w-3 h-3" /> Dismiss
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => dismiss(signal.id)}
                          >
                            <BellOff className="w-3 h-3" /> Snooze
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* F. Tasks & Action Items */}
            <Card>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4">
                Tasks &amp; Action Items
              </h2>
              {tasks.length === 0 ? (
                <p className="text-sm text-[#8B8FA3] text-center py-4">
                  No tasks
                </p>
              ) : (
                <div className="space-y-0 divide-y divide-[#1E2A45]">
                  {tasks.map((task) => {
                    const done = task.status === 'completed';
                    const prioVariant =
                      task.priority === 'high'
                        ? 'critical'
                        : task.priority === 'medium'
                          ? 'warning'
                          : 'default';
                    return (
                      <div
                        key={task.id}
                        className={cn(
                          'flex items-start gap-3 py-3',
                          done && 'opacity-50',
                        )}
                      >
                        {done ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-[#1E2A45] mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              'text-sm font-medium text-[#F0F0F5]',
                              done && 'line-through',
                            )}
                          >
                            {task.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant={prioVariant}>{task.priority}</Badge>
                            {task.status === 'in-progress' && (
                              <Badge variant="gold">In Progress</Badge>
                            )}
                            <span className="text-xs text-[#8B8FA3] flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* G. Documents */}
            <Card>
              <h2 className="text-lg font-semibold text-[#F0F0F5] mb-4">
                Documents
              </h2>
              {documents.length === 0 ? (
                <p className="text-sm text-[#8B8FA3] text-center py-4">
                  No documents
                </p>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="p-3 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/50"
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-start gap-2 min-w-0">
                          <FileText className="w-4 h-4 text-[#8B8FA3] mt-0.5 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-[#F0F0F5] truncate">
                              {doc.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="default">
                                {doc.classification}
                              </Badge>
                              <span className="text-xs text-[#8B8FA3]">
                                {formatDate(doc.uploadedAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-3 h-3" /> View
                        </Button>
                      </div>
                      {doc.aiSummary && (
                        <p className="text-xs text-[#8B8FA3] ml-6 line-clamp-2">
                          {doc.aiSummary}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </AppShell>
  );
}
