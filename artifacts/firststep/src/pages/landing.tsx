import { useState } from 'react';
import { Link } from 'wouter';
import '@/styles/landing.css';

export default function LandingPage() {
  const [presentationOpen, setPresentationOpen] = useState(false);

  return (
    <main className="optimum-page">
      <header className="optimum-header">
        <Link href="/" className="optimum-brand" aria-label="Optimum home">
          <span className="optimum-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <path d="M7 24.5V7.5h12.2c3.6 0 5.8 2 5.8 5.1 0 3.2-2.2 5.2-5.8 5.2H7" />
              <path d="M7 17.8h11.4c3.3 0 5.6 1.9 5.6 5.1" />
            </svg>
          </span>
          <span>optimum<span className="optimum-brand-period">.</span></span>
        </Link>
        <nav className="optimum-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#our-pitch">Our pitch</a>
          <Link href="/sign-in" className="optimum-signin" data-testid="link-sign-in">Sign in</Link>
          <Link href="/dashboard" className="optimum-nav-cta" data-testid="link-start-workspace">Get started</Link>
        </nav>
      </header>

      <section className="optimum-hero" aria-labelledby="optimum-hero-title">
        <div className="optimum-hero-copy">
          <p className="optimum-eyebrow"><span className="optimum-eyebrow-line" /> A clearer first step into work</p>
          <h1 id="optimum-hero-title">You have more experience than you think.</h1>
          <p className="optimum-hero-lede">Finding your first job can feel like everyone else knows the rules. Optimum helps you understand what an employer is asking for, then find the real experience you already have to answer it.</p>
          <div className="optimum-hero-actions">
            <Link href="/dashboard" className="optimum-button optimum-button-primary" data-testid="link-hero-start">
              Start with your story <span aria-hidden="true">→</span>
            </Link>
            <Link href="/sign-up" className="optimum-button optimum-button-quiet" data-testid="link-hero-sign-up">Create an account</Link>
          </div>
          <p className="optimum-private-note"><span className="optimum-note-dot" /> Start in a guest workspace. Sign up when you want to save your work.</p>
        </div>
        <div className="optimum-hero-art" aria-label="A simple illustration of a conversation becoming a path forward">
          <div className="optimum-art-paper">
            <span className="optimum-art-caption">YOUR EXPERIENCE</span>
            <div className="optimum-art-note"><span className="optimum-art-check">01</span><span>Helped organise<br />a school event</span></div>
            <div className="optimum-art-note optimum-art-note-two"><span className="optimum-art-check">02</span><span>Showed a younger<br />student how</span></div>
            <svg className="optimum-art-path" viewBox="0 0 350 185" fill="none" aria-hidden="true">
              <path d="M14 148C82 149 66 39 136 57c54 14 39 92 100 75 38-11 39-57 98-75" />
              <circle cx="14" cy="148" r="7" /><circle cx="334" cy="57" r="7" />
            </svg>
            <div className="optimum-art-result"><span>THE SKILL</span><strong>Clear communication</strong></div>
            <span className="optimum-art-stamp">REAL<br />THINGS<br />YOU DID</span>
          </div>
          <span className="optimum-art-sun" aria-hidden="true" />
          <p className="optimum-art-footnote">Everyday experience can matter.</p>
        </div>
      </section>

      <section className="optimum-reassurance" aria-label="A note about your experience">
        <span className="optimum-reassurance-mark" aria-hidden="true">“</span>
        <p>Not having had career guidance is not the same as not having ability.</p>
        <span className="optimum-reassurance-rule" aria-hidden="true" />
      </section>

      <section className="optimum-how" id="how-it-works" aria-labelledby="optimum-how-title">
        <div className="optimum-section-intro">
          <p className="optimum-eyebrow">A conversation, then a plan</p>
          <h2 id="optimum-how-title">Make sense of the job.<br /><em>Make your experience count.</em></h2>
          <p>You do not need to arrive with a finished CV or know what to say. We take it one clear step at a time.</p>
        </div>
        <div className="optimum-steps">
          <article className="optimum-step">
            <span className="optimum-step-number">01</span>
            <div className="optimum-step-symbol optimum-symbol-one" aria-hidden="true"><span className="optimum-symbol-lines" /><span className="optimum-symbol-dot" /></div>
            <h3>Understand what they need</h3>
            <p>Bring a job advert. Optimum explains its requirements in plain language, including what is required and what is preferred.</p>
            <span className="optimum-step-tag">START WITH THE JOB</span>
          </article>
          <article className="optimum-step">
            <span className="optimum-step-number">02</span>
            <div className="optimum-step-symbol optimum-symbol-two" aria-hidden="true"><span /><span /><span /></div>
            <h3>Find the evidence in your story</h3>
            <p>Talk it through by voice. School, home, community and project experiences can all offer useful examples when they fit the role.</p>
            <span className="optimum-step-tag">VOICE-FIRST GUIDANCE</span>
          </article>
          <article className="optimum-step">
            <span className="optimum-step-number">03</span>
            <div className="optimum-step-symbol optimum-symbol-three" aria-hidden="true"><span className="optimum-symbol-page" /><span className="optimum-symbol-tick">✓</span></div>
            <h3>Prepare with confidence</h3>
            <p>Build an honest CV tailored to the job, then schedule live voice or video interview practice and get useful feedback.</p>
            <span className="optimum-step-tag">YOUR NEXT STEP, YOUR PACE</span>
          </article>
        </div>
      </section>

      <section className="optimum-quote-band">
        <div className="optimum-quote-decoration" aria-hidden="true">
          <span className="optimum-quote-orbit optimum-orbit-a" /><span className="optimum-quote-orbit optimum-orbit-b" />
          <span className="optimum-quote-core">O</span>
        </div>
        <div className="optimum-quote-copy">
          <p className="optimum-eyebrow">No experience is assumed. No facts are made up.</p>
          <h2>Your story stays <em>yours.</em></h2>
          <p>Optimum helps you notice and explain relevant things you have actually done. You stay in control of what goes into your CV and what you want to practise.</p>
        </div>
      </section>

      <section className="optimum-pitch" id="our-pitch" aria-labelledby="optimum-pitch-title">
        <div className="optimum-pitch-heading">
          <div>
            <p className="optimum-eyebrow">A little more about Optimum</p>
            <h2 id="optimum-pitch-title">See the idea, <em>in two minutes.</em></h2>
          </div>
          <a className="optimum-pitch-external" href="/optimum-pitch/" target="_blank" rel="noreferrer">
            Open full presentation <span aria-hidden="true">↗</span>
          </a>
        </div>
        {!presentationOpen ? (
          <div className="optimum-pitch-invite">
            <div className="optimum-pitch-invite-mark" aria-hidden="true">
              <svg viewBox="0 0 52 52" fill="none"><path d="M19 14.5v23l19-11.5-19-11.5Z" /><circle cx="26" cy="26" r="23" /></svg>
            </div>
            <div className="optimum-pitch-invite-copy">
              <strong>Load the presentation here</strong>
              <span>It opens only when you choose, so the page stays light while you browse.</span>
            </div>
            <button className="optimum-button optimum-button-secondary" type="button" onClick={() => setPresentationOpen(true)} data-testid="button-load-presentation">
              Show presentation <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <div className="optimum-embed-wrap">
            <iframe
              className="optimum-presentation-frame"
              src="/optimum-pitch/"
              title="Optimum two-minute pitch presentation. Use the presentation's keyboard controls to move between slides."
              allowFullScreen
            />
            <p className="optimum-embed-caption">Presentation controls are available inside the frame. You can also <a href="/optimum-pitch/" target="_blank" rel="noreferrer">open it in a new tab</a>.</p>
          </div>
        )}
      </section>

      <section className="optimum-final-cta" aria-labelledby="optimum-final-title">
        <div>
          <p className="optimum-eyebrow">Whenever you are ready</p>
          <h2 id="optimum-final-title">Take your first step<br /><em>with what you have.</em></h2>
        </div>
        <div className="optimum-final-action">
          <p>Start with a job you are interested in, or just begin by telling your story.</p>
          <Link href="/dashboard" className="optimum-button optimum-button-primary" data-testid="link-final-start">Start in guest workspace <span aria-hidden="true">→</span></Link>
          <Link href="/sign-up" className="optimum-final-signup" data-testid="link-final-sign-up">Create an account to save across devices</Link>
        </div>
      </section>

      <footer className="optimum-footer">
        <Link href="/" className="optimum-brand optimum-footer-brand" aria-label="Optimum home">
          <span className="optimum-mark" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none"><path d="M7 24.5V7.5h12.2c3.6 0 5.8 2 5.8 5.1 0 3.2-2.2 5.2-5.8 5.2H7" /><path d="M7 17.8h11.4c3.3 0 5.6 1.9 5.6 5.1" /></svg></span>
          <span>optimum<span className="optimum-brand-period">.</span></span>
        </Link>
        <p>Clearer guidance for your next step.</p>
        <div className="optimum-footer-links"><Link href="/sign-in" data-testid="link-footer-sign-in">Sign in</Link><Link href="/sign-up" data-testid="link-footer-sign-up">Create account</Link></div>
      </footer>
    </main>
  );
}
