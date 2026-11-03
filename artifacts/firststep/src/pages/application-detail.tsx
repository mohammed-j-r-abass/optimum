import { useMemo, useState } from 'react';
import { Link, useParams } from 'wouter';
import { useGenerateCv, useGetApplication, useSendCoachMessage } from '@workspace/api-client-react';
import { ArrowLeft, Download, FileText, Loader2, RefreshCw, Send, Sparkles } from 'lucide-react';
import { ChatThread } from '@/components/chat-thread';
import { VoicePanel } from '@/components/voice-panel';
import { ErrorState, CardSkeletons } from '@/components/states';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useRefresh } from '@/lib/use-refresh';
import { downloadText, errorMessage } from '@/lib/media';
import { CvPreview } from '@/components/cv-preview';
import { getCvDocument } from '@/lib/cv-model';

const STARTERS = ['I helped on my family farm every weekend', 'I led a group project at school', 'I volunteer at church or a club', 'Please make my CV shorter'];

export default function ApplicationDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { data: app, isLoading, isError, refetch } = useGetApplication(id);
  const send = useSendCoachMessage();
  const gen = useGenerateCv();
  const refresh = useRefresh();
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [pendingText, setPendingText] = useState('');
  const [tab, setTab] = useState<'coach' | 'cv'>('coach');
  const [pdfBusy, setPdfBusy] = useState(false);
  const cvDoc = useMemo(() => (app ? getCvDocument(app.cv, app.cvDocument) : null), [app]);

  async function downloadPdf(name: string) {
    if (!cvDoc) return;
    setPdfBusy(true);
    try {
      const mod = await import('@/lib/cv-pdf');
      await mod.downloadCvPdf(cvDoc, name);
    } catch (e) {
      toast({ title: 'Could not make the PDF', description: errorMessage(e), variant: 'destructive' });
    } finally { setPdfBusy(false); }
  }

  function submit(msg: string) {
    const m = msg.trim();
    if (!m) return;
    setPendingText(m);
    setText('');
    send.mutate({ id, data: { message: m } }, {
      onSuccess: () => refresh({ applicationId: id }),
      onError: (e) => { setText(m); toast({ title: 'Message not sent', description: errorMessage(e), variant: 'destructive' }); },
    });
  }

  function generate() {
    gen.mutate({ id }, {
      onSuccess: () => { refresh({ applicationId: id }); setTab('cv'); toast({ title: 'Your CV is ready', description: 'Read it through. Ask the coach for any changes.' }); },
      onError: (e) => toast({ title: 'Could not write the CV', description: errorMessage(e), variant: 'destructive' }),
    });
  }

  if (isError) return <ErrorState onRetry={() => refetch()} message="This job could not be found or loaded." />;
  if (isLoading || !app) return <CardSkeletons count={2} />;

  const context = () => `Role: ${app.title} at ${app.company}. Job description: ${app.description.slice(0, 1500)}. You are a patient CV coach for a rural final-year student. Ask one friendly follow-up question to collect real facts for the CV. Conversation so far:\n${app.messages.slice(-10).map((m) => `${m.role}: ${m.content}`).join('\n')}`;
  const lastAi = [...app.messages].reverse().find((m) => m.role !== 'user' && m.role !== 'system');
  const showAdvice = !!app.advice && app.advice.trim() !== lastAi?.content.trim();
  const fileBase = `${app.title}-${app.company}-CV`.replace(/[^a-z0-9]+/gi, '-');

  return (
    <div>
      <Link href="/applications" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-clay" data-testid="link-back"><ArrowLeft className="h-4 w-4" /> All jobs</Link>
      <div className="rise mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-ink md:text-4xl" data-testid="text-app-title">{app.title}</h1>
          <p className="text-muted-foreground">{app.company}</p>
        </div>
        <Button onClick={generate} disabled={gen.isPending} className="bg-clay hover:bg-clay/90" data-testid="button-generate-cv">
          {gen.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : app.cv ? <RefreshCw className="mr-1.5 h-4 w-4" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
          {gen.isPending ? 'Writing your CV' : app.cv ? 'Rewrite CV' : 'Write my CV now'}
        </Button>
      </div>

      <div className="mb-4 inline-flex rounded-full border bg-card p-1 lg:hidden">
        {(['coach', 'cv'] as const).map((t) => <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${tab === t ? 'bg-ink text-primary-foreground' : 'text-muted-foreground'}`} data-testid={`tab-${t}`}>{t === 'coach' ? 'Coach' : 'CV'}</button>)}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <section className={`${tab === 'coach' ? 'flex' : 'hidden'} flex-col gap-4 lg:flex`}>
          {showAdvice && <div className="rounded-2xl border-l-4 border-millet bg-secondary/50 p-4 text-sm" data-testid="text-advice"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-secondary-foreground">Coach notes</p><p className="whitespace-pre-wrap">{app.advice}</p></div>}
          <div className="max-h-[60vh] min-h-[280px] overflow-y-auto rounded-2xl border bg-[#f3efe6] p-3 sm:p-4" style={{ backgroundImage: 'radial-gradient(hsl(var(--ink) / 0.05) 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
            <ChatThread messages={app.messages} pending={send.isPending} pendingText={pendingText} empty={
              <div className="py-6 text-center text-sm text-muted-foreground">
                <p className="font-display text-lg text-ink">Let us find your experience together.</p>
                <p className="mt-1">Tell your coach about anything you have done. It will ask follow-up questions.</p>
              </div>
            } />
          </div>
          <div className="flex flex-wrap gap-2">
            {STARTERS.map((s) => <button key={s} onClick={() => submit(s)} disabled={send.isPending} className="rounded-full border bg-card px-3 py-1.5 text-xs transition hover:-translate-y-0.5 hover:border-clay hover:text-clay" data-testid={`button-starter-${s.slice(0, 10)}`}>{s}</button>)}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); submit(text); }} className="flex items-end gap-2 rounded-2xl border bg-card p-2">
            <Textarea value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(text); } }} rows={2} placeholder="Type your answer, or ask for CV changes" className="resize-none border-0 bg-transparent shadow-none focus-visible:ring-0" data-testid="input-coach-message" />
            <Button type="submit" size="icon" disabled={send.isPending || !text.trim()} aria-label="Send" data-testid="button-send-coach"><Send className="h-4 w-4" /></Button>
          </form>
          <VoicePanel buildContext={context} applicationId={id} onSaved={() => refresh({ applicationId: id })} saveNote="What you say and the reply are added to this conversation." />
        </section>

        <section className={`${tab === 'cv' ? 'block' : 'hidden'} lg:block`}>
          <div className="sticky top-6 rounded-2xl border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
              <p className="flex items-center gap-2 font-semibold text-ink"><FileText className="h-4 w-4 text-clay" /> CV preview</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" disabled={!app.cv} onClick={() => downloadText(`${fileBase}.txt`, app.cv)} data-testid="button-download-txt"><Download className="mr-1.5 h-3.5 w-3.5" /> .txt</Button>
                <Button size="sm" variant="outline" disabled={!cvDoc || pdfBusy} onClick={() => downloadPdf(`${fileBase}.pdf`)} data-testid="button-download-pdf">{pdfBusy ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-1.5 h-3.5 w-3.5" />} {pdfBusy ? 'Making PDF' : 'PDF'}</Button>
              </div>
            </div>
            {app.cv ? (
              <div className="max-h-[75vh] overflow-y-auto bg-muted/40 p-2 sm:p-4">
                {cvDoc && <CvPreview doc={cvDoc} />}
                <p className="mt-3 px-2 text-xs text-muted-foreground">Layout follows common guidance from <a href="https://careerservices.fas.harvard.edu/resources/create-a-strong-resume/" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay" data-testid="link-harvard-guide">Harvard Career Services</a> and <a href="https://nationalcareers.service.gov.uk/careers-advice/cv-sections" target="_blank" rel="noopener noreferrer" className="underline hover:text-clay" data-testid="link-ncs-guide">National Careers Service</a>.</p>
              </div>
            ) : (
              <div className="ruled p-10 text-center text-sm text-muted-foreground">
                <p className="font-display text-lg text-ink">No CV yet</p>
                <p className="mt-1">Chat with your coach first for the best result, or press "Write my CV now" whenever you feel ready. You can always improve it later.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
