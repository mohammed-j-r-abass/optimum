import type { CvDocument } from '@workspace/api-client-react';

export function CvPreview({ doc }: { doc: CvDocument }) {
  return (
    <article className="mx-auto max-w-[680px] bg-[#fdfdfb] px-5 py-7 text-[#161616] shadow-[0_1px_0_rgba(0,0,0,0.04)] sm:px-10 sm:py-10" style={{ fontFamily: '"Times New Roman", Times, Georgia, serif' }} data-testid="text-cv">
      <header className="text-center">
        <h2 className="break-words text-[26px] font-bold leading-tight">{doc.name}</h2>
        {doc.contact.length > 0 && (
          <p className="mt-1 break-words text-[13px] leading-snug" data-testid="text-cv-contact">
            {doc.contact.filter(Boolean).map((c, i) => <span key={i}>{i > 0 && <span className="mx-1.5 text-[#777]">|</span>}<span className="break-all sm:break-words">{c}</span></span>)}
          </p>
        )}
      </header>
      {doc.sections.map((s, si) => (
        <section key={si} className="mt-5">
          {s.title && <h3 className="border-b border-[#222] pb-0.5 text-[14px] font-bold uppercase tracking-[0.04em]">{s.title}</h3>}
          <div className="mt-2 space-y-2.5">
            {s.entries.map((e, ei) => (
              <div key={ei} className="text-[13.5px] leading-snug">
                {(e.heading || e.date) && (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <span className="min-w-0 break-words font-bold">{e.heading}</span>
                    {e.date && <span className="shrink-0">{e.date}</span>}
                  </div>
                )}
                {(e.detail || e.location) && (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 italic">
                    <span className="min-w-0 break-words">{e.detail}</span>
                    {e.location && <span className="shrink-0">{e.location}</span>}
                  </div>
                )}
                {e.bullets.length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-5">
                    {e.bullets.map((b, bi) => <li key={bi} className="break-words">{b}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}
    </article>
  );
}
