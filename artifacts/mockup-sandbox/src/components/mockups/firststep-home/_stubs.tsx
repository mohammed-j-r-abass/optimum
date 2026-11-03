import type { AnchorHTMLAttributes } from 'react';

// Deliberately static demo data. No production API, navigation or authentication.
export const demo = {
  profile: { name: 'Ama Mensah' },
  profileCompletion: 75,
  nextStep: 'Strengthen your Lumen CV with an example of working in a team.',
  applications: [
    { id: 'lumen', title: 'Graduate Software Engineer', company: 'Lumen', status: 'cv_ready' },
    { id: 'community', title: 'Programme Assistant', company: 'Community Action', status: 'draft' },
    { id: 'schools', title: 'IT Support Trainee', company: 'Local Schools Network', status: 'draft' },
  ],
  interviews: [
    { id: 'practice', title: 'Graduate Software Engineer', stage: 'behavioral', scheduledAt: '2026-11-06T14:00:00Z' },
    { id: 'completed', title: 'IT Support Trainee', stage: 'behavioral', scheduledAt: '' },
  ],
};
export function Link({ children, onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} onClick={e => { e.preventDefault(); onClick?.(e); }}>{children}</a>;
}
export const useLocation = (): [string] => ['/dashboard'];
export const useUser = () => ({ isLoaded: true, isSignedIn: true, user: { firstName: 'Ama', primaryEmailAddress: { emailAddress: 'ama@example.com' } } });
export const useClerk = () => ({ signOut: (_options?: unknown) => undefined });
export const useGetDashboard = () => ({ data: demo, isLoading: false, isError: false, refetch: () => undefined });
export const stageLabel = (stage: string) => stage === 'behavioral' ? 'Behavioural practice' : stage;
