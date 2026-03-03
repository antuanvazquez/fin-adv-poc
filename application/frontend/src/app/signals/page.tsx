'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  X,
  Sparkles,
  ExternalLink,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Users,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AnimatedNumber } from '@/components/ui/animated-number';
import { AppShell } from '@/components/layout/app-shell';
import { getAllSignals, mockHouseholds } from '@/lib/mock-data';
import { timeAgo, cn } from '@/lib/utils';
import type { LifeSignal } from '@/lib/types';

type FilterType = 'all' | 'critical' | 'warning' | 'info';

const filterTabs: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'critical', label: 'Critical' },
  { value: 'warning', label: 'Warning' },
  { value: 'info', label: 'Info' },
];

const severityConfig = {
  critical: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    badge: 'critical' as const,
  },
  warning: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    badge: 'warning' as const,
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    badge: 'info' as const,
  },
};

// Build a lookup: householdId -> { name, phone, email }
const householdContactMap: Record<string, { name: string; phone: string; email: string; householdId: string }> =
  Object.fromEntries(
    mockHouseholds.map((h) => [
      h.id,
      {
        name: h.name,
        householdId: h.id,
        phone: h.clients[0]?.phone ?? '',
        email: h.clients[0]?.email ?? '',
      },
    ]),
  );

// Strip non-digits from phone for wa.me links
function digitsOnly(phone: string) {
  return phone.replace(/\D/g, '');
}

export default function SignalsPage() {
  const [signals, setSignals] = useState<LifeSignal[]>(getAllSignals);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [selectedClient, setSelectedClient] = useState<string>('all');

  // Unique client names across all active signals
  const clientOptions = useMemo(() => {
    const active = signals.filter((s) => s.status === 'active');
    const names = Array.from(new Set(active.map((s) => s.clientName))).sort();
    return names;
  }, [signals]);

  const filteredSignals = useMemo(() => {
    return signals
      .filter((s) => s.status === 'active')
      .filter((s) => activeFilter === 'all' || s.type === activeFilter)
      .filter((s) => selectedClient === 'all' || s.clientName === selectedClient);
  }, [signals, activeFilter, selectedClient]);

  const activeCount = signals.filter((s) => s.status === 'active').length;

  const handleResolve = (id: string) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'resolved' as const } : s)),
    );
  };

  const handleSnooze = (id: string) => {
    setSignals((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'snoozed' as const } : s)),
    );
  };

  const handleDismiss = (id: string) => {
    setSignals((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, status: 'dismissed' as const } : s,
      ),
    );
  };

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1100px]"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F0F0F5]">Life Signals</h1>
          <p className="text-[#8B8FA3] mt-1 flex items-center gap-2">
            <AnimatedNumber
              value={activeCount}
              className="text-[#C9A962] font-semibold"
            />{' '}
            active signals across your practice
          </p>
        </div>

        {/* Type Filter Tabs */}
        <div className="flex items-center gap-2 mb-3">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.value;
            const count =
              tab.value === 'all'
                ? activeCount
                : signals.filter(
                    (s) => s.status === 'active' && s.type === tab.value,
                  ).length;
            return (
              <button
                key={tab.value}
                onClick={() => setActiveFilter(tab.value)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2',
                  isActive
                    ? 'bg-[#C9A962]/10 text-[#C9A962] border border-[#C9A962]/20'
                    : 'text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/50 border border-transparent',
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'text-xs px-1.5 py-0.5 rounded-md',
                    isActive
                      ? 'bg-[#C9A962]/20 text-[#C9A962]'
                      : 'bg-[#1E2A45] text-[#8B8FA3]',
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Client Filter Row */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <div className="flex items-center gap-1.5 text-xs text-[#4A5068] mr-1 flex-shrink-0">
            <Users className="w-3.5 h-3.5" />
            <span>Client:</span>
          </div>
          <button
            onClick={() => setSelectedClient('all')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 border',
              selectedClient === 'all'
                ? 'bg-[#1E2A45] text-[#F0F0F5] border-[#2A3A5C]'
                : 'text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/50 border-transparent',
            )}
          >
            All Clients
          </button>
          {clientOptions.map((name) => (
            <button
              key={name}
              onClick={() => setSelectedClient(name)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0 border',
                selectedClient === name
                  ? 'bg-[#1E2A45] text-[#F0F0F5] border-[#2A3A5C]'
                  : 'text-[#8B8FA3] hover:text-[#F0F0F5] hover:bg-[#1E2A45]/50 border-transparent',
              )}
            >
              {name}
              <span className="ml-1.5 text-[#4A5068]">
                ({signals.filter((s) => s.status === 'active' && s.clientName === name).length})
              </span>
            </button>
          ))}
        </div>

        {/* Signal Cards */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredSignals.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#F0F0F5]">
                    All clear!
                  </h3>
                  <p className="text-sm text-[#8B8FA3] mt-1 max-w-md">
                    {activeFilter === 'all' && selectedClient === 'all'
                      ? 'All signals have been resolved. Your practice is in great shape.'
                      : `No signals match the current filters.`}
                  </p>
                </Card>
              </motion.div>
            ) : (
              filteredSignals.map((signal, i) => {
                const contact = householdContactMap[signal.householdId];
                return (
                  <SignalCard
                    key={signal.id}
                    signal={signal}
                    index={i}
                    contact={contact}
                    onResolve={handleResolve}
                    onSnooze={handleSnooze}
                    onDismiss={handleDismiss}
                  />
                );
              })
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AppShell>
  );
}

