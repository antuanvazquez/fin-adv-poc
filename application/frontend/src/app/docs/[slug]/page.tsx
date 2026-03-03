import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';
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
    <div className="min-h-screen">
      <nav className="sticky top-0 z-20 backdrop-blur-md bg-[#0A0F1C]/80 border-b border-[#1E2A45]/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">All Documents</span>
            <span className="sm:hidden">Docs</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <article
          className="doc-article"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        <footer className="mt-16 pt-6 border-t border-[#1E2A45]/50 text-center">
          <p className="text-xs text-[#4A5068]">
            Confidential — Partner Preview Only
          </p>
        </footer>
      </main>
    </div>
  );
}
