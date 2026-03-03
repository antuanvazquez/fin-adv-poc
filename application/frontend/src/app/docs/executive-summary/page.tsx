import Link from 'next/link';
import { ArrowLeft, FolderOpen } from 'lucide-react';
import { renderMarkdown } from '@/lib/docs';
import { ScrollHint } from '@/components/scroll-hint';

export default async function ExecSummaryPage() {
  const html = await renderMarkdown('executive_summary.md');

  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-20 backdrop-blur-md bg-[#0A0F1C]/80 border-b border-[#1E2A45]/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            All Documents
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article
          className="doc-article"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <ScrollHint />

        <footer className="mt-16 pt-6 border-t border-[#1E2A45]/50 text-center">
          <p className="text-xs text-[#4A5068]">
            Confidential — Partner Preview Only
          </p>
        </footer>
      </main>
    </div>
  );
}
