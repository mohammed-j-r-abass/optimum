import './_group.css';
import './NextStep.css';
import { useEffect, useState } from 'react';
import { AppShell } from './_Shell';
import { demo } from './_stubs';
import {
  ArrowDownRight,
  ArrowRight,
  AudioLines,
  BookOpenCheck,
  BriefcaseBusiness,
  Check,
  ChevronRight,
  CircleUserRound,
  Clock3,
  FileCheck2,
  Headphones,
  MessageCircleMore,
  Mic2,
  X,
} from 'lucide-react';

type DemoAction = 'cv' | 'practice' | 'story' | 'jobs' | 'upcoming' | null;

const actionCopy: Record<Exclude<DemoAction, null>, { eyebrow: string; title: string; body: string; button: string }> = {
  cv: {
    eyebrow: 'CV workspace · Lumen',
    title: 'Add one real example of teamwork.',
    body: 'Your coach will ask about a time you worked with someone else. School projects, helping at home, a club or volunteering all count. This demo keeps you in the workspace—no CV is generated in chat.',
    button: 'Continue in the CV workspace',
  },
  practice: {
    eyebrow: 'Live interview practice',
    title: 'Get comfortable answering out loud.',
    body: 'Choose voice or video when you are ready. Your coach will ask one question at a time and give kind, practical feedback.',
    button: 'Open practice setup',
  },
  story: {
    eyebrow: 'Your story',
    title: 'Start with what you already do.',
    body: 'Collect examples from school, home and your community. FirstStep helps turn real experience into clear evidence for a CV.',
    button: 'Continue your story',
  },
  jobs: {
    eyebrow: 'Jobs and CVs',
    title: 'Your saved job list',
    body: 'You have 3 jobs in progress, including one CV ready to review. Pick a real advert and build evidence for that role.',
    button: 'View jobs and CVs',
  },
  upcoming: {
    eyebrow: 'Practice session',
    title: 'Graduate Software Engineer',
    body: 'Behavioural practice · 6 Nov, 14:00. You can join when it is time, or get comfortable with a practice question now.',
    button: 'Open practice setup',
  },
};

function DemoModal({ action, onClose }: { action: Exclude<DemoAction, null>; onClose: () => void }) {
  const copy = actionCopy[action];
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div className="fs-next-overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="fs-next-dialog" role="dialog" aria-modal="true" aria-labelledby="fs-next-dialog-title">
        <button type="button" className="fs-next-close" onClick={onClose} aria-label="Close demo panel"><X size={19} /></button>
        <span className="fs-next-kicker">{copy.eyebrow}</span>
        <h2 id="fs-next-dialog-title">{copy.title}</h2>
        <p>{copy.body}</p>
        <div className="fs-next-demo-note"><span className="fs-next-demo-dot" /> Prototype preview · actions do not save or navigate</div>
        <button type="button" className="fs-next-dialog-action" onClick={onClose}>{copy.button}<ArrowRight size={17} /></button>
      </section>
    </div>
  );
}

