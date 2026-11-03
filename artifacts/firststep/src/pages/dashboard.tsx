import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { useUser } from '@clerk/react';
import { useGetDashboard } from '@workspace/api-client-react';
import { ArrowRight, BookOpen, Briefcase, CalendarClock, MessagesSquare, Sprout, UserRound } from 'lucide-react';
import { ErrorState } from '@/components/states';
import { Skeleton } from '@/components/ui/skeleton';
import { stageLabel } from '@/lib/media';
import { format } from 'date-fns';

const PATH = [
  { href: '/profile', icon: UserRound, title: 'Tell your story', body: 'School projects, helping on the farm or in the family shop, church or club volunteering. It all counts.' },
  { href: '/applications', icon: Briefcase, title: 'Pick a job and build a CV', body: 'Paste an advert. Your coach asks gentle questions, then writes a clear CV for that job.' },
  { href: '/interviews', icon: MessagesSquare, title: 'Practise the interview', body: 'Answer by typing or speaking. Get honest, kind feedback on each answer.' },
];

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const { data, isLoading, isError, refetch } = useGetDashboard();
  const name = data?.profile.name?.split(' ')[0] || (isSignedIn ? user?.firstName : '') || '';
  const pct = Math.round(data?.profileCompletion ?? 0);
  const upcoming = (data?.interviews ?? []).filter((i) => i.scheduledAt && new Date(i.scheduledAt) > new Date()).sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt));

  return (
    <div className="space-y-8">
      <section className="rise relative overflow-hidden rounded-3xl bg-ink px-6 py-10 text-primary-foreground md:px-10 md:py-14">
        <svg className="pointer-events-none absolute -right-10 bottom-0 h-56 w-[28rem] opacity-90" viewBox="0 0 440 220" aria-hidden="true">
          <path d="M20 210h90v-50h90v-50h90v-50h90" stroke="hsl(39 77% 60%)" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="400" cy="34" r="20" fill="hsl(16 68% 54%)" />
        </svg>
        <div className="relative max-w-xl">
          {!isSignedIn && <span className="mb-4 inline-block rounded-full bg-millet px-3 py-1 text-xs font-semibold uppercase tracking-wider text-ink" data-testid="badge-guest">Try it out: guest workspace</span>}
          <h1 className="text-4xl font-semibold leading-tight md:text-5xl">{name ? `Welcome back, ${name}.` : 'Your first job starts with one small step.'}</h1>
          <p className="mt-4 text-primary-foreground/80 md:text-lg">You have done more than you think. FirstStep helps you turn school, home and community work into a CV employers understand, then lets you practise the interview until it feels familiar.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/applications" className="group inline-flex items-center gap-2 rounded-full bg-millet px-5 py-2.5 font-semibold text-ink transition-transform hover:-translate-y-0.5" data-testid="link-hero-start">Start a CV <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></Link>
            {!isSignedIn && <Link href="/sign-up" className="inline-flex items-center rounded-full border border-primary-foreground/30 px-5 py-2.5 font-medium hover:bg-primary-foreground/10" data-testid="link-hero-signup">Save across devices</Link>}
          </div>
        </div>
      </section>

      {isError && <ErrorState onRetry={() => refetch()} />}

      <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
        <div className="rise rise-1 rounded-2xl border bg-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-clay">Your next step</p>
          {isLoading ? <Skeleton className="mt-3 h-6 w-3/4" /> : <p className="mt-2 font-display text-2xl text-ink" data-testid="text-next-step">{data?.nextStep || 'Fill in your story so your coach knows where you are starting from.'}</p>}
          <div className="mt-6">
            <div className="mb-2 flex justify-between text-sm"><span className="text-muted-foreground">Story completed</span><span className="font-mono font-medium" data-testid="text-profile-completion">{isLoading ? '--' : `${pct}%`}</span></div>
            <div className="h-2.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-gradient-to-r from-clay to-millet transition-transform duration-700" style={{ width: '100%', transform: `translateX(-${100 - pct}%)` }} /></div>
          </div>
        </div>
        <div className="rise rise-2 grid grid-cols-2 gap-4">
          <Stat label="Jobs you are working on" value={data?.applications.length} loading={isLoading} testId="stat-applications" />
          <Stat label="Practice interviews" value={data?.interviews.length} loading={isLoading} testId="stat-interviews" />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-semibold text-ink">Three steps, at your own pace</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {PATH.map((p, i) => (
            <Link key={p.href} href={p.href} className={`lift rise rise-${i + 2} group rounded-2xl border bg-card p-5`} data-testid={`link-step-${i}`}>
              <div className="mb-4 flex items-center justify-between">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><p.icon className="h-5 w-5" /></span>
                <span className="font-mono text-xs text-muted-foreground">0{i + 1}</span>
              </div>
              <h3 className="text-lg font-semibold text-ink">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-ink">Recent jobs</h2><Link href="/applications" className="text-sm text-clay hover:underline">See all</Link></div>
          {isLoading ? <Skeleton className="h-16" /> : data?.applications.length ? (
            <ul className="divide-y">
              {data.applications.slice(0, 4).map((a) => (
                <li key={a.id}><Link href={`/applications/${a.id}`} className="flex items-center justify-between py-3 hover:text-clay" data-testid={`link-recent-app-${a.id}`}><span><span className="font-medium">{a.title}</span><span className="text-sm text-muted-foreground"> at {a.company}</span></span><ArrowRight className="h-4 w-4" /></Link></li>
              ))}
            </ul>
          ) : <Quiet icon={<Sprout className="h-4 w-4" />} text="No jobs yet. Add one when you find an advert you like." />}
        </div>
        <div className="rounded-2xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-semibold text-ink">Coming up</h2><Link href="/interviews" className="text-sm text-clay hover:underline">Practice</Link></div>
          {isLoading ? <Skeleton className="h-16" /> : upcoming.length ? (
            <ul className="divide-y">
              {upcoming.slice(0, 4).map((i) => (
                <li key={i.id} className="flex items-center gap-3 py-3"><CalendarClock className="h-4 w-4 text-clay" /><span className="flex-1"><span className="font-medium">{i.title}</span><span className="block text-xs text-muted-foreground">{stageLabel(i.stage)}</span></span><span className="font-mono text-xs">{format(new Date(i.scheduledAt), 'd MMM, HH:mm')}</span></li>
              ))}
            </ul>
          ) : <Quiet icon={<BookOpen className="h-4 w-4" />} text="No practice planned. You can schedule one for a time that suits you." />}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value, loading, testId }: { label: string; value?: number; loading: boolean; testId: string }) {
  return (
    <div className="flex flex-col justify-between rounded-2xl border bg-secondary/60 p-5">
      <span className="text-sm text-secondary-foreground/80">{label}</span>
      {loading ? <Skeleton className="mt-3 h-9 w-12" /> : <span className="mt-3 font-display text-4xl font-semibold text-ink" data-testid={testId}>{value ?? 0}</span>}
    </div>
  );
}

function Quiet({ icon, text }: { icon: ReactNode; text: string }) {
  return <div className="flex items-center gap-3 rounded-xl bg-muted/60 p-4 text-sm text-muted-foreground">{icon}{text}</div>;
}
