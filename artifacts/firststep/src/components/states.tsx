import type { ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export function PageHeader({ eyebrow, title, children, action }: { eyebrow?: string; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="rise mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-clay">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold text-ink md:text-4xl">{title}</h1>
        {children && <p className="mt-2 text-muted-foreground">{children}</p>}
      </div>
      {action}
    </div>
  );
}

export function ErrorState({ onRetry, message }: { onRetry?: () => void; message?: string }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-6" data-testid="status-error">
      <div className="flex items-center gap-2 font-medium text-destructive"><AlertTriangle className="h-4 w-4" /> We could not load this right now.</div>
      <p className="text-sm text-muted-foreground">{message ?? 'Check your connection, then try again. Nothing you saved has been lost.'}</p>
      {onRetry && <Button variant="outline" size="sm" onClick={onRetry} data-testid="button-retry"><RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Try again</Button>}
    </div>
  );
}

export function CardSkeletons({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border bg-card p-5">
          <Skeleton className="mb-3 h-5 w-1/3" />
          <Skeleton className="mb-2 h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="ruled rise flex flex-col items-center rounded-2xl border border-dashed bg-card/70 px-6 py-12 text-center">
      <div className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-secondary text-secondary-foreground">{icon}</div>
      <h3 className="text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{children}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Typing() {
  return <span className="typing inline-flex gap-1 text-muted-foreground" aria-label="Thinking"><span /><span /><span /></span>;
}
