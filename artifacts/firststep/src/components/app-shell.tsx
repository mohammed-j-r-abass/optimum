import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useClerk, useUser } from '@clerk/react';
import { BookOpen, Briefcase, Home, LogOut, Menu, MessagesSquare, UserRound, X } from 'lucide-react';
import { Wordmark } from '@/components/brand';
import { Button } from '@/components/ui/button';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

const NAV = [
  { href: '/dashboard', label: 'Home', icon: Home, match: ['/', '/dashboard'] },
  { href: '/profile', label: 'My story', icon: UserRound, match: ['/profile'] },
  { href: '/applications', label: 'Jobs and CVs', icon: Briefcase, match: ['/applications'] },
  { href: '/interviews', label: 'Interview practice', icon: MessagesSquare, match: ['/interviews'] },
  { href: '/resources', label: 'Guidance', icon: BookOpen, match: ['/resources'] },
];

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
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
            data-testid={`link-nav-${n.label.toLowerCase().replace(/\s+/g, '-')}`}
            className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
          >
            <Icon className={`h-4 w-4 transition-transform group-hover:translate-x-0.5 ${active ? '' : 'opacity-80'}`} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function AccountBox() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  if (!isLoaded) return <div className="h-20 rounded-xl bg-sidebar-accent/50" />;
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
  return (
    <div className="flex min-h-[100dvh]">
      <aside className="sticky top-0 hidden h-[100dvh] w-64 shrink-0 flex-col justify-between bg-sidebar p-5 text-sidebar-foreground lg:flex">
        <div className="space-y-8">
          <Link href="/dashboard" data-testid="link-logo"><Wordmark light /></Link>
          <NavLinks />
        </div>
        <AccountBox />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/90 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/dashboard"><Wordmark /></Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Open menu" data-testid="button-menu"><Menu className="h-5 w-5" /></Button>
        </header>
        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="absolute inset-0 bg-ink/40" onClick={() => setOpen(false)} />
            <div className="rise absolute inset-y-0 left-0 flex w-72 flex-col justify-between bg-sidebar p-5 text-sidebar-foreground">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <Wordmark light />
                  <button onClick={() => setOpen(false)} aria-label="Close menu" className="p-1"><X className="h-5 w-5" /></button>
                </div>
                <NavLinks onNavigate={() => setOpen(false)} />
              </div>
              <AccountBox />
            </div>
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-8 md:py-10">{children}</main>
      </div>
    </div>
  );
}
