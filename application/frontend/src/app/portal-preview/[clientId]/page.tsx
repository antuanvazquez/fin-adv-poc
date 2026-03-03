'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Eye,
  LayoutDashboard,
  FileText,
  MessageCircle,
  Settings,
  TrendingUp,
  Target,
  ShieldCheck,
  AlertCircle,
  Info,
  Calendar,
  Download,
  ExternalLink,
  Send,
  Bell,
  Smartphone,
  Mail,
  Landmark,
  User,
  Phone,
  AtSign,
  CheckCircle2,
  Clock,
  Lightbulb,
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
import { getHousehold, mockAdvisor } from '@/lib/mock-data';
import { formatCurrency, formatDate, timeAgo, cn } from '@/lib/utils';

type Tab = 'overview' | 'documents' | 'messages' | 'settings';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={16} /> },
  { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
  { id: 'messages', label: 'Messages', icon: <MessageCircle size={16} /> },
  { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
];

const PORTAL_CARD =
  'rounded-2xl border border-[#1E2A45] bg-[#161D31]/90 backdrop-blur-xl';

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function PortalPreviewPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = React.use(params);
  const household = getHousehold(clientId);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [messageInput, setMessageInput] = useState('');

  if (!household) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0F1524]">
        <p className="text-[#8B8FA3]">Household not found.</p>
      </div>
    );
  }

  const client = household.clients[0];
  const plan = household.financialPlan;

  const clientSignals = household.signals.filter(
    (s) => s.type === 'info' || s.type === 'warning',
  );

  const clientMessages = household.communications.filter(
    (m) => m.senderType !== 'ai-draft' && m.status === 'sent',
  );

  const nextMeeting = household.meetings.find(
    (m) => m.status === 'scheduled',
  );

  const estateCompleted = plan.estatePlanning.documents.filter(
    (d) => d.completed,
  ).length;
  const estateTotal = plan.estatePlanning.documents.length;
  const estatePercent =
    estateTotal > 0 ? Math.round((estateCompleted / estateTotal) * 100) : 0;

  const cashPercent =
    plan.cashReserve.goal > 0
      ? Math.min(
          100,
          Math.round(
            (plan.cashReserve.currentReserve / plan.cashReserve.goal) * 100,
          ),
        )
      : 100;

  const netWorthData = plan.netWorth.history.map((h) => ({
    year: h.year.toString(),
    value: h.value,
  }));

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [signalAlerts, setSignalAlerts] = useState(true);

  return (
    <div className="min-h-screen bg-[#0F1524]">
      {/* ── Preview Banner ── */}
      <div className="sticky top-0 z-50 flex items-center justify-center gap-3 bg-[#C9A962] px-4 py-2.5">
        <Eye size={16} className="text-[#0A0F1C]" />
        <span className="text-sm font-semibold text-[#0A0F1C]">
          Portal Preview — This is what your client would see
        </span>
        <Link
          href={`/clients/${clientId}`}
          className="ml-2 inline-flex items-center gap-1.5 rounded-lg bg-[#0A0F1C]/20 px-3 py-1 text-xs font-medium text-[#0A0F1C] transition-colors hover:bg-[#0A0F1C]/30"
        >
          <ArrowLeft size={12} />
          Back to Client
        </Link>
      </div>

      {/* ── Client Portal Header ── */}
      <header className="border-b border-[#1E2A45] bg-[#0F1524]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-6 pt-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#C9A962]/10">
                <Landmark size={20} className="text-[#C9A962]" />
              </div>
              <div>
                <p className="text-sm font-semibold tracking-wide text-[#C9A962]">
                  {mockAdvisor.firm}
                </p>
                <p className="text-xs text-[#8B8FA3]">
                  {mockAdvisor.name} &middot; {mockAdvisor.title}
                </p>
              </div>
            </div>
            <p className="text-lg font-light text-[#F0F0F5]">
              Welcome, <span className="font-semibold">{client.firstName}</span>
            </p>
          </div>

          {/* ── Tab Navigation ── */}
          <nav className="mt-6 flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'relative flex items-center gap-2 px-5 py-3 text-sm font-medium transition-colors',
                  activeTab === tab.id
                    ? 'text-[#C9A962]'
                    : 'text-[#8B8FA3] hover:text-[#F0F0F5]',
                )}
              >
                {tab.icon}
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="portal-tab-indicator"
                    className="absolute inset-x-0 -bottom-px h-0.5 bg-[#C9A962]"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* ── Tab Content ── */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab
              key="overview"
              plan={plan}
              netWorthData={netWorthData}
              cashPercent={cashPercent}
              estatePercent={estatePercent}
              clientSignals={clientSignals}
              nextMeeting={nextMeeting}
              household={household}
            />
          )}
          {activeTab === 'documents' && (
            <DocumentsTab key="documents" household={household} />
          )}
          {activeTab === 'messages' && (
            <MessagesTab
              key="messages"
              messages={clientMessages}
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              advisorName={mockAdvisor.name}
            />
          )}
          {activeTab === 'settings' && (
            <SettingsTab
              key="settings"
              client={client}
              household={household}
              emailNotifs={emailNotifs}
              setEmailNotifs={setEmailNotifs}
              smsAlerts={smsAlerts}
              setSmsAlerts={setSmsAlerts}
              signalAlerts={signalAlerts}
              setSignalAlerts={setSignalAlerts}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 1 — OVERVIEW
   ═══════════════════════════════════════════════════════════════════════════ */

function OverviewTab({
  plan,
  netWorthData,
  cashPercent,
  estatePercent,
  clientSignals,
  nextMeeting,
  household,
}: {
  plan: ReturnType<typeof getHousehold> extends infer H
    ? H extends { financialPlan: infer P }
      ? P
      : never
    : never;
  netWorthData: { year: string; value: number }[];
  cashPercent: number;
  estatePercent: number;
  clientSignals: ReturnType<typeof getHousehold> extends infer H
    ? H extends { signals: infer S }
      ? (S extends (infer E)[] ? E : never)[]
      : never
    : never;
  nextMeeting:
    | NonNullable<ReturnType<typeof getHousehold>>['meetings'][number]
    | undefined;
  household: NonNullable<ReturnType<typeof getHousehold>>;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* ── Row 1: Health Score + Net Worth ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <motion.div variants={fadeUp} className={cn(PORTAL_CARD, 'p-6')}>
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#C9A962]" />
            <h3 className="text-sm font-semibold text-[#F0F0F5]">
              Financial Health Score
            </h3>
          </div>
          <div className="flex flex-col items-center">
            <ScoreRing score={plan.healthScore} size={140} strokeWidth={10} />
            <p className="mt-3 text-center text-xs text-[#8B8FA3]">
              Based on 8 key financial checkpoints
            </p>
          </div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          className={cn(PORTAL_CARD, 'p-6 lg:col-span-2')}
        >
          <div className="mb-1 flex items-center gap-2">
            <TrendingUp size={18} className="text-[#C9A962]" />
            <h3 className="text-sm font-semibold text-[#F0F0F5]">
              Net Worth Summary
            </h3>
          </div>
          <p className="text-3xl font-bold text-[#F0F0F5]">
            {formatCurrency(plan.netWorth.netWorth)}
          </p>
          <p className="mb-4 text-xs text-[#8B8FA3]">
            {formatCurrency(plan.netWorth.totalAssets)} assets &middot;{' '}
            {formatCurrency(plan.netWorth.totalLiabilities)} liabilities
          </p>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={netWorthData}>
                <defs>
                  <linearGradient id="nwFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#C9A962" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="#C9A962" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#8B8FA3', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#8B8FA3', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    `$${(v / 1_000_000).toFixed(1)}M`
                  }
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    background: '#161D31',
                    border: '1px solid #1E2A45',
                    borderRadius: 12,
                    fontSize: 12,
                    color: '#F0F0F5',
                  }}
                  formatter={(value) => [
                    formatCurrency(value as number),
                    'Net Worth',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#C9A962"
                  strokeWidth={2}
                  fill="url(#nwFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* ── Row 2: Goal Progress ── */}
      <motion.div variants={fadeUp}>
        <div className="mb-4 flex items-center gap-2">
          <Target size={18} className="text-[#C9A962]" />
          <h2 className="text-base font-semibold text-[#F0F0F5]">
            Goal Progress
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Cash Reserve */}
          <div className={cn(PORTAL_CARD, 'p-5')}>
            <p className="mb-1 text-sm font-medium text-[#F0F0F5]">
              Cash Reserve
            </p>
            <p className="mb-3 text-xs text-[#8B8FA3]">
              {formatCurrency(plan.cashReserve.currentReserve)} of{' '}
              {formatCurrency(plan.cashReserve.goal)} (
              {plan.cashReserve.targetMonths}-month target)
            </p>
            <Progress value={cashPercent} />
            <p className="mt-2 text-right text-xs font-medium text-[#C9A962]">
              {cashPercent}%
            </p>
          </div>

          {/* Retirement */}
          <div className={cn(PORTAL_CARD, 'p-5')}>
            <p className="mb-1 text-sm font-medium text-[#F0F0F5]">
              Retirement
            </p>
            <p className="mb-3 text-xs text-[#8B8FA3]">
              {formatCurrency(plan.retirementAssets.totalEarmarked)} of{' '}
              {formatCurrency(plan.retirementAssets.retirementGoal)} goal
            </p>
            <Progress
              value={Math.min(plan.retirementAssets.percentFunded, 100)}
            />
            <p className="mt-2 text-right text-xs font-medium text-[#C9A962]">
              {plan.retirementAssets.percentFunded.toFixed(1)}% funded
            </p>
          </div>

          {/* Estate Planning */}
          <div className={cn(PORTAL_CARD, 'flex items-center gap-5 p-5')}>
            <ScoreRing
              score={estatePercent}
              size={72}
              strokeWidth={6}
              label=""
            />
            <div>
              <p className="text-sm font-medium text-[#F0F0F5]">
                Estate Planning
              </p>
              <p className="text-xs text-[#8B8FA3]">
                {plan.estatePlanning.documents.filter((d) => d.completed).length}{' '}
                of {plan.estatePlanning.documents.length} documents complete
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Row 3: Life Signals ── */}
      {clientSignals.length > 0 && (
        <motion.div variants={fadeUp}>
          <div className="mb-4 flex items-center gap-2">
            <Lightbulb size={18} className="text-[#C9A962]" />
            <h2 className="text-base font-semibold text-[#F0F0F5]">
              Insights &amp; Alerts
            </h2>
          </div>
          <div className="space-y-4">
            {clientSignals.map((signal) => (
              <div
                key={signal.id}
                className={cn(PORTAL_CARD, 'flex gap-4 p-5')}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl',
                    signal.type === 'warning'
                      ? 'bg-amber-500/10'
                      : 'bg-blue-500/10',
                  )}
                >
                  {signal.type === 'warning' ? (
                    <AlertCircle size={18} className="text-amber-400" />
                  ) : (
                    <Info size={18} className="text-blue-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-[#F0F0F5]">
                        {signal.title}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-[#8B8FA3]">
                        {signal.description}
                      </p>
                    </div>
                    <Badge
                      variant={
                        signal.type === 'warning' ? 'warning' : 'info'
                      }
                    >
                      {signal.category}
                    </Badge>
                  </div>
                  <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#0F1524]/60 p-3">
                    <CheckCircle2
                      size={14}
                      className="mt-0.5 shrink-0 text-[#C9A962]"
                    />
                    <p className="text-xs leading-relaxed text-[#8B8FA3]">
                      <span className="font-medium text-[#C9A962]">
                        Suggested action:
                      </span>{' '}
                      {signal.suggestedAction}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Row 4: Upcoming Meeting ── */}
      {nextMeeting && (
        <motion.div variants={fadeUp}>
          <div className={cn(PORTAL_CARD, 'flex items-center gap-5 p-5')}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#C9A962]/10">
              <Calendar size={22} className="text-[#C9A962]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-[#F0F0F5]">
                Upcoming Meeting
              </p>
              <p className="text-xs text-[#8B8FA3]">
                {nextMeeting.type
                  .replace(/-/g, ' ')
                  .replace(/\b\w/g, (c) => c.toUpperCase())}{' '}
                &middot; {formatDate(nextMeeting.date)} at {nextMeeting.time}
              </p>
            </div>
            <Badge variant="gold">Scheduled</Badge>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 2 — DOCUMENTS
   ═══════════════════════════════════════════════════════════════════════════ */

function DocumentsTab({
  household,
}: {
  household: NonNullable<ReturnType<typeof getHousehold>>;
}) {
  const classificationVariant = (c: string) => {
    switch (c.toLowerCase()) {
      case 'insurance':
        return 'info' as const;
      case 'tax':
        return 'warning' as const;
      case 'estate':
        return 'gold' as const;
      case 'investment':
        return 'success' as const;
      default:
        return 'default' as const;
    }
  };

  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <motion.div variants={fadeUp} className="mb-2">
        <h2 className="text-base font-semibold text-[#F0F0F5]">
          Your Documents
        </h2>
        <p className="text-xs text-[#8B8FA3]">
          {household.documents.length} document
          {household.documents.length !== 1 ? 's' : ''} on file
        </p>
      </motion.div>

      {household.documents.map((doc) => (
        <motion.div
          key={doc.id}
          variants={fadeUp}
          className={cn(
            PORTAL_CARD,
            'flex flex-col gap-4 p-5 sm:flex-row sm:items-center',
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#C9A962]/10">
            <FileText size={18} className="text-[#C9A962]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-[#F0F0F5]">
              {doc.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#8B8FA3]">
              <Badge variant={classificationVariant(doc.classification)}>
                {doc.classification}
              </Badge>
              <span>&middot;</span>
              <span>Uploaded {formatDate(doc.uploadedAt)}</span>
              <span>&middot;</span>
              <span>{doc.size}</span>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button variant="secondary" size="sm">
              <ExternalLink size={13} />
              View
            </Button>
            <Button variant="ghost" size="sm">
              <Download size={13} />
              Download
            </Button>
          </div>
        </motion.div>
      ))}

      {household.documents.length === 0 && (
        <motion.div
          variants={fadeUp}
          className="flex flex-col items-center py-16 text-center"
        >
          <FileText size={40} className="mb-3 text-[#1E2A45]" />
          <p className="text-sm text-[#8B8FA3]">No documents uploaded yet.</p>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 3 — MESSAGES
   ═══════════════════════════════════════════════════════════════════════════ */

function MessagesTab({
  messages,
  messageInput,
  setMessageInput,
  advisorName,
}: {
  messages: NonNullable<ReturnType<typeof getHousehold>>['communications'];
  messageInput: string;
  setMessageInput: (v: string) => void;
  advisorName: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col"
    >
      <div className="mb-4">
        <h2 className="text-base font-semibold text-[#F0F0F5]">Messages</h2>
        <p className="text-xs text-[#8B8FA3]">
          Your conversation with {advisorName}
        </p>
      </div>

      <div className={cn(PORTAL_CARD, 'flex flex-col overflow-hidden')}>
        {/* Message Thread */}
        <div className="max-h-[480px] space-y-0 overflow-y-auto">
          {messages.map((msg, idx) => {
            const isClient = msg.senderType === 'client';
            const initials = msg.senderName
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <div
                key={msg.id}
                className={cn(
                  'flex gap-3 px-5 py-4',
                  idx !== messages.length - 1 && 'border-b border-[#1E2A45]/60',
                )}
              >
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    isClient
                      ? 'bg-[#C9A962]/15 text-[#C9A962]'
                      : 'bg-blue-500/15 text-blue-400',
                  )}
                >
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[#F0F0F5]">
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-[#8B8FA3]">
                      {timeAgo(msg.timestamp)}
                    </span>
                  </div>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-[#8B8FA3]">
                    {msg.content}
                  </p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.attachments.map((att) => (
                        <span
                          key={att.name}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2A45] bg-[#0F1524]/60 px-2.5 py-1 text-xs text-[#8B8FA3]"
                        >
                          <FileText size={12} className="text-[#C9A962]" />
                          {att.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {messages.length === 0 && (
            <div className="flex flex-col items-center py-16 text-center">
              <MessageCircle size={40} className="mb-3 text-[#1E2A45]" />
              <p className="text-sm text-[#8B8FA3]">
                No messages yet. Start a conversation with your advisor.
              </p>
            </div>
          )}
        </div>

        {/* Compose */}
        <div className="border-t border-[#1E2A45] bg-[#0F1524]/40 px-5 py-4">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Send a message to your advisor..."
                className="w-full rounded-xl border border-[#1E2A45] bg-[#161D31] px-4 py-2.5 pr-10 text-sm text-[#F0F0F5] placeholder-[#4A5068] transition-colors focus:border-[#C9A962]/50 focus:outline-none focus:ring-1 focus:ring-[#C9A962]/20"
              />
            </div>
            <button
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                messageInput.trim()
                  ? 'bg-[#C9A962] text-[#0A0F1C] hover:bg-[#D4B872]'
                  : 'bg-[#1E2A45] text-[#4A5068]',
              )}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   TAB 4 — SETTINGS
   ═══════════════════════════════════════════════════════════════════════════ */

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200',
        checked ? 'bg-[#C9A962]' : 'bg-[#1E2A45]',
      )}
    >
      <motion.span
        className="inline-block h-5 w-5 rounded-full bg-white shadow"
        animate={{ x: checked ? 20 : 2, y: 2 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

function SettingsTab({
  client,
  household,
  emailNotifs,
  setEmailNotifs,
  smsAlerts,
  setSmsAlerts,
  signalAlerts,
  setSignalAlerts,
}: {
  client: NonNullable<ReturnType<typeof getHousehold>>['clients'][number];
  household: NonNullable<ReturnType<typeof getHousehold>>;
  emailNotifs: boolean;
  setEmailNotifs: (v: boolean) => void;
  smsAlerts: boolean;
  setSmsAlerts: (v: boolean) => void;
  signalAlerts: boolean;
  setSignalAlerts: (v: boolean) => void;
}) {
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0 }}
      className="space-y-8"
    >
      {/* Profile Info */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-4 text-base font-semibold text-[#F0F0F5]">
          Profile Information
        </h2>
        <div className={cn(PORTAL_CARD, 'divide-y divide-[#1E2A45]/60')}>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/10">
              <User size={16} className="text-[#C9A962]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#8B8FA3]">Full Name</p>
              <p className="text-sm font-medium text-[#F0F0F5]">
                {client.firstName} {client.lastName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/10">
              <AtSign size={16} className="text-[#C9A962]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#8B8FA3]">Email</p>
              <p className="text-sm font-medium text-[#F0F0F5]">
                {client.email}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/10">
              <Phone size={16} className="text-[#C9A962]" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-[#8B8FA3]">Phone</p>
              <p className="text-sm font-medium text-[#F0F0F5]">
                {client.phone}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Connected Accounts */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-4 text-base font-semibold text-[#F0F0F5]">
          Connected Accounts
        </h2>
        <div className={cn(PORTAL_CARD, 'divide-y divide-[#1E2A45]/60')}>
          {household.accounts.map((acct) => (
            <div
              key={acct.id}
              className="flex items-center gap-4 px-5 py-4"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/10">
                <Landmark size={16} className="text-[#C9A962]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-[#F0F0F5]">
                  {acct.name}
                </p>
                <p className="text-xs text-[#8B8FA3]">{acct.institution}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">Connected</Badge>
                <span className="text-[10px] text-[#8B8FA3]">
                  Synced {timeAgo(acct.lastRefreshed)}
                </span>
              </div>
            </div>
          ))}

          {household.accounts.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-[#8B8FA3]">
              No accounts connected yet.
            </div>
          )}
        </div>
      </motion.div>

      {/* Notification Preferences */}
      <motion.div variants={fadeUp}>
        <h2 className="mb-4 text-base font-semibold text-[#F0F0F5]">
          Notification Preferences
        </h2>
        <div className={cn(PORTAL_CARD, 'divide-y divide-[#1E2A45]/60')}>
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/10">
                <Mail size={16} className="text-[#C9A962]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F0F0F5]">
                  Email Notifications
                </p>
                <p className="text-xs text-[#8B8FA3]">
                  Receive updates about your accounts and plan
                </p>
              </div>
            </div>
            <Toggle checked={emailNotifs} onChange={setEmailNotifs} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/10">
                <Smartphone size={16} className="text-[#C9A962]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F0F0F5]">
                  SMS Alerts
                </p>
                <p className="text-xs text-[#8B8FA3]">
                  Get text messages for urgent notifications
                </p>
              </div>
            </div>
            <Toggle checked={smsAlerts} onChange={setSmsAlerts} />
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#C9A962]/10">
                <Bell size={16} className="text-[#C9A962]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#F0F0F5]">
                  Life Signal Alerts
                </p>
                <p className="text-xs text-[#8B8FA3]">
                  Alerts when new insights are detected for your finances
                </p>
              </div>
            </div>
            <Toggle checked={signalAlerts} onChange={setSignalAlerts} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
