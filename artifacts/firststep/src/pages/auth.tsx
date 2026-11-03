import type { ReactNode } from 'react';
import { Link } from 'wouter';
import { SignIn, SignUp } from '@clerk/react';
import { ArrowLeft } from 'lucide-react';

const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

function AuthLayout({ children, line }: { children: ReactNode; line: string }) {
  return (
    <div className="grid min-h-[100dvh] lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-ink p-12 text-primary-foreground lg:flex">
        <svg className="absolute -bottom-6 -right-8 h-72 w-[32rem]" viewBox="0 0 440 220" aria-hidden="true">
          <path d="M20 210h90v-50h90v-50h90v-50h90" stroke="hsl(39 77% 60%)" strokeWidth="14" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="400" cy="34" r="20" fill="hsl(16 68% 54%)" />
        </svg>
        <p className="font-display text-2xl">First<span className="text-millet">Step</span></p>
        <div className="relative max-w-md">
          <p className="font-display text-4xl leading-tight">{line}</p>
          <p className="mt-4 text-primary-foreground/70">Your story, CVs and practice follow you to any phone or computer.</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center gap-6 px-4 py-10">
        {children}
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-clay" data-testid="link-back-home"><ArrowLeft className="h-4 w-4" /> Keep trying it out as a guest</Link>
      </div>
    </div>
  );
}

export function SignInPage() {
  return (
    <AuthLayout line="Good to see you again. Let us pick up where you left off.">
      <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
    </AuthLayout>
  );
}

export function SignUpPage() {
  return (
    <AuthLayout line="The work you have already done deserves to be seen.">
      <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
    </AuthLayout>
  );
}