function SignalCard({
  signal,
  index,
  contact,
  onResolve,
  onSnooze,
  onDismiss,
}: {
  signal: LifeSignal;
  index: number;
  contact?: { name: string; phone: string; email: string };
  onResolve: (id: string) => void;
  onSnooze: (id: string) => void;
  onDismiss: (id: string) => void;
}) {
  const config = severityConfig[signal.type];
  const Icon = config.icon;
  const isCritical = signal.type === 'critical';

  const phone = contact?.phone ?? '';
  const email = contact?.email ?? '';
  const whatsappMsg = encodeURIComponent(
    `Hi, this is a reminder regarding: ${signal.title}. ${signal.suggestedAction}`,
  );
  const smsBody = encodeURIComponent(`${signal.title}: ${signal.suggestedAction}`);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="rounded-2xl border border-[#1E2A45] bg-[#131A2E]/80 backdrop-blur-xl p-5 hover:border-[#2A3A5C] transition-colors"
    >
      <div className="flex gap-4">
        {/* Severity icon */}
        <div
          className={cn(
            'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
            config.bg,
          )}
        >
          <div className="relative">
            <Icon className={cn('w-5 h-5', config.color)} />
            {isCritical && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-400" />
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold text-[#F0F0F5]">
                  {signal.title}
                </h3>
                <Badge variant={config.badge}>{signal.type}</Badge>
              </div>
              <p className="text-sm text-[#8B8FA3] leading-relaxed">
                {signal.description}
              </p>
            </div>

            {/* Resolve / Snooze / Dismiss */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onResolve(signal.id)}
                className="text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Resolve
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onSnooze(signal.id)}
              >
                <Clock className="w-3.5 h-3.5" />
                Snooze
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDismiss(signal.id)}
                className="text-[#4A5068] hover:text-[#8B8FA3]"
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* Suggested action */}
          <div className="mt-3 px-3 py-2.5 rounded-lg bg-[#C9A962]/5 border border-[#C9A962]/10">
            <div className="flex items-start gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C9A962] mt-0.5 flex-shrink-0" />
              <p className="text-xs text-[#C9A962]/80 leading-relaxed">
                {signal.suggestedAction}
              </p>
            </div>
          </div>

          {/* Contact action buttons */}
          {(phone || email) && (
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#4A5068] mr-1">Take action:</span>
              {phone && (
                <a href={`tel:${phone}`}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2A45]/60 border border-[#2A3A5C] text-xs text-[#8B8FA3] hover:text-[#F0F0F5] hover:border-[#3A4A6C] hover:bg-[#1E2A45] transition-all duration-200">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    Call
                  </button>
                </a>
              )}
              {email && (
                <a href={`mailto:${email}?subject=${encodeURIComponent(signal.title)}&body=${encodeURIComponent(signal.suggestedAction)}`}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2A45]/60 border border-[#2A3A5C] text-xs text-[#8B8FA3] hover:text-[#F0F0F5] hover:border-[#3A4A6C] hover:bg-[#1E2A45] transition-all duration-200">
                    <Mail className="w-3.5 h-3.5 text-blue-400" />
                    Email
                  </button>
                </a>
              )}
              {phone && (
                <a href={`sms:${phone}?body=${smsBody}`}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2A45]/60 border border-[#2A3A5C] text-xs text-[#8B8FA3] hover:text-[#F0F0F5] hover:border-[#3A4A6C] hover:bg-[#1E2A45] transition-all duration-200">
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    SMS
                  </button>
                </a>
              )}
              {phone && (
                <a
                  href={`https://wa.me/${digitsOnly(phone)}?text=${whatsappMsg}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1E2A45]/60 border border-[#2A3A5C] text-xs text-[#8B8FA3] hover:text-[#F0F0F5] hover:border-[#3A4A6C] hover:bg-[#1E2A45] transition-all duration-200">
                    <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                    WhatsApp
                  </button>
                </a>
              )}
            </div>
          )}

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3 text-xs text-[#4A5068]">
            <Link
              href={`/clients/${signal.householdId}`}
              className="text-[#8B8FA3] hover:text-[#C9A962] transition-colors flex items-center gap-1"
            >
              {signal.clientName}
              <ExternalLink className="w-3 h-3" />
            </Link>
            <span>{signal.source}</span>
            <span>{timeAgo(signal.triggeredAt)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
