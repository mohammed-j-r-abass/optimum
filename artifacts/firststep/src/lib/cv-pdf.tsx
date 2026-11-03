import React from 'react';
import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { CvDocument } from '@workspace/api-client-react';

const s = StyleSheet.create({
  page: { padding: 36, fontFamily: 'Times-Roman', fontSize: 12, lineHeight: 1.03, color: '#111' },
  name: { fontFamily: 'Times-Bold', fontSize: 16, lineHeight: 1.05, textAlign: 'center', marginBottom: 1 },
  contact: { fontSize: 12, lineHeight: 1.03, textAlign: 'center', marginTop: 1 },
  section: { marginTop: 8 },
  title: { fontFamily: 'Times-Bold', fontSize: 12, textTransform: 'uppercase', borderBottomWidth: 0.5, borderBottomColor: '#555', paddingBottom: 1, marginBottom: 2 },
  entry: { marginBottom: 3 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  left: { flex: 1, paddingRight: 8 },
  right: { maxWidth: '32%', textAlign: 'right', flexShrink: 1 },
  bold: { fontFamily: 'Times-Bold' },
  italic: { fontFamily: 'Times-Italic' },
  bulletRow: { flexDirection: 'row', marginTop: 0, paddingLeft: 14 },
  dot: { width: 10 },
  bulletText: { flex: 1 },
});

function CvPdf({ doc }: { doc: CvDocument }) {
  const contact = doc.contact.filter(Boolean).join(' • ');
  return (
    <Document title={doc.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{doc.name}</Text>
        {contact ? <Text style={s.contact}>{contact}</Text> : null}
        {doc.sections.map((sec, si) => (
          <View key={si} style={s.section}>
            {sec.title ? <Text style={s.title} minPresenceAhead={30}>{sec.title}</Text> : null}
            {sec.entries.map((e, ei) => {
              const education = /^education$/i.test(sec.title.trim());
              const inlineSkill = /skills|interests|languages/i.test(sec.title) && e.heading && e.detail && !e.date && !e.location && !e.bullets.length;
              return (
              <View key={ei} style={s.entry}>
                {inlineSkill ? <Text><Text style={s.bold}>{e.heading.replace(/:$/, '')}: </Text>{e.detail}</Text> : education ? (
                  <>
                    <View style={s.row} minPresenceAhead={16}>
                      <Text style={s.left}><Text style={s.bold}>{e.detail || e.heading}</Text>{e.detail && e.heading ? ` – ${e.heading}` : ''}</Text>
                      {e.date ? <Text style={s.right}>{e.date}</Text> : null}
                    </View>
                    {e.location ? <Text style={s.italic}>{e.location}</Text> : null}
                  </>
                ) : <>
                {e.heading || e.date ? (
                  <View style={s.row} minPresenceAhead={16}><Text style={[s.left, s.bold]}>{e.heading}</Text>{e.date ? <Text style={s.right}>{e.date}</Text> : null}</View>
                ) : null}
                {e.detail || e.location ? (
                  <View style={s.row}><Text style={[s.left, s.italic]}>{e.detail}</Text>{e.location ? <Text style={[s.italic, s.right]}>{e.location}</Text> : null}</View>
                ) : null}
                </>}
                {e.bullets.map((b, bi) => (
                  <View key={bi} style={s.bulletRow}><Text style={s.dot}>{'\u2022'}</Text><Text style={s.bulletText}>{b}</Text></View>
                ))}
              </View>
            );})}
          </View>
        ))}
      </Page>
    </Document>
  );
}

export function buildCvPdf(doc: CvDocument) {
  return pdf(<CvPdf doc={doc} />).toBlob();
}

export async function downloadCvPdf(doc: CvDocument, filename: string) {
  const blob = await buildCvPdf(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
