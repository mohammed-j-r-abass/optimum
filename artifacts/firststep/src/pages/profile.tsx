import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useGetProfile, useSaveProfile, type Profile } from '@workspace/api-client-react';
import { Check, Loader2 } from 'lucide-react';
import { PageHeader, ErrorState, CardSkeletons } from '@/components/states';
import { ImportButton } from '@/components/import-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useRefresh } from '@/lib/use-refresh';
import { errorMessage } from '@/lib/media';

const EMPTY: Profile = { name: '', email: '', phone: '', location: '', education: '', experience: '', skills: '', goals: '' };

const LONG: { key: keyof Profile; label: string; hint: string; placeholder: string }[] = [
  { key: 'education', label: 'School and learning', hint: 'Your school, final-year subjects, any certificates or short courses.', placeholder: 'For example: final year at a secondary school, subjects, a science fair project' },
  { key: 'experience', label: 'Things you have done', hint: 'Family farm or shop work, caring for siblings, school projects, clubs, volunteering, part-time jobs. These are real experience.', placeholder: 'For example: helped run the family stall on market days, counted takings, served customers' },
  { key: 'skills', label: 'What you are good at', hint: 'Practical skills, languages, computer use, people skills.', placeholder: 'For example: languages you speak, using a phone or computer, fixing things' },
  { key: 'goals', label: 'What you hope for', hint: 'The kind of work you want, where, and why.', placeholder: 'For example: an apprenticeship near home, or a first office job in town' },
];

export default function ProfilePage() {
  const { data, isLoading, isError, refetch } = useGetProfile();
  const save = useSaveProfile();
  const refresh = useRefresh();
  const { toast } = useToast();
  const form = useForm<Profile>({ defaultValues: EMPTY });

  useEffect(() => { if (data) form.reset({ ...EMPTY, ...data }); }, [data, form]);

  function onSubmit(values: Profile) {
    save.mutate({ data: values }, {
      onSuccess: (p) => { form.reset(p); refresh({ profile: true }); toast({ title: 'Your story is saved', description: 'Your coach will use it for every CV.' }); },
      onError: (e) => toast({ title: 'Could not save', description: errorMessage(e), variant: 'destructive' }),
    });
  }

  function appendExperience(text: string, name: string) {
    const cur = form.getValues('experience');
    form.setValue('experience', `${cur ? `${cur}\n\n` : ''}From ${name}:\n${text.trim()}`, { shouldDirty: true });
  }

  return (
    <div>
      <PageHeader eyebrow="My story" title="Everything you have done counts">
        Write it the way you would tell a teacher. Your coach will turn it into CV language later.
      </PageHeader>
      {isError ? <ErrorState onRetry={() => refetch()} /> : isLoading ? <CardSkeletons count={2} /> : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="rise space-y-6">
          <div className="grid gap-4 rounded-2xl border bg-card p-6 md:grid-cols-2">
            {(['name', 'email', 'phone', 'location'] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={k} className="capitalize">{k === 'location' ? 'Town or village' : k}</Label>
                <Input id={k} type={k === 'email' ? 'email' : 'text'} {...form.register(k)} data-testid={`input-${k}`} />
              </div>
            ))}
          </div>
          {LONG.map((f) => (
            <div key={f.key} className="rounded-2xl border bg-card p-6">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Label htmlFor={f.key} className="font-display text-lg text-ink">{f.label}</Label>
                  <p className="text-sm text-muted-foreground">{f.hint}</p>
                </div>
                {f.key === 'experience' && <ImportButton label="Add from a document" onText={appendExperience} testId="experience" />}
              </div>
              <Textarea id={f.key} rows={f.key === 'experience' ? 7 : 4} placeholder={f.placeholder} className="ruled bg-background/60 leading-8" {...form.register(f.key)} data-testid={`input-${f.key}`} />
            </div>
          ))}
          <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-2xl border bg-card/95 p-3 shadow-md backdrop-blur">
            <span className="text-sm text-muted-foreground">{form.formState.isDirty ? 'You have unsaved changes' : 'All saved'}</span>
            <Button type="submit" disabled={save.isPending} data-testid="button-save-profile">
              {save.isPending ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Check className="mr-1.5 h-4 w-4" />}Save my story
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
