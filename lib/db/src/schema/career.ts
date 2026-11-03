import { pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";

export const careerRecords = pgTable("career_records", {
  id: text("id").primaryKey(),
  owner: text("owner").notNull(),
  kind: text("kind").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});
export const insertCareerRecordSchema = createInsertSchema(careerRecords);
export type CareerRecord = typeof careerRecords.$inferSelect;
