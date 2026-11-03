import { useRef } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { useImportDocument } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { errorMessage, fileToBase64 } from '@/lib/media';

export function ImportButton({ label, onText, testId }: { label: string; onText: (text: string, name: string) => void; testId: string }) {
  const ref = useRef<HTMLInputElement>(null);
  const importDoc = useImportDocument();
  const { toast } = useToast();

  async function handle(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'That file is a little too big', description: 'Please choose a PDF, DOCX or TXT under 5 MB.', variant: 'destructive' });
      return;
    }
    try {
      const data = await fileToBase64(file);
      importDoc.mutate(
        { data: { name: file.name, data } },
        {
          onSuccess: (res) => {
            onText(res.text, file.name);
            toast({ title: 'Text added', description: `We read the words from ${file.name}. The file itself was not kept.` });
          },
          onError: (e) => toast({ title: 'Could not read that file', description: errorMessage(e), variant: 'destructive' }),
        },
      );
    } catch (e) {
      toast({ title: 'Could not open that file', description: errorMessage(e), variant: 'destructive' });
    } finally {
      if (ref.current) ref.current.value = '';
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept=".pdf,.docx,.txt,application/pdf,text/plain,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={(e) => handle(e.target.files?.[0])} data-testid={`input-file-${testId}`} />
      <Button type="button" variant="outline" size="sm" onClick={() => ref.current?.click()} disabled={importDoc.isPending} data-testid={`button-import-${testId}`}>
        {importDoc.isPending ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <FileUp className="mr-1.5 h-3.5 w-3.5" />}
        {importDoc.isPending ? 'Reading file' : label}
      </Button>
    </>
  );
}
