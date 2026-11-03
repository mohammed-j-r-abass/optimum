import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useLocation, useClerk, useUser } from './_stubs';
import { BookOpen, Briefcase, Home, LogIn, LogOut, Menu, PanelLeftClose, PanelLeftOpen, UserPlus, MessagesSquare, UserRound, X } from 'lucide-react';
import { Wordmark } from './_Brand';
import { Button } from '@/components/ui/button';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const NAV = [
  { href: '/dashboard', label: 'Home', icon: Home, match: ['/', '/dashboard'] },
  { href: '/profile', label: 'My story', icon: UserRound, match: ['/profile'] },
  { href: '/applications', label: 'Jobs and CVs', icon: Briefcase, match: ['/applications'] },
  { href: '/interviews', label: 'Interview practice', icon: MessagesSquare, match: ['/interviews'] },
  { href: '/resources', label: 'Guidance', icon: BookOpen, match: ['/resources'] },
];

const SIDEBAR_KEY = 'firststep.mock.home.sidebarCollapsed';
function readCollapsed() {
  try { return window.localStorage.getItem(SIDEBAR_KEY) === '1'; } catch { return false; }
}
function writeCollapsed(v: boolean) {
  try { window.localStorage.setItem(SIDEBAR_KEY, v ? '1' : '0'); } catch { /* storage blocked */ }
}

function NavLinks({ onNavigate, compact }: { onNavigate?: () => void; compact?: boolean }) {
  const [location] = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = n.match.some((m) => (m === '/' ? location === '/' : location.startsWith(m)));
        const Icon = n.icon;
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            aria-label={compact ? n.label : undefined}
            title={compact ? n.label : undefined}
            data-testid={`link-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`group flex items-center rounded-xl py-2.5 ${compact ? 'justify-center px-0' : 'gap-3 px-3'} text-sm font-medium transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
          >
            <Icon className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${active ? '' : 'opacity-80'}`} />
            {!compact && n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountBox({ compact }: { compact?: boolean }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  if (!isLoaded) return <div className={`${compact ? 'h-10' : 'h-20'} rounded-xl bg-sidebar-accent/50`} />;
  if (compact) {
    const iconBtn = 'grid h-10 w-10 place-items-center rounded-xl text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground';
    if (isSignedIn && user) {
      const name = user.firstName ?? user.primaryEmailAddress?.emailAddress ?? 'Account';
      const initials = (name[0] ?? 'F').toUpperCase();
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-millet font-semibold text-ink" title={`Signed in as ${name}`} aria-label={`Signed in as ${name}`} role="img">{initials}</div>
          <button onClick={() => signOut({ redirectUrl: basePath || '/' })} className={iconBtn} aria-label="Sign out" title="Sign out" data-testid="button-sign-out"><LogOut className="h-4 w-4" /></button>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center gap-2">
        <Link href="/sign-up" className="grid h-10 w-10 place-items-center rounded-xl bg-millet text-ink" aria-label="Create account" title="Create account" data-testid="link-sign-up"><UserPlus className="h-4 w-4" /></Link>
        <Link href="/sign-in" className={iconBtn} aria-label="Sign in" title="Sign in" data-testid="link-sign-in"><LogIn className="h-4 w-4" /></Link>
      </div>
    );
  }
  if (isSignedIn && user) {
    const initials = (user.firstName?.[0] ?? user.primaryEmailAddress?.emailAddress?.[0] ?? 'F').toUpperCase();
    return (
      <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-millet font-semibold text-ink">{initials}</div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" data-testid="text-username">{user.firstName ?? user.primaryEmailAddress?.emailAddress}</p>
          <p className="text-xs text-sidebar-foreground/60">Saved to your account</p>
        </div>
        <button onClick={() => signOut({ redirectUrl: basePath || '/' })} className="rounded-lg p-2 text-sidebar-foreground/70 hover:bg-sidebar hover:text-sidebar-foreground" aria-label="Sign out" data-testid="button-sign-out">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-millet">Try it out</p>
      <p className="mt-1 text-sm text-sidebar-foreground/80">You are in a private guest workspace on this device. Create a free account to keep your work on any phone or computer.</p>
      <div className="mt-3 flex gap-2">
        <Link href="/sign-up" className="flex-1 rounded-lg bg-millet px-3 py-2 text-center text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5" data-testid="link-sign-up">Create account</Link>
        <Link href="/sign-in" className="rounded-lg px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-sidebar" data-testid="link-sign-in">Sign in</Link>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const toggle = () => setCollapsed((c) => { writeCollapsed(!c); return !c; });

  useEffect(() => {
    if (!open) return;
    const btn = menuBtn.current;
    closeBtn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onResize = () => { if (window.innerWidth >= 1024) setOpen(false); };
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = prev;
      btn?.focus();
    };
  }, [open]);

  return (
    <div className="flex min-h-[100dvh]">
      <aside id="desktop-sidebar" aria-label="Main navigation" className={`sticky top-0 hidden h-[100dvh] shrink-0 flex-col justify-between overflow-y-auto bg-sidebar text-sidebar-foreground lg:flex ${collapsed ? 'w-[72px] px-3 py-5' : 'w-64 p-5'}`}>
        <div className={collapsed ? 'flex flex-col items-center gap-6' : 'space-y-8'}>
          <div className={`flex items-center ${collapsed ? 'flex-col gap-4' : 'justify-between gap-2'}`}>
            {!collapsed && <Link href="/dashboard" data-testid="link-logo"><Wordmark light /></Link>}
            <button type="button" onClick={toggle} aria-expanded={!collapsed} aria-controls="desktop-sidebar" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} className="grid h-9 w-9 place-items-center rounded-lg text-sidebar-foreground/75 hover:bg-sidebar-accent hover:text-sidebar-foreground" data-testid="button-toggle-sidebar">
              {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </button>
          </div>
          <NavLinks compact={collapsed} />
        </div>
        <AccountBox compact={collapsed} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/dashboard"><Wordmark /></Link>
          <Button ref={menuBtn} variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="mobile-menu" data-testid="button-menu"><Menu className="h-5 w-5" /></Button>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} aria-hidden="true" />
            <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" className="rise absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col justify-between overflow-y-auto bg-sidebar p-5 text-sidebar-foreground">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <Wordmark light />
                  <button ref={closeBtn} onClick={() => setOpen(false)} aria-label="Close menu" className="rounded-lg p-1" data-testid="button-close-menu"><X className="h-5 w-5" /></button>
                </div>
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <AccountBox />
            </div>
          </div>
        )}
        <main className={`mx-auto w-full flex-1 px-4 py-8 md:px-8 md:py-10 ${collapsed ? 'max-w-7xl' : 'max-w-6xl'}`}>{children}</main>
      </div>
    </div>
  );
}
