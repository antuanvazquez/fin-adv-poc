import Link from 'next/link';
import { ArrowLeft, FileText, Star } from 'lucide-react';
import { DOC_REGISTRY } from '@/lib/docs';

export default function DocsIndex() {
  return (
    <div className="min-h-screen px-4 py-12 max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-[#8B8FA3] hover:text-[#C9A962] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-2">
        Project <span className="text-[#C9A962]">Documents</span>
      </h1>
      <p className="text-[#8B8FA3] mb-8">
        All research, planning, and technical documentation for the platform.
      </p>

      <div className="grid gap-3">
        {DOC_REGISTRY.map((doc) => (
          <Link key={doc.slug} href={`/docs/${doc.slug}`}>
            <div
              className={`group rounded-xl border p-5 transition-all duration-200 hover:scale-[1.01] ${
                doc.featured
                  ? 'border-[#C9A962]/30 bg-gradient-to-r from-[#C9A962]/5 to-transparent hover:border-[#C9A962]/50'
                  : 'border-[#1E2A45] bg-[#0D1424]/60 hover:border-[#2A3A5C]'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
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
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-[#F0F0F5] group-hover:text-[#C9A962] transition-colors">
                    {doc.title}
                  </h3>
                  <p className="text-xs text-[#8B8FA3] mt-0.5 leading-relaxed">
                    {doc.description}
                  </p>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-xs text-[#4A5068] mt-8 text-center">
        Confidential — Partner Preview Only
      </p>
    </div>
  );
}
