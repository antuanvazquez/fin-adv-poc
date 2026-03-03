'use client';

import { use, useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Sparkles,
  Presentation,
  ClipboardList,
  CheckCircle2,
  Circle,
  TrendingUp,
  RefreshCw,
  Send,
  Bot,
  User,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
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
import { AppShell } from '@/components/layout/app-shell';
import { getHousehold } from '@/lib/mock-data';
import { formatCurrency, formatPercent, cn } from '@/lib/utils';
import { useAI } from '@/hooks/useAI';
import type { InsuranceCoverage } from '@/lib/types';

const TAB_LABELS = [
  'Net Worth',
  'Cash Reserve',
  'Discretionary Income',
  'Disability Insurance',
  'Life Insurance',
  'Long-Term Care',
  'Retirement Assets',
  'Estate Planning',
];

const TOOLTIP_STYLE = {
  backgroundColor: '#131A2E',
  border: '1px solid #1E2A45',
  borderRadius: '12px',
};

const PIE_COLORS = ['#F87171', '#60A5FA', '#A78BFA', '#C9A962'];

function formatChartValue(val: number) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}K`;
  return `$${val}`;
}

function InsuranceTab({ coverage }: { coverage: InsuranceCoverage }) {
  const barData = coverage.suggestedCoverage.map((s, i) => ({
    person: s.person.split(' ')[0],
    suggested: s.amount,
    current: coverage.currentCoverage[i]?.amount ?? 0,
  }));
  const totalShortage = coverage.shortage.reduce((sum, s) => sum + s.amount, 0);
  const totalSuggested = coverage.suggestedCoverage.reduce((sum, s) => sum + s.amount, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h3 className="text-sm font-medium text-[#8B8FA3] mb-3">Policies</h3>
        {coverage.policies.length === 0 ? (
          <div className="py-8 text-center rounded-xl border border-dashed border-[#1E2A45]">
            <p className="text-[#8B8FA3] text-sm">No policies on file</p>
            <p className="text-[#8B8FA3]/60 text-xs mt-1">
              {totalSuggested > 0
                ? 'Coverage is recommended — see gap analysis'
                : 'No coverage needed at this time'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[#8B8FA3] border-b border-[#1E2A45]">
                  <th className="text-left py-2 font-medium">Owner</th>
                  <th className="text-left py-2 font-medium">Type</th>
                  <th className="text-right py-2 font-medium">Benefit</th>
                  <th className="text-right py-2 font-medium">Premium</th>
                </tr>
              </thead>
              <tbody>
                {coverage.policies.map((p) => (
                  <tr key={p.id} className="border-b border-[#1E2A45]/50">
                    <td className="py-3 text-[#F0F0F5]">{p.owner}</td>
                    <td className="py-3 text-[#8B8FA3]">{p.type}</td>
                    <td className="py-3 text-right text-[#F0F0F5] font-medium">
                      {formatCurrency(p.benefit)}
                      {p.premiumFrequency !== 'monthly' ? '' : '/mo'}
                    </td>
                    <td className="py-3 text-right text-[#8B8FA3]">
                      {formatCurrency(p.premium)}/
                      {p.premiumFrequency === 'monthly'
                        ? 'mo'
                        : p.premiumFrequency === 'quarterly'
                          ? 'qtr'
                          : 'yr'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalShortage > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-red-500/5 border border-red-500/20">
            <p className="text-red-400 text-sm font-semibold mb-2">
              Coverage Shortage
            </p>
            {coverage.shortage.map((s) => (
              <div
                key={s.person}
                className="flex justify-between py-1 text-sm"
              >
                <span className="text-[#8B8FA3]">{s.person}</span>
                <span className="text-red-400 font-medium">
                  {s.amount > 0 ? formatCurrency(s.amount) : '—'}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2 mt-2 border-t border-red-500/20 text-sm">
              <span className="text-red-400 font-semibold">Total Shortage</span>
              <span className="text-red-400 font-bold">
                {formatCurrency(totalShortage)}
              </span>
            </div>
          </div>
        )}

        {totalShortage === 0 && totalSuggested > 0 && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <p className="text-emerald-400 text-sm font-medium">
              Coverage meets recommended levels
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-[#8B8FA3] mb-4">
          Suggested vs Current Coverage
        </h3>
        {totalSuggested > 0 ? (
          <>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ left: 10, right: 20 }}
                  barGap={4}
                >
                  <XAxis
                    type="number"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B8FA3', fontSize: 12 }}
                    tickFormatter={formatChartValue}
                  />
                  <YAxis
                    dataKey="person"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8B8FA3', fontSize: 12 }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelStyle={{ color: '#8B8FA3' }}
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Bar
                    dataKey="suggested"
                    fill="#C9A962"
                    radius={[0, 4, 4, 0]}
                    name="Suggested"
                  />
                  <Bar
                    dataKey="current"
                    fill="#34D399"
                    radius={[0, 4, 4, 0]}
                    name="Current"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 text-xs text-[#8B8FA3]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#C9A962]" />
                Suggested
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-400" />
                Current
              </span>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-[220px] text-[#8B8FA3] text-sm">
            No coverage recommended
          </div>
        )}
      </div>
    </div>
  );
}

export default function FinancialPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const household = getHousehold(id);
  const [activeTab, setActiveTab] = useState(0);
  const [targetMonths, setTargetMonths] = useState(
    household?.financialPlan.cashReserve.targetMonths ?? 6,
  );
  const { loading: aiLoading, result: aiResult, analyzePlan } = useAI();
  const chatAI = useAI();
  const [chatHistory, setChatHistory] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  if (!household) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
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
  } = plan;

  const crGoal = cashReserve.monthlyExpenses * targetMonths;
  const crShortage = Math.max(0, crGoal - cashReserve.currentReserve);
  const crFundedPct =
    crGoal > 0
      ? Math.min(100, (cashReserve.currentReserve / crGoal) * 100)
      : 100;

  const totalOutflows =
    discretionaryIncome.taxes +
    discretionaryIncome.fixedExpenses +
    discretionaryIncome.variableExpenses;
  const discretionary = discretionaryIncome.grossIncome - totalOutflows;
  const savingsRate =
    discretionaryIncome.grossIncome > 0
      ? (discretionary / discretionaryIncome.grossIncome) * 100
      : 0;

  const pieData = [
    { name: 'Taxes', value: discretionaryIncome.taxes },
    { name: 'Fixed Expenses', value: discretionaryIncome.fixedExpenses },
    { name: 'Variable Expenses', value: discretionaryIncome.variableExpenses },
    { name: 'Discretionary', value: Math.max(0, discretionary) },
  ];

  const completedDocs = estatePlanning.documents.filter(
    (d) => d.completed,
  ).length;
  const docCompletionPct =
    estatePlanning.documents.length > 0
      ? Math.round((completedDocs / estatePlanning.documents.length) * 100)
      : 0;

  const handleRunAnalysis = () => {
    analyzePlan(JSON.stringify(plan));
  };

  const planContext = JSON.stringify({
    household: household.name,
    clients: household.clients.map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      age: new Date().getFullYear() - new Date(c.dateOfBirth).getFullYear(),
      occupation: c.occupation,
      employer: c.employer,
      retirementAge: c.retirementAge,
      riskTolerance: c.riskTolerance,
    })),
    healthScore: plan.healthScore,
    netWorth: plan.netWorth,
    cashReserve: plan.cashReserve,
    discretionaryIncome: plan.discretionaryIncome,
    disabilityInsurance: { shortage: plan.disabilityInsurance.shortage, currentCoverage: plan.disabilityInsurance.currentCoverage },
    lifeInsurance: { shortage: plan.lifeInsurance.shortage, currentCoverage: plan.lifeInsurance.currentCoverage },
    longTermCare: { shortage: plan.longTermCare.shortage, currentCoverage: plan.longTermCare.currentCoverage },
    retirementAssets: plan.retirementAssets,
    estatePlanning: plan.estatePlanning,
    assetAllocation: plan.assetAllocation,
    activeSignals: household.signals.filter((s) => s.status === 'active').map((s) => `[${s.type}] ${s.title}: ${s.description}`),
  });

  const handleChatSend = async () => {
    const msg = chatInput.trim();
    if (!msg || chatAI.loading) return;
    setChatInput('');
    setChatHistory((prev) => [...prev, { role: 'user', content: msg }]);
    const response = await chatAI.analyzeChat('message', msg, planContext, 'plan-chat');
    if (response) {
      setChatHistory((prev) => [...prev, { role: 'assistant', content: response }]);
    }
    chatAI.reset();
  };

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatAI.loading]);

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px] space-y-6"
      >
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/clients/${id}`}
              className="rounded-xl border border-[#1E2A45] p-2 text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-[#F0F0F5]">
                {household.name} — Financial Plan
              </h1>
              <p className="text-sm text-[#8B8FA3] mt-1">
                Great 8 Financial Plan Builder &middot; Last updated{' '}
                {new Date(plan.lastUpdated).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <ScoreRing
              score={plan.healthScore}
              size={100}
              strokeWidth={7}
              label="Health Score"
            />
            <div className="flex flex-col gap-2">
              <Button onClick={handleRunAnalysis} disabled={aiLoading}>
                <RefreshCw className={cn('w-4 h-4', aiLoading && 'animate-spin')} />
                {aiLoading ? 'Refreshing...' : 'Refresh AI Plan'}
              </Button>
              <Link href={`/clients/${id}/plan/present`}>
                <Button variant="secondary" size="sm" className="w-full">
                  <Presentation className="w-4 h-4" /> Present Plan
                </Button>
              </Link>
              <a
                href={`/clients/${id}/intake`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="sm" className="w-full">
                  <ClipboardList className="w-4 h-4" /> Request Client Info
                </Button>
              </a>
            </div>
          </div>
        </div>

        {/* ── Tab Bar ──────────────────────────────────────────────────────── */}
        <div className="flex overflow-x-auto border-b border-[#1E2A45] gap-1 scrollbar-hide">
          {TAB_LABELS.map((label, i) => (
            <button
              key={label}
              onClick={() => setActiveTab(i)}
              className={cn(
                'relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
                activeTab === i
                  ? 'text-[#C9A962]'
                  : 'text-[#8B8FA3] hover:text-[#F0F0F5]',
              )}
            >
              {label}
              {activeTab === i && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#C9A962]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ──────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <Card>
              {/* ─ Tab 0: Net Worth ─────────────────────────────────────────── */}
              {activeTab === 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider mb-3">
                      Assets
                    </h3>
                    <div className="space-y-0">
                      {netWorth.assets.map((a) => (
                        <div
                          key={a.category}
                          className="flex items-center justify-between py-2.5 border-b border-[#1E2A45]/50"
                        >
                          <span className="text-sm text-[#F0F0F5]">
                            {a.category}
                          </span>
                          <span className="text-sm font-medium text-[#F0F0F5]">
                            {formatCurrency(a.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between py-2.5 mt-1">
                      <span className="text-sm font-semibold text-[#F0F0F5]">
                        Total Assets
                      </span>
                      <span className="text-sm font-bold text-emerald-400">
                        {formatCurrency(netWorth.totalAssets)}
                      </span>
                    </div>

                    {netWorth.liabilities.length > 0 && (
                      <>
                        <h3 className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider mb-3 mt-6">
                          Liabilities
                        </h3>
                        <div className="space-y-0">
                          {netWorth.liabilities.map((l) => (
                            <div
                              key={l.category}
                              className="flex items-center justify-between py-2.5 border-b border-[#1E2A45]/50"
                            >
                              <span className="text-sm text-[#F0F0F5]">
                                {l.category}
                              </span>
                              <span className="text-sm font-medium text-red-400">
                                {formatCurrency(l.amount)}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-between py-2.5 mt-1">
                          <span className="text-sm font-semibold text-[#F0F0F5]">
                            Total Liabilities
                          </span>
                          <span className="text-sm font-bold text-red-400">
                            {formatCurrency(netWorth.totalLiabilities)}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between py-4 mt-4 border-t-2 border-[#1E2A45]">
                      <span className="text-base font-bold text-[#F0F0F5]">
                        Net Worth
                      </span>
                      <span className="text-base font-bold text-[#C9A962]">
                        {formatCurrency(netWorth.netWorth)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider mb-3">
                      Net Worth History
                    </h3>
                    <div className="h-[320px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={netWorth.history}
                          margin={{ top: 5, right: 5, bottom: 5, left: 10 }}
                        >
                          <defs>
                            <linearGradient
                              id="nwGold"
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
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={{ color: '#8B8FA3' }}
                            formatter={(val) => [
                              formatCurrency(val as number),
                              'Net Worth',
                            ]}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#C9A962"
                            fill="url(#nwGold)"
                            strokeWidth={2}
                            animationDuration={1000}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Tab 1: Cash Reserve ──────────────────────────────────────── */}
              {activeTab === 1 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm text-[#8B8FA3]">
                        Current Reserve
                      </span>
                      <span className="text-sm font-medium text-[#F0F0F5]">
                        {formatCurrency(cashReserve.currentReserve)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm text-[#8B8FA3]">
                        Monthly Expenses
                      </span>
                      <span className="text-sm font-medium text-[#F0F0F5]">
                        {formatCurrency(cashReserve.monthlyExpenses)}
                      </span>
                    </div>

                    <div>
                      <span className="text-sm text-[#8B8FA3] block mb-2">
                        Target Months
                      </span>
                      <div className="flex gap-2">
                        {[3, 4, 5, 6].map((m) => (
                          <button
                            key={m}
                            onClick={() => setTargetMonths(m)}
                            className={cn(
                              'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                              targetMonths === m
                                ? 'bg-[#C9A962] text-[#0A0F1C] shadow-lg shadow-[#C9A962]/20'
                                : 'bg-[#1E2A45] text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/80',
                            )}
                          >
                            {m} mo
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm text-[#8B8FA3]">
                        Goal ({targetMonths} months)
                      </span>
                      <span className="text-sm font-bold text-[#C9A962]">
                        {formatCurrency(crGoal)}
                      </span>
                    </div>

                    <div className="flex justify-between items-center py-2.5">
                      <span className="text-sm text-[#8B8FA3]">
                        Coverage Ratio
                      </span>
                      <span className="text-sm font-medium text-[#F0F0F5]">
                        {(
                          cashReserve.currentReserve /
                          cashReserve.monthlyExpenses
                        ).toFixed(1)}{' '}
                        months
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-6">
                    <div className="w-full max-w-xs">
                      <div className="flex justify-between text-xs text-[#8B8FA3] mb-2">
                        <span>{formatPercent(crFundedPct)} funded</span>
                        <span>
                          {formatCurrency(cashReserve.currentReserve)} /{' '}
                          {formatCurrency(crGoal)}
                        </span>
                      </div>
                      <Progress
                        value={crFundedPct}
                        color={
                          crShortage > 0 ? 'bg-amber-400' : 'bg-emerald-400'
                        }
                      />
                    </div>
                    {crShortage > 0 ? (
                      <div className="text-center p-6 rounded-xl bg-red-500/5 border border-red-500/20">
                        <p className="text-xs text-[#8B8FA3] mb-1">Shortage</p>
                        <p className="text-4xl font-bold text-red-400">
                          {formatCurrency(crShortage)}
                        </p>
                        <p className="text-xs text-[#8B8FA3] mt-2">
                          below {targetMonths}-month target
                        </p>
                      </div>
                    ) : (
                      <div className="text-center p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <p className="text-xs text-[#8B8FA3] mb-1">Status</p>
                        <p className="text-3xl font-bold text-emerald-400">
                          Fully Funded
                        </p>
                        <p className="text-xs text-[#8B8FA3] mt-2">
                          Exceeds {targetMonths}-month target
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ─ Tab 2: Discretionary Income ──────────────────────────────── */}
              {activeTab === 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-0">
                    <div className="flex justify-between py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm text-[#F0F0F5]">
                        Gross Income
                      </span>
                      <span className="text-sm font-medium text-[#F0F0F5]">
                        {formatCurrency(discretionaryIncome.grossIncome)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm text-red-400 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: PIE_COLORS[0] }}
                        />
                        Taxes
                      </span>
                      <span className="text-sm font-medium text-red-400">
                        &minus;{formatCurrency(discretionaryIncome.taxes)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm text-blue-400 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: PIE_COLORS[1] }}
                        />
                        Fixed Expenses
                      </span>
                      <span className="text-sm font-medium text-blue-400">
                        &minus;
                        {formatCurrency(discretionaryIncome.fixedExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm text-purple-400 flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: PIE_COLORS[2] }}
                        />
                        Variable Expenses
                      </span>
                      <span className="text-sm font-medium text-purple-400">
                        &minus;
                        {formatCurrency(discretionaryIncome.variableExpenses)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2.5 border-b border-[#1E2A45]/50">
                      <span className="text-sm font-medium text-[#8B8FA3]">
                        Total Outflows
                      </span>
                      <span className="text-sm font-bold text-[#F0F0F5]">
                        {formatCurrency(totalOutflows)}
                      </span>
                    </div>
                    <div className="flex justify-between py-3 mt-2 border-t-2 border-[#1E2A45]">
                      <span className="text-base font-bold text-[#C9A962] flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm"
                          style={{ backgroundColor: PIE_COLORS[3] }}
                        />
                        Discretionary
                      </span>
                      <span className="text-base font-bold text-[#C9A962]">
                        {formatCurrency(discretionary)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 mt-2 rounded-xl bg-emerald-500/5 border border-emerald-500/20 px-4">
                      <span className="text-sm text-[#8B8FA3] flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Savings Rate
                      </span>
                      <span className="text-lg font-bold text-emerald-400">
                        {savingsRate.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider mb-3">
                      Income Breakdown
                    </h3>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={105}
                            paddingAngle={3}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {pieData.map((_, i) => (
                              <Cell key={i} fill={PIE_COLORS[i]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelStyle={{ color: '#8B8FA3' }}
                            formatter={(val) => formatCurrency(val as number)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4 mt-2">
                      {pieData.map((d, i) => (
                        <span
                          key={d.name}
                          className="flex items-center gap-1.5 text-xs text-[#8B8FA3]"
                        >
                          <span
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: PIE_COLORS[i] }}
                          />
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Tab 3: Disability Insurance ──────────────────────────────── */}
              {activeTab === 3 && (
                <InsuranceTab coverage={disabilityInsurance} />
              )}

              {/* ─ Tab 4: Life Insurance ────────────────────────────────────── */}
              {activeTab === 4 && <InsuranceTab coverage={lifeInsurance} />}

              {/* ─ Tab 5: Long-Term Care ────────────────────────────────────── */}
              {activeTab === 5 && <InsuranceTab coverage={longTermCare} />}

              {/* ─ Tab 6: Retirement Assets ─────────────────────────────────── */}
              {activeTab === 6 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider mb-3">
                      Retirement Accounts
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[#8B8FA3] border-b border-[#1E2A45]">
                            <th className="text-left py-2 font-medium">
                              Account
                            </th>
                            <th className="text-left py-2 font-medium">
                              Type
                            </th>
                            <th className="text-right py-2 font-medium">
                              Balance
                            </th>
                            <th className="text-right py-2 font-medium">
                              Rate
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {retirementAssets.accounts.map((acct) => (
                            <tr
                              key={acct.id}
                              className="border-b border-[#1E2A45]/50"
                            >
                              <td className="py-3 text-[#F0F0F5] max-w-[180px] truncate">
                                {acct.name}
                              </td>
                              <td className="py-3">
                                <Badge variant="gold">
                                  {acct.type.toUpperCase()}
                                </Badge>
                              </td>
                              <td className="py-3 text-right text-[#F0F0F5] font-medium">
                                {formatCurrency(acct.balance)}
                              </td>
                              <td className="py-3 text-right text-[#8B8FA3]">
                                {acct.contributionRate != null
                                  ? `${acct.contributionRate}%`
                                  : '—'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 space-y-2">
                      <div className="flex justify-between py-2.5 border-b border-[#1E2A45]/50">
                        <span className="text-sm text-[#8B8FA3]">
                          Total Earmarked
                        </span>
                        <span className="text-sm font-bold text-[#F0F0F5]">
                          {formatCurrency(retirementAssets.totalEarmarked)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2.5 border-b border-[#1E2A45]/50">
                        <span className="text-sm text-[#8B8FA3]">
                          Retirement Goal
                        </span>
                        <span className="text-sm font-bold text-[#C9A962]">
                          {formatCurrency(retirementAssets.retirementGoal)}
                        </span>
                      </div>
                      {retirementAssets.shortage > 0 && (
                        <div className="flex justify-between py-2.5">
                          <span className="text-sm text-red-400 font-medium">
                            Shortage
                          </span>
                          <span className="text-sm font-bold text-red-400">
                            {formatCurrency(retirementAssets.shortage)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center gap-6">
                    <ScoreRing
                      score={Math.min(
                        100,
                        Math.round(retirementAssets.percentFunded),
                      )}
                      size={160}
                      strokeWidth={12}
                      label={`${retirementAssets.percentFunded}% Funded`}
                    />

                    <div className="w-full max-w-xs space-y-4 mt-2">
                      <div className="text-center p-4 rounded-xl bg-[#0A0F1C]/50 border border-[#1E2A45]">
                        <p className="text-xs text-[#8B8FA3] mb-1">
                          Projected Retirement Age
                        </p>
                        <p className="text-3xl font-bold text-[#F0F0F5]">
                          {retirementAssets.projectedAge}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="text-center p-3 rounded-xl bg-[#0A0F1C]/50 border border-[#1E2A45]">
                          <p className="text-xs text-[#8B8FA3] mb-1">
                            Current
                          </p>
                          <p className="text-sm font-bold text-[#F0F0F5]">
                            {formatCurrency(retirementAssets.totalEarmarked)}
                          </p>
                        </div>
                        <div className="text-center p-3 rounded-xl bg-[#0A0F1C]/50 border border-[#1E2A45]">
                          <p className="text-xs text-[#8B8FA3] mb-1">Goal</p>
                          <p className="text-sm font-bold text-[#C9A962]">
                            {formatCurrency(retirementAssets.retirementGoal)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ─ Tab 7: Estate Planning ───────────────────────────────────── */}
              {activeTab === 7 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider mb-3">
                      Estate Documents
                    </h3>
                    <div className="space-y-0">
                      {estatePlanning.documents.map((doc) => (
                        <div
                          key={doc.name}
                          className="flex items-center gap-3 py-3 border-b border-[#1E2A45]/50"
                        >
                          {doc.completed ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-[#1E2A45] flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <span
                              className={cn(
                                'text-sm',
                                doc.completed
                                  ? 'text-[#F0F0F5]'
                                  : 'text-[#8B8FA3]',
                              )}
                            >
                              {doc.name}
                            </span>
                            {doc.lastReviewed && (
                              <p className="text-xs text-[#8B8FA3]">
                                Last reviewed:{' '}
                                {new Date(doc.lastReviewed).toLocaleDateString(
                                  'en-US',
                                  {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                  },
                                )}
                              </p>
                            )}
                          </div>
                          {doc.completed ? (
                            <Badge variant="success">Complete</Badge>
                          ) : (
                            <Badge variant="warning">Missing</Badge>
                          )}
                        </div>
                      ))}
                    </div>

                    {estatePlanning.beneficiaries.length > 0 && (
                      <>
                        <h3 className="text-sm font-medium text-[#8B8FA3] uppercase tracking-wider mb-3 mt-8">
                          Beneficiaries
                        </h3>
                        <div className="space-y-0">
                          {estatePlanning.beneficiaries.map((b) => (
                            <div
                              key={b.name}
                              className="flex items-center justify-between py-3 border-b border-[#1E2A45]/50"
                            >
                              <div>
                                <p className="text-sm text-[#F0F0F5]">
                                  {b.name}
                                </p>
                                <p className="text-xs text-[#8B8FA3]">
                                  {b.relationship}
                                </p>
                              </div>
                              <span className="text-sm font-semibold text-[#C9A962]">
                                {b.percentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {estatePlanning.beneficiaries.length === 0 && (
                      <div className="mt-6 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <p className="text-amber-400 text-sm font-medium">
                          No beneficiaries designated
                        </p>
                        <p className="text-[#8B8FA3] text-xs mt-1">
                          Beneficiary designations should be established
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-center justify-center gap-6">
                    <ScoreRing
                      score={docCompletionPct}
                      size={160}
                      strokeWidth={12}
                      label="Document Completion"
                    />
                    <p className="text-sm text-[#8B8FA3]">
                      {completedDocs} of {estatePlanning.documents.length}{' '}
                      documents complete
                    </p>

                    <div className="text-center p-4 rounded-xl bg-[#0A0F1C]/50 border border-[#1E2A45] w-full max-w-xs">
                      <p className="text-xs text-[#8B8FA3] mb-1">
                        Total Estate Value
                      </p>
                      <p className="text-2xl font-bold text-[#F0F0F5]">
                        {formatCurrency(estatePlanning.totalEstateValue)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* ── AI Plan Chat ─────────────────────────────────────────────────── */}
        <Card className="flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#F0F0F5] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#C9A962]" />
              Chat with this Plan
            </h2>
            <span className="text-xs text-[#4A5068]">AI updates automatically on new data — use Refresh to force update</span>
          </div>

          {/* Message thread */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4" style={{ minHeight: 0 }}>
            {/* Show aiResult as the initial assistant message if available */}
            {aiResult && chatHistory.length === 0 && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#C9A962]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4 text-[#C9A962]" />
                </div>
                <div className="flex-1 p-4 rounded-2xl bg-[#0A0F1C]/60 border border-[#1E2A45]">
                  <p className="text-xs text-[#C9A962] mb-2 font-medium">Plan Analysis</p>
                  <p className="text-sm text-[#F0F0F5] whitespace-pre-wrap leading-relaxed">{aiResult}</p>
                </div>
              </div>
            )}

            {chatHistory.length === 0 && !aiResult && (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <div className="w-14 h-14 rounded-2xl bg-[#C9A962]/10 flex items-center justify-center mb-4">
                  <Sparkles className="w-7 h-7 text-[#C9A962]" />
                </div>
                <p className="text-[#F0F0F5] font-medium mb-1">Ask me anything about this plan</p>
                <p className="text-sm text-[#8B8FA3] max-w-sm">
                  Powered by Claude. Ask about retirement gaps, insurance coverage, tax strategies, or anything else relevant to this household.
                </p>
                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                  {["What should we prioritize?", "How close is this client to retirement?", "What are the biggest risks?"].map((q) => (
                    <button
                      key={q}
                      onClick={() => { setChatInput(q); }}
                      className="px-3 py-1.5 text-xs rounded-lg bg-[#1E2A45]/60 border border-[#2A3A5C] text-[#8B8FA3] hover:text-[#C9A962] hover:border-[#C9A962]/30 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {chatHistory.map((msg, i) => (
              <div key={i} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
                <div className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                  msg.role === 'user' ? 'bg-[#1E2A45]' : 'bg-[#C9A962]/10'
                )}>
                  {msg.role === 'user'
                    ? <User className="w-4 h-4 text-[#8B8FA3]" />
                    : <Bot className="w-4 h-4 text-[#C9A962]" />
                  }
                </div>
                <div className={cn(
                  'max-w-[80%] p-3.5 rounded-2xl text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#1E2A45] text-[#F0F0F5]'
                    : 'bg-[#0A0F1C]/60 border border-[#1E2A45] text-[#F0F0F5] whitespace-pre-wrap'
                )}>
                  {msg.content}
                </div>
              </div>
            ))}

            {chatAI.loading && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#C9A962]/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-[#C9A962]" />
                </div>
                <div className="p-3.5 rounded-2xl bg-[#0A0F1C]/60 border border-[#1E2A45] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#C9A962]/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#C9A962]/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#C9A962]/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-[#1E2A45] pt-4">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChatSend(); } }}
              placeholder="Ask anything about this plan..."
              className="flex-1 px-4 py-2.5 rounded-xl bg-[#0A0F1C] border border-[#1E2A45] text-[#F0F0F5] placeholder-[#4A5068] focus:outline-none focus:border-[#C9A962]/50 focus:ring-1 focus:ring-[#C9A962]/20 text-sm transition-colors"
            />
            <button
              onClick={handleChatSend}
              disabled={!chatInput.trim() || chatAI.loading}
              className="px-4 py-2.5 rounded-xl bg-[#C9A962] text-[#0A0F1C] font-semibold hover:bg-[#D4B872] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </motion.div>
    </AppShell>
  );
}