function DashboardContent() {
  const [activeAction, setActiveAction] = useState<DemoAction>(null);
  const [completed, setCompleted] = useState(false);
  const profilePercent = 75;
  const cvReadyCount = demo.applications.filter((job) => job.status === 'cv_ready').length;

  return (
    <div className="fs-next-page">
      <header className="fs-next-topline">
        <div>
          <div className="fs-next-overline">AMA’S FIRSTSTEP HOME <span>·</span> DEMO WORKSPACE</div>
          <h1>Good morning, Ama<span>.</span></h1>
          <p className="fs-next-welcome">Small steps make a strong story. Here’s yours today.</p>
        </div>
        <button type="button" className="fs-next-profile" onClick={() => setActiveAction('story')} aria-label="Open your story and profile completion">
          <span className="fs-next-avatar">AM</span>
          <span className="fs-next-profile-copy"><strong>Your story</strong><span>Profile {profilePercent}% complete</span></span>
          <ChevronRight size={17} />
        </button>
      </header>

      <section className="fs-next-primary" aria-labelledby="fs-next-primary-title">
        <div className="fs-next-primary-copy">
          <div className="fs-next-recommend"><span className="fs-next-spark">✳</span> YOUR RECOMMENDED NEXT STEP</div>
          <h2 id="fs-next-primary-title">{completed ? 'Nice work, Ama.' : 'Give your Lumen CV one more good example.'}</h2>
          <p>{completed ? 'You’ve marked this step complete in the demo. Your next step is still yours to choose.' : 'Your coach is looking for a real example of working in a team. School, home or community experience all count.'}</p>
          <div className="fs-next-primary-actions">
            <button type="button" className="fs-next-cta" onClick={() => setActiveAction('cv')}>
              {completed ? 'Open Lumen CV' : 'Continue Lumen CV'} <ArrowRight size={17} />
            </button>
            <button type="button" className="fs-next-text-action" onClick={() => setCompleted((value) => !value)}>
              {completed ? <><ArrowDownRight size={15} /> Undo demo step</> : <><Check size={15} /> Mark step done</>}
            </button>
          </div>
          <div className="fs-next-context"><FileCheck2 size={15} /> Graduate Software Engineer <span>·</span> Lumen</div>
        </div>
        <div className="fs-next-side">
          <div className="fs-next-side-top">
            <span className="fs-next-side-icon"><MessageCircleMore size={19} /></span>
            <span className="fs-next-side-label">WHEN YOU’RE READY</span>
          </div>
          <h3>Practise saying it out loud.</h3>
          <p>A live voice or video conversation, one question at a time.</p>
          <button type="button" className="fs-next-practice" onClick={() => setActiveAction('practice')}>
            <Mic2 size={16} /> Try interview practice <ArrowRight size={15} />
          </button>
          <span className="fs-next-practice-note"><AudioLines size={13} /> Start with voice or video</span>
        </div>
      </section>

      <section className="fs-next-journey" aria-label="Your three steps">
        <div className="fs-next-journey-heading">
          <div>
            <span className="fs-next-section-label">YOUR PATH, AT YOUR PACE</span>
            <h2>One step at a time</h2>
          </div>
          <div className="fs-next-progress-summary"><span className="fs-next-progress-track"><span style={{ width: `${profilePercent}%` }} /></span><strong>{profilePercent}%</strong><span>story collected</span></div>
        </div>
        <div className="fs-next-steps">
          <button type="button" className="fs-next-step fs-next-step-active" onClick={() => setActiveAction('story')}>
            <span className="fs-next-step-number">01</span><span className="fs-next-step-copy"><strong>Gather your story</strong><small>School, home, community</small></span><span className="fs-next-step-state">IN PROGRESS</span>
          </button>
          <span className="fs-next-step-connector" aria-hidden="true" />
          <button type="button" className="fs-next-step" onClick={() => setActiveAction('cv')}>
            <span className="fs-next-step-number">02</span><span className="fs-next-step-copy"><strong>Build a tailored CV</strong><small>For a real job you choose</small></span><ChevronRight className="fs-next-step-chevron" size={16} />
          </button>
          <span className="fs-next-step-connector" aria-hidden="true" />
          <button type="button" className="fs-next-step" onClick={() => setActiveAction('practice')}>
            <span className="fs-next-step-number">03</span><span className="fs-next-step-copy"><strong>Practise live</strong><small>Voice or video interview</small></span><ChevronRight className="fs-next-step-chevron" size={16} />
          </button>
        </div>
      </section>

      <section className="fs-next-bottom" aria-label="Your activity">
        <div className="fs-next-stats">
          <div className="fs-next-bottom-heading"><span className="fs-next-section-label">YOUR PROGRESS</span><span>So far</span></div>
          <div className="fs-next-stat-row">
            <div className="fs-next-stat"><span className="fs-next-stat-icon"><BriefcaseBusiness size={16} /></span><strong>{demo.applications.length}</strong><span>jobs</span></div>
            <div className="fs-next-stat"><span className="fs-next-stat-icon"><Headphones size={16} /></span><strong>{demo.interviews.length}</strong><span>practice sessions</span></div>
            <div className="fs-next-stat"><span className="fs-next-stat-icon"><BookOpenCheck size={16} /></span><strong>{cvReadyCount}</strong><span>CV ready</span></div>
          </div>
        </div>
        <div className="fs-next-recent">
          <div className="fs-next-bottom-heading"><span className="fs-next-section-label">PICK UP WHERE YOU LEFT OFF</span><button type="button" onClick={() => setActiveAction('jobs')}>All jobs <ArrowRight size={13} /></button></div>
          <button type="button" className="fs-next-job-row" onClick={() => setActiveAction('cv')}>
            <span className="fs-next-job-mark">L</span><span className="fs-next-job-copy"><strong>Graduate Software Engineer</strong><small>Lumen <span>·</span> CV ready to review</small></span><ChevronRight size={17} />
          </button>
        </div>
        <div className="fs-next-upcoming">
          <div className="fs-next-bottom-heading"><span className="fs-next-section-label">COMING UP</span><span className="fs-next-date"><Clock3 size={13} /> 6 Nov · 14:00</span></div>
          <button type="button" className="fs-next-upcoming-row" onClick={() => setActiveAction('upcoming')}>
            <span className="fs-next-calendar"><span>NOV</span><strong>06</strong></span><span className="fs-next-upcoming-copy"><strong>Interview practice</strong><small>Graduate Software Engineer</small></span><ChevronRight size={17} />
          </button>
        </div>
      </section>
      <footer className="fs-next-footer"><CircleUserRound size={14} /> A practice workspace using demo information. Your story is your own; there’s no one right starting point.</footer>
      {activeAction && <DemoModal action={activeAction} onClose={() => setActiveAction(null)} />}
    </div>
  );
}

export function NextStep() {
  return <AppShell><DashboardContent /></AppShell>;
}
