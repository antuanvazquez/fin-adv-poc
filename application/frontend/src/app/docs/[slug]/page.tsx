import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { getDocBySlug, renderMarkdown, DOC_REGISTRY } from '@/lib/docs';

export function generateStaticParams() {
  return DOC_REGISTRY.filter((d) => d.slug !== 'executive-summary').map(
    (d) => ({ slug: d.slug }),
  );
}

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  if (slug === 'executive-summary') {
    return notFound();
  }

  const doc = getDocBySlug(slug);
  if (!doc) return notFound();

  const html = await renderMarkdown(doc.filename);

  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All Documents
        </Link>
        <span className="text-[#1E2A45]">|</span>
        <Link
          href="/"
          className="text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
        >
          Home
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
