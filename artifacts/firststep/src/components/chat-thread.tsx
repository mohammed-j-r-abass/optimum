import { useEffect, useRef, type ReactNode } from 'react';
import type { Message } from '@workspace/api-client-react';
import ReactMarkdown from 'react-markdown';
import { Typing } from '@/components/states';

const AI = 'rounded-2xl rounded-tl-[4px] bg-[#dcf3dc] text-[#14301b] ring-1 ring-[#b9e2bb]';
const ME = 'rounded-2xl rounded-tr-[4px] bg-[#1f3566] text-[#f2f5fb]';

export function ChatThread({ messages, pending, pendingText, empty, assistantName = 'Coach' }: { messages: Message[]; pending?: boolean; pendingText?: string; empty?: ReactNode; assistantName?: string }) {
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages.length, pending]);
  const visible = messages.filter((m) => m.role !== 'system');
  return (
    <div className="flex flex-col gap-2.5">
      {visible.length === 0 && !pending && empty}
      {visible.map((m, i) => {
        const mine = m.role === 'user';
        return (
          <div key={i} className={`rise flex ${mine ? 'justify-end' : 'justify-start'}`} data-testid={`message-${m.role}-${i}`}>
            <div className={`min-w-0 max-w-[88%] px-3.5 py-2.5 text-[14.5px] leading-relaxed shadow-sm sm:max-w-[78%] ${mine ? ME : AI}`}>
              <p className={`mb-0.5 text-[11px] font-semibold uppercase tracking-wider ${mine ? 'text-[#a9bce6]' : 'text-[#1d7a3a]'}`}>{mine ? 'You' : assistantName}</p>
              {mine ? <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{m.content}</p> : (
                <div className="space-y-2 break-words [overflow-wrap:anywhere] [&_p]:whitespace-pre-line [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5 [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-white/50 [&_pre]:p-2 [&_code]:text-[13px]">
                  <ReactMarkdown skipHtml components={{ a: ({ children, href }) => <a href={href} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">{children}</a> }}>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        );
      })}
      {pending && pendingText && (
        <div className="flex justify-end">
          <div className={`min-w-0 max-w-[88%] px-3.5 py-2.5 text-[14.5px] leading-relaxed opacity-75 sm:max-w-[78%] ${ME}`}>
            <p className="mb-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#a9bce6]">You</p>
            <p className="whitespace-pre-wrap break-words [overflow-wrap:anywhere]">{pendingText}</p>
          </div>
        </div>
      )}
      {pending && (
        <div className="flex justify-start" data-testid="status-typing">
          <div className={`px-3.5 py-2.5 ${AI}`}>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-[#1d7a3a]">{assistantName}</p>
            <Typing />
          </div>
        </div>
      )}
      <div ref={end} />
    </div>
  );
}
