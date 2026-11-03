import { useState } from 'react';
import type { JobAnalysis, JobRequirement } from '@workspace/api-client-react';
import { AlertCircle, ChevronDown, Compass, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const GROUPS: { key: JobRequirement['category']; label: string; hint: string }[] = [
  { key: 'required', label: 'Required skills', hint: 'The advert says these are needed.' },
  { key: 'preferred', label: 'Helpful extras', hint: 'Nice to have. You can still apply without all of them.' },
  { key: 'responsibility', label: "What you'll do", hint: 'Day-to-day tasks named in the advert.' },
];

function ReqItem({ r, i }: { r: JobRequirement; i: number }) {
  return (
    <li className="rounded-xl border bg-card/70 p-3" data-testid={`item-requirement-${r.category}-${i}`}>
      <p className="text-sm font-semibold text-ink">{r.skill}</p>
      <p className="mt-0.5 text-sm text-muted-foreground">{r.explanation}</p>
      {r.quote && (
        <details className="group mt-1.5 text-xs">
          <summary className="cursor-pointer select-none text-clay hover:underline" data-testid={`toggle-quote-${r.category}-${i}`}>From the advert</summary>
          <blockquote className="mt-1 border-l-2 border-millet pl-2 italic text-muted-foreground">"{r.quote}"</blockquote>
        </details>
      )}
    </li>
  );
}

type Props = { company: string; analysis?: JobAnalysis; loading: boolean; error: boolean; onRetry: () => void };

export function JobRequirementsPanel({ company, analysis, loading, error, onRetry }: Props) {
  const name = company.trim() || 'this employer';
  const [open, setOpen] = useState(false);

  const header = (
    <div className="flex items-start justify-between gap-3">
      <p className="flex items-center gap-2 font-display text-lg text-ink"><Compass className="h-4 w-4 text-clay" /> What {name} is looking for</p>
      {analysis && <Button size="sm" variant="ghost" onClick={onRetry} disabled={loading} className="h-7 px-2 text-xs" data-testid="button-recheck-analysis">{loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}<span className="ml-1">Recheck</span></Button>}
    </div>
  );

  if (!analysis) {
    return (
      <div className="rounded-2xl border border-millet/50 bg-secondary/40 p-4" data-testid="panel-job-requirements">
        {header}
        {error ? (
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm" data-testid="status-analysis-error">
            <AlertCircle className="h-4 w-4 text-clay" />
            <span className="text-muted-foreground">We could not read the job advert just now. Nothing has been checked yet. Your coach and CV still work.</span>
            <Button size="sm" variant="outline" onClick={onRetry} data-testid="button-retry-analysis">Try again</Button>
          </div>
        ) : (
          <div className="mt-3 space-y-2" data-testid="status-analysis-loading">
            <p className="text-sm text-muted-foreground">Reading the job advert in plain words...</p>
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" /><div className="h-3 w-3/5 animate-pulse rounded bg-muted" /><div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
          </div>
        )}
      </div>
    );
  }

  const by = (k: string) => analysis.requirements.filter((r) => r.category === k);
  const required = by('required');
  const big = analysis.requirements.length > 5;
  const showAll = open || !big;

  return (
    <div className="rise rounded-2xl border border-millet/50 bg-secondary/40 p-4" data-testid="panel-job-requirements">
      {header}
      {error && <p className="mt-1 text-xs text-clay" data-testid="status-analysis-stale">Could not refresh just now; showing the last saved reading.</p>}
      <p className="mt-2 text-sm text-ink" data-testid="text-analysis-summary">{analysis.summary}</p>

      <div className="mt-4 space-y-4">
        {GROUPS.map((g) => {
          const items = by(g.key);
          if (!items.length) return null;
          if (g.key !== 'required' && !showAll) return null;
          return (
            <div key={g.key}>
              <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">{g.label}</p>
              <p className="mb-2 text-xs text-muted-foreground">{g.hint}</p>
              <ul className="space-y-2">{items.map((r, i) => <ReqItem key={i} r={r} i={i} />)}</ul>
            </div>
          );
        })}
        {!required.length && <p className="text-sm text-muted-foreground">The advert does not clearly list required skills.</p>}

        {showAll && (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl bg-card/70 p-3" data-testid="list-your-evidence">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">Your evidence so far</p>
                <p className="mb-1.5 text-xs text-muted-foreground">From facts you have saved.</p>
                {analysis.yourStrengths.length ? <ul className="list-disc space-y-1 pl-4 text-sm">{analysis.yourStrengths.map((s, i) => <li key={i}>{s}</li>)}</ul> : <p className="text-sm text-muted-foreground">Nothing matched yet. Tell your coach what you have done.</p>}
              </div>
              <div className="rounded-xl bg-card/70 p-3" data-testid="list-skills-to-build">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">Skills to build or show</p>
                <p className="mb-1.5 text-xs text-muted-foreground">Not in your saved facts yet. You may already have them.</p>
                {analysis.skillsToBuild.length ? <ul className="list-disc space-y-1 pl-4 text-sm">{analysis.skillsToBuild.map((s, i) => <li key={i}>{s}</li>)}</ul> : <p className="text-sm text-muted-foreground">None flagged.</p>}
              </div>
            </div>
            {analysis.uncertainties.length > 0 && (
              <div data-testid="list-uncertainties">
                <p className="text-xs font-semibold uppercase tracking-wider text-secondary-foreground">Not stated in the advert</p>
                <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-muted-foreground">{analysis.uncertainties.map((s, i) => <li key={i}>{s}</li>)}</ul>
              </div>
            )}
          </>
        )}
        {big && <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 text-sm font-medium text-clay hover:underline" data-testid="button-toggle-analysis">{open ? 'Show less' : 'Show extras, your evidence and gaps'}<ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} /></button>}

        {analysis.nextStep && <div className="rounded-xl border-l-4 border-clay bg-card p-3" data-testid="text-next-step"><p className="text-xs font-semibold uppercase tracking-wider text-clay">Next best step</p><p className="mt-0.5 text-sm">{analysis.nextStep}</p></div>}
      </div>
      <p className="mt-3 text-[11px] text-muted-foreground">Based on the job description you added — not independently verified employer information.</p>
    </div>
  );
}
