import '@/styles/dashboard.css';
import { Link } from 'wouter';
import { useUser } from '@clerk/react';
import { useGetDashboard, type Dashboard } from '@workspace/api-client-react';
import { format } from 'date-fns';
import { CardSkeletons, ErrorState } from '@/components/states';
import { stageLabel } from '@/lib/media';
import {
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  BriefcaseBusiness,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileCheck2,
  Headphones,
  MessageCircleMore,
  Mic2,
  Sparkles,
} from 'lucide-react';

export function DashboardView({ data, firstName = '', signedIn = false }: { data: Dashboard; firstName?: string; signedIn?: boolean }) {
  const fullName = data.profile.name?.trim() || firstName;
  const name = fullName.split(/\s+/)[0] || '';
  const initials = fullName.split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'F';
  const profilePercent = Math.max(0, Math.min(100, Math.round(data.profileCompletion || 0)));
  const cvReadyCount = data.applications.filter(job => !!job.cv?.trim() || !!job.cvDocument).length;
  const recent = data.applications[0];
  const recentHasCv = !!(recent?.cv?.trim() || recent?.cvDocument);
  const needsBasics = !data.profile.name?.trim() || !data.profile.email?.trim();
  const jobHref = recent ? `/applications/${encodeURIComponent(recent.id)}` : '/applications';
  const primaryHref = needsBasics ? '/profile' : jobHref;
  const employer = recent?.company?.trim() || 'this job';
  const primaryTitle = needsBasics ? 'Start with what you already do.' : recent
    ? `${recentHasCv ? 'Strengthen' : 'Build'} your CV for ${employer}.`
    : 'Start with a job you want to apply for.';
  const primaryBody = needsBasics
    ? 'Add your name and contact details, then share what you have done at school, at home or in your community. No CV-writing experience needed.'
    : recent ? recentHasCv
      ? 'Review your CV against this job’s requirements, add any missing evidence, then practise explaining your experience.'
      : 'Share one relevant project, task or responsibility with your coach. We’ll compare it with this advert and build your CV from confirmed facts.'
    : 'Paste a job advert. Your coach will explain what the employer wants and ask about real experiences you can use.';
  const primaryLabel = needsBasics ? 'Tell your story' : recent ? `Continue ${recent.company?.trim() || 'your'} CV` : 'Add your first job';
  const nextPractice = data.interviews.filter(i => i.scheduledAt
    && Number.isFinite(new Date(i.scheduledAt).getTime()) && new Date(i.scheduledAt).getTime() > Date.now()
    && !['finished', 'completed', 'complete', 'done'].includes(i.status) && !i.feedback)
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
  const activeStep = needsBasics ? 0 : cvReadyCount ? 2 : 1;

  return (
    <div className="fs-next-page">
      <header className="fs-next-topline">
        <div>
          <div className="fs-next-overline">YOUR FIRSTSTEP HOME <span>·</span> {signedIn ? 'SAVED TO YOUR ACCOUNT' : 'GUEST WORKSPACE'}</div>
          <h1>{name ? `Welcome back, ${name}` : 'Your first step starts here'}<span>.</span></h1>
          <p className="fs-next-welcome">Small steps make a strong story. Here’s yours today.</p>
        </div>
        <Link href="/profile" className="fs-next-profile" aria-label="Open your story and profile completion">
          <span className="fs-next-avatar" aria-hidden="true">{initials}</span>
          <span className="fs-next-profile-copy"><strong>Your story</strong><span>Profile {profilePercent}% complete</span></span>
          <ChevronRight size={17} />
        </Link>
      </header>

      <section className="fs-next-primary" aria-labelledby="fs-next-primary-title">
        <div className="fs-next-primary-copy">
          <div className="fs-next-recommend"><span className="fs-next-spark"><Sparkles size={14} aria-hidden="true" /></span> YOUR RECOMMENDED NEXT STEP</div>
          <h2 id="fs-next-primary-title" data-testid="text-next-step">{primaryTitle}</h2>
          <p>{primaryBody}</p>
          <div className="fs-next-primary-actions">
            <Link href={primaryHref} className="fs-next-cta" data-testid="link-hero-start">{primaryLabel}<ArrowRight size={17} /></Link>
            {!needsBasics && recent && <Link href="/applications" className="fs-next-text-action">Choose another job <ChevronRight size={15} /></Link>}
          </div>
          {recent && <div className="fs-next-context"><FileCheck2 size={15} /><span className="fs-next-role" title={recent.title}>{recent.title}</span><span>·</span>{recent.company}</div>}
        </div>
        <div className="fs-next-side">
          <div className="fs-next-side-top">
            <span className="fs-next-side-icon"><MessageCircleMore size={19} /></span>
            <span className="fs-next-side-label">WHEN YOU’RE READY</span>
          </div>
          <h3>Practise saying it out loud.</h3>
          <p>A live voice or video conversation, one question at a time.</p>
          <Link href="/interviews" className="fs-next-practice" data-testid="link-home-practice">
            <Mic2 size={16} /> Try interview practice <ArrowRight size={15} />
          </Link>
          <span className="fs-next-practice-note"><AudioLines size={13} /> Start with voice or video</span>
        </div>
      </section>

      <section className="fs-next-journey" aria-label="Your three steps">
        <div className="fs-next-journey-heading">
          <div>
            <span className="fs-next-section-label">YOUR PATH, AT YOUR PACE</span>
            <h2>One step at a time</h2>
          </div>
          <div className="fs-next-progress-summary"><span className="fs-next-progress-track" role="progressbar" aria-label="Story completed" aria-valuenow={profilePercent} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${profilePercent}%` }} /></span><strong data-testid="text-profile-completion">{profilePercent}%</strong><span>story collected</span></div>
        </div>
        <div className="fs-next-steps">
          <Link href="/profile" className={`fs-next-step ${activeStep === 0 ? 'fs-next-step-active' : ''}`} aria-current={activeStep === 0 ? 'step' : undefined} data-testid="link-step-0">
            <span className="fs-next-step-number">01</span><span className="fs-next-step-copy"><strong>Gather your story</strong><small>School, home, community</small></span><span className="fs-next-step-state">{profilePercent >= 100 ? 'COMPLETE' : 'IN PROGRESS'}</span>
          </Link>
          <span className="fs-next-step-connector" aria-hidden="true" />
          <Link href={jobHref} className={`fs-next-step ${activeStep === 1 ? 'fs-next-step-active' : ''}`} aria-current={activeStep === 1 ? 'step' : undefined} data-testid="link-step-1">
            <span className="fs-next-step-number">02</span><span className="fs-next-step-copy"><strong>Build a tailored CV</strong><small>For a real job you choose</small></span><ChevronRight className="fs-next-step-chevron" size={16} />
          </Link>
          <span className="fs-next-step-connector" aria-hidden="true" />
          <Link href="/interviews" className={`fs-next-step ${activeStep === 2 ? 'fs-next-step-active' : ''}`} aria-current={activeStep === 2 ? 'step' : undefined} data-testid="link-step-2">
            <span className="fs-next-step-number">03</span><span className="fs-next-step-copy"><strong>Practise live</strong><small>Voice or video interview</small></span><ChevronRight className="fs-next-step-chevron" size={16} />
          </Link>
        </div>
      </section>

      <section className="fs-next-bottom" aria-label="Your activity">
        <div className="fs-next-stats">
          <div className="fs-next-bottom-heading"><span className="fs-next-section-label">YOUR PROGRESS</span><span>So far</span></div>
          <div className="fs-next-stat-row">
            <div className="fs-next-stat"><span className="fs-next-stat-icon"><BriefcaseBusiness size={16} /></span><strong data-testid="stat-applications">{data.applications.length}</strong><span>jobs</span></div>
            <div className="fs-next-stat"><span className="fs-next-stat-icon"><Headphones size={16} /></span><strong data-testid="stat-interviews">{data.interviews.length}</strong><span>practice sessions</span></div>
            <div className="fs-next-stat"><span className="fs-next-stat-icon"><BookOpenCheck size={16} /></span><strong data-testid="stat-cvs">{cvReadyCount}</strong><span>{cvReadyCount === 1 ? 'CV ready' : 'CVs ready'}</span></div>
          </div>
        </div>
        <div className="fs-next-recent">
          <div className="fs-next-bottom-heading"><span className="fs-next-section-label">PICK UP WHERE YOU LEFT OFF</span><Link href="/applications">All jobs <ArrowRight size={13} /></Link></div>
          {recent ? <Link href={jobHref} className="fs-next-job-row" data-testid={`link-recent-app-${recent.id}`}>
            <span className="fs-next-job-mark" aria-hidden="true">{(recent.company || recent.title).charAt(0).toUpperCase()}</span><span className="fs-next-job-copy"><strong title={recent.title}>{recent.title}</strong><small>{recent.company}<span>·</span>{recentHasCv ? 'CV ready to review' : 'Gathering your experience'}</small></span><ChevronRight size={17} />
          </Link> : <Link href="/applications" className="fs-next-empty">No saved jobs yet. Add an advert to get started.<ArrowRight size={15} /></Link>}
        </div>
        <div className="fs-next-upcoming">
          <div className="fs-next-bottom-heading"><span className="fs-next-section-label">COMING UP</span>{nextPractice && <time className="fs-next-date" dateTime={nextPractice.scheduledAt}><Clock3 size={13} />{format(new Date(nextPractice.scheduledAt), 'd MMM · HH:mm')}</time>}</div>
          {nextPractice ? <Link href="/interviews" className="fs-next-upcoming-row" data-testid="link-upcoming-practice">
            <span className="fs-next-calendar"><span>{format(new Date(nextPractice.scheduledAt), 'MMM').toUpperCase()}</span><strong>{format(new Date(nextPractice.scheduledAt), 'dd')}</strong></span><span className="fs-next-upcoming-copy"><strong title={nextPractice.title}>{nextPractice.title}</strong><small>{stageLabel(nextPractice.stage)}</small></span><ChevronRight size={17} />
          </Link> : <Link href="/interviews" className="fs-next-empty">No practice planned. Schedule one when it suits you.<ArrowRight size={15} /></Link>}
        </div>
      </section>
      <footer className="fs-next-footer"><CircleUserRound size={14} />{signedIn ? 'Your work is saved to your account. Your story is your own; there’s no one right starting point.' : <>Your work is private to this device. <Link href="/sign-up" className="underline" data-testid="link-hero-signup">Create an account to save across devices.</Link></>}</footer>
    </div>
  );
}

export default function DashboardPage() {
  const { isSignedIn, user } = useUser();
  const { data, isLoading, isError, refetch } = useGetDashboard();
  if (isError) return <ErrorState onRetry={() => refetch()} />;
  if (isLoading || !data) return <CardSkeletons count={3} />;
  return <DashboardView data={data} firstName={user?.firstName || ''} signedIn={!!isSignedIn} />;
}
