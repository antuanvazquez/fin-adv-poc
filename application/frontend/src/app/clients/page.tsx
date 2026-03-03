'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScoreRing } from '@/components/ui/score-ring';
import { AppShell } from '@/components/layout/app-shell';
import { mockHouseholds } from '@/lib/mock-data';
import { formatCurrency } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function ClientsPage() {
  const router = useRouter();

  return (
    <AppShell>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-[1400px]"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#F0F0F5]">
            Client Households
          </h1>
          <p className="text-[#8B8FA3] mt-1">
            Manage and view all client households
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
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
                        variant={h.status === 'active' ? 'success' : 'gold'}
                      >
                        {h.status === 'active' ? 'Active' : 'Prospect'}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#8B8FA3] mb-4">
                      {h.clients
                        .map((c) => `${c.firstName} ${c.lastName}`)
                        .join(' & ')}
                    </p>
                    <div className="flex items-end gap-6">
                      <div>
                        <p className="text-xs text-[#8B8FA3] uppercase tracking-wider mb-1">
                          Net Worth
                        </p>
                        <p className="text-2xl font-bold text-[#F0F0F5]">
                          {formatCurrency(h.financialPlan.netWorth.netWorth)}
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
                            {pendingTasks} task{pendingTasks !== 1 && 's'}
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
                <div className="flex items-center justify-end mt-4 pt-3 border-t border-[#1E2A45]">
                  <span className="text-sm text-[#8B8FA3] flex items-center gap-1 group-hover:text-[#C9A962]">
                    View details <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.div>
    </AppShell>
  );
}
