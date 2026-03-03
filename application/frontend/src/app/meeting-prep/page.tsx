'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Calendar, Users, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/ui/score-ring';
import { AppShell } from '@/components/layout/app-shell';
import { mockHouseholds } from '@/lib/mock-data';
import { formatCurrency, cn } from '@/lib/utils';

export default function MeetingPrepIndexPage() {
  const router = useRouter();

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[900px]"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F0F0F5]">Meeting Prep</h1>
          <p className="text-[#8B8FA3] mt-1">
            Select a client to prepare for a meeting with AI
          </p>
        </div>

        <div className="space-y-3">
          {mockHouseholds.map((h, i) => {
            const activeSignals = h.signals.filter((s) => s.status === 'active').length;
            const nextMeeting = h.meetings
              .filter((m) => m.status === 'scheduled')
              .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
              >
                <div
                  onClick={() => router.push(`/meeting-prep/${h.id}`)}
                  className="rounded-2xl border border-[#1E2A45] bg-[#131A2E]/80 backdrop-blur-xl p-5 hover:border-[#C9A962]/30 cursor-pointer transition-all duration-200 flex items-center gap-5"
                >
                  <ScoreRing
                    score={h.financialPlan.healthScore}
                    size={64}
                    strokeWidth={5}
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-base font-semibold text-[#F0F0F5]">
                        {h.name}
                      </h2>
                      <Badge
                        variant={h.status === 'active' ? 'success' : 'gold'}
                      >
                        {h.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#8B8FA3]">
                      {h.clients
                        .map((c) => `${c.firstName} ${c.lastName}`)
                        .join(' & ')}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-[#4A5068]">
                      <span>
                        Net Worth:{' '}
                        <span className="text-[#C9A962] font-medium">
                          {formatCurrency(h.financialPlan.netWorth.netWorth)}
                        </span>
                      </span>
                      {activeSignals > 0 && (
                        <span>
                          {activeSignals} active signal
                          {activeSignals > 1 ? 's' : ''}
                        </span>
                      )}
                      {nextMeeting && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Next:{' '}
                          {new Date(nextMeeting.date).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' },
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-[#2A3A5C]" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </AppShell>
  );
}
