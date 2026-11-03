import { z } from "zod";
import type OpenAI from "openai";

export const cvDocumentSchema = z.object({
  name: z.string().min(1).max(250),
  contact: z.array(z.string().max(500)).max(10),
  sections: z.array(z.object({
    title: z.string().min(1).max(120),
    entries: z.array(z.object({
      heading: z.string().max(1000),
      detail: z.string().max(1000),
      location: z.string().max(500),
      date: z.string().max(250),
      bullets: z.array(z.string().max(3000)).max(20),
    })).min(1).max(20),
  })).min(1).max(12),
});
export type CvDocument = z.infer<typeof cvDocumentSchema>;

// Strict provider schema keeps design out of model-generated prose.
export const cvResponseFormat: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming["response_format"] = {
  type: "json_schema",
  json_schema: {
    name: "firststep_cv",
    strict: true,
    schema: {
      type: "object", additionalProperties: false, required: ["name", "contact", "sections"],
      properties: {
        name: { type: "string" },
        contact: { type: "array", items: { type: "string" } },
        sections: {
          type: "array",
          items: {
            type: "object", additionalProperties: false, required: ["title", "entries"],
            properties: {
              title: { type: "string" },
              entries: {
                type: "array",
                items: {
                  type: "object", additionalProperties: false, required: ["heading", "detail", "location", "date", "bullets"],
                  properties: {
                    heading: { type: "string" }, detail: { type: "string" }, location: { type: "string" }, date: { type: "string" },
                    bullets: { type: "array", items: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    },
  },
};

export const cvWritingInstructions = `Write the candidate's complete tailored CV as a structured JSON document matching the response schema. No Markdown, HTML, LaTeX, design instructions or commentary inside fields.
Use the verified writing guidance below. Decide wording, section selection and ordering yourself. Use the known full institution names, never ask formatting preferences. Education normally comes first for a graduate, followed by relevant Experience, Projects or Volunteering, then Skills; adjust only when another order is genuinely stronger.
name is the candidate's actual name. contact contains ONLY real supplied contact details/location/portfolio links, each as a separate string. Do not insert labels such as "Email:" or invent a GitHub/LinkedIn address.
Each section has a clear short title. Each entry uses heading for the university/employer/project title (bold), detail for the degree/role/technologies when known, location for the explicitly supplied place of THAT education/employment/project and date for the supplied period (right aligned by the renderer). A person's residence is NOT the location of their university or employer; never copy it into an entry without explicit supporting facts. Use empty strings for unknown optional fields. For Skills use compact categories as headings and genuine listed skills as detail or bullets. Never use empty entries or placeholder text.
Use concise accomplishment bullets based on what the candidate ACTUALLY did. Relevant school, volunteering or family responsibilities can be included but must be labelled truthfully, not disguised as paid employment. Keep numbers, seniority, grades, technical skills and outcomes grounded in explicit statements. Do not copy assistant suggestions as candidate evidence unless the candidate confirmed them. Do not copy job requirements as skills.
The discovery conversation is the factual source, not an existing draft to reproduce. Select its strongest evidence for THIS job when the user clicks CV generation. Apply relevance decisions discussed with the coach: leave out activities that demonstrate none of the role's requirements or relevant transferable skills, especially when that omission was explained. Do not force every saved experience onto the page. Keep a user-requested inclusion only when the user explicitly insists after the relevance advice, and describe it honestly rather than inventing a match. A skill suggested from external/general role knowledge is NOT a candidate skill until the user provides actual evidence of doing it.
ONE-PAGE CONTENT BUDGET: The requested layout is A4, 12-point body text, half-inch margins and close single line spacing. Maximise the usefulness of ONE page. Target 300-400 words or fewer; prefer 4-5 relevant sections, 1-2 strongest relevant entries per section and 2-3 concise bullets per experience/project. Keep most bullets to one or two lines. Merge repeated skills and overlapping evidence; prioritise the target job's essentials. Keep skills as compact labelled entries (e.g. heading "Languages", detail "Python, SQL") rather than one entry per skill. Do not pad short CVs to fill the page. Never shrink the font, invent content or remove essential factual identity/education to force the target. Honour user-requested inclusions/corrections; if unusually extensive material is essential, accuracy takes priority over an absolute page count.
Do not include photos, age, gender, nationality, a generic objective, references or unsupported self-ratings by default. No empty sections or missing-information messages in the CV.`;

export function cvToText(doc: CvDocument) {
  return [doc.name, doc.contact.join(" | "), "", ...doc.sections.flatMap(section => [
    section.title.toUpperCase(),
    ...section.entries.flatMap(entry => [
      [entry.heading, entry.location].filter(Boolean).join(" | "),
      [entry.detail, entry.date].filter(Boolean).join(" | "),
      ...entry.bullets.map(bullet => `• ${bullet}`),
      "",
    ].filter((line, index) => line || index === 2 + entry.bullets.length)),
  ])].join("\n").trim();
}
