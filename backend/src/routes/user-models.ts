import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';

const app = new OpenAPIHono();

const getUserModelsRoute = createRoute({
  method: 'get',
  path: '/',
  tags: ['User Models'],
  summary: 'Get user 3D models',
  responses: {
    200: {
      description: 'List of user models',
      content: {
        'application/json': {
          schema: z.object({
            data: z.array(z.object({
              id: z.string().uuid(),
              name: z.string(),
              is_primary: z.boolean(),
              processing_status: z.string(),
              created_at: z.string(),
            })),
          }),
        },
      },
    },
  },
});

app.openapi(getUserModelsRoute, async (c) => {
  return c.json({ data: [] });
});

export default app;