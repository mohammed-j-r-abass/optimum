import { useEffect, useRef, useState } from 'react';
import type { CvDocument } from '@workspace/api-client-react';

// Physical A4 dimensions and half-inch margins, scaled as a whole for small screens.
// Scaling the paper, rather than reflowing it, keeps the preview close to the PDF.
const PAGE_WIDTH = 210 / 25.4 * 96;
const PAGE_HEIGHT = 297 / 25.4 * 96;

export function CvPreview({ doc }: { doc: CvDocument }) {
  const container = useRef<HTMLDivElement>(null);
  const paper = useRef<HTMLElement>(null);
  const [size, setSize] = useState({ scale: 1, height: PAGE_HEIGHT });
  useEffect(() => {
    const update = () => {
      const width = container.current?.clientWidth;
      if (!width || !paper.current) return;
      const scale = Math.min(1, width / PAGE_WIDTH);
      setSize({ scale, height: paper.current.offsetHeight * scale });
    };
    const observer = new ResizeObserver(update);
    if (container.current) observer.observe(container.current);
    if (paper.current) observer.observe(paper.current);
    update();
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={container} style={{ width: '100%', minWidth: 0, height: size.height, maxWidth: PAGE_WIDTH, margin: '0 auto', overflow: 'hidden' }}>
      <article ref={paper} data-testid="text-cv" style={{
        width: PAGE_WIDTH, minHeight: PAGE_HEIGHT, boxSizing: 'border-box',
        padding: '0.5in', background: '#fff', color: '#111',
        fontFamily: '"Times New Roman", Times, serif', fontSize: '12pt', lineHeight: 1.03,
        transform: `scale(${size.scale})`, transformOrigin: 'top left',
      }}>
        <header style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '16pt', fontWeight: 700, lineHeight: 1.05, overflowWrap: 'anywhere', marginBottom: '1pt' }}>{doc.name}</h2>
          {doc.contact.length > 0 && <p style={{ marginTop: '1pt', overflowWrap: 'anywhere' }} data-testid="text-cv-contact">{doc.contact.filter(Boolean).join(' • ')}</p>}
        </header>
        {doc.sections.map((section, si) => (
          <section key={si} style={{ marginTop: '8pt' }}>
            {section.title && <h3 style={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '12pt', borderBottom: '0.5pt solid #555', paddingBottom: '1pt', marginBottom: '2pt' }}>{section.title}</h3>}
            {section.entries.map((entry, ei) => {
              const education = /^education$/i.test(section.title.trim());
              const inlineSkill = /skills|interests|languages/i.test(section.title) && entry.heading && entry.detail && !entry.date && !entry.location && !entry.bullets.length;
              const row = { display: 'flex', justifyContent: 'space-between', gap: '8pt' } as const;
              const right = { maxWidth: '32%', flexShrink: 1, textAlign: 'right' as const, overflowWrap: 'anywhere' as const };
              return <div key={ei} style={{ marginBottom: '3pt', overflowWrap: 'anywhere' }}>
                {inlineSkill ? <p><strong>{entry.heading.replace(/:$/, '')}: </strong>{entry.detail}</p> : education ? <>
                  <div style={row}>
                    <p style={{ flex: 1 }}><strong>{entry.detail || entry.heading}</strong>{entry.detail && entry.heading ? ` – ${entry.heading}` : ''}</p>
                    {entry.date && <span style={right}>{entry.date}</span>}
                  </div>
                  {entry.location && <p style={{ fontStyle: 'italic' }}>{entry.location}</p>}
                </> : <>
                  {(entry.heading || entry.date) && <div style={row}><strong style={{ flex: 1 }}>{entry.heading}</strong>{entry.date && <span style={right}>{entry.date}</span>}</div>}
                  {(entry.detail || entry.location) && <div style={{ ...row, fontStyle: 'italic' }}><span style={{ flex: 1 }}>{entry.detail}</span>{entry.location && <span style={right}>{entry.location}</span>}</div>}
                </>}
                {entry.bullets.length > 0 && <ul style={{ listStyle: 'disc', paddingLeft: '24pt', margin: 0 }}>{entry.bullets.map((bullet, bi) => <li key={bi} style={{ paddingLeft: 0 }}>{bullet}</li>)}</ul>}
              </div>;
            })}
          </section>
        ))}
      </article>
    </div>
  );
}
