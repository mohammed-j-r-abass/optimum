import { lazy, Suspense } from 'react';
import { Route, Router, Switch } from 'wouter';
import LandingPage from '@/pages/landing';

// The public page does not download authentication, PDF, or live-call code.
const Workspace = lazy(() => import('./App'));
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

export default function PublicApp() {
  return (
    <Router base={basePath}>
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route>
          <Suspense fallback={<main className="mx-auto max-w-xl px-6 py-20" role="status" aria-live="polite"><h1 className="font-display text-3xl">Opening Optimum…</h1><p className="mt-3 text-muted-foreground">Loading your workspace. This may take a moment on a slow connection.</p></main>}>
            <Workspace />
          </Suspense>
        </Route>
      </Switch>
    </Router>
  );
}
