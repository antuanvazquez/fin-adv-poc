'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  CalendarCheck,
  CalendarClock,
  MessageSquare,
  Sparkles,
  Loader2,
  X,
  Save,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Circle,
  Clock,
  Play,
  Square,
  SkipForward,
  Plus,
  Trash2,
  Bot,
  FileText,
  Clipboard,
  TrendingUp,
  Shield,
  User,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Mic,
  MicOff,
  Send,
  Download,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppShell } from '@/components/layout/app-shell';
import { getHousehold } from '@/lib/mock-data';
import { formatCurrency, formatDate, timeAgo, cn } from '@/lib/utils';
import { useAI } from '@/hooks/useAI';
import type { Household } from '@/lib/types';

function compactCurrency(n: number) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

// ── Types ────────────────────────────────────────────────────────────────────

interface AgendaItem {
  id: string;
  title: string;
  minutes: number;
  notes: string;
  done?: boolean;
  meetingNotes?: string;
}

interface TalkingPointGroup {
  topic: string;
  points: string[];
}

interface RiskFlag {
  severity: 'critical' | 'warning' | 'info';
  title: string;
  detail: string;
}

interface PrepData {
  agenda: AgendaItem[];
  talkingPoints: TalkingPointGroup[];
  riskFlags: RiskFlag[];
  discussionStarters: string[];
  clientInsights: string;
}

interface ActionItem {
  id: string;
  task: string;
  assignee: string;
  dueDate: string;
  done: boolean;
}

type ViewMode = 'prep' | 'meeting' | 'summary';

// ── Constants ────────────────────────────────────────────────────────────────

const MEETING_TYPES = [
  {
    value: 'annual-review',
    label: 'Annual Review',
    description: 'Comprehensive yearly assessment',
    icon: CalendarCheck,
    color: 'text-[#C9A962]',
    duration: 60,
  },
  {
    value: 'quarterly-check-in',
    label: 'Quarterly Check-in',
    description: 'Regular progress update',
    icon: CalendarClock,
    color: 'text-blue-400',
    duration: 30,
  },
  {
    value: 'initial-consultation',
    label: 'Initial Consultation',
    description: 'First meeting with prospect',
    icon: MessageSquare,
    color: 'text-emerald-400',
    duration: 45,
  },
  {
    value: 'ad-hoc',
    label: 'Ad-hoc Meeting',
    description: 'Special topic or concern',
    icon: Calendar,
    color: 'text-purple-400',
    duration: 30,
  },
] as const;

