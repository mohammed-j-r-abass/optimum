import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'wouter';
import { useCreateApplication, useDeleteApplication, useListApplications } from '@workspace/api-client-react';
import { Briefcase, FileText, Loader2, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { PageHeader, ErrorState, CardSkeletons, EmptyState } from '@/components/states';
import { ImportButton } from '@/components/import-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useRefresh } from '@/lib/use-refresh';
import { errorMessage } from '@/lib/media';

export default function ApplicationsPage() {
  const { data, isLoading, isError, refetch } = useListApplications();
  const del = useDeleteApplication();
  const refresh = useRefresh();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [toDelete, setToDelete] = useState<string | null>(null);

  return (
    <div>
      <PageHeader eyebrow="Jobs and CVs" title="One CV for each job you want" action={<Button onClick={() => setOpen(true)} data-testid="button-new-application"><Plus className="mr-1.5 h-4 w-4" /> Add a job</Button>}>
        A CV shaped for each advert works better than one CV for everything.
      </PageHeader>
      {isError ? <ErrorState onRetry={() => refetch()} /> : isLoading ? <CardSkeletons /> : !data?.length ? (
        <EmptyState icon={<Briefcase className="h-6 w-6" />} title="No jobs yet" action={<Button onClick={() => setOpen(true)} data-testid="button-empty-new">Add your first job</Button>}>
          Found an advert on a notice board, a radio announcement or online? Add it here and your coach will help you apply.
        </EmptyState>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {data.map((a, i) => (
            <li key={a.id} className={`lift rise rise-${Math.min(i, 4)} group relative rounded-2xl border bg-card p-5`} data-testid={`card-application-${a.id}`}>
              <Link href={`/applications/${a.id}`} className="block pr-10">
                <p className="text-xs font-mono text-muted-foreground">{format(new Date(a.createdAt), 'd MMM yyyy')}</p>
                <h3 className="mt-1 text-xl font-semibold text-ink">{a.title}</h3>
                <p className="text-sm text-muted-foreground">{a.company}</p>
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium capitalize text-secondary-foreground">{a.status}</span>
                  {a.cv && <span className="flex items-center gap-1 text-xs text-sage"><FileText className="h-3.5 w-3.5" /> CV ready</span>}
                  <span className="text-xs text-muted-foreground">{a.messages.length} messages</span>
                </div>
              </Link>
              <button onClick={() => setToDelete(a.id)} className="absolute right-4 top-4 rounded-lg p-2 text-muted-foreground opacity-60 transition hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100" aria-label="Delete" data-testid={`button-delete-${a.id}`}><Trash2 className="h-4 w-4" /></button>
            </li>
          ))}
        </ul>
      )}
      <NewApplicationDialog open={open} onOpenChange={setOpen} />
      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this job?</AlertDialogTitle>
            <AlertDialogDescription>The coaching conversation and CV for this job will be deleted. Your story stays safe.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive hover:bg-destructive/90" data-testid="button-confirm-delete" onClick={() => toDelete && del.mutate({ id: toDelete }, {
              onSuccess: () => { refresh(); toast({ title: 'Job removed' }); },
              onError: (e) => toast({ title: 'Could not remove', description: errorMessage(e), variant: 'destructive' }),
            })}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NewApplicationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const create = useCreateApplication();
  const refresh = useRefresh();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [description, setDescription] = useState('');

  function submit(e: FormEvent) {
    e.preventDefault();
    create.mutate({ data: { title: title.trim(), company: company.trim(), description: description.trim() } }, {
      onSuccess: (a) => { refresh(); onOpenChange(false); setTitle(''); setCompany(''); setDescription(''); setLocation(`/applications/${a.id}`); },
      onError: (err) => toast({ title: 'Could not add job', description: errorMessage(err), variant: 'destructive' }),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Add a job</DialogTitle>
            <DialogDescription>Copy what the advert says. Rough is fine.</DialogDescription>
          </DialogHeader>
          <div className="my-5 grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="title">Job title</Label><Input id="title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Example: Shop assistant" data-testid="input-title" /></div>
              <div className="space-y-1.5"><Label htmlFor="company">Employer</Label><Input id="company" required value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Example: the local co-op" data-testid="input-company" /></div>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between"><Label htmlFor="desc">Job advert</Label><ImportButton label="Read from file" testId="job" onText={(t) => setDescription((d) => (d ? `${d}\n\n${t}` : t))} /></div>
              <Textarea id="desc" rows={7} value={description} onChange={(e) => setDescription(e.target.value)} placeholder={'Example only, replace with the real advert:\nWe need a friendly assistant to serve customers, keep shelves tidy and handle cash. Must be reliable on Saturdays.'} data-testid="input-description" />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={create.isPending || !title.trim() || !company.trim()} data-testid="button-create-application">{create.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}Start coaching</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
