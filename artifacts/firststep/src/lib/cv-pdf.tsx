import React from 'react';
import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import type { CvDocument } from '@workspace/api-client-react';

const s = StyleSheet.create({
  page: { paddingVertical: 40, paddingHorizontal: 46, fontFamily: 'Times-Roman', fontSize: 11, lineHeight: 1.3, color: '#111' },
  name: { fontFamily: 'Times-Bold', fontSize: 22, lineHeight: 1.2, textAlign: 'center', marginBottom: 2 },
  contact: { fontSize: 10.5, textAlign: 'center', marginTop: 3 },
  section: { marginTop: 11 },
  title: { fontFamily: 'Times-Bold', fontSize: 12, textTransform: 'uppercase', borderBottomWidth: 0.8, borderBottomColor: '#111', paddingBottom: 1.5, marginBottom: 4 },
  entry: { marginBottom: 5 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  left: { flex: 1, paddingRight: 10 },
  right: { maxWidth: '32%', textAlign: 'right', flexShrink: 1 },
  bold: { fontFamily: 'Times-Bold' },
  italic: { fontFamily: 'Times-Italic' },
  bulletRow: { flexDirection: 'row', marginTop: 1.5, paddingLeft: 8 },
  dot: { width: 10 },
  bulletText: { flex: 1 },
});

function CvPdf({ doc }: { doc: CvDocument }) {
  const contact = doc.contact.filter(Boolean).join('  |  ');
  return (
    <Document title={doc.name}>
      <Page size="A4" style={s.page}>
        <Text style={s.name}>{doc.name}</Text>
        {contact ? <Text style={s.contact}>{contact}</Text> : null}
        {doc.sections.map((sec, si) => (
          <View key={si} style={s.section}>
            {sec.title ? <Text style={s.title} minPresenceAhead={30}>{sec.title}</Text> : null}
            {sec.entries.map((e, ei) => (
              <View key={ei} style={s.entry}>
                {e.heading || e.date ? (
                  <View style={s.row} minPresenceAhead={20}><Text style={[s.left, s.bold]}>{e.heading}</Text>{e.date ? <Text style={s.right}>{e.date}</Text> : null}</View>
                ) : null}
                {e.detail || e.location ? (
                  <View style={s.row}><Text style={[s.left, s.italic]}>{e.detail}</Text>{e.location ? <Text style={[s.italic, s.right]}>{e.location}</Text> : null}</View>
                ) : null}
                {e.bullets.map((b, bi) => (
                  <View key={bi} style={s.bulletRow}><Text style={s.dot}>{'\u2022'}</Text><Text style={s.bulletText}>{b}</Text></View>
                ))}
              </View>
            ))}
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
