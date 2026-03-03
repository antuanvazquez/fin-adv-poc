import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-[#8B8FA3] font-medium">{label}</label>}
      <input
        className={cn(
          'w-full px-4 py-2.5 rounded-xl bg-[#0A0F1C] border border-[#1E2A45] text-[#F0F0F5] placeholder-[#4A5068] focus:outline-none focus:border-[#C9A962]/50 focus:ring-1 focus:ring-[#C9A962]/20 transition-colors text-sm',
          error && 'border-red-500/50',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export function Textarea({ label, className, ...props }: TextareaProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="text-sm text-[#8B8FA3] font-medium">{label}</label>}
      <textarea
        className={cn(
          'w-full px-4 py-2.5 rounded-xl bg-[#0A0F1C] border border-[#1E2A45] text-[#F0F0F5] placeholder-[#4A5068] focus:outline-none focus:border-[#C9A962]/50 focus:ring-1 focus:ring-[#C9A962]/20 transition-colors text-sm resize-none',
          className
        )}
        {...props}
      />
    </div>
  );
}
