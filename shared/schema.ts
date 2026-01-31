import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export Chat Models from Integration
export * from "./models/chat";

// === TABLE DEFINITIONS ===

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  programInterest: text("program_interest").notNull(), // Masterclass, LEP, 1-Crore Club, etc.
  status: text("status").notNull().default("New"), // New, Contacted, Interested, Enrolled, Closed
  createdAt: timestamp("created_at").defaultNow(),
});

export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").references(() => leads.id).notNull(),
  program: text("program").notNull(),
  status: text("status").notNull().default("Under Review"), // Under Review, Interview Scheduled, Accepted, Rejected
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===
export const leadsRelations = relations(leads, ({ many }) => ({
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  lead: one(leads, {
    fields: [applications.leadId],
    references: [leads.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertApplicationSchema = createInsertSchema(applications).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===

// Leads
export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type CreateLeadRequest = InsertLead;
export type UpdateLeadRequest = Partial<InsertLead>;
export type LeadResponse = Lead;

// Applications
export type Application = typeof applications.$inferSelect;
export type InsertApplication = z.infer<typeof insertApplicationSchema>;
export type CreateApplicationRequest = InsertApplication;
export type UpdateApplicationRequest = Partial<InsertApplication>;
export type ApplicationResponse = Application & { lead?: Lead }; // Optional lead relation

// Program Types (for frontend constants)
export const PROGRAMS = [
  "Leadership Masterclass",
  "Leadership Essentials Program (LEP)",
  "Transition to Leadership Bootcamp",
  "1-Crore Club",
  "100 Board Members Program",
  "Master Business Warfare (MBW)",
  "Corporate Custom Program"
] as const;

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Interested",
  "Enrolled",
  "Closed"
] as const;

export const APPLICATION_STATUSES = [
  "Under Review",
  "Interview Scheduled",
  "Accepted",
  "Rejected"
] as const;
