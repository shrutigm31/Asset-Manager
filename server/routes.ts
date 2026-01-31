import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerChatRoutes } from "./replit_integrations/chat";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Register Chat Routes from Integration
  registerChatRoutes(app);

  // === Leads Routes ===
  app.get(api.leads.list.path, async (req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });

  app.get(api.leads.get.path, async (req, res) => {
    const lead = await storage.getLead(Number(req.params.id));
    if (!lead) {
      return res.status(404).json({ message: 'Lead not found' });
    }
    res.json(lead);
  });

  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.leads.update.path, async (req, res) => {
    try {
      const input = api.leads.update.input.parse(req.body);
      const lead = await storage.updateLead(Number(req.params.id), input);
      if (!lead) {
        return res.status(404).json({ message: 'Lead not found' });
      }
      res.json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.leads.delete.path, async (req, res) => {
    await storage.deleteLead(Number(req.params.id));
    res.status(204).send();
  });

  // === Applications Routes ===
  app.get(api.applications.list.path, async (req, res) => {
    const apps = await storage.getApplications();
    res.json(apps);
  });

  app.get(api.applications.get.path, async (req, res) => {
    const appData = await storage.getApplication(Number(req.params.id));
    if (!appData) {
      return res.status(404).json({ message: 'Application not found' });
    }
    res.json(appData);
  });

  app.post(api.applications.create.path, async (req, res) => {
    try {
      const input = api.applications.create.input.parse(req.body);
      const appData = await storage.createApplication(input);
      res.status(201).json(appData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.applications.update.path, async (req, res) => {
    try {
      const input = api.applications.update.input.parse(req.body);
      const appData = await storage.updateApplication(Number(req.params.id), input);
      if (!appData) {
        return res.status(404).json({ message: 'Application not found' });
      }
      res.json(appData);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.applications.delete.path, async (req, res) => {
    await storage.deleteApplication(Number(req.params.id));
    res.status(204).send();
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingLeads = await storage.getLeads();
  if (existingLeads.length === 0) {
    const lead1 = await storage.createLead({
      name: "Priya Sharma",
      email: "priya@example.com",
      phone: "+91 98765 43210",
      programInterest: "Leadership Masterclass",
      status: "Contacted"
    });

    const lead2 = await storage.createLead({
      name: "Anjali Gupta",
      email: "anjali@example.com",
      phone: "+91 98765 43211",
      programInterest: "1-Crore Club",
      status: "Interested"
    });

    await storage.createApplication({
      leadId: lead2.id,
      program: "1-Crore Club",
      status: "Interview Scheduled",
      notes: "High potential candidate, current VP at Tech Corp."
    });

    await storage.createConversation("Iron Lady Program Advisor");
  }
}
