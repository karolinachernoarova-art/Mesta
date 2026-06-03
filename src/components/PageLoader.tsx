import { Loader2 } from 'lucide-react';

export default function PageLoader({ label = 'Загрузка' }: { label?: string }) {
  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center px-6">
      <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 rounded-3xl bg-[var(--bg-surface)] border border-[var(--border-main)] shadow-sm flex items-center justify-center">
          <Loader2 className="w-7 h-7 text-[var(--brand-primary)] animate-spin" />
        </div>
        <p className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest">{label}</p>
      </div>
    </div>
  );
}
