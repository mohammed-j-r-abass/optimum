import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react';
import { ClerkProvider, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Route, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AppShell } from '@/components/app-shell';
import NotFound from '@/pages/not-found';
import { SignInPage, SignUpPage } from '@/pages/auth';

const DashboardPage = lazy(() => import('@/pages/dashboard'));
const ProfilePage = lazy(() => import('@/pages/profile'));
const ApplicationsPage = lazy(() => import('@/pages/applications'));
const ApplicationDetailPage = lazy(() => import('@/pages/application-detail'));
const InterviewsPage = lazy(() => import('@/pages/interviews'));
const ResourcesPage = lazy(() => import('@/pages/resources'));

const queryClient = new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1 } } });

const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);

const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || '/'
    : path;
}

if (!clerkPubKey) {
  throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY in .env file');
}

const clerkAppearance = {
  theme: shadcn,
  cssLayerName: 'clerk',
  options: {
    logoPlacement: 'inside' as const,
    logoLinkUrl: basePath || '/',
    logoImageUrl: `${window.location.origin}${basePath}/logo.svg`,
  },
  variables: {
    colorPrimary: 'hsl(228 46% 25%)',
    colorForeground: 'hsl(228 40% 17%)',
    colorMutedForeground: 'hsl(228 14% 40%)',
    colorDanger: 'hsl(4 64% 46%)',
    colorBackground: 'hsl(44 60% 98%)',
    colorInput: 'hsl(42 45% 95%)',
    colorInputForeground: 'hsl(228 40% 17%)',
    colorNeutral: 'hsl(228 30% 30%)',
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
    borderRadius: '0.85rem',
  },
  elements: {
    rootBox: 'w-full flex justify-center',
    cardBox: 'bg-card rounded-2xl w-[440px] max-w-full overflow-hidden border border-border shadow-lg',
    card: '!shadow-none !border-0 !bg-transparent !rounded-none',
    footer: '!shadow-none !border-0 !bg-transparent !rounded-none',
    headerTitle: 'font-serif text-2xl text-foreground',
    headerSubtitle: 'text-muted-foreground',
    socialButtonsBlockButtonText: 'text-foreground font-medium',
    formFieldLabel: 'text-foreground font-medium',
    footerActionLink: 'text-[hsl(16_68%_44%)] font-semibold hover:underline',
    footerActionText: 'text-muted-foreground',
    dividerText: 'text-muted-foreground',
    identityPreviewEditButton: 'text-[hsl(16_68%_44%)]',
    formFieldSuccessText: 'text-[hsl(150_22%_34%)]',
    alertText: 'text-foreground',
    logoBox: 'justify-center',
    logoImage: 'h-12 w-12',
    socialButtonsBlockButton: 'border border-border bg-background hover:bg-muted',
    formButtonPrimary: 'bg-[hsl(16_68%_54%)] text-white font-semibold',
    formFieldInput: 'bg-background border border-input text-foreground',
    footerAction: 'justify-center',
    dividerLine: 'bg-border',
    alert: 'bg-accent border border-border',
    otpCodeFieldInput: 'border border-input text-foreground',
    formFieldRow: 'gap-3',
    main: 'gap-5',
  },
};

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return () => {
      unsubscribe();
      // The public landing page does not mount Clerk. Never retain private
      // query results while the workspace's identity listener is unmounted.
      qc.clear();
    };
  }, [addListener, qc]);

  return null;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function ShellRoutes() {
  return (
    <AppShell>
      <RoutedErrorBoundary>
        <Suspense fallback={<div className="py-12 text-muted-foreground" role="status">Loading your page…</div>}>
        <Switch>
          <Route path="/dashboard" component={DashboardPage} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/applications" component={ApplicationsPage} />
          <Route path="/applications/:id" component={ApplicationDetailPage} />
          <Route path="/interviews" component={InterviewsPage} />
          <Route path="/resources" component={ResourcesPage} />
          <Route component={NotFound} />
        </Switch>
        </Suspense>
      </RoutedErrorBoundary>
    </AppShell>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      appearance={clerkAppearance}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      localization={{
        signIn: { start: { title: 'Welcome back', subtitle: 'Sign in to see your saved story, CVs and practice' } },
        signUp: { start: { title: 'Save your progress', subtitle: 'A free account keeps your work on every device' } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <TooltipProvider>
          <Switch>
            <Route path="/sign-in/*?" component={SignInPage} />
            <Route path="/sign-up/*?" component={SignUpPage} />
            <Route component={ShellRoutes} />
          </Switch>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return <ClerkProviderWithRoutes />;
}

export default App;
