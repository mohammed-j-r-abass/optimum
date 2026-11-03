import { useState } from 'react';
import { ArrowRight, BriefcaseBusiness, CalendarDays, Check, ChevronDown, ChevronRight, CircleHelp, FileText, Menu, Mic2, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Play, Plus, Search, Settings2, Sparkles, UserRound, X } from 'lucide-react';
import { demo } from './_stubs';
import './_group.css';

type Space = 'My story' | 'CV builder' | 'Interview practice';

const spaces: { name: Space; icon: typeof UserRound; sub: string }[] = [
  { name: 'My story', icon: UserRound, sub: 'Your experience, in your words' },
  { name: 'CV builder', icon: FileText, sub: 'Build a CV for a real role' },
  { name: 'Interview practice', icon: Mic2, sub: 'Practise out loud, at your pace' },
];

export function Workspace() {
  const [space, setSpace] = useState<Space>('My story');
  const [collapsed, setCollapsed] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const show = (message: string) => { setNotice(message); setMenuOpen(false); };

  return (
    <div className="fs-workspace min-h-[100dvh]">
      <aside className={`fs-rail ${collapsed ? 'is-collapsed' : ''}`} aria-label="Workspace navigation">
        <div className="fs-brand-row">
          {!collapsed && <div className="fs-brand"><span className="fs-brand-mark">f</span><span>firststep<span className="fs-brand-dot">.</span></span></div>}
          <button className="fs-icon-btn fs-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'} title={collapsed ? 'Expand navigation' : 'Collapse navigation'}>{collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}</button>
        </div>
        <div className="fs-rail-caption">{!collapsed && 'YOUR WORKSPACE'}</div>
        <nav className="fs-space-nav" aria-label="Your work">
          {spaces.map(({ name, icon: Icon }) => (
            <button key={name} className={`fs-nav-item ${space === name ? 'active' : ''}`} onClick={() => setSpace(name)} aria-current={space === name ? 'page' : undefined} aria-label={name} title={collapsed ? name : undefined}>
              <Icon /><span>{!collapsed && name}</span>{!collapsed && space === name && <span className="fs-nav-dot" />}
            </button>
          ))}
        </nav>
        {!collapsed && <div className="fs-rail-note"><span className="fs-note-icon"><Sparkles /></span><p><b>Your experience counts.</b><br />School, home and community all matter.</p></div>}
        <div className="fs-rail-bottom">
          {!collapsed && <button className="fs-help" onClick={() => show('Help & guidance — a friendly coach can help you find your next step.')}><CircleHelp /> Help & guidance</button>}
          <button className={`fs-account ${accountOpen ? 'selected' : ''}`} onClick={() => setAccountOpen(!accountOpen)} aria-expanded={accountOpen} aria-label="Account menu">
            <span className="fs-avatar">A</span>{!collapsed && <><span className="fs-account-copy"><b>Ama Mensah</b><small>Demo workspace</small></span><ChevronDown className="fs-chevron" /></>}
          </button>
          {accountOpen && <div className="fs-account-menu"><b>Ama Mensah</b><small>Demo profile · 75% complete</small><button onClick={() => show('Account settings are part of this local demo.')}>Account settings <Settings2 /></button></div>}
        </div>
      </aside>

      <main className="fs-main">
        <header className="fs-topbar">
          <div className="fs-breadcrumb"><span>Workspace</span><ChevronRight /><b>{space}</b></div>
          <div className="fs-top-actions"><span className="fs-demo-pill"><span /> DEMO DATA</span><button className="fs-mobile-menu" onClick={() => setMenuOpen(!menuOpen)} aria-label="Open quick navigation"><Menu /></button><button className="fs-icon-btn fs-search" aria-label="Search workspace" onClick={() => show('Search your story, saved jobs and practice sessions.')}><Search /></button><button className="fs-top-avatar" onClick={() => setAccountOpen(!accountOpen)} aria-label="Open account">A</button></div>
        </header>
        {menuOpen && <div className="fs-mobile-popover">{spaces.map(({ name, icon: Icon }) => <button key={name} onClick={() => setSpace(name)}><Icon />{name}</button>)}</div>}

        <div className="fs-content">
          <section className="fs-welcome">
            <div><div className="fs-eyebrow"><span className="fs-eyebrow-mark" aria-hidden="true">✳</span> YOUR NEXT CHAPTER, AT YOUR PACE</div><h1>Good morning, {demo.profile.name.split(' ')[0]}.</h1><p>Everything you’re working on, all in one place.</p></div>
            <div className="fs-profile">
              <div className="fs-profile-top"><span>Profile completion</span><b>{demo.profileCompletion}%</b></div>
              <div className="fs-progress"><span style={{ width: `${demo.profileCompletion}%` }} /></div>
              <button onClick={() => {setSpace('My story');show('Your story workspace is selected. Add details about what you have learned and done.');}}>Continue your story <ArrowRight /></button>
            </div>
          </section>

          <section className="fs-metrics" aria-label="Your activity">
            <div className="fs-metric"><span className="fs-metric-icon gold"><BriefcaseBusiness /></span><div><strong>{demo.applications.length}</strong><span>jobs saved</span></div></div>
            <div className="fs-metric"><span className="fs-metric-icon terracotta"><Mic2 /></span><div><strong>{demo.interviews.length}</strong><span>practice sessions</span></div></div>
            <div className="fs-metric"><span className="fs-metric-icon sage"><FileText /></span><div><strong>{demo.applications.filter((job) => job.status === 'cv_ready').length}</strong><span>CV ready to review</span></div></div>
            <button className="fs-add-job" onClick={() => {setSpace('CV builder');show('Add a job advert — paste a real job description to tailor your CV.');}}><Plus /> Add a job</button>
          </section>

          <section className="fs-quick-access">
            <div className="fs-section-head"><div><span className="fs-kicker">PICK UP WHERE YOU LIKE</span><h2>Your workspaces</h2></div><span className="fs-head-note">Choose what feels useful today</span></div>
            <div className="fs-workspace-grid">
              {spaces.map(({ name, icon: Icon, sub }, index) => <button key={name} className={`fs-workspace-card card-${index + 1} ${space === name ? 'current' : ''}`} onClick={() => setSpace(name)} aria-pressed={space === name}>
                <span className="fs-card-icon"><Icon /></span><span className="fs-card-copy"><b>{name}</b><small>{sub}</small></span><ArrowRight className="fs-card-arrow" />
                {index === 0 && <span className="fs-card-meta">75% complete</span>}
                {index === 1 && <span className="fs-card-meta">1 CV ready · 3 saved jobs</span>}
                {index === 2 && <span className="fs-card-meta">Next practice · 6 Nov</span>}
              </button>)}
            </div>
          </section>

          <section className="fs-bottom-grid">
            <div className="fs-panel fs-jobs">
              <div className="fs-panel-head"><div><span className="fs-kicker">SAVED JOBS</span><h2>Keep your momentum</h2></div><button className="fs-text-link" onClick={() => setSpace('CV builder')}>View all <ArrowRight /></button></div>
              <div className="fs-job-row featured">
                <div className="fs-company-mark">L</div><div className="fs-job-info"><b>{demo.applications[0].title}</b><span>{demo.applications[0].company} <i>·</i> CV ready</span></div><button className="fs-continue" onClick={() => {setSpace('CV builder');show(`Continuing your ${demo.applications[0].company} CV — your next step is to add a teamwork example.`);}}>Continue CV <ArrowRight /></button>
              </div>
              <div className="fs-job-row compact-job"><span className="fs-job-mini"><BriefcaseBusiness /></span><div className="fs-job-info"><b>Programme Assistant</b><span>Community Action <i>·</i> In progress</span></div><button className="fs-more" aria-label="Open Programme Assistant" onClick={() => {setSpace('CV builder');show('Programme Assistant workspace selected.');}}><MoreHorizontal /></button></div>
            </div>
            <div className="fs-panel fs-practice">
              <div className="fs-panel-head"><div><span className="fs-kicker">UP NEXT</span><h2>Practice that fits you</h2></div><span className="fs-calendar-icon"><CalendarDays /></span></div>
              <div className="fs-next-session">
                <div className="fs-date-tile"><b>06</b><span>NOV</span></div>
                <div className="fs-session-copy"><b>{demo.interviews[0].title}</b><span>Behavioural practice · 2:00 pm</span></div>
              </div>
              <button className="fs-practice-cta" onClick={() => {setSpace('Interview practice');show('Interview practice selected. You can practise by speaking or typing, when you are ready.');}}><span className="fs-play"><Play /></span> Go to interview practice <ArrowRight /></button>
            </div>
          </section>
          <footer className="fs-footer"><span>FIRSTSTEP <i>·</i> A space to make your experience count.</span><span>YOUR WORK STAYS YOURS</span></footer>
        </div>
      </main>

      {notice && <div className="fs-toast" role="status"><span className="fs-toast-check"><Check /></span><span><b>Demo workspace</b><small>{notice}</small></span><button onClick={() => setNotice('')} aria-label="Dismiss notice"><X /></button></div>}

      <style>{`
        .fs-workspace{--fs-ink:#283252;--fs-paper:#f8f4e9;--fs-card:#fffdf7;--fs-line:#e8dfce;--fs-clay:#bb6047;--fs-gold:#e8bd67;--fs-muted:#777b84;display:flex;background:var(--fs-paper);color:var(--fs-ink);font-family:var(--app-font-sans),sans-serif;min-height:100dvh;font-size:14px}
        .fs-workspace *{box-sizing:border-box}
        .fs-rail{width:226px;background:#293451;color:#f5efdf;min-height:100dvh;padding:22px 14px 16px;display:flex;flex-direction:column;flex-shrink:0;position:relative;transition:width .2s ease}
        .fs-rail.is-collapsed{width:76px;padding:22px 11px 16px}
        .fs-brand-row{display:flex;align-items:center;justify-content:space-between;padding:0 4px 32px 7px;min-height:38px}
        .fs-brand{display:flex;align-items:center;gap:9px;font-weight:700;font-size:19px;letter-spacing:-.7px}.fs-brand-mark{display:grid;place-items:center;width:27px;height:27px;background:#e9be68;color:#293451;border-radius:9px 9px 9px 3px;font-family:var(--app-font-serif);font-size:22px;line-height:1}.fs-brand-dot{color:#edc56f}
        .fs-icon-btn{border:0;background:transparent;color:inherit;display:grid;place-items:center;cursor:pointer;border-radius:9px;width:34px;height:34px}.fs-icon-btn svg{width:17px;height:17px}.fs-icon-btn:hover{background:#ffffff18}
        .fs-rail-caption{height:30px;padding:0 10px;color:#aeb5c4;font-size:9px;letter-spacing:1.35px;font-weight:700}
        .fs-space-nav{display:grid;gap:5px}.fs-nav-item{height:43px;display:flex;align-items:center;gap:11px;width:100%;border:0;background:none;color:#d6d8df;text-align:left;padding:0 11px;border-radius:9px;font:500 12px var(--app-font-sans);cursor:pointer;position:relative;white-space:nowrap}.fs-nav-item svg{width:17px;height:17px;flex-shrink:0}.fs-nav-item:hover{background:#ffffff12;color:white}.fs-nav-item.active{background:#e9be68;color:#293451;font-weight:700}.fs-nav-dot{height:5px;width:5px;border-radius:50%;background:var(--fs-clay);margin-left:auto}.is-collapsed .fs-nav-item{justify-content:center;padding:0}
        .fs-rail-note{margin:30px 5px 0;padding:13px 11px;background:#ffffff0c;border:1px solid #ffffff14;border-radius:10px;color:#c7ccda;font-size:10px;line-height:1.55}.fs-rail-note p{margin:8px 0 0}.fs-rail-note b{color:#f4d17f;font-weight:600}.fs-note-icon{display:grid;place-items:center;width:24px;height:24px;background:#e9be6821;color:#e9be68;border-radius:7px}.fs-note-icon svg{width:14px}
        .fs-rail-bottom{margin-top:auto;position:relative}.fs-help{display:flex;align-items:center;gap:10px;width:100%;border:0;background:none;color:#c8ccda;padding:11px 10px;margin-bottom:9px;font:500 11px var(--app-font-sans);cursor:pointer;text-align:left}.fs-help svg{width:16px}.fs-account{display:flex;align-items:center;gap:9px;width:100%;background:#ffffff12;border:1px solid #ffffff1c;border-radius:10px;padding:9px 8px;color:#f5efdf;text-align:left;cursor:pointer}.fs-account.selected,.fs-account:hover{background:#ffffff20}.fs-avatar,.fs-top-avatar{display:grid;place-items:center;border-radius:50%;background:#e9be68;color:#293451;font-weight:700}.fs-avatar{width:30px;height:30px;flex-shrink:0}.fs-account-copy{min-width:0;display:grid;gap:3px}.fs-account-copy b{font-size:10px;font-weight:600}.fs-account-copy small{font-size:9px;color:#b9bfce}.fs-chevron{margin-left:auto;width:14px}.is-collapsed .fs-account{justify-content:center;padding:7px 0}.fs-account-menu{position:absolute;bottom:52px;left:4px;right:4px;background:#fffdf7;color:var(--fs-ink);border:1px solid var(--fs-line);box-shadow:0 12px 32px #111b3530;border-radius:11px;padding:13px;z-index:5;display:grid;gap:5px}.fs-account-menu b{font-size:12px}.fs-account-menu small{font-size:10px;color:var(--fs-muted)}.fs-account-menu button{display:flex;justify-content:space-between;align-items:center;background:#f3eddf;border:0;border-radius:7px;padding:9px;margin-top:6px;color:var(--fs-ink);font:500 10px var(--app-font-sans);cursor:pointer}.fs-account-menu svg{width:14px}
        .fs-main{flex:1;min-width:0}.fs-topbar{height:62px;border-bottom:1px solid var(--fs-line);display:flex;align-items:center;justify-content:space-between;padding:0 34px;background:#faf7ef}.fs-breadcrumb{display:flex;align-items:center;gap:10px;color:#96959a;font-size:11px}.fs-breadcrumb svg{width:13px}.fs-breadcrumb b{color:#3d4561;font-weight:600}.fs-top-actions{display:flex;align-items:center;gap:17px}.fs-demo-pill{font-size:9px;letter-spacing:1px;color:#7f7463;font-weight:700;display:flex;align-items:center;gap:7px}.fs-demo-pill>span{width:7px;height:7px;background:#88a38b;border-radius:50%}.fs-top-avatar{border:0;width:30px;height:30px;font:700 11px var(--app-font-sans);cursor:pointer}.fs-search{color:#7b7e87}.fs-mobile-menu{display:none}
        .fs-content{max-width:1170px;margin:0 auto;padding:21px 34px 13px}.fs-welcome{display:flex;align-items:center;justify-content:space-between;min-height:100px}.fs-eyebrow,.fs-kicker{font-size:9px;font-weight:700;letter-spacing:1.35px;color:#9b7952}.fs-eyebrow{display:flex;gap:7px;align-items:center}.fs-eyebrow-mark{font-size:13px;color:var(--fs-clay)}.fs-welcome h1{font:600 31px/1.1 var(--app-font-serif);letter-spacing:-.8px;margin:7px 0 5px;color:#293451}.fs-welcome p{margin:0;color:#7d7e83;font-size:12px}.fs-profile{width:270px;padding:13px 15px;background:#fffdf7;border:1px solid var(--fs-line);border-radius:11px}.fs-profile-top{display:flex;justify-content:space-between;font-size:10px;color:#727680}.fs-profile-top b{font-family:var(--app-font-mono);font-size:11px;color:#39425f}.fs-progress{height:5px;background:#eee8dc;border-radius:8px;margin:9px 0 8px;overflow:hidden}.fs-progress span{display:block;background:#d3a94f;border-radius:8px;height:100%;width:75%}.fs-profile button{display:flex;align-items:center;gap:6px;border:0;padding:0;background:none;color:#a6523e;font:600 10px var(--app-font-sans);cursor:pointer}.fs-profile button svg{width:13px}
        .fs-metrics{margin-top:17px;background:#eee6d6;border-radius:11px;padding:10px 15px;display:flex;align-items:center;gap:0;min-height:69px}.fs-metric{flex:1;display:flex;align-items:center;gap:10px;padding:0 16px;border-right:1px solid #dcd2bf}.fs-metric:first-child{padding-left:2px}.fs-metric:nth-child(3){border:0}.fs-metric-icon{width:34px;height:34px;border-radius:10px;display:grid;place-items:center}.fs-metric-icon svg{width:16px;height:16px}.fs-metric-icon.gold{background:#f7e7bf;color:#9a7127}.fs-metric-icon.terracotta{background:#f3dcd3;color:#a34f3a}.fs-metric-icon.sage{background:#dfe8d9;color:#547255}.fs-metric>div{display:grid;gap:1px}.fs-metric strong{font:600 21px/1 var(--app-font-serif);color:#293451}.fs-metric>div span{font-size:10px;color:#777773}.fs-add-job{margin-left:auto;display:flex;align-items:center;gap:7px;border:1px solid #d7cdbc;background:#fffaf0;color:#414a63;border-radius:8px;padding:9px 12px;font:600 10px var(--app-font-sans);cursor:pointer;white-space:nowrap}.fs-add-job:hover{background:#fff}.fs-add-job svg{width:14px}
        .fs-quick-access{margin-top:21px}.fs-section-head,.fs-panel-head{display:flex;align-items:flex-end;justify-content:space-between}.fs-section-head h2,.fs-panel-head h2{font:600 19px/1.2 var(--app-font-serif);letter-spacing:-.3px;margin:4px 0 0;color:#293451}.fs-head-note{font-size:10px;color:#96949a;padding-bottom:3px}.fs-workspace-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px;margin-top:11px}.fs-workspace-card{min-height:91px;background:#fffdf7;border:1px solid var(--fs-line);border-radius:11px;text-align:left;position:relative;padding:13px 34px 13px 13px;display:grid;grid-template-columns:35px 1fr;grid-template-rows:auto auto;column-gap:10px;align-content:center;cursor:pointer;color:#293451;transition:transform .18s,border-color .18s,box-shadow .18s}.fs-workspace-card:hover{transform:translateY(-2px);box-shadow:0 5px 14px #26324d12}.fs-workspace-card.current{border-color:#d9ae58;box-shadow:inset 0 0 0 1px #d9ae58}.fs-card-icon{grid-row:1 / span 2;width:35px;height:35px;border-radius:10px;display:grid;place-items:center;align-self:center;background:#eee9db;color:#46506a}.fs-card-icon svg{width:17px}.card-2 .fs-card-icon{background:#f6e8c7;color:#927332}.card-3 .fs-card-icon{background:#f3dfd8;color:#a35743}.fs-card-copy{display:grid;gap:4px;align-self:end}.fs-card-copy b{font-size:12px;font-weight:700}.fs-card-copy small{font-size:9px;color:#83838a}.fs-card-meta{grid-column:2;font:9px var(--app-font-mono);color:#87817a;margin-top:7px}.fs-card-arrow{position:absolute;width:14px;right:13px;top:18px;color:#a8a39a}.fs-workspace-card.current .fs-card-arrow{color:#b17b25}
        .fs-bottom-grid{display:grid;grid-template-columns:1.08fr .92fr;gap:12px;margin-top:17px}.fs-panel{background:#fffdf7;border:1px solid var(--fs-line);border-radius:11px;padding:14px 15px;min-width:0}.fs-panel-head{align-items:center}.fs-panel-head h2{font-size:17px}.fs-text-link{display:flex;align-items:center;gap:5px;border:0;background:none;color:#a75642;font:600 10px var(--app-font-sans);cursor:pointer}.fs-text-link svg{width:13px}.fs-job-row{display:flex;align-items:center;gap:10px}.fs-job-row.featured{margin-top:11px;padding:9px 10px;background:#f8f2e5;border:1px solid #efe4cf;border-radius:9px}.fs-company-mark{display:grid;place-items:center;flex-shrink:0;width:30px;height:30px;border-radius:8px;background:#e4b950;color:#fffdf7;font:700 17px var(--app-font-serif)}.fs-job-info{display:grid;gap:4px;min-width:0;flex:1}.fs-job-info b{font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.fs-job-info span{font-size:9px;color:#85848a;white-space:nowrap}.fs-job-info i{font-style:normal;padding:0 3px;color:#c39a4e}.fs-continue{display:flex;align-items:center;gap:5px;white-space:nowrap;background:#33405c;color:#fff9e9;border:0;border-radius:7px;padding:8px 9px;font:600 9px var(--app-font-sans);cursor:pointer}.fs-continue:hover{background:#445273}.fs-continue svg{width:12px}.compact-job{padding:9px 2px 2px}.fs-job-mini{display:grid;place-items:center;width:30px;height:30px;color:#977842;background:#f2eddf;border-radius:8px}.fs-job-mini svg{width:14px}.fs-more{border:0;background:none;color:#888;border-radius:7px;cursor:pointer;padding:5px}.fs-more:hover{background:#f2eee4}.fs-more svg{width:16px}
        .fs-calendar-icon{display:grid;place-items:center;width:29px;height:29px;border-radius:8px;background:#f3e5c5;color:#947333}.fs-calendar-icon svg{width:15px}.fs-next-session{display:flex;gap:10px;align-items:center;margin:11px 0 9px}.fs-date-tile{display:grid;justify-items:center;align-content:center;width:37px;height:40px;background:#f5ebd5;border-radius:8px;color:#39445f}.fs-date-tile b{font:600 16px var(--app-font-serif);line-height:1}.fs-date-tile span{font:700 8px var(--app-font-mono);margin-top:3px;color:#a36d41}.fs-session-copy{display:grid;gap:5px}.fs-session-copy b{font-size:10px}.fs-session-copy span{font-size:9px;color:#85848a}.fs-practice-cta{display:flex;align-items:center;gap:8px;width:100%;border:1px solid #e6ddcd;background:#faf6ec;border-radius:8px;padding:7px 9px;color:#3f4962;font:600 9px var(--app-font-sans);cursor:pointer;text-align:left}.fs-practice-cta:hover{background:#f4eddf}.fs-play{display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#e7bd67;color:#293451}.fs-play svg{width:10px;fill:currentColor}.fs-practice-cta>svg{width:13px;margin-left:auto;color:#a25442}
        .fs-footer{display:flex;justify-content:space-between;padding:11px 1px 0;color:#a19c91;font-size:8px;letter-spacing:.65px}.fs-footer i{font-style:normal;color:#c49b4e}.fs-toast{position:fixed;z-index:10;right:24px;bottom:22px;display:flex;align-items:center;gap:11px;max-width:390px;padding:12px 14px;background:#fffdf7;border:1px solid var(--fs-line);border-radius:11px;box-shadow:0 12px 35px #28325224;animation:rise .18s ease-out}.fs-toast-check{display:grid;place-items:center;width:27px;height:27px;border-radius:50%;background:#e1eadb;color:#577556;flex-shrink:0}.fs-toast-check svg{width:14px}.fs-toast>span:nth-child(2){display:grid;gap:3px}.fs-toast b{font-size:10px}.fs-toast small{font-size:10px;color:#777b84;line-height:1.4}.fs-toast button{border:0;background:none;color:#8d8c91;cursor:pointer;padding:4px}.fs-toast button svg{width:15px}
        .fs-mobile-popover{display:none}
        @media(min-width:1280px){.fs-content{padding-top:23px}.fs-welcome{min-height:105px}.fs-metrics{margin-top:19px}.fs-quick-access{margin-top:22px}.fs-bottom-grid{margin-top:19px}}
        @media(max-width:950px){.fs-rail{width:76px;padding:22px 11px 16px}.fs-brand-row{justify-content:center;padding:0 0 32px}.fs-brand-row>.fs-brand{display:none}.fs-rail-caption{font-size:0}.fs-nav-item{justify-content:center;padding:0}.fs-nav-item span:not(.fs-nav-dot){display:none}.fs-rail-note,.fs-help,.fs-account-copy,.fs-chevron{display:none}.fs-account{justify-content:center;padding:7px 0}.fs-content{padding-left:22px;padding-right:22px}.fs-topbar{padding:0 22px}}
        @media(max-width:700px){.fs-workspace{display:block}.fs-rail{display:none}.fs-topbar{height:55px;padding:0 15px}.fs-breadcrumb{font-size:10px}.fs-demo-pill{font-size:8px}.fs-top-actions{gap:10px}.fs-mobile-menu{display:grid;place-items:center;width:31px;height:31px;border:0;background:transparent;color:#50566a}.fs-mobile-menu svg{width:18px}.fs-mobile-popover{position:absolute;right:12px;top:50px;z-index:8;display:grid;min-width:205px;padding:6px;background:#fffdf7;border:1px solid var(--fs-line);border-radius:10px;box-shadow:0 8px 22px #28325220}.fs-mobile-popover button{display:flex;align-items:center;gap:10px;padding:11px;border:0;background:none;text-align:left;color:#36405b;font:500 11px var(--app-font-sans);border-radius:7px}.fs-mobile-popover button:hover{background:#f3eddf}.fs-mobile-popover svg{width:16px}.fs-search{display:none}.fs-content{padding:20px 15px 20px}.fs-welcome{display:block}.fs-welcome h1{font-size:29px}.fs-profile{width:100%;margin-top:16px}.fs-metrics{flex-wrap:wrap;gap:9px;padding:11px}.fs-metric{flex:1 1 29%;padding:0 7px;gap:7px;border:0}.fs-metric:first-child{padding-left:7px}.fs-metric-icon{width:30px;height:30px}.fs-metric>div span{font-size:8px;white-space:nowrap}.fs-metric strong{font-size:19px}.fs-add-job{margin:4px 0 0;width:100%;justify-content:center}.fs-quick-access{margin-top:22px}.fs-section-head{align-items:flex-end}.fs-section-head h2{font-size:19px}.fs-head-note{font-size:9px;max-width:110px;text-align:right}.fs-workspace-grid{grid-template-columns:1fr;gap:8px}.fs-workspace-card{min-height:79px}.fs-bottom-grid{grid-template-columns:1fr;gap:10px;margin-top:16px}.fs-panel{padding:13px}.fs-footer{gap:12px;font-size:7px}.fs-toast{left:12px;right:12px;bottom:12px;max-width:none}.fs-workspace-card:hover{transform:none}}
        @media(max-width:370px){.fs-metric{flex-basis:45%}.fs-metric:nth-child(2){border:0}.fs-metric:nth-child(3){flex-basis:45%}.fs-continue{padding:8px 6px;font-size:8px}.fs-job-info b{font-size:9px}}
      `}</style>
    </div>
  );
}
