import { z } from 'zod';
import { 
  insertVendorSchema, 
  insertCollaborationRequestSchema, 
  insertExpansionRequestSchema,
  vendors,
  collaborationRequests,
  expansionRequests
} from './schema';

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

export const api = {
  vendors: {
    list: {
      method: 'GET' as const,
      path: '/api/vendors',
      responses: {
        200: z.array(z.custom<typeof vendors.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/vendors/:id',
      responses: {
        200: z.custom<typeof vendors.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/vendors',
      input: insertVendorSchema,
      responses: {
        201: z.custom<typeof vendors.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    // The "Dashboard" logic is implicitly tied to a vendor. 
    // We can expose a specific endpoint for the analyzed data.
    getDashboard: {
      method: 'GET' as const,
      path: '/api/vendors/:id/dashboard',
      responses: {
        200: z.custom<{
          vendor: typeof vendors.$inferSelect;
          resourceScore: { budgetScore: number; timeScore: number; growthCapacity: number };
          growthStrategy: { 
            score: any; 
            strategyName: string; 
            actions: { action: string; avoid: string; reason: string }[] 
          };
          platformRecommendations: { platform: string; reason: string; suitabilityScore: number }[];
        }>(),
        404: errorSchemas.notFound,
      },
    },
    getMatches: {
      method: 'GET' as const,
      path: '/api/vendors/:id/matches',
      responses: {
        200: z.array(z.object({
          vendor: z.custom<typeof vendors.$inferSelect>(),
          matchScore: z.number(),
          reasons: z.array(z.string())
        })),
        404: errorSchemas.notFound,
      },
    }
  },
  collaboration: {
    list: {
      method: 'GET' as const,
      path: '/api/collaboration-requests',
      input: z.object({
        vendorId: z.coerce.number().optional(), // To filter my requests
        type: z.enum(['sent', 'received']).optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof collaborationRequests.$inferSelect & { fromVendor?: typeof vendors.$inferSelect, toVendor?: typeof vendors.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/collaboration-requests',
      input: insertCollaborationRequestSchema,
      responses: {
        201: z.custom<typeof collaborationRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/collaboration-requests/:id/status',
      input: z.object({ status: z.enum(['accepted', 'rejected']) }),
      responses: {
        200: z.custom<typeof collaborationRequests.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    }
  },
  expansion: {
    list: {
      method: 'GET' as const,
      path: '/api/expansion-requests',
      responses: {
        200: z.array(z.custom<typeof expansionRequests.$inferSelect & { vendor?: typeof vendors.$inferSelect }>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expansion-requests',
      input: insertExpansionRequestSchema,
      responses: {
        201: z.custom<typeof expansionRequests.$inferSelect>(),
        400: errorSchemas.validation,
      },
    }
  },
  ai: {
    generateContent: {
      method: 'POST' as const,
      path: '/api/ai/generate-content',
      input: z.object({
        topic: z.string(),
        platform: z.string(),
        tone: z.string().optional(),
      }),
      responses: {
        200: z.object({
          caption: z.string(),
          hashtags: z.array(z.string()),
          explanation: z.string(),
        }),
        500: errorSchemas.internal,
      }
    }
  }
};

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