const SEVERITY_CONFIG = {
  critical: { icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', badge: 'critical' as const },
  warning: { icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', badge: 'warning' as const },
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', badge: 'info' as const },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildClientData(household: Household, meetingType: string) {
  const plan = household.financialPlan;
  const signalsSummary = household.signals
    .filter((s) => s.status === 'active')
    .map((s) => `[${s.type.toUpperCase()}] ${s.title}: ${s.description}`)
    .join('\n');
  const recentComms = household.communications
    .slice(-3)
    .map((m) => `${m.senderName} (${m.senderType}): ${m.content.slice(0, 120)}`)
    .join('\n');

  return JSON.stringify({
    meetingType,
    household: household.name,
    status: household.status,
    clients: household.clients.map((c) => ({
      name: `${c.firstName} ${c.lastName}`,
      age: new Date().getFullYear() - new Date(c.dateOfBirth).getFullYear(),
      occupation: c.occupation,
      employer: c.employer,
      retirementAge: c.retirementAge,
      riskTolerance: c.riskTolerance,
    })),
    financialPlan: {
      healthScore: plan.healthScore,
      netWorth: plan.netWorth.netWorth,
      netWorthHistory: plan.netWorth.history,
      cashReserveCurrent: plan.cashReserve.currentReserve,
      cashReserveGoal: plan.cashReserve.goal,
      cashReserveShortage: plan.cashReserve.shortage,
      grossIncome: plan.discretionaryIncome.grossIncome,
      discretionaryIncome: plan.discretionaryIncome.discretionary,
      savingsRate: plan.discretionaryIncome.savingsRate,
      retirementEarmarked: plan.retirementAssets.totalEarmarked,
      retirementGoal: plan.retirementAssets.retirementGoal,
      retirementFunded: plan.retirementAssets.percentFunded,
      retirementShortage: plan.retirementAssets.shortage,
      estateDocuments: plan.estatePlanning.documents.map((d) => `${d.name}: ${d.completed ? 'Complete' : 'MISSING'}`).join(', '),
      lifeInsuranceShortage: plan.lifeInsurance.shortage,
      disabilityShortage: plan.disabilityInsurance.shortage,
      ltcShortage: plan.longTermCare.shortage,
    },
    activeSignals: signalsSummary,
    recentCommunications: recentComms,
    openTasks: household.tasks.filter((t) => t.status !== 'completed').map((t) => t.title).join(', '),
    lastMeeting: household.meetings.filter((m) => m.status === 'completed').slice(-1)[0]?.date ?? 'No prior meeting',
  });
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ClientSnapshotCard({ household }: { household: Household }) {
  const plan = household.financialPlan;
  const activeSignals = household.signals.filter((s) => s.status === 'active');
  const criticalCount = activeSignals.filter((s) => s.type === 'critical').length;
  const openTasks = household.tasks.filter((t) => t.status !== 'completed').length;
  const lastMeeting = household.meetings.filter((m) => m.status === 'completed').slice(-1)[0];

  const scoreColor = plan.healthScore >= 80 ? '#34D399' : plan.healthScore >= 60 ? '#C9A962' : '#F87171';

  return (
    <Card className="mb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-[#F0F0F5]">{household.name}</h2>
          <p className="text-xs text-[#8B8FA3] mt-0.5">
            {household.clients.map((c) => `${c.firstName} ${c.lastName}`).join(' & ')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-bold"
            style={{ borderColor: scoreColor, color: scoreColor }}
          >
            {plan.healthScore}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="p-2.5 rounded-xl bg-[#0A0F1C]/60 border border-[#1E2A45]">
          <p className="text-[9px] text-[#4A5068] uppercase tracking-wide mb-1">Net Worth</p>
          <p className="text-xs font-bold text-[#C9A962]">{compactCurrency(plan.netWorth.netWorth)}</p>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0A0F1C]/60 border border-[#1E2A45]">
          <p className="text-[9px] text-[#4A5068] uppercase tracking-wide mb-1">Retirement</p>
          <p className="text-xs font-bold" style={{ color: plan.retirementAssets.percentFunded >= 80 ? '#34D399' : '#C9A962' }}>
            {plan.retirementAssets.percentFunded}% funded
          </p>
        </div>
        <div className="p-2.5 rounded-xl bg-[#0A0F1C]/60 border border-[#1E2A45]">
          <p className="text-[9px] text-[#4A5068] uppercase tracking-wide mb-1">Cash Reserve</p>
          <p className="text-xs font-bold" style={{ color: plan.cashReserve.shortage > 0 ? '#F87171' : '#34D399' }}>
            {plan.cashReserve.shortage > 0
              ? `-${compactCurrency(plan.cashReserve.shortage)}`
              : 'On target'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {criticalCount > 0 && (
          <Badge variant="critical" pulse>
            {criticalCount} critical signal{criticalCount > 1 ? 's' : ''}
          </Badge>
        )}
        {activeSignals.length > criticalCount && (
          <Badge variant="warning">
            {activeSignals.length - criticalCount} signal{activeSignals.length - criticalCount > 1 ? 's' : ''}
          </Badge>
        )}
        {openTasks > 0 && (
          <Badge variant="info">{openTasks} open task{openTasks > 1 ? 's' : ''}</Badge>
        )}
        {lastMeeting && (
          <span className="text-xs text-[#4A5068]">
            Last met: {formatDate(lastMeeting.date)}
          </span>
        )}
      </div>
    </Card>
  );
}

function AgendaSection({
  items,
  onToggle,
  onNotesChange,
  activeMeeting,
  currentItemIdx,
}: {
  items: AgendaItem[];
  onToggle: (id: string) => void;
  onNotesChange: (id: string, notes: string) => void;
  activeMeeting: boolean;
  currentItemIdx: number;
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const totalMinutes = items.reduce((s, i) => s + i.minutes, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#C9A962]" />
          Meeting Agenda
        </h3>
        <span className="text-xs text-[#4A5068]">{totalMinutes} min total</span>
      </div>
      <div className="space-y-2">
        {items.map((item, idx) => {
          const isActive = activeMeeting && idx === currentItemIdx;
          const isPast = activeMeeting && idx < currentItemIdx;
          const isExpanded = expandedId === item.id;

          return (
            <div
              key={item.id}
              className={cn(
                'rounded-xl border transition-all duration-200',
                isActive && 'border-[#C9A962]/40 bg-[#C9A962]/5',
                isPast && 'border-[#1E2A45] opacity-60',
                !isActive && !isPast && 'border-[#1E2A45]',
              )}
            >
              <div
                className="flex items-center gap-3 p-3 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                {activeMeeting ? (
                  <button
                    onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                    className="flex-shrink-0"
                  >
                    {item.done
                      ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      : <Circle className={cn('w-5 h-5', isActive ? 'text-[#C9A962]' : 'text-[#2A3A5C]')} />
                    }
                  </button>
                ) : (
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#1E2A45] flex items-center justify-center text-[10px] text-[#8B8FA3] font-bold">
                    {idx + 1}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className={cn('text-sm font-medium', item.done ? 'text-[#4A5068] line-through' : 'text-[#F0F0F5]', isActive && 'text-[#C9A962]')}>
                    {item.title}
                  </p>
                  {!isExpanded && (
                    <p className="text-[11px] text-[#4A5068] truncate mt-0.5">{item.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-xs text-[#4A5068] bg-[#1E2A45] px-2 py-0.5 rounded-md">
                    {item.minutes}m
                  </span>
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-[#4A5068]" /> : <ChevronDown className="w-3.5 h-3.5 text-[#4A5068]" />}
                </div>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 border-t border-[#1E2A45] pt-3 space-y-3">
                      <p className="text-xs text-[#8B8FA3]">{item.notes}</p>
                      {activeMeeting && (
                        <div>
                          <p className="text-[10px] text-[#4A5068] mb-1.5 uppercase tracking-wide">Meeting notes for this item</p>
                          <textarea
                            value={item.meetingNotes ?? ''}
                            onChange={(e) => onNotesChange(item.id, e.target.value)}
                            placeholder="Type notes during the meeting..."
                            rows={3}
                            className="w-full px-3 py-2 rounded-lg bg-[#0A0F1C] border border-[#1E2A45] text-[#F0F0F5] placeholder-[#4A5068] focus:outline-none focus:border-[#C9A962]/40 text-xs resize-none transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MeetingTimer({
  items,
  currentIdx,
  isRunning,
  elapsed,
  onStart,
  onPause,
  onNext,
  onEnd,
}: {
  items: AgendaItem[];
  currentIdx: number;
  isRunning: boolean;
  elapsed: number;
  onStart: () => void;
  onPause: () => void;
  onNext: () => void;
  onEnd: () => void;
}) {
  const current = items[currentIdx];
  if (!current) return null;

  const targetSeconds = current.minutes * 60;
  const isOvertime = elapsed > targetSeconds;
  const pct = Math.min((elapsed / targetSeconds) * 100, 100);

  const fmt = (s: number) => {
    const abs = Math.abs(s);
    const m = Math.floor(abs / 60).toString().padStart(2, '0');
    const sec = (abs % 60).toString().padStart(2, '0');
    return `${s < 0 ? '-' : ''}${m}:${sec}`;
  };

  return (
    <div className="rounded-2xl border border-[#1E2A45] bg-[#0A0F1C]/60 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs text-[#4A5068] uppercase tracking-wide">Now: Item {currentIdx + 1}/{items.length}</p>
          <p className="text-sm font-semibold text-[#F0F0F5] mt-0.5">{current.title}</p>
        </div>
        <div className={cn('text-2xl font-mono font-bold tabular-nums', isOvertime ? 'text-red-400' : 'text-[#C9A962]')}>
          {isOvertime ? '+' : ''}{fmt(isOvertime ? elapsed - targetSeconds : targetSeconds - elapsed)}
        </div>
      </div>

      <div className="w-full h-1.5 rounded-full bg-[#1E2A45] mb-4 overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', isOvertime ? 'bg-red-400' : 'bg-[#C9A962]')}
          style={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <div className="flex gap-2">
        {isRunning ? (
          <Button size="sm" variant="secondary" onClick={onPause}>
            <Square className="w-3.5 h-3.5" /> Pause
          </Button>
        ) : (
          <Button size="sm" onClick={onStart}>
            <Play className="w-3.5 h-3.5" /> Resume
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={onNext} disabled={currentIdx >= items.length - 1}>
          <SkipForward className="w-3.5 h-3.5" /> Next Item
        </Button>
        <Button size="sm" variant="danger" onClick={onEnd} className="ml-auto">
          End Meeting
        </Button>
      </div>
    </div>
  );
}

function ActionItemCapture({
  items,
  onAdd,
  onToggle,
  onRemove,
}: {
  items: ActionItem[];
  onAdd: (item: ActionItem) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}) {
  const [task, setTask] = useState('');
  const [assignee, setAssignee] = useState('Advisor');
  const [dueDate, setDueDate] = useState('');

  const handleAdd = () => {
    if (!task.trim()) return;
    onAdd({ id: Date.now().toString(), task: task.trim(), assignee, dueDate, done: false });
    setTask('');
  };

  return (
    <div>
      <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2 mb-3">
        <Clipboard className="w-4 h-4 text-[#C9A962]" />
        Action Items
      </h3>

      <div className="space-y-2 mb-3">
        {items.map((item) => (
          <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg border border-[#1E2A45] group">
            <button onClick={() => onToggle(item.id)}>
              {item.done
                ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                : <Circle className="w-4 h-4 text-[#2A3A5C] flex-shrink-0" />
              }
            </button>
            <div className="flex-1 min-w-0">
              <p className={cn('text-xs text-[#F0F0F5]', item.done && 'line-through text-[#4A5068]')}>{item.task}</p>
              <p className="text-[10px] text-[#4A5068]">
                {item.assignee}{item.dueDate ? ` · Due ${item.dueDate}` : ''}
              </p>
            </div>
            <button onClick={() => onRemove(item.id)} className="opacity-0 group-hover:opacity-100 text-[#4A5068] hover:text-red-400 transition-all">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-xs text-[#4A5068] text-center py-3">No action items yet</p>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Add action item..."
          className="flex-1 px-3 py-2 rounded-lg bg-[#0A0F1C] border border-[#1E2A45] text-[#F0F0F5] placeholder-[#4A5068] focus:outline-none focus:border-[#C9A962]/40 text-xs"
        />
        <select
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          className="px-2 py-2 rounded-lg bg-[#0A0F1C] border border-[#1E2A45] text-[#8B8FA3] text-xs focus:outline-none"
        >
          <option>Advisor</option>
          <option>Client</option>
          <option>Both</option>
        </select>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-2 py-2 rounded-lg bg-[#0A0F1C] border border-[#1E2A45] text-[#8B8FA3] text-xs focus:outline-none w-36"
        />
        <button
          onClick={handleAdd}
          disabled={!task.trim()}
          className="px-3 py-2 rounded-lg bg-[#C9A962] text-[#0A0F1C] disabled:opacity-40 hover:bg-[#D4B872] transition-colors"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function MeetingPrepPage({ params }: { params: Promise<{ clientId: string }> }) {
  const { clientId } = React.use(params);
  const household = getHousehold(clientId);

  const [selectedType, setSelectedType] = useState('annual-review');
  const [prepData, setPrepData] = useState<PrepData | null>(null);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('prep');

  // Live meeting state
  const [currentItemIdx, setCurrentItemIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Post-meeting summary state
  const [summaryText, setSummaryText] = useState('');

  // AI hooks
  const prepAI = useAI();
  const summaryAI = useAI();

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    setTimerRunning(false);
  }, []);

  const startTimer = useCallback(() => {
    setTimerRunning(true);
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  if (!household) {
    return (
      <AppShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 text-center">
            <p className="text-[#F0F0F5] text-lg">Household not found</p>
            <Link href="/clients"><Button variant="secondary" className="mt-4">Back to Clients</Button></Link>
          </Card>
        </div>
      </AppShell>
    );
  }

  async function handleGenerate() {
    if (!household) return;
    const clientData = buildClientData(household, selectedType);
    const result = await prepAI.generatePrep(clientData, selectedType);
    if (result && typeof result === 'object') {
      setPrepData(result as PrepData);
      setAgendaItems((result as PrepData).agenda.map((a: AgendaItem) => ({ ...a, done: false, meetingNotes: '' })));
    }
  }

  function handleStartMeeting() {
    setCurrentItemIdx(0);
    setElapsed(0);
    setViewMode('meeting');
    startTimer();
  }

  function handleNextItem() {
    stopTimer();
    setElapsed(0);
    const next = currentItemIdx + 1;
    if (next < agendaItems.length) {
      setCurrentItemIdx(next);
      startTimer();
    }
  }

  function handleEndMeeting() {
    stopTimer();
    setViewMode('summary');
  }

  function handleToggleAgendaItem(id: string) {
    setAgendaItems((prev) => prev.map((a) => a.id === id ? { ...a, done: !a.done } : a));
  }

  function handleAgendaNotesChange(id: string, notes: string) {
    setAgendaItems((prev) => prev.map((a) => a.id === id ? { ...a, meetingNotes: notes } : a));
  }

  async function handleGenerateSummary() {
    if (!household) return;
    const agendaNotes = agendaItems.map((a) => `${a.title}:\n${a.meetingNotes || '(no notes)'}`).join('\n\n');
    const actionsList = actionItems.map((a) => `- ${a.task} [${a.assignee}${a.dueDate ? ` · Due ${a.dueDate}` : ''}]`).join('\n');
    const clientContext = `Client: ${household.name}. Meeting type: ${selectedType}. Health score: ${household.financialPlan.healthScore}.`;
    const summary = await summaryAI.summarizeMeeting(agendaNotes, actionsList, clientContext);
    if (summary) setSummaryText(summary);
  }

  const meetingTypeConfig = MEETING_TYPES.find((t) => t.value === selectedType);

  // ── PREP VIEW ──────────────────────────────────────────────────────────────
  if (viewMode === 'prep') {
    return (
      <AppShell>
        <div className="max-w-[1200px]">
          {/* Header */}
          <div className="mb-6">
            <Link href={`/clients/${household.id}`} className="inline-flex items-center gap-1.5 text-[#8B8FA3] hover:text-[#F0F0F5] transition-colors text-sm mb-3">
              <ArrowLeft className="w-4 h-4" /> Back to {household.name}
            </Link>
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-[#F0F0F5]">Meeting Prep</h1>
                <p className="text-[#8B8FA3] mt-1">AI-powered preparation for <span className="text-[#C9A962]">{household.name}</span></p>
              </div>
              {prepData && (
                <Button onClick={handleStartMeeting}>
                  <Play className="w-4 h-4" /> Start Meeting
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
            {/* Left column */}
            <div>
              <ClientSnapshotCard household={household} />

              {/* Meeting type */}
              <Card className="mb-4">
                <h3 className="text-xs font-semibold text-[#8B8FA3] uppercase tracking-wide mb-3">Meeting Type</h3>
                <div className="grid grid-cols-2 gap-2">
                  {MEETING_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.value;
                    return (
                      <button
                        key={type.value}
                        onClick={() => setSelectedType(type.value)}
                        className={cn(
                          'flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all',
                          isSelected ? 'border-[#C9A962] bg-[#C9A962]/5' : 'border-[#1E2A45] hover:border-[#2E3A55]',
                        )}
                      >
                        <Icon className={cn('w-4 h-4', isSelected ? 'text-[#C9A962]' : type.color)} />
                        <span className={cn('text-xs font-semibold', isSelected ? 'text-[#C9A962]' : 'text-[#F0F0F5]')}>{type.label}</span>
                        <span className="text-[10px] text-[#4A5068]">~{type.duration} min</span>
                      </button>
                    );
                  })}
                </div>
                <Button
                  className="w-full mt-4"
                  disabled={prepAI.loading}
                  onClick={handleGenerate}
                >
                  {prepAI.loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : prepData ? (
                    <><RefreshCw className="w-4 h-4" /> Regenerate Prep</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Generate with AI</>
                  )}
                </Button>
              </Card>

              {/* Active signals summary */}
              {household.signals.filter((s) => s.status === 'active').length > 0 && (
                <Card>
                  <h3 className="text-xs font-semibold text-[#8B8FA3] uppercase tracking-wide mb-3">Active Signals</h3>
                  <div className="space-y-2">
                    {household.signals.filter((s) => s.status === 'active').map((sig) => {
                      const cfg = SEVERITY_CONFIG[sig.type];
                      const SigIcon = cfg.icon;
                      return (
                        <div key={sig.id} className={cn('flex items-start gap-2.5 p-2.5 rounded-lg border', cfg.border, cfg.bg)}>
                          <SigIcon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', cfg.color)} />
                          <p className="text-xs text-[#F0F0F5] leading-snug">{sig.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}
            </div>

            {/* Right column */}
            <div>
              <AnimatePresence mode="wait">
                {/* Loading shimmer */}
                {prepAI.loading && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    {['Agenda', 'Talking Points', 'Risk Flags', 'Discussion Starters'].map((label) => (
                      <Card key={label}>
                        <div className="h-4 w-28 rounded-lg bg-[#1E2A45] mb-4 animate-pulse" />
                        {[90, 70, 80, 60, 75].map((w, i) => (
                          <div key={i} className="h-3 rounded-full bg-[#1E2A45] mb-2 animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }} />
                        ))}
                      </Card>
                    ))}
                  </motion.div>
                )}

                {/* Empty state */}
                {!prepAI.loading && !prepData && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-[#1E2A45]/50 flex items-center justify-center mb-5">
                        <Sparkles className="w-8 h-8 text-[#4A5068]" />
                      </div>
                      <p className="text-[#F0F0F5] font-semibold mb-2">Ready to prepare for this meeting</p>
                      <p className="text-sm text-[#4A5068] max-w-md">
                        Select a meeting type and click Generate. The AI will analyze {household.name}&apos;s financial plan, active signals, recent communications, and open tasks to create a tailored agenda, talking points, and risk flags.
                      </p>
                      <div className="flex gap-3 mt-6 flex-wrap justify-center">
                        <div className="flex items-center gap-1.5 text-xs text-[#4A5068]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Timed agenda
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#4A5068]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Talking points
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#4A5068]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Risk flags
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-[#4A5068]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Discussion starters
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                )}

                {/* Prep results */}
                {!prepAI.loading && prepData && (
                  <motion.div key="results" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

                    {/* Client insights */}
                    {prepData.clientInsights && (
                      <div className="flex gap-3 p-4 rounded-2xl border border-[#C9A962]/20 bg-[#C9A962]/5">
                        <Bot className="w-5 h-5 text-[#C9A962] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-[#C9A962] mb-1">AI Insight</p>
                          <p className="text-sm text-[#F0F0F5] leading-relaxed">{prepData.clientInsights}</p>
                        </div>
                      </div>
                    )}

                    {/* Risk flags */}
                    {prepData.riskFlags.length > 0 && (
                      <Card>
                        <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2 mb-4">
                          <Shield className="w-4 h-4 text-red-400" />
                          Risk Flags
                          <span className="ml-auto text-xs text-[#4A5068]">Must address in meeting</span>
                        </h3>
                        <div className="space-y-3">
                          {prepData.riskFlags.map((flag, i) => {
                            const cfg = SEVERITY_CONFIG[flag.severity] ?? SEVERITY_CONFIG.info;
                            const FlagIcon = cfg.icon;
                            return (
                              <div key={i} className={cn('p-3 rounded-xl border', cfg.border, cfg.bg)}>
                                <div className="flex items-center gap-2 mb-1">
                                  <FlagIcon className={cn('w-4 h-4', cfg.color)} />
                                  <p className={cn('text-sm font-semibold', cfg.color)}>{flag.title}</p>
                                  <Badge variant={cfg.badge} className="ml-auto">{flag.severity}</Badge>
                                </div>
                                <p className="text-xs text-[#8B8FA3] ml-6">{flag.detail}</p>
                              </div>
                            );
                          })}
                        </div>
                      </Card>
                    )}

                    {/* Agenda */}
                    <Card>
                      <AgendaSection
                        items={agendaItems}
                        onToggle={handleToggleAgendaItem}
                        onNotesChange={handleAgendaNotesChange}
                        activeMeeting={false}
                        currentItemIdx={-1}
                      />
                    </Card>

                    {/* Talking points */}
                    {prepData.talkingPoints.length > 0 && (
                      <Card>
                        <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2 mb-4">
                          <MessageSquare className="w-4 h-4 text-blue-400" />
                          Talking Points
                        </h3>
                        <div className="space-y-4">
                          {prepData.talkingPoints.map((group, i) => (
                            <div key={i}>
                              <p className="text-xs font-semibold text-[#C9A962] mb-2">{group.topic}</p>
                              <ul className="space-y-1.5">
                                {group.points.map((point, j) => (
                                  <li key={j} className="flex items-start gap-2 text-sm text-[#8B8FA3]">
                                    <ChevronRight className="w-3.5 h-3.5 text-[#2A3A5C] flex-shrink-0 mt-0.5" />
                                    {point}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Discussion starters */}
                    {prepData.discussionStarters.length > 0 && (
                      <Card>
                        <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2 mb-4">
                          <MessageSquare className="w-4 h-4 text-purple-400" />
                          Discussion Starters
                          <span className="ml-auto text-xs text-[#4A5068]">Open-ended questions</span>
                        </h3>
                        <div className="space-y-2">
                          {prepData.discussionStarters.map((q, i) => (
                            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#0A0F1C]/60 border border-[#1E2A45]">
                              <span className="w-5 h-5 rounded-full bg-purple-500/10 flex items-center justify-center text-[10px] text-purple-400 font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                              <p className="text-sm text-[#F0F0F5]">{q}</p>
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* CTA */}
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-xs text-[#4A5068]">
                        Prep ready for {meetingTypeConfig?.label} — {household.name}
                      </p>
                      <Button onClick={handleStartMeeting} size="lg">
                        <Play className="w-4 h-4" /> Start Meeting
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── MEETING VIEW ───────────────────────────────────────────────────────────
  if (viewMode === 'meeting') {
    return (
      <AppShell>
        <div className="max-w-[1200px]">
          {/* Header */}
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-xs text-red-400 font-semibold uppercase tracking-wide">Meeting in Progress</span>
              </div>
              <h1 className="text-2xl font-bold text-[#F0F0F5]">{household.name}</h1>
              <p className="text-sm text-[#8B8FA3]">{meetingTypeConfig?.label} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            <Button variant="danger" onClick={handleEndMeeting}>
              End Meeting
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
            {/* Left: agenda + timer */}
            <div className="space-y-4">
              <MeetingTimer
                items={agendaItems}
                currentIdx={currentItemIdx}
                isRunning={timerRunning}
                elapsed={elapsed}
                onStart={startTimer}
                onPause={stopTimer}
                onNext={handleNextItem}
                onEnd={handleEndMeeting}
              />

              <Card>
                <AgendaSection
                  items={agendaItems}
                  onToggle={handleToggleAgendaItem}
                  onNotesChange={handleAgendaNotesChange}
                  activeMeeting
                  currentItemIdx={currentItemIdx}
                />
              </Card>
            </div>

            {/* Right: action items + talking points quick ref */}
            <div className="space-y-4">
              <Card>
                <ActionItemCapture
                  items={actionItems}
                  onAdd={(item) => setActionItems((prev) => [...prev, item])}
                  onToggle={(id) => setActionItems((prev) => prev.map((a) => a.id === id ? { ...a, done: !a.done } : a))}
                  onRemove={(id) => setActionItems((prev) => prev.filter((a) => a.id !== id))}
                />
              </Card>

              {prepData && prepData.riskFlags.length > 0 && (
                <Card>
                  <h3 className="text-xs font-semibold text-[#8B8FA3] uppercase tracking-wide mb-3">Risk Flags — Quick Ref</h3>
                  <div className="space-y-2">
                    {prepData.riskFlags.map((flag, i) => {
                      const cfg = SEVERITY_CONFIG[flag.severity] ?? SEVERITY_CONFIG.info;
                      const FlagIcon = cfg.icon;
                      return (
                        <div key={i} className="flex items-start gap-2">
                          <FlagIcon className={cn('w-3.5 h-3.5 flex-shrink-0 mt-0.5', cfg.color)} />
                          <p className="text-xs text-[#8B8FA3]">{flag.title}</p>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              )}

              {prepData && prepData.discussionStarters.length > 0 && (
                <Card>
                  <h3 className="text-xs font-semibold text-[#8B8FA3] uppercase tracking-wide mb-3">Discussion Starters</h3>
                  <div className="space-y-2">
                    {prepData.discussionStarters.slice(0, 3).map((q, i) => (
                      <p key={i} className="text-xs text-[#8B8FA3] leading-relaxed border-l-2 border-[#2A3A5C] pl-2">{q}</p>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  // ── SUMMARY VIEW ───────────────────────────────────────────────────────────
  return (
    <AppShell>
      <div className="max-w-[900px]">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-semibold">Meeting Complete</span>
          </div>
          <h1 className="text-3xl font-bold text-[#F0F0F5]">Post-Meeting Summary</h1>
          <p className="text-[#8B8FA3] mt-1">{household.name} · {meetingTypeConfig?.label}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">
          {/* Main summary */}
          <div className="space-y-4">
            {/* AI Summary */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#C9A962]" />
                  AI Meeting Summary
                </h3>
                {!summaryText && (
                  <Button onClick={handleGenerateSummary} disabled={summaryAI.loading} size="sm">
                    {summaryAI.loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</> : <><Sparkles className="w-3.5 h-3.5" /> Generate Summary</>}
                  </Button>
                )}
              </div>

              {summaryAI.loading && (
                <div className="space-y-3">
                  {[80, 90, 65, 75, 85].map((w, i) => (
                    <div key={i} className="h-3 rounded-full bg-[#1E2A45] animate-pulse" style={{ width: `${w}%`, animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              )}

              {summaryText && (
                <div className="p-4 rounded-xl bg-[#0A0F1C]/60 border border-[#1E2A45]">
                  <p className="text-sm text-[#F0F0F5] whitespace-pre-wrap leading-relaxed">{summaryText}</p>
                </div>
              )}

              {!summaryText && !summaryAI.loading && (
                <p className="text-sm text-[#4A5068] text-center py-6">
                  Generate an AI summary from your meeting notes and action items
                </p>
              )}
            </Card>

            {/* Agenda notes review */}
            <Card>
              <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-[#C9A962]" />
                Agenda Notes
              </h3>
              <div className="space-y-3">
                {agendaItems.map((item) => (
                  <div key={item.id} className="border-b border-[#1E2A45] pb-3 last:border-0">
                    <div className="flex items-center gap-2 mb-1">
                      {item.done
                        ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        : <Circle className="w-4 h-4 text-[#2A3A5C] flex-shrink-0" />
                      }
                      <p className={cn('text-sm font-medium', item.done ? 'text-[#F0F0F5]' : 'text-[#4A5068]')}>{item.title}</p>
                    </div>
                    {item.meetingNotes && (
                      <p className="text-xs text-[#8B8FA3] ml-6 leading-relaxed">{item.meetingNotes}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right: action items + links */}
          <div className="space-y-4">
            <Card>
              <h3 className="text-sm font-semibold text-[#F0F0F5] flex items-center gap-2 mb-4">
                <Clipboard className="w-4 h-4 text-[#C9A962]" />
                Action Items ({actionItems.length})
              </h3>
              {actionItems.length === 0 ? (
                <p className="text-xs text-[#4A5068] text-center py-4">No action items captured</p>
              ) : (
                <div className="space-y-2">
                  {actionItems.map((item) => (
                    <div key={item.id} className={cn('p-2.5 rounded-lg border', item.done ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-[#1E2A45]')}>
                      <p className={cn('text-xs font-medium', item.done ? 'text-emerald-400' : 'text-[#F0F0F5]')}>{item.task}</p>
                      <p className="text-[10px] text-[#4A5068] mt-0.5">
                        {item.assignee}{item.dueDate ? ` · Due ${item.dueDate}` : ''}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card>
              <h3 className="text-sm font-semibold text-[#F0F0F5] mb-4">Next Steps</h3>
              <div className="space-y-2">
                <Link href={`/clients/${household.id}/plan`}>
                  <button className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-[#1E2A45] hover:border-[#C9A962]/30 text-left transition-colors">
                    <TrendingUp className="w-4 h-4 text-[#C9A962]" />
                    <span className="text-sm text-[#F0F0F5]">View Financial Plan</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#4A5068] ml-auto" />
                  </button>
                </Link>
                <Link href={`/clients/${household.id}/comms`}>
                  <button className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-[#1E2A45] hover:border-[#C9A962]/30 text-left transition-colors">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-[#F0F0F5]">Send Follow-up</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#4A5068] ml-auto" />
                  </button>
                </Link>
                <button
                  onClick={() => { setViewMode('prep'); setPrepData(null); setAgendaItems([]); setActionItems([]); setCurrentItemIdx(0); setSummaryText(''); prepAI.reset(); summaryAI.reset(); }}
                  className="w-full flex items-center gap-2.5 p-3 rounded-xl border border-[#1E2A45] hover:border-[#C9A962]/30 text-left transition-colors"
                >
                  <RefreshCw className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-[#F0F0F5]">New Meeting Prep</span>
                </button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
