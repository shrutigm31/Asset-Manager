import { db } from "./db";
import {
  leads, applications,
  type Lead, type InsertLead, type UpdateLeadRequest,
  type Application, type InsertApplication, type UpdateApplicationRequest
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { chatStorage, type IChatStorage } from "./replit_integrations/chat/storage";

export interface IStorage extends IChatStorage {
  // Leads
  getLeads(): Promise<Lead[]>;
  getLead(id: number): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: number, updates: UpdateLeadRequest): Promise<Lead>;
  deleteLead(id: number): Promise<void>;

  // Applications
  getApplications(): Promise<(Application & { lead?: Lead })[]>;
  getApplication(id: number): Promise<(Application & { lead?: Lead }) | undefined>;
  createApplication(app: InsertApplication): Promise<Application>;
  updateApplication(id: number, updates: UpdateApplicationRequest): Promise<Application>;
  deleteApplication(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // --- Chat Storage Implementation (Delegated) ---
  async getConversation(id: number) { return chatStorage.getConversation(id); }
  async getAllConversations() { return chatStorage.getAllConversations(); }
  async createConversation(title: string) { return chatStorage.createConversation(title); }
  async deleteConversation(id: number) { return chatStorage.deleteConversation(id); }
  async getMessagesByConversation(id: number) { return chatStorage.getMessagesByConversation(id); }
  async createMessage(convId: number, role: string, content: string) { return chatStorage.createMessage(convId, role, content); }

  // --- Leads Implementation ---
  async getLeads(): Promise<Lead[]> {
    return await db.select().from(leads).orderBy(desc(leads.createdAt));
  }

  async getLead(id: number): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const [lead] = await db.insert(leads).values(insertLead).returning();
    return lead;
  }

  async updateLead(id: number, updates: UpdateLeadRequest): Promise<Lead> {
    const [updated] = await db.update(leads)
      .set(updates)
      .where(eq(leads.id, id))
      .returning();
    return updated;
  }

  async deleteLead(id: number): Promise<void> {
    // Delete associated applications first (though FK should handle it if cascade is set, explicit is safer in app logic)
    await db.delete(applications).where(eq(applications.leadId, id));
    await db.delete(leads).where(eq(leads.id, id));
  }

  // --- Applications Implementation ---
  async getApplications(): Promise<(Application & { lead?: Lead })[]> {
    const results = await db.query.applications.findMany({
      with: {
        lead: true
      },
      orderBy: desc(applications.createdAt)
    });
    return results;
  }

  async getApplication(id: number): Promise<(Application & { lead?: Lead }) | undefined> {
    const result = await db.query.applications.findFirst({
      where: eq(applications.id, id),
      with: {
        lead: true
      }
    });
    return result;
  }

  async createApplication(insertApp: InsertApplication): Promise<Application> {
    const [app] = await db.insert(applications).values(insertApp).returning();
    return app;
  }

  async updateApplication(id: number, updates: UpdateApplicationRequest): Promise<Application> {
    const [updated] = await db.update(applications)
      .set(updates)
      .where(eq(applications.id, id))
      .returning();
    return updated;
  }

  async deleteApplication(id: number): Promise<void> {
    await db.delete(applications).where(eq(applications.id, id));
  }
}

export const storage = new DatabaseStorage();
