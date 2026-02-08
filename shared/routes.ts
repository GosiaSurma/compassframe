import { z } from 'zod';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  shadows: {
    list: {
      method: 'GET' as const,
      path: '/api/shadows',
      responses: {
        200: z.array(z.object({
          id: z.string(),
          label: z.string(),
          description: z.string(),
        })),
      },
    },
  },
  sessions: {
    create: {
      method: 'POST' as const,
      path: '/api/sessions',
      input: z.object({
        role: z.enum(['parent', 'teen']),
        shadowId: z.string().optional(),
        shadowCustom: z.string().optional(),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/sessions/:id',
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    turn: {
      method: 'POST' as const,
      path: '/api/sessions/:id/turn',
      input: z.object({
        userText: z.string(),
        mode: z.enum(['reflect', 'battle']),
        session: z.any().optional(), // For stateless mode
        messages: z.array(z.any()).optional(), // For stateless mode
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/sessions/:id',
      input: z.object({
        companionId: z.string().optional(),
        artifactType: z.string().optional(),
        spell: z.any().optional(),
        status: z.string().optional(),
        turn: z.number().optional(),
        cycle: z.number().optional(),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    encounterStart: {
      method: 'POST' as const,
      path: '/api/sessions/:id/encounter/start',
      input: z.object({
        companionId: z.string(),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    encounterScene: {
      method: 'POST' as const,
      path: '/api/sessions/:id/encounter/scene',
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    encounterChoice: {
      method: 'POST' as const,
      path: '/api/sessions/:id/encounter/choice',
      input: z.object({
        choiceId: z.number(),
        choiceText: z.string(),
        outcome: z.string(),
        delta: z.object({
          calm: z.number(),
          understanding: z.number(),
          boundary: z.number(),
        }),
        essenceId: z.string().optional(),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    composeArtifact: {
      method: 'POST' as const,
      path: '/api/sessions/:id/artifact',
      input: z.object({
        artifactType: z.enum(['scroll', 'crystal', 'potion']),
      }),
      responses: {
        200: z.any(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
  },
  relays: {
    create: {
      method: 'POST' as const,
      path: '/api/relays',
      input: z.object({
        type: z.enum(['scroll', 'crystal', 'potion']),
        text: z.string(),
        shadowId: z.string().optional(),
        toUserId: z.string().optional(),
      }),
      responses: {
        201: z.any(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/relays',
      responses: {
        200: z.array(z.any()),
        401: errorSchemas.unauthorized,
      },
    },
  },
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
