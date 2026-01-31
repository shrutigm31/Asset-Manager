import { z } from 'zod';
import { insertLeadSchema, insertApplicationSchema, leads, applications } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  leads: {
    list: {
      method: 'GET' as const,
      path: '/api/leads',
      responses: {
        200: z.array(z.custom<typeof leads.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/leads/:id',
      responses: {
        200: z.custom<typeof leads.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/leads',
      input: insertLeadSchema,
      responses: {
        201: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/leads/:id',
      input: insertLeadSchema.partial(),
      responses: {
        200: z.custom<typeof leads.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/leads/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  applications: {
    list: {
      method: 'GET' as const,
      path: '/api/applications',
      responses: {
        200: z.array(z.custom<typeof applications.$inferSelect & { lead?: typeof leads.$inferSelect }>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/applications/:id',
      responses: {
        200: z.custom<typeof applications.$inferSelect & { lead?: typeof leads.$inferSelect }>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/applications',
      input: insertApplicationSchema,
      responses: {
        201: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/applications/:id',
      input: insertApplicationSchema.partial(),
      responses: {
        200: z.custom<typeof applications.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/applications/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
};

// ============================================
// REQUIRED: buildUrl helper
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

// ============================================
// TYPE HELPERS
// ============================================
export type LeadInput = z.infer<typeof api.leads.create.input>;
export type LeadResponse = z.infer<typeof api.leads.create.responses[201]>;
export type ApplicationInput = z.infer<typeof api.applications.create.input>;
export type ApplicationResponse = z.infer<typeof api.applications.create.responses[201]>;
