import { useState } from 'react';
import { useListResources, useResearchCareers, type ResearchResult } from '@workspace/api-client-react';
import { ArrowUpRight, BookOpen, Loader2, Search } from 'lucide-react';
import { PageHeader, ErrorState, CardSkeletons, EmptyState } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { errorMessage } from '@/lib/media';

const IDEAS = ['Apprenticeships for school leavers near rural towns', 'What does a farm supervisor earn as a beginner', 'How to apply for a nursing assistant course'];

export default function ResourcesPage() {
  const { data, isLoading, isError, refetch } = useListResources();
  const research = useResearchCareers();
  const [q, setQ] = useState('');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [cat, setCat] = useState('All');
  const cats = ['All', ...Array.from(new Set((data ?? []).map((r) => r.category)))];

  function ask(query: string) {
    const v = query.trim();
    if (!v) return;
    setQ(v); setErr(null);
    research.mutate({ data: { query: v } }, {
      onSuccess: (r) => setResult(r),
      onError: (e) => {
        const status = (e as { status?: number }).status;
        setErr(status === 503 ? 'Web search is not available right now. Try again in a little while. The guides below still work.' : errorMessage(e));
      },
    });
  }

  return (
    <div>
      <PageHeader eyebrow="Guidance" title="Answers, without the guesswork">Search the web for careers, courses and pay, or read our short guides.</PageHeader>
      <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="rise mb-3 flex gap-2 rounded-2xl border bg-card p-2">
        <Search className="ml-2 mt-2.5 h-4 w-4 text-muted-foreground" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ask about a job, course or employer" className="border-0 shadow-none focus-visible:ring-0" data-testid="input-research" />
        <Button type="submit" disabled={research.isPending || !q.trim()} data-testid="button-research">{research.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Search'}</Button>
      </form>
      <div className="mb-8 flex flex-wrap gap-2">
        {IDEAS.map((i) => <button key={i} onClick={() => ask(i)} className="rounded-full border bg-card px-3 py-1 text-xs hover:border-clay hover:text-clay" data-testid={`button-idea-${i.slice(0, 8)}`}>{i}</button>)}
      </div>

      {err && <div className="mb-8"><ErrorState message={err} onRetry={() => ask(q)} /></div>}
      {research.isPending && <div className="mb-8"><CardSkeletons count={1} /></div>}
      {result && !research.isPending && (
        <div className="rise mb-10 rounded-2xl border bg-card p-6" data-testid="panel-research">
          <p className="whitespace-pre-wrap leading-relaxed">{result.answer}</p>
          {result.sources.length > 0 && (
            <ul className="mt-5 grid gap-2 border-t pt-4 md:grid-cols-2">
              {result.sources.map((s, i) => (
                <li key={i}><a href={s.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-xl p-2 text-sm hover:bg-muted" data-testid={`link-source-${i}`}><ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-clay" /><span><span className="font-medium">{s.title}</span><span className="block text-xs text-muted-foreground">{s.description}</span></span></a></li>
              ))}
            </ul>
          )}
        </div>
      )}

      <h2 className="mb-4 text-2xl font-semibold text-ink">Guides</h2>
      {isError ? <ErrorState onRetry={() => refetch()} /> : isLoading ? <CardSkeletons /> : !data?.length ? (
        <EmptyState icon={<BookOpen className="h-6 w-6" />} title="No guides yet">Use the search above to look anything up.</EmptyState>
      ) : (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={`rounded-full px-3 py-1 text-sm transition ${cat === c ? 'bg-ink text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-ink'}`} data-testid={`button-cat-${c}`}>{c}</button>)}
          </div>
          <ul className="grid gap-4 md:grid-cols-2">
            {data.filter((r) => cat === 'All' || r.category === cat).map((r, i) => (
              <li key={r.url + i}>
                <a href={r.url} target="_blank" rel="noreferrer" className="lift group block h-full rounded-2xl border bg-card p-5" data-testid={`link-resource-${i}`}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-clay">{r.category}</p>
                  <h3 className="mt-1 flex items-start justify-between gap-2 text-lg font-semibold text-ink">{r.title}<ArrowUpRight className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></h3>
                  <p className="mt-1 text-sm text-muted-foreground">{r.description}</p>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
