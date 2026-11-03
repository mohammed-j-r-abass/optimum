import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  getListInterviewsQueryKey,
  useCreateInterview,
  useFinishInterview,
  useListApplications,
  useListInterviews,
  useSendInterviewTurn,
  type Interview,
} from '@workspace/api-client-react';
import { ArrowLeft, CalendarClock, Flag, Loader2, MessagesSquare, Play, Send } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader, ErrorState, CardSkeletons, EmptyState } from '@/components/states';
import { ChatThread } from '@/components/chat-thread';
import { LiveInterview } from '@/components/live-interview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRefresh } from '@/lib/use-refresh';
import { STAGES, errorMessage, stageLabel } from '@/lib/media';

const isDone = (i: Interview) => ['finished', 'completed', 'complete', 'done'].includes(i.status) || !!i.feedback;

export default function InterviewsPage() {
  const { data: interviews, isLoading, isError, refetch } = useListInterviews();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = interviews?.find((i) => i.id === activeId);

  if (active) return <Session interview={active} onBack={() => setActiveId(null)} />;

  const sorted = [...(interviews ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const scored = sorted.filter((i) => i.score !== null);

  return (
    <div>
      <PageHeader eyebrow="Interview practice" title="Practise until it feels familiar">
        Nobody is watching or judging. Scores describe how clear and complete your answers were, not whether you will get the job.
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Setup onStarted={setActiveId} />
        <div className="space-y-6">
          {scored.length > 1 && (
            <div className="rise rounded-2xl border bg-card p-5">
              <p className="mb-3 text-sm font-semibold text-ink">Answer quality over time</p>
              <div className="flex h-28 items-end gap-2" data-testid="chart-progress">
                {[...scored].reverse().map((i) => (
                  <div key={i.id} className="group flex flex-1 flex-col items-center gap-1">
                    <span className="font-mono text-[10px] text-muted-foreground opacity-0 transition group-hover:opacity-100">{i.score}</span>
                    <div className="w-full origin-bottom rounded-t-md bg-gradient-to-t from-clay to-millet transition-transform" style={{ height: `${Math.max(6, Number(i.score))}%` }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {isError ? <ErrorState onRetry={() => refetch()} /> : isLoading ? <CardSkeletons /> : !sorted.length ? (
            <EmptyState icon={<MessagesSquare className="h-6 w-6" />} title="No practice yet">Choose a job and a type of interview to begin. Your first one can be short.</EmptyState>
          ) : (
            <ul className="space-y-3">
              {sorted.map((i) => {
                const future = i.scheduledAt && new Date(i.scheduledAt) > new Date();
                return (
                  <li key={i.id} className="lift flex items-center gap-4 rounded-2xl border bg-card p-4" data-testid={`card-interview-${i.id}`}>
                    <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl font-mono text-sm font-semibold ${i.score !== null ? 'bg-ink text-millet' : 'bg-muted text-muted-foreground'}`}>{i.score ?? '--'}</div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-ink">{i.title}</p>
                      <p className="text-xs text-muted-foreground">{stageLabel(i.stage)} · {isDone(i) ? 'Finished' : future ? `Planned for ${format(new Date(i.scheduledAt), 'd MMM, HH:mm')}` : 'In progress'}</p>
                    </div>
                    <Button size="sm" variant={isDone(i) ? 'outline' : 'default'} onClick={() => setActiveId(i.id)} data-testid={`button-open-${i.id}`}>{isDone(i) ? 'Review' : future ? 'Start early' : 'Continue'}</Button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Setup({ onStarted }: { onStarted: (id: string) => void }) {
  const { data: apps, isLoading } = useListApplications();
  const create = useCreateInterview();
  const refresh = useRefresh();
  const { toast } = useToast();
  const [appId, setAppId] = useState('');
  const [stage, setStage] = useState<string>('behavioral');
  const [when, setWhen] = useState('');
  const chosen = appId || apps?.[0]?.id || '';

  function go() {
    const scheduledAt = when ? new Date(when).toISOString() : undefined;
    create.mutate({ data: { applicationId: chosen, stage, scheduledAt } }, {
      onSuccess: (i) => { refresh(); if (scheduledAt && new Date(scheduledAt) > new Date()) toast({ title: 'Practice planned', description: `See you on ${format(new Date(scheduledAt), 'd MMM at HH:mm')}.` }); else onStarted(i.id); },
      onError: (e) => toast({ title: 'Could not start', description: errorMessage(e), variant: 'destructive' }),
    });
  }

  return (
    <div className="rise h-fit rounded-2xl border bg-card p-5">
      <h2 className="mb-4 text-xl font-semibold text-ink">Set up a practice</h2>
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : !apps?.length ? (
        <p className="text-sm text-muted-foreground">Practice is based on a real job. <Link href="/applications" className="font-medium text-clay underline">Add a job first</Link>.</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="app">Job</Label>
            <select id="app" value={chosen} onChange={(e) => setAppId(e.target.value)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" data-testid="select-application">
              {apps.map((a) => <option key={a.id} value={a.id}>{a.title} at {a.company}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Type of interview</Label>
            {STAGES.map((s) => (
              <button key={s.value} type="button" onClick={() => setStage(s.value)} className={`w-full rounded-xl border p-3 text-left transition ${stage === s.value ? 'border-clay bg-accent' : 'hover:border-clay/50'}`} data-testid={`button-stage-${s.value}`}>
                <p className="text-sm font-semibold text-ink">{s.label}</p>
                <p className="text-xs text-muted-foreground">{s.hint}</p>
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="when">Plan it for later (optional)</Label>
            <Input id="when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} data-testid="input-scheduled" />
          </div>
          <Button className="w-full" onClick={go} disabled={create.isPending || !chosen} data-testid="button-start-interview">
            {create.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : when ? <CalendarClock className="mr-1.5 h-4 w-4" /> : <Play className="mr-1.5 h-4 w-4" />}
            {when ? 'Schedule practice' : 'Start now'}
          </Button>
        </div>
      )}
    </div>
  );
}

function Session({ interview, onBack }: { interview: Interview; onBack: () => void }) {
  const turn = useSendInterviewTurn();
  const finish = useFinishInterview();
  const refresh = useRefresh();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [pendingText, setPendingText] = useState('');
  const [liveBusy, setLiveBusy] = useState(false);
  const done = isDone(interview);

  const patch = (i: Interview) => qc.setQueryData<Interview[]>(getListInterviewsQueryKey(), (old) => old?.map((o) => (o.id === i.id ? i : o)));

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const m = text.trim();
    if (!m) return;
    setPendingText(m);
    setText('');
    turn.mutate({ id: interview.id, data: { message: m } }, {
      onSuccess: (i) => { patch(i); refresh(); },
      onError: (err) => { setText(m); toast({ title: 'Answer not sent', description: errorMessage(err), variant: 'destructive' }); },
    });
  }

  function end() {
    finish.mutate({ id: interview.id }, {
      onSuccess: (i) => { patch(i); refresh(); },
      onError: (err) => toast({ title: 'Could not finish', description: errorMessage(err), variant: 'destructive' }),
    });
  }

  useEffect(() => {
    if (!liveBusy) return;
    const h = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', h);
    return () => window.removeEventListener('beforeunload', h);
  }, [liveBusy]);

  function back() {
    if (liveBusy && !window.confirm('A live call is running or part of your transcript is not saved yet. Leave anyway and lose it?')) return;
    onBack();
  }

  return (
    <div>
      <button onClick={back} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-clay" data-testid="button-back-interviews"><ArrowLeft className="h-4 w-4" /> All practice</button>
      <div className="rise mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">{stageLabel(interview.stage)}</p>
          <h1 className="text-3xl font-semibold text-ink">{interview.title}</h1>
        </div>
        {!done && <Button variant="outline" onClick={end} disabled={finish.isPending || liveBusy || !interview.messages.some(m => m.role === 'user')} title={liveBusy ? 'End the live call and wait for the transcript to save first' : undefined} data-testid="button-finish-interview">{finish.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Flag className="mr-1.5 h-4 w-4" />}Finish and get feedback</Button>}
      </div>

      {done && (
        <div className="rise mb-6 grid gap-4 rounded-2xl bg-ink p-6 text-primary-foreground md:grid-cols-[160px_1fr]" data-testid="panel-feedback">
          <div>
            <p className="text-xs uppercase tracking-wider text-primary-foreground/60">Answer quality</p>
            <p className="font-display text-6xl font-semibold text-millet" data-testid="text-score">{interview.score ?? '--'}</p>
            <p className="text-xs text-primary-foreground/60">out of 100. A practice measure only, not a hiring prediction.</p>
          </div>
          <div>
            <p className="mb-2 text-xs uppercase tracking-wider text-primary-foreground/60">Feedback and practice plan</p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed" data-testid="text-feedback">{interview.feedback || 'Feedback is on its way.'}</p>
          </div>
        </div>
      )}

      <div className="grid gap-6">
        <div className="space-y-4">
          {!done && <LiveInterview interviewId={interview.id} onSaved={(i) => { patch(i); refresh(); }} onBusyChange={setLiveBusy} />}
          <div className="max-h-[60vh] min-h-[300px] overflow-y-auto rounded-2xl border bg-background/60 p-4">
            <ChatThread assistantName="Interviewer" messages={interview.messages} pending={turn.isPending} pendingText={pendingText} empty={<p className="py-8 text-center text-sm text-muted-foreground">Start the live call above, or type "ready" and the interviewer will ask the first question.</p>} />
          </div>
          {!done && (
            <>
              <form onSubmit={submit} className="flex items-end gap-2 rounded-2xl border bg-card p-2">
                <Textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); } }} rows={3} disabled={liveBusy} placeholder={liveBusy ? 'Typing is paused during the live call. End the call to type.' : 'Type your answer. Take your time.'} className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" data-testid="input-answer" />
                <Button type="submit" size="icon" disabled={turn.isPending || liveBusy || !text.trim()} aria-label="Send answer" data-testid="button-send-answer"><Send className="h-4 w-4" /></Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
