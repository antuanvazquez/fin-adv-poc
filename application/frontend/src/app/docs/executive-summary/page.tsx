import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { renderMarkdown } from '@/lib/docs';

export default async function ExecSummaryPage() {
  const html = await renderMarkdown('executive_summary.md');

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Home
        </Link>
        <span className="text-[#1E2A45]">|</span>
        <Link
          href="/docs"
          className="text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
        >
          All Documents
        </Link>
      </div>

      <article
        className="prose prose-invert prose-sm max-w-none
          prose-headings:text-[#F0F0F5] prose-headings:font-bold
          prose-h1:text-3xl prose-h1:mb-2 prose-h1:border-b prose-h1:border-[#1E2A45] prose-h1:pb-4
          prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:text-[#C9A962]
          prose-h3:text-base prose-h3:mt-6 prose-h3:mb-2
          prose-p:text-[#C0C4D6] prose-p:leading-relaxed prose-p:text-sm
          prose-a:text-[#C9A962] prose-a:no-underline hover:prose-a:underline
          prose-strong:text-[#F0F0F5]
          prose-li:text-[#C0C4D6] prose-li:text-sm
          prose-table:text-sm
          prose-th:text-[#C9A962] prose-th:font-semibold prose-th:text-left prose-th:border-b prose-th:border-[#1E2A45] prose-th:pb-2 prose-th:text-xs
          prose-td:text-[#C0C4D6] prose-td:border-b prose-td:border-[#1E2A45]/50 prose-td:py-2 prose-td:text-xs
          prose-hr:border-[#1E2A45]
          prose-em:text-[#8B8FA3]
          prose-code:text-[#C9A962] prose-code:bg-[#131A2E] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <p className="text-xs text-[#4A5068] mt-12 text-center">
        Confidential — Partner Preview Only
      </p>
    </div>
  );
}
