'use client';

import { use, useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileDown,
  Shield,
  Heart,
  HandHelping,
  CheckCircle2,
  XCircle,
  Wallet,
  TrendingUp,
  PiggyBank,
  Landmark,
  ScrollText,
  PieChartIcon,
  ListChecks,
  CalendarCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
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
import {
  formatCurrency,
  formatPercent,
  cn,
  calculateHealthScore,
} from '@/lib/utils';
import type { FinancialPlan, InsuranceCoverage } from '@/lib/types';

const SLIDE_LABELS = [
  'Welcome',
  'Executive Summary',
  'Net Worth',
  'Cash Reserve',
  'Discretionary Income',
  'Insurance Overview',
  'Retirement Assets',
  'Estate Planning',
  'Asset Allocation',
  'Your Great 8',
  'Next Steps',
];

const TOOLTIP_STYLE = {
  backgroundColor: '#131A2E',
  border: '1px solid #1E2A45',
  borderRadius: '12px',
};

const PIE_COLORS = ['#C9A962', '#60A5FA', '#34D399', '#A78BFA', '#F87171', '#FB923C'];

function formatChartValue(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function scoreForCheckpoint(plan: FinancialPlan, checkpoint: string): number {
  switch (checkpoint) {
    case 'Net Worth': {
      const { netWorth, history } = plan.netWorth;
      if (netWorth <= 0) return 10;
      const growing = history.length >= 2 && history[history.length - 1].value > history[0].value;
      return Math.min(100, Math.round(Math.min(netWorth / 2_000_000, 1) * 80 + (growing ? 20 : 0)));
    }
    case 'Cash Reserve': {
      const { currentReserve, goal } = plan.cashReserve;
      if (goal <= 0) return 100;
      return Math.min(100, Math.round((currentReserve / goal) * 100));
    }
    case 'Discretionary Income': {
      const { savingsRate } = plan.discretionaryIncome;
      if (savingsRate >= 25) return 100;
      if (savingsRate >= 15) return 80;
      if (savingsRate >= 10) return 60;
      if (savingsRate >= 5) return 40;
      return 20;
    }
    case 'Disability Insurance':
      return scoreInsurance(plan.disabilityInsurance);
    case 'Life Insurance':
      return scoreInsurance(plan.lifeInsurance);
    case 'Long-Term Care':
      return scoreInsurance(plan.longTermCare);
    case 'Retirement': {
      return Math.min(100, Math.round(plan.retirementAssets.percentFunded));
    }
    case 'Estate Planning': {
      const { documents } = plan.estatePlanning;
      if (documents.length === 0) return 0;
      const completed = documents.filter((d) => d.completed).length;
      return Math.round((completed / documents.length) * 100);
    }
    default:
      return 0;
  }
}

function scoreInsurance(coverage: InsuranceCoverage): number {
  const totalShortage = coverage.shortage.reduce((s, c) => s + c.amount, 0);
  const totalSuggested = coverage.suggestedCoverage.reduce((s, c) => s + c.amount, 0);
  if (totalSuggested === 0) return 100;
  return Math.max(0, Math.min(100, Math.round((1 - totalShortage / totalSuggested) * 100)));
}

function dotColor(score: number): string {
  if (score >= 80) return 'bg-emerald-400';
  if (score >= 60) return 'bg-[#C9A962]';
  return 'bg-red-400';
}

function statusLabel(score: number): string {
  if (score >= 80) return 'On Track';
  if (score >= 60) return 'Needs Attention';
  return 'Action Required';
}

function generateRecommendations(plan: FinancialPlan): string[] {
  const recs: string[] = [];

  const estateCompleted = plan.estatePlanning.documents.filter((d) => d.completed).length;
  if (estateCompleted < plan.estatePlanning.documents.length) {
    const missing = plan.estatePlanning.documents.filter((d) => !d.completed).map((d) => d.name);
    recs.push(`Schedule a meeting with an estate attorney to complete: ${missing.join(', ')}.`);
  }

  if (plan.cashReserve.shortage > 0) {
    recs.push(
      `Build cash reserve by ${formatCurrency(plan.cashReserve.shortage)} to reach ${plan.cashReserve.targetMonths}-month target of ${formatCurrency(plan.cashReserve.goal)}.`,
    );
  }

  const lifeShortageTotal = plan.lifeInsurance.shortage.reduce((s, c) => s + c.amount, 0);
  if (lifeShortageTotal > 0) {
    recs.push(
      `Close ${formatCurrency(lifeShortageTotal)} life insurance gap — consider term policies to bridge coverage needs.`,
    );
  }

  const disabilityShortageTotal = plan.disabilityInsurance.shortage.reduce((s, c) => s + c.amount, 0);
  if (disabilityShortageTotal > 0) {
    recs.push(
      `Obtain disability insurance coverage — currently ${formatCurrency(disabilityShortageTotal)}/mo short of recommended benefit.`,
    );
  }

  const ltcShortageTotal = plan.longTermCare.shortage.reduce((s, c) => s + c.amount, 0);
  if (ltcShortageTotal > 0) {
    recs.push(
      `Evaluate long-term care insurance options — ${formatCurrency(ltcShortageTotal)}/mo coverage gap identified.`,
    );
  }

  if (plan.retirementAssets.shortage > 0) {
    recs.push(
      `Increase retirement contributions to close the ${formatCurrency(plan.retirementAssets.shortage)} funding gap (currently ${formatPercent(plan.retirementAssets.percentFunded)} funded).`,
    );
  }

  if (plan.discretionaryIncome.savingsRate < 20) {
    recs.push(
      `Aim to increase savings rate from ${plan.discretionaryIncome.savingsRate.toFixed(1)}% toward 20%+ for stronger long-term wealth building.`,
    );
  }

  const allocationDrift = plan.assetAllocation.current.some((c) => {
    const target = plan.assetAllocation.target.find((t) => t.category === c.category);
    return target && Math.abs(c.percentage - target.percentage) > 3;
  });
  if (allocationDrift) {
    recs.push('Rebalance portfolio to align current allocation with target — drift exceeds 3% in one or more categories.');
  }

  return recs.slice(0, 5);
}

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
};

export default function PlanPresentationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const _household = getHousehold(id);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const recommendations = useMemo(
    () => (_household ? generateRecommendations(_household.financialPlan) : []),
    [_household],
  );

  if (!_household) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-bold text-[#F0F0F5]">Household not found</h1>
          <p className="text-[#8B8FA3]">No household with id &ldquo;{id}&rdquo; exists.</p>
          <Link href="/clients">
            <Button variant="secondary">
              <ArrowLeft className="w-4 h-4" /> Back to Clients
            </Button>
          </Link>
        </div>
      </AppShell>
    );
  }

  const household = _household;
  const plan = household.financialPlan;
  const {
    netWorth,
    cashReserve,
    discretionaryIncome,
    disabilityInsurance,
    lifeInsurance,
    longTermCare,
    retirementAssets,
    estatePlanning,
    assetAllocation,
  } = plan;

  const healthScore = calculateHealthScore(plan);

  const checkpoints = [
    { name: 'Net Worth', score: scoreForCheckpoint(plan, 'Net Worth') },
    { name: 'Cash Reserve', score: scoreForCheckpoint(plan, 'Cash Reserve') },
    { name: 'Discretionary Income', score: scoreForCheckpoint(plan, 'Discretionary Income') },
    { name: 'Disability Ins.', score: scoreForCheckpoint(plan, 'Disability Insurance') },
    { name: 'Life Insurance', score: scoreForCheckpoint(plan, 'Life Insurance') },
    { name: 'Long-Term Care', score: scoreForCheckpoint(plan, 'Long-Term Care') },
    { name: 'Retirement', score: scoreForCheckpoint(plan, 'Retirement') },
    { name: 'Estate Planning', score: scoreForCheckpoint(plan, 'Estate Planning') },
  ];

  const totalOutflows =
    discretionaryIncome.taxes +
    discretionaryIncome.fixedExpenses +
    discretionaryIncome.variableExpenses;
  const discretionary = discretionaryIncome.grossIncome - totalOutflows;

  const incomeBreakdown = [
    { name: 'Taxes', value: discretionaryIncome.taxes },
    { name: 'Fixed Expenses', value: discretionaryIncome.fixedExpenses },
    { name: 'Variable Expenses', value: discretionaryIncome.variableExpenses },
    { name: 'Discretionary', value: Math.max(0, discretionary) },
  ];

  const completedDocs = estatePlanning.documents.filter((d) => d.completed).length;
  const docCompletionPct =
    estatePlanning.documents.length > 0
      ? Math.round((completedDocs / estatePlanning.documents.length) * 100)
      : 0;

  function goTo(slide: number) {
    setDirection(slide > currentSlide ? 1 : -1);
    setCurrentSlide(slide);
  }

  function next() {
    if (currentSlide < SLIDE_LABELS.length - 1) {
      setDirection(1);
      setCurrentSlide((s) => s + 1);
    }
  }

  function prev() {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide((s) => s - 1);
    }
  }

  function renderInsuranceColumn(
    label: string,
    Icon: typeof Shield,
    coverage: InsuranceCoverage,
  ) {
    const totalCurrent = coverage.currentCoverage.reduce((s, c) => s + c.amount, 0);
    const totalSuggested = coverage.suggestedCoverage.reduce((s, c) => s + c.amount, 0);
    const totalShortage = coverage.shortage.reduce((s, c) => s + c.amount, 0);
    const hasGap = totalShortage > 0;

    return (
      <div className="flex-1 p-5 rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/50">
        <div className="flex items-center gap-2 mb-4">
          <Icon className={cn('w-5 h-5', hasGap ? 'text-red-400' : 'text-emerald-400')} />
          <h4 className="text-sm font-semibold text-[#F0F0F5]">{label}</h4>
        </div>
        <div className="space-y-3">
          <div>
            <p className="text-xs text-[#8B8FA3]">Current Coverage</p>
            <p className="text-lg font-bold text-[#F0F0F5]">
              {totalSuggested === 0 && totalCurrent === 0
                ? 'N/A'
                : totalCurrent > 0
                  ? formatCurrency(totalCurrent)
                  : 'None'}
              {label !== 'Disability' && totalCurrent > 0 ? '' : totalCurrent > 0 ? '/mo' : ''}
            </p>
          </div>
          <div>
            <p className="text-xs text-[#8B8FA3]">Suggested</p>
            <p className="text-sm text-[#F0F0F5]">
              {totalSuggested === 0 ? 'N/A' : formatCurrency(totalSuggested)}
              {label === 'Disability' && totalSuggested > 0 ? '/mo' : ''}
            </p>
          </div>
          {hasGap ? (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-400 font-medium">
                Gap: {formatCurrency(totalShortage)}
                {label === 'Disability' ? '/mo' : ''}
              </p>
              {coverage.shortage.map((s) =>
                s.amount > 0 ? (
                  <p key={s.person} className="text-xs text-red-400/80 mt-1">
                    {s.person}: {formatCurrency(s.amount)}
                  </p>
                ) : null,
              )}
            </div>
          ) : totalSuggested > 0 ? (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <p className="text-xs text-emerald-400 font-medium">Fully covered</p>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-[#1E2A45]/50 border border-[#1E2A45]">
              <p className="text-xs text-[#8B8FA3]">Not applicable</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  function renderSlide() {
    switch (currentSlide) {
      // ── Slide 0: Cover ──────────────────────────────────────────
      case 0:
        return (
          <div className="flex flex-col items-center justify-center min-h-[520px] text-center relative">
            <div className="absolute top-8 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#C9A962]/40 to-transparent" />
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-[#C9A962]/40 to-transparent" />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="w-16 h-1 mx-auto bg-[#C9A962] rounded-full" />
              <h1 className="text-4xl md:text-5xl font-bold text-[#F0F0F5] tracking-tight">
                {household.name}
              </h1>
              <p className="text-xl text-[#C9A962] font-medium">Financial Planning Proposal</p>
              <div className="space-y-2">
                <p className="text-sm text-[#8B8FA3]">Prepared by</p>
                <p className="text-lg text-[#F0F0F5] font-medium">Alanna Shepherd, CFP&reg;</p>
                <p className="text-sm text-[#8B8FA3]">Meridian Wealth Partners</p>
              </div>
              <p className="text-sm text-[#8B8FA3] pt-4">{today}</p>
              <div className="w-16 h-1 mx-auto bg-[#C9A962] rounded-full" />
            </motion.div>
          </div>
        );

      // ── Slide 1: Executive Summary ──────────────────────────────
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2">Executive Summary</h2>
              <p className="text-sm text-[#8B8FA3]">Overall financial health across all Great 8 checkpoints</p>
            </div>

            <div className="flex justify-center">
              <ScoreRing score={healthScore} size={180} strokeWidth={12} label="Financial Health Score" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {checkpoints.map((cp) => (
                <div
                  key={cp.name}
                  className="p-4 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/50 text-center"
                >
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className={cn('w-2.5 h-2.5 rounded-full', dotColor(cp.score))} />
                    <span className="text-xs font-medium text-[#8B8FA3]">{cp.name}</span>
                  </div>
                  <p className="text-2xl font-bold text-[#F0F0F5]">{cp.score}</p>
                  <p className={cn('text-xs mt-1', cp.score >= 80 ? 'text-emerald-400' : cp.score >= 60 ? 'text-[#C9A962]' : 'text-red-400')}>
                    {statusLabel(cp.score)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );

      // ── Slide 2: Net Worth ──────────────────────────────────────
      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="w-6 h-6 text-[#C9A962]" />
                Net Worth
              </h2>
              <div className="flex items-center justify-center gap-2 mt-3">
                <AnimatedNumber
                  value={netWorth.netWorth}
                  format={formatCurrency}
                  className="text-4xl font-bold text-[#C9A962]"
                />
              </div>
            </div>

            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={netWorth.history} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="nwGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C9A962" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C9A962" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fill: '#8B8FA3', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8B8FA3', fontSize: 12 }} tickFormatter={formatChartValue} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: '#8B8FA3' }} formatter={(v) => formatCurrency(v as number)} />
                  <Area type="monotone" dataKey="value" stroke="#C9A962" strokeWidth={2} fill="url(#nwGradient)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-[#8B8FA3] mb-3">Assets — {formatCurrency(netWorth.totalAssets)}</h4>
                <div className="space-y-2">
                  {netWorth.assets.map((a) => (
                    <div key={a.category} className="flex justify-between text-sm">
                      <span className="text-[#8B8FA3]">{a.category}</span>
                      <span className="text-[#F0F0F5] font-medium">{formatCurrency(a.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-[#8B8FA3] mb-3">Liabilities — {formatCurrency(netWorth.totalLiabilities)}</h4>
                {netWorth.liabilities.length > 0 ? (
                  <div className="space-y-2">
                    {netWorth.liabilities.map((l) => (
                      <div key={l.category} className="flex justify-between text-sm">
                        <span className="text-[#8B8FA3]">{l.category}</span>
                        <span className="text-red-400 font-medium">{formatCurrency(l.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-emerald-400 text-sm">No liabilities — debt free</p>
                )}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#C9A962]/5 border border-[#C9A962]/20 text-center">
              <p className="text-sm text-[#C9A962]">
                Net worth has grown{' '}
                <span className="font-bold">
                  {netWorth.history.length >= 2
                    ? formatPercent(
                        ((netWorth.history[netWorth.history.length - 1].value -
                          netWorth.history[0].value) /
                          netWorth.history[0].value) *
                          100,
                      )
                    : 'N/A'}
                </span>{' '}
                over the past {netWorth.history.length > 1 ? netWorth.history.length - 1 : 0} years.
              </p>
            </div>
          </div>
        );

      // ── Slide 3: Cash Reserve ───────────────────────────────────
      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <PiggyBank className="w-6 h-6 text-[#C9A962]" />
                Cash Reserve
              </h2>
              <p className="text-sm text-[#8B8FA3]">Emergency fund adequacy</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/50 text-center">
                <p className="text-xs text-[#8B8FA3] mb-1">Current Reserve</p>
                <p className="text-3xl font-bold text-[#F0F0F5]">
                  {formatCurrency(cashReserve.currentReserve)}
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/50 text-center">
                <p className="text-xs text-[#8B8FA3] mb-1">{cashReserve.targetMonths}-Month Target</p>
                <p className="text-3xl font-bold text-[#C9A962]">
                  {formatCurrency(cashReserve.goal)}
                </p>
              </div>
              <div className="p-6 rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/50 text-center">
                <p className="text-xs text-[#8B8FA3] mb-1">Monthly Expenses</p>
                <p className="text-3xl font-bold text-[#F0F0F5]">
                  {formatCurrency(cashReserve.monthlyExpenses)}
                </p>
              </div>
            </div>

            <div className="p-6 rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/50">
              <div className="flex justify-between mb-3">
                <span className="text-sm text-[#8B8FA3]">Progress Toward Goal</span>
                <span className="text-sm font-medium text-[#F0F0F5]">
                  {formatPercent(cashReserve.goal > 0 ? Math.min(100, (cashReserve.currentReserve / cashReserve.goal) * 100) : 100)}
                </span>
              </div>
              <Progress
                value={cashReserve.goal > 0 ? (cashReserve.currentReserve / cashReserve.goal) * 100 : 100}
                color={cashReserve.shortage > 0 ? 'bg-amber-400' : 'bg-emerald-400'}
              />
              <p className="text-xs text-[#8B8FA3] mt-3">
                Coverage: {cashReserve.monthlyExpenses > 0 ? (cashReserve.currentReserve / cashReserve.monthlyExpenses).toFixed(1) : '—'} months
              </p>
            </div>

            {cashReserve.shortage > 0 ? (
              <div className="p-5 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-red-400 font-semibold text-lg mb-1">
                  Shortage: {formatCurrency(cashReserve.shortage)}
                </p>
                <p className="text-red-400/80 text-sm">
                  Consider directing discretionary funds to close this gap.
                </p>
              </div>
            ) : (
              <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-emerald-400 font-semibold">Cash reserve exceeds target</p>
              </div>
            )}
          </div>
        );

      // ── Slide 4: Discretionary Income ───────────────────────────
      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <Wallet className="w-6 h-6 text-[#C9A962]" />
                Discretionary Income
              </h2>
              <p className="text-sm text-[#8B8FA3]">How income flows from gross to discretionary</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-[#8B8FA3]">Income Waterfall</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Gross Income', amount: discretionaryIncome.grossIncome, color: 'text-[#F0F0F5]' },
                    { label: 'Taxes', amount: -discretionaryIncome.taxes, color: 'text-red-400' },
                    { label: 'Fixed Expenses', amount: -discretionaryIncome.fixedExpenses, color: 'text-red-400' },
                    { label: 'Variable Expenses', amount: -discretionaryIncome.variableExpenses, color: 'text-red-400' },
                    { label: 'Discretionary', amount: Math.max(0, discretionary), color: 'text-[#C9A962]' },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between items-center py-2 border-b border-[#1E2A45]/50 last:border-0">
                      <span className="text-sm text-[#8B8FA3]">{row.label}</span>
                      <span className={cn('text-sm font-semibold', row.color)}>
                        {row.amount < 0 ? `(${formatCurrency(Math.abs(row.amount))})` : formatCurrency(row.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-4 rounded-xl bg-[#C9A962]/10 border border-[#C9A962]/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B8FA3]">Savings Rate</span>
                    <span className="text-xl font-bold text-[#C9A962]">
                      {discretionaryIncome.savingsRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#8B8FA3] mb-4">Breakdown</h4>
                <div className="h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={incomeBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        stroke="none"
                      >
                        {incomeBreakdown.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => formatCurrency(v as number)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-3 justify-center mt-2">
                  {incomeBreakdown.map((item, i) => (
                    <span key={item.name} className="flex items-center gap-1.5 text-xs text-[#8B8FA3]">
                      <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i] }} />
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      // ── Slide 5: Insurance Overview ─────────────────────────────
      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <Shield className="w-6 h-6 text-[#C9A962]" />
                Insurance Overview
              </h2>
              <p className="text-sm text-[#8B8FA3]">Disability, life, and long-term care coverage assessment</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {renderInsuranceColumn('Disability', Shield, disabilityInsurance)}
              {renderInsuranceColumn('Life Insurance', Heart, lifeInsurance)}
              {renderInsuranceColumn('Long-Term Care', HandHelping, longTermCare)}
            </div>
          </div>
        );

      // ── Slide 6: Retirement Assets ──────────────────────────────
      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <Landmark className="w-6 h-6 text-[#C9A962]" />
                Retirement Assets
              </h2>
              <p className="text-sm text-[#8B8FA3]">Retirement readiness assessment</p>
            </div>

            <div className="flex justify-center">
              <ScoreRing
                score={Math.min(100, Math.round(retirementAssets.percentFunded))}
                size={160}
                strokeWidth={10}
                label={`${retirementAssets.percentFunded.toFixed(1)}% Funded`}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/50 text-center">
                <p className="text-xs text-[#8B8FA3] mb-1">Total Earmarked</p>
                <p className="text-2xl font-bold text-[#F0F0F5]">
                  {formatCurrency(retirementAssets.totalEarmarked)}
                </p>
              </div>
              <div className="p-5 rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/50 text-center">
                <p className="text-xs text-[#8B8FA3] mb-1">Retirement Goal</p>
                <p className="text-2xl font-bold text-[#C9A962]">
                  {formatCurrency(retirementAssets.retirementGoal)}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#8B8FA3] mb-3">Account Breakdown</h4>
              <div className="space-y-2">
                {retirementAssets.accounts.map((acct) => (
                  <div key={acct.id} className="flex justify-between items-center py-2 px-4 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/30">
                    <div>
                      <p className="text-sm text-[#F0F0F5]">{acct.name}</p>
                      <p className="text-xs text-[#8B8FA3]">
                        {acct.type.toUpperCase()}
                        {acct.contributionRate ? ` · ${acct.contributionRate}% contribution` : ''}
                        {acct.employerMatch ? ` · ${acct.employerMatch}% match` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#F0F0F5]">
                      {acct.balance > 0 ? formatCurrency(acct.balance) : 'Pension'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {retirementAssets.shortage > 0 ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                <p className="text-red-400 font-semibold">
                  Shortage: {formatCurrency(retirementAssets.shortage)}
                </p>
                <p className="text-red-400/80 text-xs mt-1">
                  Projected shortfall by age {retirementAssets.projectedAge} at current savings rate
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                <p className="text-emerald-400 font-semibold">
                  On track — funded through age {retirementAssets.projectedAge}
                </p>
              </div>
            )}
          </div>
        );

      // ── Slide 7: Estate Planning ────────────────────────────────
      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <ScrollText className="w-6 h-6 text-[#C9A962]" />
                Estate Planning
              </h2>
              <p className="text-sm text-[#8B8FA3]">
                Document readiness and beneficiary structure
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-[#8B8FA3] mb-4">Document Checklist</h4>
                <div className="space-y-3">
                  {estatePlanning.documents.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-center justify-between py-2 px-4 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/30"
                    >
                      <div className="flex items-center gap-3">
                        {doc.completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        )}
                        <span className="text-sm text-[#F0F0F5]">{doc.name}</span>
                      </div>
                      {doc.lastReviewed && (
                        <span className="text-xs text-[#8B8FA3]">
                          Reviewed {new Date(doc.lastReviewed).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex justify-center">
                  <ScoreRing
                    score={docCompletionPct}
                    size={140}
                    strokeWidth={10}
                    label={`${completedDocs}/${estatePlanning.documents.length} Complete`}
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#8B8FA3] mb-3">Beneficiaries</h4>
                  {estatePlanning.beneficiaries.length > 0 ? (
                    <div className="space-y-2">
                      {estatePlanning.beneficiaries.map((b) => (
                        <div
                          key={b.name}
                          className="flex justify-between py-2 px-4 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/30"
                        >
                          <div>
                            <p className="text-sm text-[#F0F0F5]">{b.name}</p>
                            <p className="text-xs text-[#8B8FA3]">{b.relationship}</p>
                          </div>
                          <Badge variant="gold">{b.percentage}%</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-center">
                      <p className="text-red-400 text-sm">No beneficiaries designated</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      // ── Slide 8: Asset Allocation ───────────────────────────────
      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <PieChartIcon className="w-6 h-6 text-[#C9A962]" />
                Asset Allocation
              </h2>
              <p className="text-sm text-[#8B8FA3]">Current allocation vs. recommended target</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-sm font-medium text-[#8B8FA3] mb-2 text-center">Current</h4>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocation.current}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        dataKey="percentage"
                        nameKey="category"
                        stroke="none"
                      >
                        {assetAllocation.current.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-[#8B8FA3] mb-2 text-center">Target</h4>
                <div className="h-[240px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocation.target}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        dataKey="percentage"
                        nameKey="category"
                        stroke="none"
                      >
                        {assetAllocation.target.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => `${v}%`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              {[...new Set([...assetAllocation.current.map((c) => c.category), ...assetAllocation.target.map((t) => t.category)])].map(
                (cat, i) => (
                  <span key={cat} className="flex items-center gap-1.5 text-xs text-[#8B8FA3]">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {cat}
                  </span>
                ),
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#8B8FA3] mb-3">Difference Analysis</h4>
              <div className="space-y-2">
                {assetAllocation.current.map((c) => {
                  const target = assetAllocation.target.find((t) => t.category === c.category);
                  const diff = target ? c.percentage - target.percentage : c.percentage;
                  if (diff === 0) return null;
                  return (
                    <div key={c.category} className="flex justify-between items-center py-1.5 px-4 rounded-lg border border-[#1E2A45]/50">
                      <span className="text-sm text-[#8B8FA3]">{c.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#8B8FA3]">{c.percentage}% → {target?.percentage ?? 0}%</span>
                        <Badge variant={Math.abs(diff) > 3 ? 'warning' : 'default'}>
                          {diff > 0 ? '+' : ''}{diff}%
                        </Badge>
                      </div>
                    </div>
                  );
                })}
                {assetAllocation.target
                  .filter((t) => !assetAllocation.current.find((c) => c.category === t.category))
                  .map((t) => (
                    <div key={t.category} className="flex justify-between items-center py-1.5 px-4 rounded-lg border border-[#1E2A45]/50">
                      <span className="text-sm text-[#8B8FA3]">{t.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-[#8B8FA3]">0% → {t.percentage}%</span>
                        <Badge variant="info">New</Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        );

      // ── Slide 9: Your Great 8 Summary ────────────────────────────
      case 9: {
        // Build the 8 checkpoint value summaries
        const g8Items = [
          {
            num: 1,
            label: 'Net Worth',
            value: formatCurrency(netWorth.netWorth),
            sub: `${formatCurrency(netWorth.totalAssets)} assets`,
            score: scoreForCheckpoint(plan, 'Net Worth'),
          },
          {
            num: 2,
            label: 'Cash Reserve',
            value: formatCurrency(cashReserve.currentReserve),
            sub: `${(cashReserve.currentReserve / (cashReserve.monthlyExpenses || 1)).toFixed(1)} months`,
            score: scoreForCheckpoint(plan, 'Cash Reserve'),
          },
          {
            num: 3,
            label: 'Discretionary Income',
            value: formatCurrency(
              Math.max(0, discretionaryIncome.grossIncome - (discretionaryIncome.taxes + discretionaryIncome.fixedExpenses + discretionaryIncome.variableExpenses))
            ),
            sub: 'annual discretionary',
            score: scoreForCheckpoint(plan, 'Discretionary Income'),
          },
          {
            num: 4,
            label: 'Disability Insurance',
            value: disabilityInsurance.currentCoverage.length > 0
              ? disabilityInsurance.currentCoverage.map(c => formatCurrency(c.amount)).join(' & ')
              : 'No coverage',
            sub: disabilityInsurance.currentCoverage.length > 0
              ? disabilityInsurance.currentCoverage.map(c => c.person.split(' ')[0]).join(' & ')
              : '',
            score: scoreForCheckpoint(plan, 'Disability Insurance'),
          },
          {
            num: 5,
            label: 'Life Insurance',
            value: lifeInsurance.currentCoverage.length > 0
              ? lifeInsurance.currentCoverage.map(c => formatCurrency(c.amount)).join(' & ')
              : 'No coverage',
            sub: lifeInsurance.currentCoverage.length > 0
              ? lifeInsurance.currentCoverage.map(c => c.person.split(' ')[0]).join(' & ')
              : '',
            score: scoreForCheckpoint(plan, 'Life Insurance'),
          },
          {
            num: 6,
            label: 'Long-Term Care',
            value: longTermCare.currentCoverage.length > 0 && longTermCare.currentCoverage.some(c => c.amount > 0)
              ? longTermCare.currentCoverage.map(c => formatCurrency(c.amount)).join(' & ')
              : '$0 & $0',
            sub: longTermCare.currentCoverage.length > 0 && longTermCare.currentCoverage.some(c => c.amount > 0)
              ? longTermCare.currentCoverage.map(c => c.person.split(' ')[0]).join(' & ')
              : 'Review coverage',
            score: scoreForCheckpoint(plan, 'Long-Term Care'),
          },
          {
            num: 7,
            label: 'Assets Earmarked\nToward Retirement',
            value: formatCurrency(retirementAssets.totalEarmarked),
            sub: `${retirementAssets.percentFunded}% of goal`,
            score: scoreForCheckpoint(plan, 'Retirement'),
          },
          {
            num: 8,
            label: 'Estate Planning',
            value: formatCurrency(estatePlanning.totalEstateValue),
            sub: `${estatePlanning.documents.filter(d => d.completed).length}/${estatePlanning.documents.length} docs complete`,
            score: scoreForCheckpoint(plan, 'Estate Planning'),
          },
        ];

        // 3x3 grid: [1, 2, 3], [4, CENTER, 5], [6, 7, 8]
        const gridOrder = [0, 1, 2, 3, null, 4, 5, 6, 7]; // null = center title cell

        return (
          <div className="space-y-4">
            <div className="text-center mb-2">
              <p className="text-sm text-[#8B8FA3] uppercase tracking-widest">to conclude —</p>
              <h2 className="text-4xl font-bold text-[#F0F0F5] mt-1">your great 8</h2>
              <p className="text-sm text-[#8B8FA3] mt-1">8 checkpoints for your financial health</p>
              <div className="w-16 h-0.5 bg-[#C9A962] mx-auto mt-3 rounded-full" />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {gridOrder.map((itemIdx, cellIdx) => {
                if (itemIdx === null) {
                  // Center title cell
                  return (
                    <div
                      key="center"
                      className="rounded-2xl border border-[#C9A962]/30 bg-gradient-to-br from-[#C9A962]/10 to-[#C9A962]/5 flex flex-col items-center justify-center p-4 text-center min-h-[130px]"
                    >
                      <p className="text-[#C9A962] text-xs font-medium tracking-wider uppercase mb-1">your</p>
                      <p className="text-3xl font-black text-[#C9A962]">8</p>
                      <p className="text-[#C9A962] text-xs font-medium tracking-wider uppercase mt-1">checkpoints</p>
                    </div>
                  );
                }

                const item = g8Items[itemIdx];
                const scoreColor = item.score >= 80 ? '#34D399' : item.score >= 60 ? '#C9A962' : '#F87171';

                return (
                  <div
                    key={item.num}
                    className="relative rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/70 p-4 min-h-[130px] flex flex-col justify-between overflow-hidden hover:border-[#2A3A5C] transition-colors"
                  >
                    {/* Large background number */}
                    <span
                      className="absolute right-2 top-1 text-[72px] font-black leading-none select-none pointer-events-none"
                      style={{ color: scoreColor, opacity: 0.07 }}
                    >
                      {item.num}
                    </span>

                    <div>
                      <p className="text-[10px] font-semibold text-[#8B8FA3] uppercase tracking-wider leading-tight whitespace-pre-line">
                        {item.label}
                      </p>
                    </div>

                    <div>
                      <p
                        className="text-lg font-bold leading-tight mt-1"
                        style={{ color: scoreColor }}
                      >
                        {item.value}
                      </p>
                      {item.sub && (
                        <p className="text-xs text-[#4A5068] mt-0.5">{item.sub}</p>
                      )}
                    </div>

                    {/* Score dot */}
                    <div
                      className="absolute top-3 right-3 w-2 h-2 rounded-full"
                      style={{ backgroundColor: scoreColor }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      // ── Slide 10: Recommendations & Next Steps ───────────────────
      case 10:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-[#F0F0F5] mb-2 flex items-center justify-center gap-2">
                <ListChecks className="w-6 h-6 text-[#C9A962]" />
                Recommendations &amp; Next Steps
              </h2>
              <p className="text-sm text-[#8B8FA3]">Priority actions to strengthen your financial plan</p>
            </div>

            <div className="space-y-4">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex gap-4 p-4 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/50"
                >
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C9A962]/10 border border-[#C9A962]/30 flex items-center justify-center text-sm font-bold text-[#C9A962]">
                    {i + 1}
                  </span>
                  <p className="text-sm text-[#F0F0F5] leading-relaxed pt-1">{rec}</p>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                  <p className="text-emerald-400 font-medium">All checkpoints are in excellent standing.</p>
                </div>
              )}
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#8B8FA3] mb-3">Action Items</h4>
              <div className="space-y-2">
                {[
                  'Review and approve this financial plan presentation',
                  'Gather any outstanding documents identified above',
                  'Schedule follow-up meeting to begin implementation',
                  'Coordinate with external professionals (attorney, CPA) as needed',
                  'Set calendar reminder for next quarterly review',
                ].map((item) => (
                  <label key={item} className="flex items-center gap-3 py-2 px-4 rounded-xl border border-[#1E2A45] bg-[#0A0F1C]/30 cursor-default">
                    <span className="w-5 h-5 rounded border-2 border-[#1E2A45] flex-shrink-0" />
                    <span className="text-sm text-[#F0F0F5]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="text-center pt-4">
              <Button size="lg">
                <CalendarCheck className="w-5 h-5" />
                Schedule Follow-up Meeting
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto print:max-w-none print:bg-white print:text-black">
        {/* ── Header ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8 no-print">
          <div className="flex items-center gap-4">
            <Link href={`/clients/${id}/plan`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4" /> Back to Plan
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-[#F0F0F5]">
                {household.name} — Financial Plan Presentation
              </h1>
              <p className="text-sm text-[#8B8FA3]">{today}</p>
            </div>
          </div>
          <a href={`/api/pdf/${id}`} download>
            <Button variant="secondary">
              <FileDown className="w-4 h-4" /> Export PDF
            </Button>
          </a>
        </div>

        {/* ── Slide Content ─────────────────────────────────────── */}
        <Card className="min-h-[580px] relative overflow-hidden print:border-none print:shadow-none print:bg-white">
          <div className="flex items-center justify-between mb-4 no-print">
            <Badge variant="gold">{SLIDE_LABELS[currentSlide]}</Badge>
            <span className="text-xs text-[#8B8FA3]">
              {currentSlide + 1} / {SLIDE_LABELS.length}
            </span>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentSlide}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* ── Navigation ────────────────────────────────────────── */}
        <div className="flex items-center justify-between mt-6 no-print">
          <Button variant="ghost" onClick={prev} disabled={currentSlide === 0}>
            <ChevronLeft className="w-5 h-5" /> Previous
          </Button>

          <div className="flex items-center gap-2">
            {SLIDE_LABELS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all duration-200',
                  i === currentSlide
                    ? 'bg-[#C9A962] scale-125'
                    : 'bg-[#1E2A45] hover:bg-[#2A3A5C]',
                )}
                aria-label={`Go to slide ${i + 1}: ${SLIDE_LABELS[i]}`}
              />
            ))}
          </div>

          <Button variant="ghost" onClick={next} disabled={currentSlide === SLIDE_LABELS.length - 1}>
            Next <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* ── Slide Label Bar ───────────────────────────────────── */}
        <div className="mt-3 text-center no-print">
          <p className="text-xs text-[#8B8FA3]">
            {SLIDE_LABELS[currentSlide]}
            {currentSlide > 0 && currentSlide < SLIDE_LABELS.length - 1 && (
              <span className="text-[#1E2A45] mx-2">·</span>
            )}
            {currentSlide > 0 && currentSlide < SLIDE_LABELS.length - 1 && (
              <span>Use arrow keys or click dots to navigate</span>
            )}
          </p>
        </div>

        {/* ── Print Styles ──────────────────────────────────────── */}
        <style jsx global>{`
          @media print {
            body { background: white !important; color: black !important; }
            .no-print { display: none !important; }
            main { margin-left: 0 !important; padding: 0 !important; }
          }
        `}</style>
      </div>
    </AppShell>
  );
}
