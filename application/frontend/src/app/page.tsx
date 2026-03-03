'use client';

import { motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  FolderOpen,
  Play,
  LayoutDashboard,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

const cards = [
  {
    title: 'Start Here',
    description:
      'A quick walkthrough of the platform vision and what the POC demonstrates.',
    icon: Play,
    href: '/video',
    accent: true,
  },
  {
    title: 'Executive Summary',
    description:
      'The opportunity, revenue model, cost roadmap, and investment overview.',
    icon: FileText,
    href: '/docs/executive-summary',
    accent: true,
  },
  {
    title: 'Supporting Documents',
    description:
      'Market research, competitive analysis, compliance, technology roadmap, and more.',
    icon: FolderOpen,
    href: '/docs',
    accent: false,
  },
  {
    title: 'Explore the POC',
    description:
      'See the platform in action — AI-powered planning, communication hub, life signals, and more.',
    icon: LayoutDashboard,
    href: '/dashboard',
    accent: true,
    featured: true,
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 sm:py-16">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(201,169,98,0.06)_0%,_transparent_60%)]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7 }}
        className="relative z-10 flex flex-col items-center w-full max-w-3xl"
      >
        <motion.div
          animate={{
            boxShadow: [
              '0 0 20px rgba(201,169,98,0.1)',
              '0 0 40px rgba(201,169,98,0.2)',
              '0 0 20px rgba(201,169,98,0.1)',
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#131A2E] border border-[#C9A962]/20 flex items-center justify-center mb-5 sm:mb-6"
        >
          <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-[#C9A962]" />
        </motion.div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-center leading-tight">
          Advisory{' '}
          <span className="text-[#C9A962]">Intelligence Platform</span>
        </h1>
        <p className="text-[#8B8FA3] mt-3 text-sm sm:text-base md:text-lg text-center max-w-xl px-2">
          Welcome, partners. This is a work in progress — start with the
          Executive Summary or the intro video for the big picture. The
          supporting documents are deeper dives into the research and analysis
          behind it. The Proof of Concept (POC) is an early, working prototype
          for us to tweak and begin to get a sense of what the platform should look and feel like.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-8 sm:mt-10 w-full">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 * i }}
            >
              {card.featured ? (
                <Link href={card.href} className="block h-full">
                  <motion.div
                    animate={{
                      boxShadow: [
                        '0 0 0px rgba(201,169,98,0)',
                        '0 0 24px rgba(201,169,98,0.18)',
                        '0 0 0px rgba(201,169,98,0)',
                      ],
                    }}
                    transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                    className="group relative rounded-2xl border border-[#C9A962]/50 bg-gradient-to-br from-[#C9A962]/8 via-[#0D1424]/90 to-[#0D1424]/80 p-5 sm:p-6 h-full flex flex-col justify-between transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02] sm:hover:border-[#C9A962]/70"
                  >
                    <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] uppercase tracking-widest text-[#C9A962]/70 font-semibold">
                      Try it
                    </span>
                    <CardContent card={card} />
                  </motion.div>
                </Link>
              ) : (
                <Link href={card.href} className="block h-full">
                  <div
                    className={`group relative rounded-2xl border p-5 sm:p-6 h-full flex flex-col justify-between transition-all duration-300 active:scale-[0.98] sm:hover:scale-[1.02] ${
                      card.accent
                        ? 'border-[#C9A962]/30 bg-gradient-to-br from-[#C9A962]/5 to-[#0D1424]/80 hover:border-[#C9A962]/50'
                        : 'border-[#1E2A45] bg-[#0D1424]/80 hover:border-[#2A3A5C]'
                    }`}
                  >
                    <CardContent card={card} />
                  </div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-[#4A5068] mt-8 sm:mt-10 text-center">
          Confidential — Partner Preview Only
        </p>
      </motion.div>
    </div>
  );
}

function CardContent({ card }: { card: (typeof cards)[number] }) {
  const Icon = card.icon;
  return (
    <>
      <div>
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${
            card.accent
              ? 'bg-[#C9A962]/10 text-[#C9A962]'
              : 'bg-[#131A2E] text-[#8B8FA3]'
          }`}
        >
          <Icon className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-[#F0F0F5] mb-1">
          {card.title}
        </h3>
        <p className="text-sm text-[#8B8FA3] leading-relaxed">
          {card.description}
        </p>
      </div>
      <div className="flex items-center gap-1 text-xs text-[#C9A962] mt-3 sm:mt-4 font-medium group-hover:gap-2 transition-all">
        Open <ArrowRight className="w-3 h-3" />
      </div>
    </>
  );
}
