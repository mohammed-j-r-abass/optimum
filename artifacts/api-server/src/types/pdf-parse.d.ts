declare module "pdf-parse/lib/pdf-parse.js" {
  export default function pdf(buffer: Buffer): Promise<{ text: string }>;
}
