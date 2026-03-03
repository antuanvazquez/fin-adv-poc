import Link from 'next/link';
import { ArrowLeft, FileText, Star, ArrowRight } from 'lucide-react';
import { DOC_REGISTRY } from '@/lib/docs';

export default function DocsIndex() {
  return (
    <div className="min-h-screen">
      <nav className="sticky top-0 z-20 backdrop-blur-md bg-[#0A0F1C]/80 border-b border-[#1E2A45]/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-1">
          Project <span className="text-[#C9A962]">Documents</span>
        </h1>
        <p className="text-sm text-[#8B8FA3] mb-8">
          All research, planning, and technical documentation for the platform.
        </p>

        <div className="grid gap-3">
          {DOC_REGISTRY.map((doc) => (
            <Link key={doc.slug} href={`/docs/${doc.slug}`}>
              <div
                className={`group rounded-xl border p-4 sm:p-5 transition-all duration-200 active:scale-[0.99] sm:hover:scale-[1.01] ${
                  doc.featured
                    ? 'border-[#C9A962]/30 bg-gradient-to-r from-[#C9A962]/5 to-transparent hover:border-[#C9A962]/50'
                    : 'border-[#1E2A45] bg-[#0D1424]/60 hover:border-[#2A3A5C]'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      doc.featured
                        ? 'bg-[#C9A962]/10 text-[#C9A962]'
                        : 'bg-[#131A2E] text-[#8B8FA3]'
                    }`}
                  >
                    {doc.featured ? (
                      <Star className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-semibold text-[#F0F0F5] group-hover:text-[#C9A962] transition-colors">
                        {doc.title}
                      </h3>
                      <ArrowRight className="w-3.5 h-3.5 text-[#4A5068] group-hover:text-[#C9A962] transition-colors shrink-0" />
                    </div>
                    <p className="text-xs text-[#8B8FA3] mt-0.5 leading-relaxed">
                      {doc.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-[#1E2A45]/50 text-center">
          <p className="text-xs text-[#4A5068]">
            Confidential — Partner Preview Only
          </p>
        </footer>
      </main>
    </div>
  );
}
