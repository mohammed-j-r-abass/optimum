import { useEffect, useRef, type ReactNode } from 'react';
import type { Message } from '@workspace/api-client-react';
import { Typing } from '@/components/states';

export function ChatThread({ messages, pending, pendingText, empty, assistantName = 'Coach' }: { messages: Message[]; pending?: boolean; pendingText?: string; empty?: ReactNode; assistantName?: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages.length, pending]);
  const visible = messages.filter((m) => m.role !== 'system');
  return (
    <div className="flex flex-col gap-3">
      {visible.length === 0 && !pending && empty}
      {visible.map((m, i) => {
        const mine = m.role === 'user';
        return (
          <div key={i} className={`rise flex ${mine ? 'justify-end' : 'justify-start'}`} data-testid={`message-${m.role}-${i}`}>
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed ${mine ? 'rounded-br-md bg-ink text-primary-foreground' : 'rounded-bl-md border bg-card'}`}>
              {!mine && <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-clay">{assistantName}</p>}
              {m.content}
            </div>
          </div>
        );
      })}
      {pending && (
        <div className="flex justify-start">
          <div className="rounded-2xl rounded-bl-md border bg-card px-4 py-3 text-sm">
            {pendingText && <p className="mb-2 whitespace-pre-wrap rounded-lg bg-muted px-2 py-1 text-xs text-muted-foreground">You: {pendingText}</p>}
            <Typing />
          </div>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
